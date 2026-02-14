/**
 * Trellis Agent Payroll - Simulation Script 02
 * Workflow: Batch Payroll Execution
 * 
 * This script demonstrates:
 * 1. Employer depositing funds
 * 2. Adding employees to roster
 * 3. Scheduling batch payroll
 * 4. Executing atomic batch payments
 * 5. Tax withholding and escrow
 * 6. Payment memos and tracking
 */

const { ethers } = require("ethers");
const chalk = require("chalk");
const ora = require("ora");
const cliProgress = require("cli-progress");

// Load agents from previous simulation
let agentsRegistry = [];
try {
  agentsRegistry = require("../agents-registry.json");
} catch (e) {
  console.log(chalk.yellow("⚠️  No agents registry found. Run 01-agent-onboarding.js first."));
  // Use mock data for standalone demo
  agentsRegistry = [
    { name: "Sarah Chen", walletAddress: "0x1234...", agentId: "EMP-001", type: "HUMAN", jurisdiction: "US", salary: 120000 },
    { name: "CodePilot-AI", walletAddress: "0x5678...", agentId: "AI-002", type: "AI_AGENT", jurisdiction: "US", salary: 0 },
    { name: "Marcus Johnson", walletAddress: "0x9abc...", agentId: "EMP-003", type: "HUMAN", jurisdiction: "UK", salary: 95000 },
    { name: "Elena Rodriguez", walletAddress: "0xdef0...", agentId: "EMP-005", type: "HUMAN", jurisdiction: "US", salary: 135000 }
  ];
}

const TEMPO_CONFIG = {
  rpcUrl: process.env.TEMPO_RPC_URL || "https://rpc.moderato.tempo.xyz",
  chainId: 42431
};

