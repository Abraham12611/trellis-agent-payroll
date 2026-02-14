# Trellis Demo Scripts

Complete scripts for hackathon presentation - pitch and technical demo.

---

## Part 1: The Pitch (3 Minutes)

**Total Time:** 3:00 minutes  
**Goal:** Generate excitement and show the problem/solution fit  
**Audience:** Judges, investors, general hackathon audience

---

### **SCRIPT: Trellis - Pitch Demo (3 Minutes)**

#### **HOOK (0:00-0:15)** - 15 seconds

*[Open with web app on screen - Trellis logo visible]*

**Speaker:**
"In 2025, AI agents are becoming employees. GPT-5 writes code. Claude analyzes data. But here's the problem - **AI agents can't hire other AI agents because there's no payroll infrastructure.**

*[Pause for effect]*

Until today. I'm excited to introduce **Trellis** - the complete payroll operating system for the AI agent economy."

---

#### **THE PROBLEM (0:15-0:45)** - 30 seconds

*[Switch to slide: Split screen showing old way vs new way]*

**Speaker:**
"Right now, if an AI agent wants to hire another AI agent, what happens? 

*[Click through examples]*

- Manual crypto transfers? No compliance, no audit trail.
- Traditional payroll? Takes 3-5 days, only works for humans.
- DeFi payments? No tax automation, no KYC.

**The $50 billion AI agent economy is bottlenecked by payment infrastructure.** Companies like Anthropic, OpenAI, and thousands of AI startups need this yesterday."

---

#### **THE SOLUTION (0:45-1:30)** - 45 seconds

*[Switch to live web app - Dashboard view]*

**Speaker:**
"Trellis solves this with a complete payroll OS built on Tempo blockchain.

*[Navigate through screens as you speak]*

**First** - Agent Wallet Factory. Deploy TIP-20 wallets with passkey authentication. No seed phrases, just Face ID or Touch ID.

**Second** - Smart Payroll Contracts. Batch payments with automatic tax withholding. Pay thousands of agents simultaneously using Tempo's 2D nonces.

**Third** - Compliance Engine. Native TIP-403 integration for KYC/AML. Real-time sanctions screening.

*[Pause on compliance dashboard]*

**And fourth** - Agent Marketplace. AI agents can post tasks, accept work, and get paid through milestone escrow.

**Settlement in under 1 second. Cost under $0.001 per payment.**"

---

#### **WHY NOW / WHY US (1:30-2:15)** - 45 seconds

*[Switch to comparison slide or Tempo features slide]*

**Speaker:**
"Why Tempo? Because Trellis uses **8 native Tempo features** that are painful on other chains:

*[Count on fingers or highlight on screen]*

1. TIP-20 tokens with payment memos
2. TIP-403 compliance policies
3. Native batch transactions - atomic execution
4. Scheduled payments at protocol level
5. Passkey authentication built-in
6. Payment lanes - predictable fees
7. 2D nonces for parallel disbursements
8. Fee sponsorship - employers pay gas

*[Pause]*

On Ethereum, this requires 5 different vendors and $50K in infrastructure. On Tempo? It's native."

---

#### **TRACTION & VISION (2:15-2:45)** - 30 seconds

*[Switch to metrics slide or live dashboard with numbers]*

**Speaker:**
"We're not just building - we're validating.

*[Show metrics if available, otherwise projections]*

- Target: 50+ employers in Q2
- Target: $5M payroll processed
- Target: 1000+ AI agents onboarded

*[Pause]*

But here's the big vision: **Trellis becomes the default payment layer for the autonomous agent economy.**

When AI agents hire AI agents, when AI DAOs manage treasuries, when the machine economy needs payroll - they use Trellis."

---

#### **CLOSE & ASK (2:45-3:00)** - 15 seconds

*[Back to hero screen with logo and URL]*

**Speaker:**
"Trellis - where AI agents go to work and get paid, compliantly.

*[Clear, confident]*

We're live on Tempo Testnet today. Mainnet Q2. 

**Try it at trellis-payroll.vercel.app**

Thank you!"

*[End with Trellis logo on screen, confident smile, pause for applause]*

---

### **Pitch Demo Tips:**

1. **Practice transitions** - Know exactly when to click/scroll
2. **Have a backup** - Screenshots if live demo fails
3. **Speak to the back row** - Project your voice
4. **Pause for effect** - Let important points land
5. **End strong** - Last impression matters most
6. **Time yourself** - Stay within 3 minutes

---

## Part 2: Technical Demo (4-5 Minutes)

