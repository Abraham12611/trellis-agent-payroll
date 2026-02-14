# Trellis - Real Application Development Plan

## Executive Summary

Build Trellis as a **multi-platform application suite** consisting of:
1. **Web Application** - Primary user interface (React + Web3)
2. **CLI Tool** - Developer/automation interface
3. **TypeScript SDK** - For third-party integrations
4. **Agent Skill (OpenClaw)** - For AI agent integration
5. **Backend API** - Supporting all platforms

All components interact with real smart contracts deployed on Tempo Testnet.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Web App      │  │ CLI Tool │  │ SDK      │  │ OpenClaw    │ │
│  │ (React)      │  │ (Node.js)│  │ (npm)    │  │ Skill       │ │
│  └──────┬───────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└─────────┼──────────────┼────────────┼────────────┼──────────┘
          │              │            │            │
          └──────────────┴────────────┴────────────┘
                             │
                    ┌────────┴────────┐
                    │  REST API       │
                    │  (Node.js)      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────┴──────┐  ┌────────┴────────┐  ┌─────┴──────┐
   │ Tempo       │  │ Database        │  │ External   │
   │ Blockchain  │  │ (PostgreSQL)    │  │ Services   │
   └─────────────┘  └─────────────────┘  └────────────┘
```

---

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 Smart Contract Deployment

**Tasks:**
- [ ] Deploy all 4 contracts to Tempo Testnet (Moderato)
- [ ] Verify contracts on Tempo Explorer
- [ ] Set up contract monitoring
- [ ] Create contract upgradeability plan

**Deliverables:**
- `deployments-moderato.json` with verified addresses
- Contract verification on https://explore.tempo.xyz
- Environment configuration file

### 1.2 Backend API Setup

**Technology Stack:**
- Node.js + Express/Fastify
- TypeScript
- PostgreSQL (user data, off-chain storage)
- Redis (caching, sessions)
- Docker + Docker Compose

**API Structure:**
```
/api/v1/
├── auth/           # Passkey authentication
├── agents/         # Agent CRUD
├── payroll/        # Payroll operations
├── compliance/     # KYC/AML checks
├── tax/            # Tax calculations
├── employers/      # Employer management
└── webhooks/       # Event callbacks
```

**Endpoints to Implement:**

```typescript
// Auth
POST /api/v1/auth/passkey/register
POST /api/v1/auth/passkey/login
POST /api/v1/auth/verify

// Agents
POST /api/v1/agents
GET /api/v1/agents/:id
PUT /api/v1/agents/:id
DELETE /api/v1/agents/:id
GET /api/v1/agents/:id/wallet

// Payroll
POST /api/v1/payroll/batches
GET /api/v1/payroll/batches/:id
POST /api/v1/payroll/batches/:id/execute
GET /api/v1/payroll/employees
POST /api/v1/payroll/employees

// Compliance
POST /api/v1/compliance/verify
GET /api/v1/compliance/status/:address
GET /api/v1/compliance/check/:from/:to

// Tax
GET /api/v1/tax/calculate
GET /api/v1/tax/forms/:employer/:year
POST /api/v1/tax/remit
```

### 1.3 Database Schema

**Tables:**

```sql
-- Users (Employers & Agents)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    user_type VARCHAR(20) CHECK (user_type IN ('EMPLOYER', 'AGENT', 'ADMIN')),
    jurisdiction VARCHAR(10),
    kyc_status VARCHAR(20) DEFAULT 'PENDING',
    risk_level VARCHAR(20) DEFAULT 'MEDIUM',
    passkey_credential_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Profiles
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    agent_type VARCHAR(20) CHECK (agent_type IN ('HUMAN', 'AI_AGENT', 'HYBRID')),
    wallet_address VARCHAR(42) NOT NULL,
    contract_address VARCHAR(42),
    skills JSONB,
    reputation_score DECIMAL(3,2) DEFAULT 5.00,
    tasks_completed INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,6) DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Employers
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_name VARCHAR(255),
    company_type VARCHAR(50),
    tax_id VARCHAR(50),
    billing_address JSONB,
    subscription_tier VARCHAR(20) DEFAULT 'FREE'
);

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id),
    agent_profile_id UUID REFERENCES agent_profiles(id),
    employee_id VARCHAR(50) NOT NULL,
    salary DECIMAL(20,6),
    tax_rate INTEGER, -- basis points
    payment_frequency INTEGER, -- seconds
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(employer_id, employee_id)
);

