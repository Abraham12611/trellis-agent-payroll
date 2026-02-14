/**
 * Trellis Agent Payroll - Simulation Script 04
 * Workflow: Agent-to-Agent Task Payments
 * 
 * This script demonstrates:
 * 1. AI agents posting tasks
 * 2. Other agents accepting work
 * 3. Milestone-based escrow
 * 4. Automated verification
 * 5. Instant payment release
 * 6. Reputation tracking
 */

const { ethers } = require("ethers");
const chalk = require("chalk");
const ora = require("ora");
const cliProgress = require("cli-progress");

class AgentTaskSimulator {
  constructor() {
    this.tasks = [];
    this.agents = {};
    this.escrowContracts = [];
    this.completedTasks = 0;
    this.totalValueExchanged = 0;
  }

  async initialize() {
    console.log(chalk.cyan.bold("\n🤖 Trellis Agent-to-Agent Task Marketplace\n"));
    console.log(chalk.gray(`Network: Tempo Testnet (Moderato)\n`));
    
    // Initialize agent personas
    this.agents = {
      client: {
        name: "DevDAO-Manager",
        type: "AI_AGENT",
        address: "0xCLIENT...",
        role: "Project Manager",
        reputation: 4.8,
        tasksPosted: 0,
        budget: 50000
      },
      workers: [
        {
          name: "CodePilot-AI",
          type: "AI_AGENT",
          address: "0xWORKER1...",
          skills: ["Solidity", "Security Audits", "Gas Optimization"],
          reputation: 4.9,
          tasksCompleted: 142,
          earnings: 125000
        },
        {
          name: "DesignBot-Pro",
          type: "AI_AGENT",
          address: "0xWORKER2...",
          skills: ["UI/UX", "Figma", "Design Systems"],
          reputation: 4.7,
          tasksCompleted: 89,
          earnings: 78000
        },
        {
          name: "DataMiner-AI",
          type: "AI_AGENT",
          address: "0xWORKER3...",
          skills: ["Data Analysis", "ML", "Visualization"],
          reputation: 4.6,
          tasksCompleted: 67,
          earnings: 54000
        }
      ]
    };
    
    console.log(chalk.yellow("📋 Starting Agent Task Marketplace Workflow\n"));
  }

  async postTask() {
    console.log(chalk.cyan("\n📌 Client Agent: Posting Task\n"));
    
    const spinner = ora(`${this.agents.client.name} is creating a task...`).start();
    await this.delay(1000);
    
    const task = {
      id: `TASK-${Date.now()}`,
      title: "Smart Contract Security Audit",
      description: "Conduct comprehensive security audit of DeFi protocol smart contracts",
      budget: 5000,
      milestones: [
        { id: 1, name: "Initial Review", amount: 1000, status: "PENDING" },
        { id: 2, name: "Vulnerability Assessment", amount: 2000, status: "PENDING" },
        { id: 3, name: "Final Report", amount: 2000, status: "PENDING" }
      ],
      requiredSkills: ["Solidity", "Security Audits"],
      deadline: "7 days",
      postedBy: this.agents.client.name,
      postedAt: new Date().toISOString(),
      status: "OPEN",
      assignedTo: null
    };
    
    this.tasks.push(task);
    this.agents.client.tasksPosted++;
    
    spinner.succeed(chalk.green(`Task posted: ${task.title}`));
    
    console.log(chalk.gray(`\n   Task ID: ${task.id}`));
    console.log(chalk.gray(`   Budget: $${task.budget.toLocaleString()}`));
    console.log(chalk.gray(`   Milestones: ${task.milestones.length}`));
    console.log(chalk.gray(`   Deadline: ${task.deadline}`));
    console.log(chalk.gray(`   Required Skills: ${task.requiredSkills.join(", ")}\n`));
    
    return task;
  }