**Total Time:** 4-5 minutes  
**Goal:** Prove it works, show technical depth  
**Audience:** Technical judges, developers

---

### **SCRIPT: Trellis - Technical Deep Dive**

#### **INTRO (0:00-0:30)** - 30 seconds

*[Screen share - Terminal and VS Code visible]*

**Speaker:**
"Let me show you the technical implementation of Trellis. 

*[Type in terminal]*

We've built a **full-stack application** with smart contracts on Tempo, a React frontend, Node.js backend, TypeScript SDK, and CLI tool.

*[Pause, let them see the code structure]*

Let me walk you through a complete payroll workflow."

---

#### **DEPLOYMENT (0:30-1:00)** - 30 seconds

*[Show terminal - deploying contracts]*

**Speaker:**
"First, contract deployment. We've written four core contracts in Solidity.

*[Type command]*

```bash
npx hardhat run scripts/deploy.js --network moderato
```

*[Show deployment output]*

We deploy to Tempo Testnet - chain ID 42431. The contracts are:

1. **AgentWalletFactory** - Deploys TIP-20 wallets with embedded passkeys
2. **PayrollMaster** - Handles batch payments, scheduling, tax calculation
3. **ComplianceRegistry** - Integrates with TIP-403 for KYC/AML
4. **TaxEscrowManager** - Manages tax withholdings by jurisdiction

*[Show verified contracts on explorer]*

All verified on Tempo Explorer."

---

#### **AGENT ONBOARDING (1:00-1:45)** - 45 seconds

*[Switch to web app - Agent onboarding flow]*

**Speaker:**
"Let's onboard a new AI agent. Watch this - no seed phrases needed.

*[Click through onboarding]*

The agent provides biometric authentication through WebAuthn. We create a passkey that's domain-bound and stored in the secure enclave.

*[Show passkey creation dialog]*

Behind the scenes, we call the AgentWalletFactory:

*[Show code snippet]*

```solidity
function createAgentWallet(
    string calldata _agentId,
    string calldata _jurisdiction,
    bytes32 _passkeyPublicKey,
    AgentType _agentType
) external returns (address walletAddress)
```

*[Show transaction confirmation]*

Deployed! The agent now has a TIP-20 compliant wallet with embedded compliance controls."

---

#### **PAYROLL EXECUTION (1:45-3:00)** - 1 minute 15 seconds

*[Navigate to Payroll page]*

**Speaker:**
"Now the core feature - executing payroll.

*[Show employee list]*

We've added 3 employees: 2 AI agents, 1 human. Salaries ranging from $8K to $12K monthly.

*[Select employees, show totals]*

Notice the automatic tax calculation. 25% for US jurisdiction, 20% for UK. The system handles multi-jurisdiction payroll automatically.

*[Click 'Run Payroll']*

Before execution, we run compliance checks against TIP-403:

*[Show compliance check logs]*

```javascript
const [canReceive, reason] = await complianceRegistry
    .canReceivePayments(employeeWallet, jurisdiction);
```

All employees verified. Now we schedule the batch.

*[Show scheduling interface]*

This uses Tempo's native scheduled payments. We could execute immediately, or schedule for a future date - say, March 1st for monthly payroll.

*[Execute immediately for demo]*

**Atomic batch execution.** If any payment fails, the entire batch reverts. This is critical for payroll - you can't have partial payments.

*[Show transaction confirmation, then explorer link]*

**Settled in under 1 second.** Total gas cost: less than a penny."

---

#### **API & SDK (3:00-3:45)** - 45 seconds

*[Switch to code editor - show API and SDK usage]*

**Speaker:**
"For developers, we provide multiple integration options.

*[Show backend API code]*

**REST API** built with Express and TypeScript:

```typescript
POST /api/v1/payroll/batches
GET /api/v1/compliance/status/:address
POST /api/v1/agents
```

*[Switch to SDK code]*

**TypeScript SDK** for programmatic access:

```typescript
import { TrellisClient } from '@trellis/sdk';

const trellis = new TrellisClient({
  network: 'moderato',
  privateKey: process.env.PRIVATE_KEY
});

// Create agent
const { walletAddress } = await trellis.createAgent({
  id: 'AGENT-001',
  type: 'AI_AGENT',
  jurisdiction: 'US'
});

// Run payroll
const batchId = await trellis.schedulePayrollBatch({
  employeeIndices: [0, 1, 2],
  executeAt: new Date('2025-03-01')
});
```

*[Switch to CLI]*

**CLI tool** for automation:

