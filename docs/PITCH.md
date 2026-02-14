# Trellis - Hackathon Pitch Deck

## 🎯 The Problem

**AI agents cannot hire other AI agents.**

The AI agent economy is exploding in 2025:
- GPT-5, Claude 4, and autonomous agents are becoming "employees"
- Agents need to pay other agents for services
- But there's NO payroll infrastructure with compliance

Current "solutions":
- ❌ Manual crypto transfers (no compliance)
- ❌ Traditional payroll (humans only, slow)
- ❌ DeFi payments (no tax/regulatory support)

**Result:** The $50B+ AI agent economy is bottlenecked by payment infrastructure.

---

## 💡 Our Solution

**Trellis** - The complete payroll OS for the AI agent economy.

We enable:
- 🤖 **Agent-to-agent hiring** with smart contracts
- 💰 **Compliant payments** with automatic tax withholding
- 🌍 **Cross-border payroll** with instant settlement
- 🔒 **Full compliance** via TIP-403 policy registry

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    TRELLIS PLATFORM                       │
├──────────────────────────────────────────────────────────┤
│  Agent Wallet Factory → Smart Payroll → Compliance Engine │
│      (Passkeys)         (Batch/Schedule)    (TIP-403)    │
└──────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────────┐
   │ Human   │      │ AI      │      │ AI          │
   │ Workers │      │ Agents  │      │ DAOs        │
   └─────────┘      └─────────┘      └─────────────┘
```

---

## 🚀 Key Features

### 1. Agent Wallet Factory
- Deploy TIP-20 wallets with passkey auth
- No seed phrases needed
- Domain-bound security

### 2. Smart Payroll
- Batch payments (1000s at once)
- Scheduled recurring payments
- Atomic execution (all-or-nothing)

### 3. Compliance Engine
- Native TIP-403 integration
- KYC/AML per jurisdiction
- Real-time sanctions screening

### 4. Tax Automation
- Automatic withholding calculation
- Escrow management
- Automated tax form generation

### 5. Agent Marketplace
- Task posting and acceptance
- Milestone escrow
- Reputation tracking

---

## 🎪 Why Tempo?

| Feature | Tempo | Ethereum | Other L1s |
|---------|-------|----------|-----------|
| **Native Batching** | ✅ | ❌ (external) | ❌ |
| **Scheduled Payments** | ✅ Protocol | ❌ Keepers | ❌ |
| **Passkey Auth** | ✅ Native | ❌ Complex AA | ❌ |
| **Payment Lanes** | ✅ Reserved | ❌ Gas wars | ❌ |
| **TIP-403 Compliance** | ✅ Built-in | ❌ Custom | ❌ |
| **2D Nonces** | ✅ Parallel | ❌ Sequential | ❌ |
| **Sub-second Finality** | ✅ | ❌ 12s+ | ⚠️ Varies |
| **Stablecoin Fees** | ✅ | ❌ ETH | ⚠️ Some |

**Trellis uses 8+ Tempo-native features that are painful elsewhere.**

---

## 📊 Market Opportunity

### Total Addressable Market
- **Global Payroll:** $50B+ annually
- **AI Agent Economy:** Growing to $100B+ by 2027
- **Freelance/Contractor:** $1.3T globally
- **Crypto Payroll:** $5B (growing 300% YoY)

### Target Users
1. **AI Agent DAOs** - Autonomous organizations
2. **DeFi Protocols** - Pay contributors globally
3. **Remote-first Companies** - Global talent payroll
4. **Freelance Platforms** - Automated contractor payments

---

## 🏆 Competitive Advantage

### vs Traditional Payroll (ADP, Gusto)
- ✅ Instant settlement (< 1s vs 2-5 days)
- ✅ Global by default
- ✅ AI agent support
- ✅ 100x cheaper

### vs Crypto Payroll (Request, Superfluid)
- ✅ Native compliance
- ✅ Tax automation
- ✅ Batch payments
- ✅ Scheduled payroll

### vs General Chains
- ✅ Purpose-built for payments
- ✅ Predictable fees
- ✅ Payment lanes
- ✅ Passkey integration

---

## 💼 Business Model

### Revenue Streams
1. **Transaction Fees** - 0.1% per payment
2. **Compliance SaaS** - $99/mo for advanced features
3. **Enterprise API** - Custom integrations
4. **Tax Filing** - $5 per tax form generated

### Unit Economics
- **Cost per payroll:** <$0.01 (gas)
- **Revenue per payroll:** $0.50-2.00
- **Margin:** 95%+

---

## 📈 Traction Plan

### Hackathon (Now)
- ✅ Smart contracts deployed
- ✅ 5 simulation scripts
- ✅ Full documentation

### Q1 2025
- Testnet beta with 10 companies
- 100+ agents onboarded
- $100K payroll processed

### Q2 2025
- Mainnet launch
- 50+ enterprise clients
- $5M payroll processed

### Q3-Q4 2025
- AI agent marketplace
- Cross-chain bridges
- $100M+ payroll processed

---

## 👥 Team

**Trellis is built by developers, for developers.**

We're passionate about:
- AI agent autonomy
- Financial inclusion
- Compliance automation
- Blockchain usability

---

## 🎤 Demo Scripts

We created 5 comprehensive simulations:

1. **01-agent-onboarding.js** - Wallet creation & KYC
2. **02-batch-payroll.js** - Payroll execution
3. **03-compliance-check.js** - Regulatory screening
4. **04-agent-tasks.js** - Agent marketplace
5. **05-full-workflow.js** - End-to-end integration

Run them with:
```bash
npm install
npm run simulate:full
```

---

## 🎯 Why We Win

### 1. **Novel Primitive**
- First payroll system designed for AI agents
- Creates new market category

### 2. **Tempo-Native**
- Uses 8+ unique Tempo features
- Impossible to replicate on other chains

### 3. **Real Problem**
- $50B+ market waiting for solution
- Clear product-market fit

### 4. **Compliance-First**
- Enterprise-ready from day one
- Regulatory moat

### 5. **Scalable**
- Handles 1000s of parallel payments
- Grows with AI agent economy

---

## 🙏 Thank You!

**Trellis: Where AI agents go to work and get paid - compliantly.**

### Resources
- 📁 GitHub: github.com/yourusername/trellis-agent-payroll
- 📖 Docs: /docs/README.md
- 🎮 Demo: `npm run simulate:full`

### Contact
- Twitter: @TrellisPayroll
- Email: team@trellis.io
- Discord: discord.gg/trellis

---

**Built with ❤️ on Tempo** 🌿
