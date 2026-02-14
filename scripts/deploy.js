const { ethers } = require("hardhat");
const chalk = require("chalk");
const fs = require("fs");

async function main() {
  console.log(chalk.cyan.bold("\n🌿 Trellis Contract Deployment\n"));
  
  const [deployer] = await ethers.getSigners();
  console.log(chalk.gray(`Deploying from: ${deployer.address}`));
  console.log(chalk.gray(`Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`));
  
  const deployedContracts = {};
  
  try {
    // 1. Deploy ComplianceRegistry
    console.log(chalk.yellow("Deploying ComplianceRegistry..."));
    const ComplianceRegistry = await ethers.getContractFactory("ComplianceRegistry");
    // For hackathon demo, we'll use a mock TIP-403 address
    const tip403Registry = "0x0000000000000000000000000000000000000000"; // Replace with actual
    const complianceRegistry = await ComplianceRegistry.deploy(tip403Registry);
    await complianceRegistry.waitForDeployment();
    deployedContracts.complianceRegistry = await complianceRegistry.getAddress();
    console.log(chalk.green(`✓ ComplianceRegistry: ${deployedContracts.complianceRegistry}`));
    
    // 2. Deploy TaxEscrowManager
    console.log(chalk.yellow("\nDeploying TaxEscrowManager..."));
    const TaxEscrowManager = await ethers.getContractFactory("TaxEscrowManager");
    const taxEscrowManager = await TaxEscrowManager.deploy();
    await taxEscrowManager.waitForDeployment();
    deployedContracts.taxEscrowManager = await taxEscrowManager.getAddress();
    console.log(chalk.green(`✓ TaxEscrowManager: ${deployedContracts.taxEscrowManager}`));
    
    // 3. Deploy AgentWalletFactory
    console.log(chalk.yellow("\nDeploying AgentWalletFactory..."));
    const AgentWalletFactory = await ethers.getContractFactory("AgentWalletFactory");
    const agentWalletFactory = await AgentWalletFactory.deploy(deployedContracts.complianceRegistry);
    await agentWalletFactory.waitForDeployment();
    deployedContracts.agentWalletFactory = await agentWalletFactory.getAddress();
    console.log(chalk.green(`✓ AgentWalletFactory: ${deployedContracts.agentWalletFactory}`));
    
    // 4. Deploy PayrollMaster
    console.log(chalk.yellow("\nDeploying PayrollMaster..."));
    const PayrollMaster = await ethers.getContractFactory("PayrollMaster");
    const payrollMaster = await PayrollMaster.deploy(
      deployedContracts.agentWalletFactory,
      deployedContracts.complianceRegistry,
      deployedContracts.taxEscrowManager
    );
    await payrollMaster.waitForDeployment();
    deployedContracts.payrollMaster = await payrollMaster.getAddress();
    console.log(chalk.green(`✓ PayrollMaster: ${deployedContracts.payrollMaster}`));
    
    // 5. Configure contracts
    console.log(chalk.yellow("\nConfiguring contracts..."));
    
    // Set payroll master in tax escrow
    await taxEscrowManager.setPayrollMaster(deployedContracts.payrollMaster);
    console.log(chalk.gray("  ✓ TaxEscrowManager linked to PayrollMaster"));
    
    // Add authorized deployer to factory
    await agentWalletFactory.addAuthorizedDeployer(deployedContracts.payrollMaster);
    console.log(chalk.gray("  ✓ PayrollMaster authorized in AgentWalletFactory"));
    
    // Add jurisdictions
    const jurisdictions = [
      { code: "US", authority: deployer.address, frequency: 30 * 24 * 60 * 60 }, // 30 days
      { code: "UK", authority: deployer.address, frequency: 30 * 24 * 60 * 60 },
      { code: "EU", authority: deployer.address, frequency: 30 * 24 * 60 * 60 }
    ];
    
    for (const jur of jurisdictions) {
      await taxEscrowManager.addJurisdiction(jur.code, jur.authority, jur.frequency);
      console.log(chalk.gray(`  ✓ Added jurisdiction: ${jur.code}`));
    }
    
    // Add compliance officers
    await complianceRegistry.addComplianceOfficer(deployer.address);
    await complianceRegistry.addVerifier(deployer.address);
    console.log(chalk.gray("  ✓ Deployer set as compliance officer"));
    
    console.log(chalk.green.bold("\n✅ All contracts deployed and configured!\n"));
    
    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.config.chainId,
      deployer: deployer.address,
      contracts: deployedContracts,
      deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      `./deployments-${network.name}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(chalk.cyan("Deployment Info:\n"));
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Create .env file template for scripts
    const envContent = `# Trellis Deployment - ${network.name}
TEMPO_RPC_URL=${network.config.url || "https://rpc.moderato.tempo.xyz"}
FACTORY_ADDRESS=${deployedContracts.agentWalletFactory}
COMPLIANCE_ADDRESS=${deployedContracts.complianceRegistry}
PAYROLL_ADDRESS=${deployedContracts.payrollMaster}
TAX_ADDRESS=${deployedContracts.taxEscrowManager}
`;
    
    fs.writeFileSync(`./.env.${network.name}`, envContent);
    console.log(chalk.gray(`\n📁 Environment variables saved to .env.${network.name}`));
    console.log(chalk.gray(`📁 Deployment info saved to deployments-${network.name}.json\n`));
    
  } catch (error) {
    console.error(chalk.red("\n❌ Deployment failed:"), error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
