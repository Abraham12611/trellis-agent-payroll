/**
 * Trellis Agent Payroll - Simulation Script 03
 * Workflow: Compliance & Regulatory Checks
 * 
 * This script demonstrates:
 * 1. TIP-403 policy enforcement
 * 2. KYC/AML verification status
 * 3. Blacklist/whitelist checks
 * 4. Jurisdiction compliance
 * 5. Risk assessment
 * 6. Audit trail generation
 */

const { ethers } = require("ethers");
const chalk = require("chalk");
const ora = require("ora");
const Table = require("cli-table3");

// Mock agents for compliance checks
const testAgents = [
  { address: "0x1111...", name: "Verified User 1", jurisdiction: "US", status: "VERIFIED", risk: "LOW" },
  { address: "0x2222...", name: "Verified User 2", jurisdiction: "UK", status: "VERIFIED", risk: "LOW" },
  { address: "0x3333...", name: "Pending User", jurisdiction: "EU", status: "PENDING", risk: "MEDIUM" },
  { address: "0x4444...", name: "Sanctioned Entity", jurisdiction: "US", status: "REJECTED", risk: "CRITICAL" },
  { address: "0x5555...", name: "Expired KYC", jurisdiction: "UK", status: "EXPIRED", risk: "HIGH" },
  { address: "0x6666...", name: "AI Agent", jurisdiction: "US", status: "VERIFIED", risk: "MEDIUM" },
];

class ComplianceSimulator {
  constructor() {
    this.checksPerformed = 0;
    this.violations = [];
    this.auditLog = [];
  }

  async initialize() {
    console.log(chalk.cyan.bold("\n🔒 Trellis Compliance & Regulatory Simulator\n"));
    console.log(chalk.gray(`Network: Tempo Testnet (Moderato)\n`));
    
    console.log(chalk.yellow("📋 Running Compliance Checks\n"));
    console.log(chalk.gray("Integrating with TIP-403 Policy Registry...\n"));
  }

  async checkTIP403Policies() {
    console.log(chalk.cyan("\n📋 TIP-403 Policy Enforcement\n"));
    
    const spinner = ora("Loading active policies...").start();
    await this.delay(800);
    
    const policies = [
      { id: "POL-001", type: "whitelist", jurisdiction: "US", active: true },
      { id: "POL-002", type: "blacklist", jurisdiction: "GLOBAL", active: true },
      { id: "POL-003", type: "kyc-required", jurisdiction: "US", active: true },
      { id: "POL-004", type: "kyc-required", jurisdiction: "EU", active: true },
      { id: "POL-005", type: "kyc-required", jurisdiction: "UK", active: true },
      { id: "POL-006", type: "sanctions", jurisdiction: "GLOBAL", active: true },
    ];
    
    spinner.succeed(chalk.green(`Loaded ${policies.length} active policies`));
    
    console.log(chalk.cyan("\nActive Policies:\n"));
    policies.forEach(policy => {
      const status = policy.active ? chalk.green("✓ Active") : chalk.red("✗ Inactive");
      console.log(chalk.gray(`  ${policy.id}: ${policy.type.toUpperCase()} (${policy.jurisdiction}) ${status}`));
    });
  }

  async runComplianceChecks() {
    console.log(chalk.cyan("\n🔍 Running Compliance Verification\n"));
    
    const results = [];
    
    for (const agent of testAgents) {
      const spinner = ora(`Checking ${agent.name}...`).start();
      await this.delay(500);
      
      const check = await this.verifyAgentCompliance(agent);
      results.push(check);
      
      this.checksPerformed++;
      
      if (check.passed) {
        spinner.succeed(chalk.green(`${agent.name}: COMPLIANT`));
      } else {
        spinner.fail(chalk.red(`${agent.name}: NON-COMPLIANT - ${check.reason}`));
        this.violations.push(check);
      }
      
      // Log to audit trail
      this.auditLog.push({
        timestamp: new Date().toISOString(),
        agent: agent.name,
        address: agent.address,
        check: "COMPLIANCE",
        result: check.passed ? "PASS" : "FAIL",
        reason: check.reason || null
      });
    }
    
    return results;
  }

  async verifyAgentCompliance(agent) {
    // Simulate compliance checks against TIP-403
    const checks = {
      blacklist: !agent.name.includes("Sanctioned"),
      kycValid: agent.status === "VERIFIED",
      notExpired: agent.status !== "EXPIRED",
      jurisdictionAllowed: ["US", "UK", "EU"].includes(agent.jurisdiction),
      riskAcceptable: agent.risk !== "CRITICAL"
    };
    
    const passed = Object.values(checks).every(c => c);
    
    let reason = null;
    if (!checks.blacklist) reason = "Blacklisted entity";
    else if (!checks.kycValid) reason = "KYC not verified";
    else if (!checks.notExpired) reason = "KYC expired";
    else if (!checks.jurisdictionAllowed) reason = "Unsupported jurisdiction";
    else if (!checks.riskAcceptable) reason = "Critical risk level";
    
    return {
      agent,
      passed,
      reason,
      checks
    };
  }