class PayrollSimulator {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(TEMPO_CONFIG.rpcUrl);
    this.employees = [];
    this.payrollRuns = [];
    this.totalDisbursed = ethers.parseEther("0");
    this.totalTaxes = ethers.parseEther("0");
  }

  async initialize() {
    console.log(chalk.cyan.bold("\n💰 Trellis Batch Payroll Simulator\n"));
    console.log(chalk.gray(`Network: Tempo Testnet (Moderato)\n`));
    
    this.employer = ethers.Wallet.createRandom().connect(this.provider);
    console.log(chalk.green(`✓ Employer Account: ${this.employer.address}\n`));
    
    // Tax rates by jurisdiction (basis points)
    this.taxRates = {
      "US": 2500,    // 25%
      "UK": 2000,    // 20%
      "EU": 2200     // 22%
    };
    
    console.log(chalk.yellow("📋 Starting Payroll Workflow\n"));
  }

  async simulateEmployerDeposit() {
    const spinner = ora("Processing employer deposit...").start();
    
    try {
      // Simulate deposit of $500,000 USDC equivalent
      const depositAmount = ethers.parseUnits("500000", 6); // 6 decimals for stablecoins
      
      await this.delay(1000);
      
      this.employerBalance = depositAmount;
      
      spinner.succeed(chalk.green(`Employer deposited ${ethers.formatUnits(depositAmount, 6)} PATHUSD`));
      console.log(chalk.gray(`   Tx Hash: 0x${ethers.hexlify(ethers.randomBytes(32)).slice(2, 42)}...`));
      console.log(chalk.gray(`   Status: ✓ Confirmed (Finalized in 0.5s)\n`));
      
      return depositAmount;
      
    } catch (error) {
      spinner.fail(chalk.red(`Deposit failed: ${error.message}`));
      throw error;
    }
  }

  async addEmployeesToRoster() {
    console.log(chalk.cyan("\n👥 Adding Employees to Roster\n"));
    
    const employees = agentsRegistry.filter(agent => agent.type === "HUMAN");
    const progressBar = new cliProgress.SingleBar({
      format: 'Adding Employees |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
    
    progressBar.start(employees.length, 0);
    
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const taxRate = this.taxRates[emp.jurisdiction] || 2500;
      const monthlySalary = Math.floor(emp.salary / 12);
      
      const employee = {
        id: emp.agentId,
        name: emp.name,
        walletAddress: emp.walletAddress,
        salary: monthlySalary,
        annualSalary: emp.salary,
        taxRate: taxRate,
        jurisdiction: emp.jurisdiction,
        addedAt: new Date().toISOString()
      };
      
      this.employees.push(employee);
      
      progressBar.update(i + 1);
      await this.delay(300);
    }
    
    progressBar.stop();
    console.log(chalk.green(`\n✓ Added ${this.employees.length} employees to roster\n`));
    
    // Display roster
    console.log(chalk.cyan("Employee Roster:\n"));
    this.employees.forEach((emp, idx) => {
      const taxAmount = (emp.salary * emp.taxRate) / 10000;
      const netSalary = emp.salary - taxAmount;
      
      console.log(chalk.white(`${idx + 1}. ${emp.name} (${emp.id})`));
      console.log(chalk.gray(`   Gross Salary: $${emp.salary.toLocaleString()}/month`));
      console.log(chalk.gray(`   Tax (${(emp.taxRate/100)}%): $${taxAmount.toLocaleString()}`));
      console.log(chalk.gray(`   Net Salary: $${netSalary.toLocaleString()}`));
      console.log(chalk.gray(`   Jurisdiction: ${emp.jurisdiction}\n`));
    });
  }

  async schedulePayrollBatch() {
    console.log(chalk.cyan("\n📅 Scheduling Payroll Batch\n"));
    
    const spinner = ora("Calculating payroll totals...").start();
    
    let totalGross = 0;
    let totalTax = 0;
    
    this.employees.forEach(emp => {
      totalGross += emp.salary;
      totalTax += (emp.salary * emp.taxRate) / 10000;
    });
    
    const totalNet = totalGross - totalTax;
    const executeTime = new Date(Date.now() + 5000); // Execute in 5 seconds
    
    await this.delay(1000);
    
    spinner.succeed(chalk.green("Payroll batch scheduled"));
    
    const batchId = ethers.keccak256(
      ethers.toUtf8Bytes(`PAYROLL-${Date.now()}-${this.employer.address}`)
    );
    
    const batch = {
      id: batchId,
      employer: this.employer.address,
      employeeCount: this.employees.length,
      totalGross: totalGross,
      totalTax: totalTax,
      totalNet: totalNet,
      scheduledTime: executeTime.toISOString(),
      status: "SCHEDULED"
    };
    
    this.payrollRuns.push(batch);
    
    console.log(chalk.gray(`\n   Batch ID: ${batchId.slice(0, 30)}...`));
    console.log(chalk.gray(`   Employees: ${batch.employeeCount}`));
    console.log(chalk.gray(`   Total Gross: $${totalGross.toLocaleString()}`));
    console.log(chalk.gray(`   Total Tax Withholding: $${totalTax.toLocaleString()}`));
    console.log(chalk.gray(`   Total Net: $${totalNet.toLocaleString()}`));
    console.log(chalk.gray(`   Scheduled: ${executeTime.toLocaleString()}\n`));
    
    return batch;
  }

  async executePayrollBatch(batch) {
    console.log(chalk.cyan(`\n🚀 Executing Payroll Batch\n`));
    console.log(chalk.yellow(`⏳ Waiting for scheduled time...\n`));
    
    await this.delay(3000); // Simulate waiting
    
    const spinner = ora("Executing batch payments...").start();
    
    try {
      // Simulate batch execution with atomic transactions
      const payments = [];
      const taxEscrows = {};
      
      for (const emp of this.employees) {
        const taxAmount = Math.floor((emp.salary * emp.taxRate) / 10000);
        const netAmount = emp.salary - taxAmount;
        
        // Generate payment memo with employee ID and timestamp
        const memo = ethers.keccak256(
          ethers.toUtf8Bytes(`${emp.id}-${Date.now()}-${emp.jurisdiction}`)
        );
        
        payments.push({
          employee: emp,
          grossAmount: emp.salary,
          taxAmount: taxAmount,
          netAmount: netAmount,
          memo: memo,
          status: "PENDING"
        });
        
        // Accumulate tax by jurisdiction
        if (!taxEscrows[emp.jurisdiction]) {
          taxEscrows[emp.jurisdiction] = 0;
        }
        taxEscrows[emp.jurisdiction] += taxAmount;
      }
      
      await this.delay(1500);
      
      // Simulate atomic execution
      spinner.text = "Processing transfers...";
      
      let successCount = 0;
      for (const payment of payments) {
        // Simulate transfer
        await this.delay(100);
        payment.status = "SUCCESS";
        payment.txHash = `0x${ethers.hexlify(ethers.randomBytes(32)).slice(2, 42)}`;
        payment.timestamp = new Date().toISOString();
        successCount++;
      }
      
      spinner.text = "Escrowing taxes...";
      await this.delay(800);
      
      // Update totals
      this.totalDisbursed = ethers.parseUnits(batch.totalNet.toString(), 6);
      this.totalTaxes = ethers.parseUnits(batch.totalTax.toString(), 6);
      
      batch.status = "EXECUTED";
      batch.executedAt = new Date().toISOString();
      batch.payments = payments;
      batch.taxEscrows = taxEscrows;
      
      spinner.succeed(chalk.green(`Payroll batch executed successfully!`));
      
      console.log(chalk.gray(`\n   Execution Time: ${new Date().toLocaleString()}`));
      console.log(chalk.gray(`   Transactions: ${successCount}/${payments.length} successful`));
      console.log(chalk.gray(`   Finality: < 1 second`));
      console.log(chalk.gray(`   Gas per payment: <$0.001`));
      console.log(chalk.gray(`   Total Gas: <$0.01\n`));
      
      return batch;
      
    } catch (error) {
      spinner.fail(chalk.red(`Batch execution failed: ${error.message}`));
      // In real Tempo, atomic batch ensures all-or-nothing
      console.log(chalk.yellow("⚠️  Atomic rollback: All transactions reverted\n"));
      throw error;
    }
  }

  async displayPaymentDetails(batch) {
    console.log(chalk.cyan("\n📋 Payment Details\n"));
    
    batch.payments.forEach((payment, idx) => {
      console.log(chalk.white(`${idx + 1}. ${payment.employee.name}`));
      console.log(chalk.gray(`   Gross: $${payment.grossAmount.toLocaleString()}`));
      console.log(chalk.gray(`   Tax: -$${payment.taxAmount.toLocaleString()}`));
      console.log(chalk.green(`   Net: $${payment.netAmount.toLocaleString()}`));
      console.log(chalk.gray(`   Memo: ${payment.memo.slice(0, 25)}...`));
      console.log(chalk.gray(`   Tx: ${payment.txHash.slice(0, 30)}...\n`));
    });
    
    // Tax escrow summary
    console.log(chalk.cyan("\n🏛️  Tax Escrow by Jurisdiction\n"));
    Object.entries(batch.taxEscrows).forEach(([jurisdiction, amount]) => {
      console.log(chalk.gray(`${jurisdiction}: $${amount.toLocaleString()}`));
    });
  }

  async displayFinalSummary() {
    console.log(chalk.cyan.bold("\n📊 Payroll Execution Summary\n"));
    
    console.log(chalk.white(`Total Employees Paid: ${this.employees.length}`));
    console.log(chalk.white(`Total Gross Disbursed: $${ethers.formatUnits(this.totalDisbursed.add(this.totalTaxes), 6)}`));
    console.log(chalk.gray(`  ├─ Net to Employees: $${ethers.formatUnits(this.totalDisbursed, 6)}`));
    console.log(chalk.gray(`  └─ Tax Withheld: $${ethers.formatUnits(this.totalTaxes, 6)}\n`));
    
    console.log(chalk.cyan("Key Metrics:\n"));
    console.log(chalk.gray(`  ✓ Settlement Time: < 1 second`));
    console.log(chalk.gray(`  ✓ Transaction Fees: <$0.01 total`));
    console.log(chalk.gray(`  ✓ Atomic Execution: All-or-nothing`));
    console.log(chalk.gray(`  ✓ Payment Memos: Embedded in TIP-20 transfers`));
    console.log(chalk.gray(`  ✓ Tax Compliance: Automatic withholding & escrow\n`));
    
    console.log(chalk.green.bold("✅ Payroll batch completed successfully!\n"));
    
    // Save payroll data
    const fs = require('fs');
    fs.writeFileSync('./payroll-history.json', JSON.stringify(this.payrollRuns, null, 2));
    console.log(chalk.gray("📁 Payroll history saved to payroll-history.json\n"));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();
      await this.simulateEmployerDeposit();
      await this.addEmployeesToRoster();
      const batch = await this.schedulePayrollBatch();
      const executedBatch = await this.executePayrollBatch(batch);
      await this.displayPaymentDetails(executedBatch);
      await this.displayFinalSummary();
      
    } catch (error) {
      console.error(chalk.red("\n❌ Payroll simulation failed:"), error.message);
      process.exit(1);
    }
  }
}

// Run simulation
const simulator = new PayrollSimulator();
simulator.run();