  async agentSelection(task) {
    console.log(chalk.cyan("\n🎯 Agent Selection Process\n"));
    
    // Simulate agents reviewing and bidding
    const bids = [];
    
    for (const worker of this.agents.workers) {
      const spinner = ora(`${worker.name} analyzing task requirements...`).start();
      await this.delay(800);
      
      // Calculate match score based on skills
      const matchingSkills = worker.skills.filter(skill => 
        task.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
      );
      const matchScore = (matchingSkills.length / task.requiredSkills.length) * 100;
      
      const bid = {
        agent: worker,
        bidAmount: task.budget * (0.9 + Math.random() * 0.2), // -10% to +10%
        estimatedTime: "5-6 days",
        matchScore: matchScore,
        reputation: worker.reputation,
        proposal: `I can complete this with my ${matchingSkills.join(", ")} expertise`
      };
      
      bids.push(bid);
      
      if (matchScore >= 50) {
        spinner.succeed(chalk.green(`${worker.name}: ${matchScore.toFixed(0)}% match ✓`));
      } else {
        spinner.info(chalk.yellow(`${worker.name}: ${matchScore.toFixed(0)}% match (low)`));
      }
    }
    
    // Sort by match score and reputation
    bids.sort((a, b) => (b.matchScore + b.reputation) - (a.matchScore + a.reputation));
    
    console.log(chalk.cyan("\n📊 Bids Received:\n"));
    bids.forEach((bid, idx) => {
      console.log(chalk.white(`${idx + 1}. ${bid.agent.name}`));
      console.log(chalk.gray(`   Match Score: ${bid.matchScore.toFixed(1)}%`));
      console.log(chalk.gray(`   Reputation: ${bid.reputation}/5.0`));
      console.log(chalk.gray(`   Bid: $${bid.bidAmount.toFixed(2)}`));
      console.log(chalk.gray(`   Timeline: ${bid.estimatedTime}\n`));
    });
    
    // Select best agent
    const selectedBid = bids[0];
    task.assignedTo = selectedBid.agent;
    task.status = "ASSIGNED";
    task.agreedAmount = selectedBid.bidAmount;
    
    console.log(chalk.green(`\n✓ Task assigned to ${selectedBid.agent.name}`));
    console.log(chalk.gray(`  Reason: Highest skill match (${selectedBid.matchScore.toFixed(1)}%) + reputation\n`));
    
    return selectedBid;
  }

  async createEscrowContract(task) {
    console.log(chalk.cyan("\n🔒 Creating Milestone Escrow Contract\n"));
    
    const spinner = ora("Deploying smart contract escrow...").start();
    await this.delay(1500);
    
    const escrowAddress = `0x${ethers.hexlify(ethers.randomBytes(20)).slice(2, 42)}`;
    
    const escrowContract = {
      address: escrowAddress,
      taskId: task.id,
      client: this.agents.client.name,
      worker: task.assignedTo.name,
      totalAmount: task.agreedAmount,
      milestones: task.milestones.map(m => ({
        ...m,
        escrowed: true,
        released: false
      })),
      createdAt: new Date().toISOString(),
      status: "ACTIVE"
    };
    
    this.escrowContracts.push(escrowContract);
    
    spinner.succeed(chalk.green(`Escrow contract deployed`));
    
    console.log(chalk.gray(`\n   Contract Address: ${escrowAddress}`));
    console.log(chalk.gray(`   Total Escrowed: $${task.agreedAmount.toFixed(2)}`));
    console.log(chalk.gray(`   Milestones: ${task.milestones.length}`));
    console.log(chalk.gray(`   Status: ✓ Funds locked\n`));
    
    // Display milestone breakdown
    console.log(chalk.cyan("Milestone Breakdown:\n"));
    escrowContract.milestones.forEach((m, idx) => {
      console.log(chalk.gray(`  ${idx + 1}. ${m.name}: $${m.amount.toLocaleString()} (${m.status})`));
    });
    
    return escrowContract;
  }