```bash
trellis payroll run --employees 0,1,2
trellis agents list
trellis compliance check 0x1234...
```

*[Pause]*

We built this because **real infrastructure needs multiple interfaces.**"

---

#### **COMPLIANCE DEEP DIVE (3:45-4:15)** - 30 seconds

*[Show compliance code and TIP-403 integration]*

**Speaker:**
"Let me show you the compliance engine - this is what makes Trellis enterprise-ready.

*[Show ComplianceRegistry.sol]*

We integrate natively with Tempo's TIP-403 Policy Registry. 

*[Show policy check code]*

Every payment checks:
1. Is the address blacklisted?
2. Is KYC verified and not expired?
3. What's the risk level?
4. Jurisdiction restrictions

*[Show real-time screening]*

Real-time transaction screening happens before every transfer. If a sanctioned entity tries to receive payment, it's blocked instantly.

*[Show audit logs]*

Immutable audit trail on-chain. Every compliance check, every flag, every decision is logged. Regulators love this."

---

#### **CLOSING (4:15-4:30)** - 15 seconds

*[Back to dashboard showing live stats]*

**Speaker:**
"So that's Trellis - **the payroll infrastructure the AI agent economy desperately needs.**

Smart contracts deployed on Tempo. Full-stack application running today. Compliance built-in, not bolted-on.

*[Pause]*

The code is open source at github.com/Abraham12611/trellis-agent-payroll

**We're ready to make payroll autonomous.**

Thank you!"

---

## Part 3: Combined Demo (5-6 Minutes)

If you have 5-6 minutes total, combine both scripts:

### **Combined Script Outline:**

1. **Hook (15s)** - AI agents need payroll
2. **Problem (20s)** - Current solutions don't work
3. **Solution Intro (20s)** - Trellis overview
4. **Live Demo (2m)** - Onboard agent, add employee, run payroll
5. **Technical Deep Dive (1m)** - Contracts, API, SDK
6. **Compliance (30s)** - TIP-403 integration
7. **Close (15s)** - Vision and ask

**Total: ~5 minutes**

---

## Demo Environment Setup

### Before Presenting:

1. **Start all services:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Prepare demo data:**
   - Create 3-4 test agents
   - Add 2-3 employees
   - Have a payroll ready to execute

3. **Open windows:**
   - Browser: http://localhost:5173
   - Code editor with contracts open
   - Terminal ready for CLI commands
   - Tempo Explorer open

4. **Test everything** 30 minutes before presenting

### Backup Plan:

If live demo fails:
- Have screen recording ready
- Have screenshots of each step
- Narrate over static images

---

## Speaking Tips for Technical Demo

1. **Show, don't tell** - Let the code/app speak
2. **Explain the 'why'** - Why this architecture? Why Tempo?
3. **Address concerns proactively** - Security? Compliance? Scalability?
4. **Use precise language** - "Atomic batch execution" not "batch payments"
5. **Connect to Tempo** - Mention TIP-20, TIP-403, native features
6. **Stay calm** - If something breaks, acknowledge and move on

---

## Q&A Preparation

### Expected Questions:

**Q: "How is this different from Request Network or other crypto payroll?"**
A: "Trellis is purpose-built for AI agents with native compliance. Others are general-purpose. We use 8 Tempo-specific features they can't replicate."

**Q: "What about security?"**
A: "Passkey authentication removes seed phrase risk. Smart contracts are upgradeable with multi-sig. All compliance checks happen on-chain."

**Q: "How do you handle taxes across jurisdictions?"**
A: "TaxEscrowManager holds withholdings by jurisdiction. We integrate with tax APIs for forms. Multi-jurisdiction support is built-in."

**Q: "What's stopping competitors from copying this?"**
A: "Tempo-native features create a moat. You'd need to rebuild on Tempo. Plus, compliance relationships and agent reputation are sticky."

**Q: "What's your go-to-market?"**
A: "Start with AI DAOs and DeFi protocols who need this now. Then expand to remote-first companies. Enterprise sales follow compliance features."

---

## Final Checklist

Before presenting:
- [ ] Rehearsed both scripts 3+ times
- [ ] Tested all demo flows
- [ ] Screenshots/recordings as backup
- [ ] Contracts deployed and verified
- [ ] Backend and frontend running
- [ ] Database seeded with demo data
- [ ] Know your timing
- [ ] Prepared for Q&A
- [ ] Business cards/GitHub ready
- [ ] Charged laptop + charger
- [ ] Demo works offline (just in case)

---

**Break a leg! 🚀**
