import { ethers, Contract, Provider, Signer } from 'ethers';

// Contract ABIs (simplified - would import from JSON files)
const FACTORY_ABI = [
  "function createAgentWallet(string agentId, string jurisdiction, bytes32 passkeyPublicKey, uint8 agentType) external returns (address)",
  "function getAgentProfile(address walletAddress) external view returns (tuple(address walletAddress, string agentId, string jurisdiction, bytes32 passkeyPublicKey, bool isActive, uint256 createdAt, uint8 agentType))",
  "function totalAgents() external view returns (uint256)",
  "event AgentWalletCreated(address indexed walletAddress, string indexed agentId, uint8 agentType, string jurisdiction, uint256 timestamp)"
];

const PAYROLL_ABI = [
  "function depositFunds() external payable",
  "function addEmployee(address _employeeWallet, string calldata _employeeId, uint256 _annualSalary, uint256 _taxRate, string calldata _jurisdiction, uint256 _paymentFrequency) external",
  "function schedulePayrollBatch(uint256[] calldata _employeeIndices, uint256 _scheduledTime) external returns (bytes32)",
  "function executePayrollBatch(bytes32 _batchId, uint256[] calldata _employeeIndices) external",
  "function employerBalances(address employer) external view returns (uint256)",
  "event PayrollExecuted(bytes32 indexed batchId, address indexed employer, uint256 totalAmount, uint256 totalTax, uint256 employeeCount, uint256 timestamp)"
];

const COMPLIANCE_ABI = [
  "function verifyCompliance(address walletAddress, string jurisdiction, uint8 riskLevel, string kycProvider, bytes32 verificationHash) external",
  "function canReceivePayments(address walletAddress, string jurisdiction) external view returns (bool canReceive, string reason)"
];

export interface TrellisConfig {
  network: 'moderato' | 'mainnet';
  rpcUrl?: string;
  privateKey?: string;
  apiKey?: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  type: 'HUMAN' | 'AI_AGENT' | 'HYBRID';
  jurisdiction: string;
  walletAddress: string;
}

export interface PayrollBatch {
  id: string;
  employeeCount: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  status: 'SCHEDULED' | 'EXECUTING' | 'EXECUTED' | 'FAILED';
}

export class TrellisClient {
  private provider: Provider;
  private signer?: Signer;
  private factory: Contract;
  private payroll: Contract;
  private compliance: Contract;

  constructor(config: TrellisConfig) {
    // Setup provider
    const rpcUrl = config.rpcUrl || (
      config.network === 'moderato' 
        ? 'https://rpc.moderato.tempo.xyz'
        : 'https://rpc.tempo.xyz'
    );
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }

    // Contract addresses would be loaded from config or env
    const addresses = this.getContractAddresses(config.network);
    
