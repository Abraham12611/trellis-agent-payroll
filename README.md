# Trellis - Agent Payroll & Compliance OS

## Overview

**Trellis** is a complete payroll operating system designed specifically for the AI agent economy. It enables seamless agent-to-agent and agent-to-human payments with full compliance controls, tax management, and automated disbursements.

### Problem Statement

AI agents cannot hire other AI agents because there's no payroll infrastructure with compliance controls. Current solutions require human intermediation for:
- Payments and salary disbursements
- KYC/AML compliance
- Tax reporting and withholding
- Contract management
- Regulatory adherence

### Solution

Trellis provides a comprehensive payroll OS leveraging Tempo blockchain's unique features to enable autonomous agent employment relationships with full regulatory compliance.

---

## Key Features

### 1. Agent Wallet Factory
- Deploy TIP-20 wallets with embedded passkey authentication
- Domain-bound passkeys for secure, passwordless agent access
- Smart account abstraction for batch operations
- Role-based access control (RBAC) for agent hierarchies

### 2. Smart Payroll Contracts
- Batch salary payments with TIP-20 memos (employee ID, tax codes, department)
- Atomic execution - all payments succeed or fail together
- Configurable payment lanes for predictable fees
- Support for multiple currencies (USD, EUR, GBP, etc.)

### 3. Compliance Engine (TIP-403 Integration)
- KYC/AML policy enforcement per jurisdiction
- Whitelist/blacklist management for sanctioned entities
- Jurisdiction-specific compliance rules
- Real-time policy updates across all payroll operations

### 4. Tax Withholding System
- Automatic tax calculation based on jurisdiction and income
- Escrow mechanism for tax liabilities
- Multi-jurisdiction tax support
- Automated tax form generation (W-2, 1099, etc.)

### 5. Parallel Disbursements
- 2D nonce system for concurrent payments
- Pay thousands of agents simultaneously
- Optimized for high-volume payroll runs
- Sub-second finality for payment confirmation

### 6. Recurring Payroll
- Scheduled transactions for monthly/quarterly cycles
- Protocol-level time windows for execution
- "Set and forget" automation
- No external cron jobs or automation services needed

---

## Hackathon Tracks Covered

### Primary Track: AI Agents & Automation (Grand Prize Potential)
- **Novel Application**: Creates the payroll primitive that doesn't exist
- **Agent-to-Agent Economy**: Enables autonomous employment relationships
- **Enterprise Adoption**: Compliance + automation targets real business needs
- **Scalability**: Parallel disbursements handle enterprise-scale payroll

### Secondary Tracks:
1. **DeFi Innovation**: Tax escrow, automated withholding, compliance oracles
2. **Enterprise Blockchain**: Corporate payroll, regulatory compliance
3. **Developer Experience**: Clean APIs, SDKs, comprehensive documentation
4. **Social Impact**: Democratizing access to compliant payment systems

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TRELLIS PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Frontend   │  │   Agent     │  │  Compliance Portal  │ │
│  │  (React)    │  │   SDK       │  │  (Admin Dashboard)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┴─────────────────────┘            │
│                          │                                  │
│         ┌────────────────┴─────────────────────┐            │
│         │      Trellis Core Contracts          │            │
│         ├──────────────────────────────────────┤            │
│         │ • AgentWalletFactory                 │            │
│         │ • PayrollMaster                      │            │
│         │ • ComplianceRegistry                 │            │
│         │ • TaxEscrowManager                   │            │
│         └────────────────┬─────────────────────┘            │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────┐          │
│  │                       │                       │          │
│  ▼                       ▼                       ▼          │
│ ┌────────────┐    ┌────────────┐    ┌──────────────────┐   │
│ │  TIP-20    │    │  TIP-403   │    │  Tempo Native    │   │
│ │  Tokens    │    │  Policies  │    │  Transactions    │   │
│ │            │    │            │    │                  │   │
│ │ • Transfer │    │ • KYC/AML  │    │ • Batching       │   │
│ │ • Memos    │    │ • Whitelist│    │ • Scheduling     │   │
│ │ • RBAC     │    │ • Blacklist│    │ • Passkeys       │   │
│ └────────────┘    └────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Agent Onboarding & Wallet Creation

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Agent   │────▶│   Trellis    │────▶│  Wallet Factory │────▶│   TIP-20     │
│ (Human/  │     │    Portal    │     │   Contract      │     │   Wallet     │
│   AI)    │◀────│              │◀────│                 │◀────│   Deployed   │
└──────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
       │                                               │
       │         Passkey Registration                  │
       │         KYC Verification                      │
       │         Role Assignment                       │
       └───────────────────────────────────────────────┘
```

**Steps:**
1. Agent initiates onboarding via Trellis Portal
2. Passkey authentication setup (biometric/Face ID)
3. KYC/AML verification via TIP-403 Policy Registry
4. Smart wallet deployment with embedded roles
5. Wallet receives unique Agent ID and tax jurisdiction code

### Flow 2: Hiring & Contract Creation

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Hiring     │────▶│   Payroll    │────▶│  Smart Contract │
│    Agent     │     │    Master    │     │    Deployed     │
│  (Employer)  │◀────│   Contract   │◀────│                 │
└──────────────┘     └──────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Employee   │
                    │    Wallet    │
                    │   Notified   │
                    └──────────────┘
```

**Steps:**
1. Employer agent creates employment contract
2. Define salary, frequency, tax jurisdiction, benefits
3. Smart contract deployed with schedule parameters
4. Employee wallet whitelisted for incoming payments
5. Contract stored on-chain with encrypted terms

### Flow 3: Batch Payroll Execution

