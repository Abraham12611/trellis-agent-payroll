/**
 * Trellis Agent Payroll - Simulation Script 01
 * Workflow: Agent Onboarding & Wallet Creation
 * 
 * This script demonstrates:
 * 1. Creating employer account
 * 2. Onboarding multiple agents (human and AI)
 * 3. Passkey registration simulation
 * 4. KYC/AML compliance verification
 * 5. Wallet deployment on Tempo testnet
 */

const { ethers } = require("ethers");
const chalk = require("chalk");
const ora = require("ora");

// Tempo Testnet Configuration
const TEMPO_CONFIG = {
  rpcUrl: process.env.TEMPO_RPC_URL || "https://rpc.moderato.tempo.xyz",
  chainId: 42431,
  explorer: "https://explore.tempo.xyz",
  nativeToken: "PATHUSD"
};

// Contract addresses (would be populated after deployment)
const CONTRACTS = {
  agentWalletFactory: process.env.FACTORY_ADDRESS || "0x...",
  complianceRegistry: process.env.COMPLIANCE_ADDRESS || "0x...",
  payrollMaster: process.env.PAYROLL_ADDRESS || "0x...",
  taxEscrowManager: process.env.TAX_ADDRESS || "0x..."
};

// ABI imports (simplified for simulation)
const FACTORY_ABI = [
  "function createAgentWallet(string agentId, string jurisdiction, bytes32 passkeyPublicKey, uint8 agentType) external returns (address)",
  "function getAgentProfile(address walletAddress) external view returns (tuple(address walletAddress, string agentId, string jurisdiction, bytes32 passkeyPublicKey, bool isActive, uint256 createdAt, uint8 agentType))",
  "function totalAgents() external view returns (uint256)",
  "event AgentWalletCreated(address indexed walletAddress, string indexed agentId, uint8 agentType, string jurisdiction, uint256 timestamp)"
];

const COMPLIANCE_ABI = [
  "function verifyCompliance(address walletAddress, string jurisdiction, uint8 riskLevel, string kycProvider, bytes32 verificationHash) external",
  "function canReceivePayments(address walletAddress, string jurisdiction) external view returns (bool canReceive, string reason)",
  "function isComplianceValid(address walletAddress) external view returns (bool)"
];