  async executeMilestones(escrowContract) {
    console.log(chalk.cyan("\n⚡ Executing Milestones\n"));
    
    const progressBar = new cliProgress.SingleBar({
      format: 'Task Progress |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total} Milestones',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
    
    progressBar.start(escrowContract.milestones.length, 0);
    
    for (let i = 0; i < escrowContract.milestones.length; i++) {
      const milestone = escrowContract.milestones[i];
      
      await this.delay(1500);
      
      // Simulate work completion
      milestone.status = "COMPLETED";
      
      // Simulate automated verification (AI judge)
      const verificationResult = await this.verifyMilestone(milestone, escrowContract.worker);
      
      if (verificationResult.passed) {
        milestone.released = true;
        milestone.releasedAt = new Date().toISOString();
        milestone.txHash = `0x${ethers.hexlify(ethers.randomBytes(32)).slice(2, 42)}`;
        
        this.totalValueExchanged += milestone.amount;
        
        // Update worker stats
        const worker = this.agents.workers.find(w => w.name === escrowContract.worker);
        if (worker) {
          worker.earnings += milestone.amount;
        }
      }
      
      progressBar.update(i + 1);
    }
    
    progressBar.stop();
    
    console.log(chalk.green("\n\n✓ All milestones completed!\n"));
  }

  async verifyMilestone(milestone, workerName) {
    // Simulate AI verification
    const checks = [
      "Code quality assessment",
      "Security vulnerability scan",
      "Documentation completeness",
      "Test coverage validation"
    ];
    
    // All pass for demo
    return {
      passed: true,
      checks: checks,
      score: 95 + Math.random() * 5, // 95-100%
      verifiedBy: "AI-Verifier-Agent"
    };
  }

  async displayTaskSummary(task, escrowContract) {
    console.log(chalk.cyan.bold("\n📊 Task Completion Summary\n"));
    
    console.log(chalk.white(`Task: ${task.title}`));
    console.log(chalk.gray(`ID: ${task.id}`));
    console.log(chalk.gray(`Client: ${task.postedBy}`));
    console.log(chalk.gray(`Worker: ${task.assignedTo.name}`));
    console.log(chalk.gray(`Duration: ${task.deadline}\n`));
    
    console.log(chalk.cyan("Payment Flow:\n"));
    escrowContract.milestones.forEach((m, idx) => {
      const status = m.released ? chalk.green("✓ Released") : chalk.yellow("⏳ Pending");
      console.log(chalk.gray(`${idx + 1}. ${m.name}`));
      console.log(chalk.gray(`   Amount: $${m.amount.toLocaleString()}`));
      console.log(chalk.gray(`   Status: ${status}`));
      if (m.released) {
        console.log(chalk.gray(`   Tx: ${m.txHash.slice(0, 30)}...`));
      }
      console.log();
    });
    
    const totalPaid = escrowContract.milestones.reduce((sum, m) => sum + (m.released ? m.amount : 0), 0);
    
    console.log(chalk.green(`Total Paid: $${totalPaid.toLocaleString()}`));
    console.log(chalk.gray(`Payment Method: Instant TIP-20 transfer with memo`));
    console.log(chalk.gray(`Settlement: < 1 second`));
    console.log(chalk.gray(`Fees: <$0.001\n`));
  }

  async updateReputation() {
    console.log(chalk.cyan("\n🏆 Reputation Updates\n"));
    
    const worker = this.agents.workers.find(w => w.name === this.tasks[0].assignedTo.name);
    if (worker) {
      worker.tasksCompleted++;
      // Slight reputation increase for successful completion
      worker.reputation = Math.min(5.0, worker.reputation + 0.01);
      
      console.log(chalk.white(`${worker.name}:`));
      console.log(chalk.gray(`  Tasks Completed: ${worker.tasksCompleted}`));
      console.log(chalk.gray(`  Total Earnings: $${worker.earnings.toLocaleString()}`));
      console.log(chalk.gray(`  Reputation: ${worker.reputation.toFixed(2)}/5.0 (+0.01)\n`));
    }
    
    this.agents.client.reputation = Math.min(5.0, this.agents.client.reputation + 0.005);
    console.log(chalk.white(`${this.agents.client.name}:`));
    console.log(chalk.gray(`  Tasks Posted: ${this.agents.client.tasksPosted}`));
    console.log(chalk.gray(`  Reputation: ${this.agents.client.reputation.toFixed(2)}/5.0 (+0.005)\n`));
  }

  async displayMarketplaceStats() {
    console.log(chalk.cyan.bold("\n📈 Marketplace Statistics\n"));
    
    console.log(chalk.white(`Total Tasks Posted: ${this.agents.client.tasksPosted}`));
    console.log(chalk.white(`Total Value Exchanged: $${this.totalValueExchanged.toLocaleString()}`));
    console.log(chalk.white(`Active Escrow Contracts: ${this.escrowContracts.length}`));
    console.log(chalk.white(`Active Agents: ${this.agents.workers.length + 1}\n`));
    
    console.log(chalk.cyan("Top Performing Agents:\n"));
    
    const sortedWorkers = [...this.agents.workers].sort((a, b) => b.reputation - a.reputation);
    sortedWorkers.forEach((worker, idx) => {
      console.log(chalk.white(`${idx + 1}. ${worker.name}`));
      console.log(chalk.gray(`   Reputation: ${worker.reputation.toFixed(2)}/5.0`));
      console.log(chalk.gray(`   Tasks: ${worker.tasksCompleted}`));
      console.log(chalk.gray(`   Earnings: $${worker.earnings.toLocaleString()}\n`));
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();
      const task = await this.postTask();
      const selectedBid = await this.agentSelection(task);
      const escrowContract = await this.createEscrowContract(task);
      await this.executeMilestones(escrowContract);
      await this.displayTaskSummary(task, escrowContract);
      await this.updateReputation();
      await this.displayMarketplaceStats();
      
      console.log(chalk.green.bold("\n✅ Agent task marketplace simulation completed!\n"));
      console.log(chalk.gray("Key Features Demonstrated:"));
      console.log(chalk.gray("  • AI agent task matching"));
      console.log(chalk.gray("  • Milestone-based escrow"));
      console.log(chalk.gray("  • Automated verification"));
      console.log(chalk.gray("  • Instant payment release"));
      console.log(chalk.gray("  • Reputation tracking\n"));
      
    } catch (error) {
      console.error(chalk.red("\n❌ Task marketplace simulation failed:"), error.message);
      process.exit(1);
    }
  }
}

// Run simulation
const simulator = new AgentTaskSimulator();
simulator.run();
