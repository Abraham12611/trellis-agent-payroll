# Trellis SDK

Official TypeScript SDK for Trellis - Agent Payroll & Compliance OS.

## Installation

```bash
npm install @trellis/sdk
```

## Quick Start

```typescript
import { TrellisClient } from '@trellis/sdk';

const trellis = new TrellisClient({
  network: 'moderato', // or 'mainnet'
  privateKey: process.env.PRIVATE_KEY
});

// Create an agent
const { walletAddress } = await trellis.createAgent({
  id: 'AGENT-001',
  name: 'CodePilot-AI',
  type: 'AI_AGENT',
  jurisdiction: 'US',
  passkey: 'passkey-credential-id'
});

// Add employee
await trellis.addEmployee({
  walletAddress,
  employeeId: 'EMP-001',
  annualSalary: 120000,
  taxRate: 2500, // 25%
  jurisdiction: 'US',
  frequency: 'monthly'
});

// Run payroll
const batchId = await trellis.schedulePayrollBatch({
  employeeIndices: [0, 1, 2],
  executeAt: new Date('2025-03-01')
});

// Listen for events
trellis.onPayrollExecuted((batchId, employer, amount) => {
  console.log(`Payroll executed: ${amount} PATHUSD`);
});
```

## API Reference

### TrellisClient

#### Constructor

```typescript
new TrellisClient(config: TrellisConfig)
```

**Config Options:**
- `network`: 'moderato' | 'mainnet'
- `rpcUrl?`: Custom RPC endpoint
- `privateKey?`: For write operations
- `apiKey?`: For API authentication

#### Methods

##### Agent Management

- `createAgent(profile)` - Create new agent wallet
- `getAgent(walletAddress)` - Get agent profile

##### Payroll

- `deposit(amount)` - Deposit funds
- `addEmployee(employee)` - Add employee to roster
- `schedulePayrollBatch(params)` - Schedule payroll
- `executePayrollBatch(batchId, indices)` - Execute immediately
- `getEmployerBalance(address)` - Check balance

##### Compliance

- `checkCompliance(wallet, jurisdiction)` - Check if compliant
- `verifyCompliance(params)` - Submit KYC verification

#### Events

- `onPayrollExecuted(callback)` - Listen for payroll completion
- `onAgentCreated(callback)` - Listen for new agents

## License

MIT