-- Payroll Batches
CREATE TABLE payroll_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id),
    batch_id VARCHAR(66), -- on-chain batch ID
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    total_amount DECIMAL(20,6),
    total_tax DECIMAL(20,6),
    employee_count INTEGER,
    scheduled_for TIMESTAMP,
    executed_at TIMESTAMP,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES payroll_batches(id),
    employee_id UUID REFERENCES employees(id),
    gross_amount DECIMAL(20,6),
    tax_amount DECIMAL(20,6),
    net_amount DECIMAL(20,6),
    memo VARCHAR(66),
    transaction_hash VARCHAR(66),
    status VARCHAR(20),
    paid_at TIMESTAMP
);

-- Tasks (Agent Marketplace)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES agent_profiles(id),
    title VARCHAR(500),
    description TEXT,
    budget DECIMAL(20,6),
    status VARCHAR(20) DEFAULT 'OPEN',
    required_skills JSONB,
    deadline TIMESTAMP,
    assigned_to UUID REFERENCES agent_profiles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 2: Web Application (Weeks 2-4)

### 2.1 Technology Stack

- **Framework:** React 18 + TypeScript
- **State Management:** Zustand + TanStack Query
- **Web3:** ethers.js v6 + wagmi
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

### 2.2 Page Structure

```
/                    → Landing page
/auth/
  /login             → Passkey login
  /register          → Employer/Agent registration
/dashboard           → Main dashboard (role-based)
/agents/
  /                  → Agent list
  /:id               → Agent profile
  /onboard           → Onboarding flow
/payroll/
  /                  → Payroll overview
  /run               → Execute payroll
  /history           → Past payrolls
  /employees         → Employee management
/compliance/
  /                  → Compliance dashboard
  /kyc               → KYC verification
  /audits            → Audit logs
/tasks/
  /                  → Task marketplace
  /post              → Post new task
  /:id               → Task details
/settings/
  /profile           → User settings
  /wallet            → Wallet management
  /billing           → Subscription & billing
```

### 2.3 Key Components

#### 1. Passkey Authentication
```typescript
// components/auth/PasskeyLogin.tsx
import { startAuthentication } from '@simplewebauthn/browser';

export function PasskeyLogin() {
  const handleLogin = async () => {
    // 1. Get challenge from server
    const { challenge } = await fetch('/api/v1/auth/passkey/challenge');
    
    // 2. Authenticate with passkey
    const authentication = await startAuthentication({ challenge });
    
    // 3. Verify with server
    const result = await fetch('/api/v1/auth/passkey/verify', {
      method: 'POST',
      body: JSON.stringify(authentication)
    });
    
    // 4. Login to app
    if (result.success) {
      login(result.token);
    }
  };
  
  return <Button onClick={handleLogin}>Sign in with Passkey</Button>;
}
```