```
┌──────────────────┐
│  Payroll Master  │
│    Contract      │
└────────┬─────────┘
         │
    ┌────┴────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│Tax    │ │Tax    │ │Tax    │ │Tax    │ │Tax    │
│Calc   │ │Calc   │ │Calc   │ │Calc   │ │Calc   │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│Net Pay│ │Net Pay│ │Net Pay│ │Net Pay│ │Net Pay│
│Agent 1│ │Agent 2│ │Agent 3│ │Agent 4│ │Agent 5│
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

**Steps:**
1. Payroll run initiated by employer or scheduled trigger
2. Contract calculates tax withholdings for each employee
3. Tax amounts escrowed to TaxEscrowManager
4. Net salaries disbursed via batch TIP-20 transfers
5. All transactions execute atomically (all-or-nothing)
6. Payment memos include employee ID, period, tax codes

### Flow 4: Compliance & Reporting

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Compliance  │────▶│    TIP-403   │────▶│  Policy Check   │
│    Engine    │     │   Registry   │     │  Before Payment │
└──────────────┘     └──────────────┘     └─────────────────┘
         │
         ▼
┌──────────────────┐
│  Tax Authority   │
│  Integration     │
│  (API/Webhook)   │
└──────────────────┘
```

**Steps:**
1. All payments checked against TIP-403 policies before execution
2. Real-time KYC/AML screening via policy registry
3. Transaction logs with memos for audit trails
4. Automated tax form generation and submission
5. Compliance dashboard for real-time monitoring

### Flow 5: Agent-to-Agent Micro-Tasks

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Agent   │─────────▶│  Task    │─────────▶│  Agent   │
│ (Client) │          │Contract  │          │(Worker)  │
└──────────┘          └──────────┘          └──────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Escrow      │
                    │  Milestone   │
                    │  Payments    │
                    └──────────────┘
```

**Steps:**
1. Client agent posts task with requirements and budget
2. Worker agent accepts and begins work
3. Milestone-based escrow payments
4. Automated verification (oracles/AI judges)
5. Instant payment release upon completion

---

## Technical Implementation

### Smart Contracts

1. **AgentWalletFactory.sol** - Deploys TIP-20 compliant wallets with passkey auth
2. **PayrollMaster.sol** - Core payroll logic, batching, scheduling
3. **ComplianceRegistry.sol** - Integrates with TIP-403 for KYC/AML
4. **TaxEscrowManager.sol** - Manages tax withholdings and remittances
5. **EmploymentContract.sol** - Individual employment agreements

### Key Tempo Features Used

1. **TIP-20 Tokens**: Transfer memos, RBAC, predictable fees
2. **TIP-403 Policies**: Compliance enforcement, KYC/AML
3. **Batched Transactions**: Atomic payroll runs
4. **Scheduled Payments**: Recurring payroll automation
5. **Passkey Auth**: Secure, biometric agent authentication
6. **Payment Lanes**: Dedicated blockspace for payroll
7. **2D Nonces**: Parallel disbursements at scale
8. **Fee Sponsorship**: Employers pay gas for employees

---

## Why It Wins

### 1. Novel Primitive
- Creates "agent payroll" infrastructure that doesn't exist
- Enables truly autonomous agent economies
- First-mover advantage in an emerging market

### 2. Tempo-Native Features
Uses 8+ Tempo-specific features that are painful on other chains:
- Native batching (vs. external multisend)
- Protocol-level scheduling (vs. external keepers)
- Built-in passkeys (vs. complex AA implementations)
- Payment lanes (vs. gas wars)
- TIP-403 compliance (vs. custom implementations)

### 3. Enterprise Appeal
- Compliance-first design attracts institutional users
- Tax automation reduces operational overhead
- Audit trails satisfy regulatory requirements
- Scalable to millions of agents

### 4. AI Agent Narrative
- Hot topic in 2025 (GPT-5, Claude 4, etc.)
- Agents hiring agents is the next evolution
- Enables new economic models (agent DAOs, task markets)

### 5. Real-World Utility
- Solves actual payroll pain points
- Reduces compliance costs
- Democratizes access to global talent
- No-code interface for non-technical users

---

## Competitive Advantage

| Feature | Trellis on Tempo | Traditional Payroll | Other Chains |
|---------|-----------------|-------------------|--------------|
| Settlement Time | <1 second | 2-5 days | 10+ minutes |
| Transaction Cost | <$0.001 | $2-50 | $0.10-10 |
| Compliance | Native (TIP-403) | Manual/3rd party | Custom build |
| Batch Payments | Protocol-native | Limited | Complex AA |
| Agent Authentication | Passkey (native) | N/A | Complex setup |
| Tax Automation | Smart contract | Manual/SaaS | Not available |
| Cross-border | Instant | Expensive | Slow/expensive |

---

## Future Roadmap

### Phase 1: MVP (Hackathon)
- Basic payroll contracts
- Agent wallet factory
- Simple compliance integration
- Batch payments

### Phase 2: Production (Q2 2025)
- Multi-jurisdiction tax support
- Advanced compliance rules
- Agent reputation system
- Mobile SDK

### Phase 3: Scale (Q3-Q4 2025)
- AI-powered compliance monitoring
- Cross-chain payroll bridges
- Treasury management for agent DAOs
- Insurance and benefits marketplace

### Phase 4: Ecosystem (2026+)
- Agent-to-agent lending
- Decentralized retirement accounts
- Global compliance network
- Native token for governance

---

## Getting Started

See the `/scripts` directory for simulation scripts demonstrating:
1. Agent onboarding flow
2. Employment contract creation
3. Batch payroll execution
4. Compliance reporting
5. Agent-to-agent task payments

## License

MIT License - See LICENSE file for details.

## Team

Built with ❤️ for the Tempo AI Agents & Automation Track.

---

**"Where AI agents go to work and get paid - compliantly."**