class TrellisOnboardingSimulator {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(TEMPO_CONFIG.rpcUrl);
    this.walletCount = 0;
    this.agents = [];
  }

  async initialize() {
    console.log(chalk.cyan.bold("\n🌿 Trellis Agent Onboarding Simulator\n"));
    console.log(chalk.gray(`Network: Tempo Testnet (Moderato) - Chain ID ${TEMPO_CONFIG.chainId}\n`));
    
    // Simulate having funded accounts
    this.employer = ethers.Wallet.createRandom().connect(this.provider);
    console.log(chalk.green(`✓ Generated Employer Account: ${this.employer.address}`));
    
    // Initialize contracts
    this.factory = new ethers.Contract(CONTRACTS.agentWalletFactory, FACTORY_ABI, this.employer);
    this.compliance = new ethers.Contract(CONTRACTS.complianceRegistry, COMPLIANCE_ABI, this.employer);
    
    console.log(chalk.gray("\n📋 Starting Agent Onboarding Workflow\n"));
  }

  async simulateAgentOnboarding(agentData) {
    const spinner = ora(`Onboarding ${agentData.name}...`).start();
    
    try {
      // Step 1: Generate passkey (simulated)
      const passkey = this.generatePasskey();
      spinner.text = `${agentData.name}: Generated passkey ✓`;
      await this.delay(500);
      
      // Step 2: Deploy AgentWallet via Factory
      const agentType = agentData.type === "AI_AGENT" ? 1 : 0;
      const tx = await this.factory.createAgentWallet(
        agentData.agentId,
        agentData.jurisdiction,
        passkey.publicKey,
        agentType
      );
      
      spinner.text = `${agentData.name}: Deploying smart wallet...`;
      const receipt = await tx.wait();
      
      // Extract wallet address from event
      const event = receipt.events.find(e => e.event === "AgentWalletCreated");
      const walletAddress = event.args.walletAddress;
      
      spinner.text = `${agentData.name}: Wallet deployed at ${walletAddress.slice(0, 20)}...`;
      await this.delay(300);
      
      // Step 3: KYC/AML Verification
      spinner.text = `${agentData.name}: Running KYC/AML checks...`;
      await this.simulateKYC(walletAddress, agentData);
      
      // Step 4: Store agent data
      const agent = {
        ...agentData,
        walletAddress,
        passkey,
        createdAt: new Date().toISOString(),
        txHash: receipt.hash
      };
      
      this.agents.push(agent);
      this.walletCount++;
      
      spinner.succeed(chalk.green(`${agentData.name} onboarded successfully!`));
      
      // Display agent details
      console.log(chalk.gray(`   ├─ Wallet: ${walletAddress}`));
      console.log(chalk.gray(`   ├─ Agent ID: ${agentData.agentId}`));
      console.log(chalk.gray(`   ├─ Type: ${agentData.type}`));
      console.log(chalk.gray(`   ├─ Jurisdiction: ${agentData.jurisdiction}`));
      console.log(chalk.gray(`   └─ Passkey: ${passkey.publicKey.slice(0, 30)}...\n`));
      
      return agent;
      
    } catch (error) {
      spinner.fail(chalk.red(`Failed to onboard ${agentData.name}: ${error.message}`));
      throw error;
    }
  }

  async simulateKYC(walletAddress, agentData) {
    // Simulate KYC verification process
    const riskLevel = agentData.riskLevel || 0; // 0 = LOW, 1 = MEDIUM, 2 = HIGH
    const kycProvider = "Trellis-KYC-Provider";
    const verificationHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${walletAddress}-${agentData.jurisdiction}-${Date.now()}`)
    );
    
    // In real implementation, this would call the compliance registry
    // await this.compliance.verifyCompliance(walletAddress, agentData.jurisdiction, riskLevel, kycProvider, verificationHash);
    
    await this.delay(800); // Simulate API call
  }

  generatePasskey() {
    // Simulate WebAuthn passkey generation
    const privateKey = ethers.hexlify(ethers.randomBytes(32));
    const publicKey = ethers.keccak256(privateKey);
    
    return {
      privateKey,
      publicKey,
      credentialId: ethers.hexlify(ethers.randomBytes(16)),
      type: "public-key"
    };
  }

  async displaySummary() {
    console.log(chalk.cyan.bold("\n📊 Onboarding Summary\n"));
    console.log(chalk.white(`Total Agents Onboarded: ${this.walletCount}`));
    
    const humans = this.agents.filter(a => a.type === "HUMAN").length;
    const aiAgents = this.agents.filter(a => a.type === "AI_AGENT").length;
    
    console.log(chalk.gray(`  ├─ Human Workers: ${humans}`));
    console.log(chalk.gray(`  └─ AI Agents: ${aiAgents}\n`));
    
    console.log(chalk.cyan("Agent Registry:\n"));
    this.agents.forEach((agent, idx) => {
      console.log(chalk.white(`${idx + 1}. ${agent.name}`));
      console.log(chalk.gray(`   Wallet: ${agent.walletAddress}`));
      console.log(chalk.gray(`   Status: ✓ Verified & Active\n`));
    });
    
    console.log(chalk.green.bold("✅ All agents successfully onboarded to Trellis!\n"));
    
    // Save agents data for other scripts
    const fs = require('fs');
    fs.writeFileSync('./agents-registry.json', JSON.stringify(this.agents, null, 2));
    console.log(chalk.gray("📁 Agent registry saved to agents-registry.json\n"));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();
      
      // Simulate onboarding various types of agents
      const agentsToOnboard = [
        {
          name: "Sarah Chen",
          agentId: "EMP-001-UX",
          type: "HUMAN",
          jurisdiction: "US",
          role: "Senior UX Designer",
          salary: 120000,
          riskLevel: 0
        },
        {
          name: "CodePilot-AI",
          agentId: "AI-002-DEV",
          type: "AI_AGENT",
          jurisdiction: "US",
          role: "Smart Contract Developer",
          salary: 0, // Paid per task
          capabilities: ["solidity", "rust", "security"],
          riskLevel: 1
        },
        {
          name: "Marcus Johnson",
          agentId: "EMP-003-PM",
          type: "HUMAN",
          jurisdiction: "UK",
          role: "Product Manager",
          salary: 95000,
          riskLevel: 0
        },
        {
          name: "DataMiner-Pro",
          agentId: "AI-004-ANALYTICS",
          type: "AI_AGENT",
          jurisdiction: "EU",
          role: "Data Analytics Agent",
          salary: 0,
          capabilities: ["data-analysis", "reporting", "forecasting"],
          riskLevel: 1
        },
        {
          name: "Elena Rodriguez",
          agentId: "EMP-005-DEV",
          type: "HUMAN",
          jurisdiction: "US",
          role: "Full Stack Developer",
          salary: 135000,
          riskLevel: 0
        }
      ];
      
      console.log(chalk.yellow(`📌 Onboarding ${agentsToOnboard.length} agents...\n`));
      
      for (const agent of agentsToOnboard) {
        await this.simulateAgentOnboarding(agent);
      }
      
      await this.displaySummary();
      
    } catch (error) {
      console.error(chalk.red("\n❌ Simulation failed:"), error.message);
      process.exit(1);
    }
  }
}

// Run simulation
const simulator = new TrellisOnboardingSimulator();
simulator.run();