#### 2. Payroll Execution Interface
```typescript
// components/payroll/PayrollRunner.tsx
export function PayrollRunner() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  
  const executePayroll = async () => {
    // 1. Validate compliance
    const compliance = await checkCompliance(selectedEmployees);
    if (!compliance.passed) {
      toast.error(`Compliance failed: ${compliance.reason}`);
      return;
    }
    
    // 2. Calculate totals
    const totals = calculateTotals(selectedEmployees);
    
    // 3. Confirm with user
    const confirmed = await showConfirmationModal(totals);
    if (!confirmed) return;
    
    // 4. Execute on-chain
    const batchId = await schedulePayrollBatch({
      employeeIds: selectedEmployees,
      scheduledTime: scheduleDate
    });
    
    // 5. Show progress
    trackBatchExecution(batchId);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <EmployeeSelector 
          employees={employees}
          selected={selectedEmployees}
          onChange={setSelectedEmployees}
        />
        <SchedulePicker 
          value={scheduleDate}
          onChange={setScheduleDate}
        />
        <Button onClick={executePayroll}>
          Execute Payroll
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 3. Compliance Dashboard
```typescript
// components/compliance/ComplianceDashboard.tsx
export function ComplianceDashboard() {
  const { data: stats } = useComplianceStats();
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Verified Agents"
        value={stats.verifiedCount}
        trend={+12}
      />
      <StatCard
        title="Pending KYC"
        value={stats.pendingCount}
        alert={stats.pendingCount > 0}
      />
      <StatCard
        title="Violations Blocked"
        value={stats.blockedCount}
        trend={+5}
      />
      <StatCard
        title="Compliance Rate"
        value={`${stats.complianceRate}%`}
        trend={+2}
      />
    </div>
  );
}
```

#### 4. Agent Marketplace
```typescript
// components/marketplace/TaskBoard.tsx
export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  
  return (
    <div className="space-y-4">
      <TaskFilters filters={filters} onChange={setFilters} />
      <div className="grid grid-cols-3 gap-4">
        {tasks.map(task => (
          <TaskCard 
            key={task.id}
            task={task}
            onAccept={() => acceptTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2.4 Web3 Integration

```typescript
// hooks/useTrellisContracts.ts
import { useContractRead, useContractWrite } from 'wagmi';

export function usePayrollContract() {
  const { data: employerBalance } = useContractRead({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: 'employerBalances',
    args: [address]
  });
  
  const { write: addEmployee } = useContractWrite({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: 'addEmployee'
  });
  
  const { write: executeBatch } = useContractWrite({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: 'executePayrollBatch'
  });
  
  return {
    employerBalance,
    addEmployee,
    executeBatch
  };
}
```

---

## Phase 3: CLI Tool (Week 3)

### 3.1 Features

```bash
# Installation
npm install -g trellis-cli

# Initialize
trellis init

# Authentication
trellis auth login                    # Login with passkey
trellis auth status                   # Check auth status

# Agent Management
trellis agents list                   # List all agents
trellis agents create                 # Create new agent
trellis agents show <id>              # Show agent details
trellis agents verify <id>            # Run compliance check

# Payroll
trellis payroll deposit <amount>      # Deposit funds
trellis payroll employees add         # Add employee
trellis payroll run                   # Execute payroll
trellis payroll schedule              # Schedule future payroll
trellis payroll history               # View past payrolls

# Compliance
trellis compliance check <address>    # Check compliance
trellis compliance kyc <id>           # Submit KYC

# Configuration
trellis config set rpc <url>          # Set RPC endpoint
trellis config set contracts <file>   # Load contract addresses
trellis config show                   # Show current config
```

### 3.2 Implementation

```typescript
// cli/src/commands/payroll/run.ts
import { Command } from 'commander';
import { PayrollService } from '../../services/payroll';
import { prompt } from '../../utils/prompt';
import { spinner } from '../../utils/spinner';

export const runCommand = new Command('run')
  .description('Execute payroll batch')
  .option('-e, --employees <ids>', 'Employee IDs (comma-separated)')
  .option('-n, --now', 'Execute immediately')
  .option('-s, --schedule <time>', 'Schedule for future time')
  .action(async (options) => {
    const payroll = new PayrollService();
    
    // Get employees if not provided
    let employeeIds = options.employees?.split(',');
    if (!employeeIds) {
      const employees = await payroll.getEmployees();
      employeeIds = await prompt.selectMultiple(
        'Select employees to pay:',
        employees.map(e => ({ value: e.id, label: `${e.name} - $${e.salary}` }))
      );
    }
    
    // Calculate totals
    const totals = await payroll.calculateTotals(employeeIds);
    console.log(`\nPayroll Summary:`);
    console.log(`  Employees: ${employeeIds.length}`);
    console.log(`  Total Gross: $${totals.gross}`);
    console.log(`  Total Tax: $${totals.tax}`);
    console.log(`  Total Net: $${totals.net}\n`);
    
    // Confirm
    const confirmed = await prompt.confirm('Execute payroll?');
    if (!confirmed) return;
    
    // Execute
    const spin = spinner('Executing payroll...');
    try {
      if (options.now) {
        const result = await payroll.executeImmediate(employeeIds);
        spin.succeed(`Payroll executed: ${result.txHash}`);
      } else {
        const scheduleTime = options.schedule || await prompt.date('Schedule for:');
        const batchId = await payroll.scheduleBatch(employeeIds, scheduleTime);
        spin.succeed(`Payroll scheduled: ${batchId}`);
      }
    } catch (error) {
      spin.fail(`Failed: ${error.message}`);
      process.exit(1);
    }
  });
```

---

## Phase 4: TypeScript SDK (Week 3)

### 4.1 Package Structure

```
trellis-sdk/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # Core client
│   ├── contracts/
│   │   ├── factory.ts        # AgentWalletFactory
│   │   ├── payroll.ts        # PayrollMaster
│   │   ├── compliance.ts     # ComplianceRegistry
│   │   └── tax.ts            # TaxEscrowManager
│   ├── types/
│   │   ├── agents.ts
│   │   ├── payroll.ts
│   │   └── compliance.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── tests/
└── package.json
```

### 4.2 SDK Usage

```typescript
// Installation: npm install @trellis/sdk

import { TrellisClient } from '@trellis/sdk';

// Initialize
const trellis = new TrellisClient({
  network: 'moderato', // or 'mainnet'
  apiKey: 'your-api-key',
  privateKey: process.env.PRIVATE_KEY
});

// Agent Management
const agent = await trellis.agents.create({
  name: 'CodePilot-AI',
  type: 'AI_AGENT',
  jurisdiction: 'US',
  passkey: {
    challenge: '...',
    // ...webauthn credential
  }
});

// Payroll
await trellis.payroll.deposit({
  amount: '10000',
  token: 'PATHUSD'
});

await trellis.payroll.addEmployee({
  walletAddress: agent.walletAddress,
  salary: 120000, // Annual
  taxRate: 2500,  // 25%
  frequency: 'monthly'
});

const batch = await trellis.payroll.scheduleBatch({
  employeeIds: ['emp-001', 'emp-002'],
  executeAt: new Date('2025-03-01')
});

// Listen for execution
batch.on('executed', (receipt) => {
  console.log('Payroll complete:', receipt);
});

// Compliance
const canPay = await trellis.compliance.canReceivePayments({
  address: agent.walletAddress,
  jurisdiction: 'US'
});

if (!canPay.allowed) {
  console.error('Compliance check failed:', canPay.reason);
}

// Agent Marketplace
const task = await trellis.tasks.create({
  title: 'Smart Contract Audit',
  budget: 5000,
  requiredSkills: ['solidity', 'security'],
  milestones: [
    { name: 'Initial Review', amount: 1000 },
    { name: 'Final Report', amount: 4000 }
  ]
});

const bids = await trellis.tasks.getBids(task.id);
await trellis.tasks.acceptBid(task.id, bids[0].id);
```

---

## Phase 5: OpenClaw Agent Skill (Week 4)

### 5.1 Skill Definition

```typescript
// skills/trellis-payroll/skill.ts
import { Skill, Action, Input } from '@openclaw/core';

export const TrellisPayrollSkill = new Skill({
  name: 'trellis-payroll',
  description: 'Manage payroll and payments via Trellis',
  version: '1.0.0',
  
  actions: [
    new Action({
      name: 'check_balance',
      description: 'Check employer balance',
      input: z.object({
        employerId: z.string()
      }),
      async execute({ employerId }, context) {
        const trellis = context.getTrellisClient();
        const balance = await trellis.payroll.getBalance(employerId);
        return {
          balance: balance.amount,
          currency: balance.token,
          sufficient: balance.amount > 1000
        };
      }
    }),
    
    new Action({
      name: 'run_payroll',
      description: 'Execute payroll for employees',
      input: z.object({
        employeeIds: z.array(z.string()).optional(),
        dryRun: z.boolean().default(true)
      }),
      async execute({ employeeIds, dryRun }, context) {
        const trellis = context.getTrellisClient();
        
        // Get employees if not specified
        const employees = employeeIds 
          ? await trellis.payroll.getEmployees(employeeIds)
          : await trellis.payroll.getAllActiveEmployees();
        
        // Calculate
        const calculation = await trellis.payroll.calculate(employees);
        
        if (dryRun) {
          return {
            mode: 'DRY_RUN',
            employees: employees.length,
            totalGross: calculation.gross,
            totalTax: calculation.tax,
            totalNet: calculation.net,
            canExecute: calculation.balance >= calculation.gross
          };
        }
        
        // Execute
        const result = await trellis.payroll.executeBatch(employees);
        return {
          mode: 'EXECUTED',
          batchId: result.batchId,
          transactionHash: result.txHash,
          employeesPaid: result.employeeCount,
          totalAmount: result.totalAmount
        };
      }
    }),
    
    new Action({
      name: 'hire_agent',
      description: 'Hire an AI agent for a task',
      input: z.object({
        agentId: z.string(),
        task: z.string(),
        budget: z.number(),
        milestones: z.array(z.object({
          name: z.string(),
          amount: z.number(),
          criteria: z.string()
        }))
      }),
      async execute(input, context) {
        const trellis = context.getTrellisClient();
        
        // Verify agent compliance
        const agent = await trellis.agents.get(input.agentId);
        const compliance = await trellis.compliance.check(agent.walletAddress);
        
        if (!compliance.verified) {
          throw new Error(`Agent ${input.agentId} not compliant: ${compliance.reason}`);
        }
        
        // Create escrow contract
        const contract = await trellis.contracts.createEscrow({
          worker: agent.walletAddress,
          totalAmount: input.budget,
          milestones: input.milestones
        });
        
        return {
          contractAddress: contract.address,
          status: 'AWAITING_WORK',
          milestones: contract.milestones
        };
      }
    }),
    
    new Action({
      name: 'verify_milestone',
      description: 'Verify milestone completion and release payment',
      input: z.object({
        contractAddress: z.string(),
        milestoneId: z.number(),
        deliverables: z.array(z.string())
      }),
      async execute(input, context) {
        // AI verification logic
        const verification = await context.ai.verify({
          criteria: input.milestone.criteria,
          deliverables: input.deliverables
        });
        
        if (verification.passed) {
          const trellis = context.getTrellisClient();
          await trellis.contracts.releaseMilestone(
            input.contractAddress,
            input.milestoneId
          );
          
          return {
            verified: true,
            paymentReleased: true,
            amount: input.milestone.amount,
            confidence: verification.confidence
          };
        }
        
        return {
          verified: false,
          reason: verification.reason,
          suggestions: verification.suggestions
        };
      }
    })
  ]
});
```

### 5.2 Agent Usage Example

```typescript
// Agent uses Trellis skill
const agent = new Agent({
  skills: [TrellisPayrollSkill]
});

// Agent can now:
// 1. Check if it can afford to hire workers
const balance = await agent.execute('trellis-payroll.check_balance', {
  employerId: 'my-dao'
});

// 2. Hire another agent for a task
const contract = await agent.execute('trellis-payroll.hire_agent', {
  agentId: 'codepilot-ai',
  task: 'Audit smart contracts',
  budget: 5000,
  milestones: [
    { name: 'Initial Review', amount: 1000, criteria: 'Check 50% of contracts' },
    { name: 'Final Report', amount: 4000, criteria: 'Complete audit report delivered' }
  ]
});

// 3. Verify work and release payment
const result = await agent.execute('trellis-payroll.verify_milestone', {
  contractAddress: contract.address,
  milestoneId: 1,
  deliverables: ['audit-report.pdf', 'findings.json']
});

// 4. Run payroll for human employees
const payroll = await agent.execute('trellis-payroll.run_payroll', {
  dryRun: true
});

if (payroll.canExecute) {
  await agent.execute('trellis-payroll.run_payroll', {
    dryRun: false
  });
}
```

---

## Phase 6: Testing & Deployment (Week 4)

### 6.1 Testing Strategy

```typescript
// Testing pyramid
// 1. Unit Tests (Jest)
// 2. Integration Tests (Hardhat network)
// 3. E2E Tests (Playwright)

// Example contract integration test
describe('PayrollMaster', () => {
  beforeEach(async () => {
    // Deploy contracts to local Hardhat network
    [owner, employer, employee1, employee2] = await ethers.getSigners();
    
    const ComplianceRegistry = await ethers.getContractFactory('ComplianceRegistry');
    compliance = await ComplianceRegistry.deploy(ZERO_ADDRESS);
    
    const TaxEscrowManager = await ethers.getContractFactory('TaxEscrowManager');
    taxEscrow = await TaxEscrowManager.deploy();
    
    const AgentWalletFactory = await ethers.getContractFactory('AgentWalletFactory');
    factory = await AgentWalletFactory.deploy(await compliance.getAddress());
    
    const PayrollMaster = await ethers.getContractFactory('PayrollMaster');
    payroll = await PayrollMaster.deploy(
      await factory.getAddress(),
      await compliance.getAddress(),
      await taxEscrow.getAddress()
    );
  });
  
  it('should execute batch payroll', async () => {
    // Setup
    await payroll.authorizeEmployer(employer.address);
    await payroll.connect(employer).depositFunds({ value: ethers.parseEther('10') });
    
    // Create employee wallets
    const emp1Wallet = await factory.createAgentWallet(
      'EMP-001', 'US', ethers.randomBytes(32), 0
    );
    
    // Add employees
    await payroll.connect(employer).addEmployee(
      emp1Wallet,
      'EMP-001',
      ethers.parseEther('12'), // $12 annual (for test)
      2500, // 25% tax
      'US',
      30 * 24 * 60 * 60 // Monthly
    );
    
    // Execute
    const batchId = await payroll.connect(employer).schedulePayrollBatch([0], 0);
    await payroll.connect(employer).executePayrollBatch(batchId, [0]);
    
    // Verify
    const balance = await ethers.provider.getBalance(emp1Wallet);
    expect(balance).to.be.gt(0);
  });
});
```

### 6.2 Deployment Checklist

**Pre-deployment:**
- [ ] All contracts tested and audited
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates prepared

**Deployment:**
- [ ] Deploy contracts to Tempo Testnet
- [ ] Verify contracts on explorer
- [ ] Deploy backend API to cloud (AWS/GCP)
- [ ] Deploy web app to Vercel/Netlify
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure DNS

**Post-deployment:**
- [ ] Test all user flows
- [ ] Verify contract interactions
- [ ] Check compliance integrations
- [ ] Monitor error rates
- [ ] Announce beta launch

---

## Phase 7: Production Readiness (Week 5)

### 7.1 Security Measures

- Rate limiting on API
- SQL injection prevention
- XSS protection
- CSRF tokens
- Input sanitization
- Contract access controls
- Multi-sig for admin functions

### 7.2 Monitoring & Analytics

```typescript
// Monitoring setup
- Sentry for error tracking
- DataDog for performance
- Mixpanel for analytics
- Custom dashboards for:
  - Daily active users
  - Total payroll processed
  - Compliance check success rate
  - Average settlement time
```

### 7.3 Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] SDK documentation (TypeDoc)
- [ ] User guides (Notion/GitBook)
- [ ] Video tutorials
- [ ] Example projects

---

## Timeline Summary

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Infrastructure | Contracts deployed, API skeleton, DB schema |
| 2 | Web App (Part 1) | Auth, Dashboard, Agent management |
| 3 | Web App (Part 2) + CLI + SDK | Payroll UI, CLI tool, npm package |
| 4 | OpenClaw + Polish | Agent skill, testing, bug fixes |
| 5 | Production | Security audit, monitoring, launch |

---

## Success Metrics

- **5+** real employers onboarded in first month
- **$100K+** payroll processed in first month
- **< 1s** average settlement time
- **99.9%** uptime
- **Zero** security incidents

---

## Next Steps

1. **Review this plan** - Any changes needed?
2. **Set up development environment** - Clone repo, install dependencies
3. **Deploy contracts** - Start with infrastructure
4. **Build MVP** - Focus on core payroll flow first
5. **Iterate** - Get feedback, improve, expand

Ready to build the future of agent payroll? 🚀