    this.factory = new ethers.Contract(addresses.factory, FACTORY_ABI, this.signer || this.provider);
    this.payroll = new ethers.Contract(addresses.payroll, PAYROLL_ABI, this.signer || this.provider);
    this.compliance = new ethers.Contract(addresses.compliance, COMPLIANCE_ABI, this.signer || this.provider);
  }

  private getContractAddresses(network: string) {
    // In real implementation, load from deployments file
    return {
      factory: process.env.FACTORY_ADDRESS || '0x...',
      payroll: process.env.PAYROLL_ADDRESS || '0x...',
      compliance: process.env.COMPLIANCE_ADDRESS || '0x...'
    };
  }

  // Agent Management
  async createAgent(profile: {
    id: string;
    name: string;
    type: 'HUMAN' | 'AI_AGENT' | 'HYBRID';
    jurisdiction: string;
    passkey: string;
  }): Promise<{ walletAddress: string; transactionHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    const agentType = profile.type === 'AI_AGENT' ? 1 : profile.type === 'HYBRID' ? 2 : 0;
    const passkeyHash = ethers.keccak256(ethers.toUtf8Bytes(profile.passkey));

    const tx = await this.factory.createAgentWallet(
      profile.id,
      profile.jurisdiction,
      passkeyHash,
      agentType
    );

    const receipt = await tx.wait();
    
    // Extract wallet address from event
    const event = receipt.events?.find((e: any) => e.event === 'AgentWalletCreated');
    const walletAddress = event?.args?.walletAddress;

    return {
      walletAddress,
      transactionHash: receipt.hash
    };
  }

  async getAgent(walletAddress: string): Promise<AgentProfile> {
    const profile = await this.factory.getAgentProfile(walletAddress);
    
    return {
      id: profile.agentId,
      name: profile.agentId, // Would fetch from metadata
      type: profile.agentType === 1 ? 'AI_AGENT' : profile.agentType === 2 ? 'HYBRID' : 'HUMAN',
      jurisdiction: profile.jurisdiction,
      walletAddress: profile.walletAddress
    };
  }

  // Payroll Operations
  async deposit(amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required');
    }

    const tx = await this.payroll.depositFunds({
      value: ethers.parseEther(amount)
    });

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async addEmployee(employee: {
    walletAddress: string;
    employeeId: string;
    annualSalary: number;
    taxRate: number;
    jurisdiction: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  }): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required');
    }

    const frequencySeconds = {
      weekly: 7 * 24 * 60 * 60,
      biweekly: 14 * 24 * 60 * 60,
      monthly: 30 * 24 * 60 * 60
    }[employee.frequency];

    const tx = await this.payroll.addEmployee(
      employee.walletAddress,
      employee.employeeId,
      ethers.parseUnits(employee.annualSalary.toString(), 6),
      employee.taxRate,
      employee.jurisdiction,
      frequencySeconds
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async schedulePayrollBatch(params: {
    employeeIndices: number[];
    executeAt: Date;
  }): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required');
    }

    const timestamp = Math.floor(params.executeAt.getTime() / 1000);
    
    const tx = await this.payroll.schedulePayrollBatch(
      params.employeeIndices,
      timestamp
    );

    const receipt = await tx.wait();
    
    // Extract batch ID from event
    const event = receipt.events?.find((e: any) => e.event === 'PayrollBatchScheduled');
    return event?.args?.batchId;
  }

  async executePayrollBatch(batchId: string, employeeIndices: number[]): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required');
    }

    const tx = await this.payroll.executePayrollBatch(batchId, employeeIndices);
    const receipt = await tx.wait();
    
    return receipt.hash;
  }

  async getEmployerBalance(employerAddress: string): Promise<string> {
    const balance = await this.payroll.employerBalances(employerAddress);
    return ethers.formatUnits(balance, 6);
  }

  // Compliance
  async checkCompliance(walletAddress: string, jurisdiction: string): Promise<{
    canReceive: boolean;
    reason?: string;
  }> {
    const [canReceive, reason] = await this.compliance.canReceivePayments(
      walletAddress,
      jurisdiction
    );

    return { canReceive, reason };
  }

  async verifyCompliance(params: {
    walletAddress: string;
    jurisdiction: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    kycProvider: string;
  }): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required');
    }

    const riskLevels = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    const verificationHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${params.walletAddress}-${Date.now()}`)
    );

    const tx = await this.compliance.verifyCompliance(
      params.walletAddress,
      params.jurisdiction,
      riskLevels[params.riskLevel],
      params.kycProvider,
      verificationHash
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  // Event Listeners
  onPayrollExecuted(callback: (batchId: string, employer: string, amount: string) => void) {
    this.payroll.on('PayrollExecuted', (batchId, employer, totalAmount) => {
      callback(batchId, employer, ethers.formatUnits(totalAmount, 6));
    });
  }

  onAgentCreated(callback: (walletAddress: string, agentId: string, agentType: number) => void) {
    this.factory.on('AgentWalletCreated', (walletAddress, agentId, agentType) => {
      callback(walletAddress, agentId, agentType);
    });
  }
}

export default TrellisClient;