  async simulateRealTimeScreening() {
    console.log(chalk.cyan("\n⚡ Real-Time Transaction Screening\n"));
    
    const transactions = [
      { from: "0x1111...", to: "0x2222...", amount: 5000, type: "PAYMENT" },
      { from: "0x1111...", to: "0x4444...", amount: 10000, type: "PAYMENT" }, // Sanctioned!
      { from: "0x3333...", to: "0x2222...", amount: 3000, type: "PAYMENT" }, // Pending KYC
      { from: "0x6666...", to: "0x1111...", amount: 2500, type: "TASK_PAYMENT" },
    ];
    
    for (const tx of transactions) {
      const spinner = ora(`Screening tx: ${tx.from.slice(0, 10)}... → ${tx.to.slice(0, 10)}... ($${tx.amount})`).start();
      await this.delay(400);
      
      // Check both parties
      const fromAgent = testAgents.find(a => a.address === tx.from);
      const toAgent = testAgents.find(a => a.address === tx.to);
      
      let allowed = true;
      let reason = null;
      
      if (fromAgent?.name.includes("Sanctioned") || toAgent?.name.includes("Sanctioned")) {
        allowed = false;
        reason = "Sanctioned entity detected";
      } else if (fromAgent?.status === "PENDING" || toAgent?.status === "PENDING") {
        allowed = false;
        reason = "KYC pending";
      } else if (fromAgent?.risk === "CRITICAL" || toAgent?.risk === "CRITICAL") {
        allowed = false;
        reason = "Critical risk level";
      }
      
      this.checksPerformed++;
      this.auditLog.push({
        timestamp: new Date().toISOString(),
        transaction: tx,
        check: "TRANSACTION_SCREENING",
        result: allowed ? "ALLOWED" : "BLOCKED",
        reason
      });
      
      if (allowed) {
        spinner.succeed(chalk.green(`Transaction allowed`));
      } else {
        spinner.fail(chalk.red(`Transaction blocked: ${reason}`));
      }
    }
  }

  async generateAuditReport() {
    console.log(chalk.cyan("\n📊 Compliance Audit Report\n"));
    
    // Create summary table
    const table = new Table({
      head: [chalk.white('Metric'), chalk.white('Value')],
      colWidths: [40, 20]
    });
    
    const compliantCount = testAgents.filter(a => !a.name.includes("Sanctioned") && a.status === "VERIFIED").length;
    
    table.push(
      ['Total Checks Performed', this.checksPerformed],
      ['Agents Verified', compliantCount],
      ['Violations Found', this.violations.length],
      ['Transactions Screened', 4],
      ['Transactions Blocked', this.violations.length],
      ['Compliance Rate', `${((this.checksPerformed - this.violations.length) / this.checksPerformed * 100).toFixed(1)}%`]
    );
    
    console.log(table.toString());
    
    console.log(chalk.cyan("\n🚨 Violations Detected:\n"));
    if (this.violations.length === 0) {
      console.log(chalk.green("✓ No violations detected"));
    } else {
      this.violations.forEach((v, idx) => {
        console.log(chalk.red(`${idx + 1}. ${v.agent.name}`));
        console.log(chalk.gray(`   Address: ${v.agent.address}`));
        console.log(chalk.gray(`   Reason: ${v.reason}`));
        console.log(chalk.gray(`   Jurisdiction: ${v.agent.jurisdiction}\n`));
      });
    }
    
    console.log(chalk.cyan("\n📝 Audit Trail:\n"));
    console.log(chalk.gray(`Total audit entries: ${this.auditLog.length}`));
    console.log(chalk.gray(`Log integrity: ✓ Immutable (on-chain storage)`));
    console.log(chalk.gray(`Retention: Permanent\n`));
  }

  async displayComplianceFeatures() {
    console.log(chalk.cyan("\n🛡️  Trellis Compliance Features\n"));
    
    const features = [
      {
        name: "TIP-403 Policy Registry",
        description: "Native integration with Tempo's compliance policies",
        status: "✓ Active"
      },
      {
        name: "Real-Time Screening",
        description: "Every payment checked against policies before execution",
        status: "✓ Active"
      },
      {
        name: "KYC/AML Verification",
        description: "Multi-provider KYC with risk scoring",
        status: "✓ Active"
      },
      {
        name: "Sanctions Screening",
        description: "Automatic blacklist checking",
        status: "✓ Active"
      },
      {
        name: "Jurisdiction Controls",
        description: "Per-region compliance rules",
        status: "✓ Active"
      },
      {
        name: "Audit Trail",
        description: "Immutable on-chain compliance logs",
        status: "✓ Active"
      },
      {
        name: "Risk Scoring",
        description: "Dynamic risk assessment per agent",
        status: "✓ Active"
      }
    ];
    
    features.forEach((feature, idx) => {
      console.log(chalk.white(`${idx + 1}. ${feature.name}`));
      console.log(chalk.gray(`   ${feature.description}`));
      console.log(chalk.green(`   ${feature.status}\n`));
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();
      await this.checkTIP403Policies();
      await this.runComplianceChecks();
      await this.simulateRealTimeScreening();
      await this.generateAuditReport();
      await this.displayComplianceFeatures();
      
      console.log(chalk.green.bold("\n✅ Compliance simulation completed!\n"));
      
    } catch (error) {
      console.error(chalk.red("\n❌ Compliance simulation failed:"), error.message);
      process.exit(1);
    }
  }
}

// Run simulation
const simulator = new ComplianceSimulator();
simulator.run();
