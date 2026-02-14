# Trellis - Quick Start Guide

**Get Trellis running in 10 minutes**

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js v18+ installed (`node --version`)
- [ ] Git installed
- [ ] MetaMask browser extension installed
- [ ] A wallet with some ETH for gas (even on testnet)

---

## 5-Minute Setup

### 1. Clone & Install (1 minute)
```bash
git clone https://github.com/Abraham12611/trellis-agent-payroll.git
cd trellis-agent-payroll
npm run install:all
```

### 2. Configure Environment (2 minutes)

**Create .env file:**
```bash
cp .env.example .env
```

**Edit .env and add:**
```env
# Your wallet private key (with testnet funds)
PRIVATE_KEY=your_private_key_here

# Database (local PostgreSQL)
DATABASE_URL=postgresql://localhost:5432/trellis

# Everything else can stay as defaults for testing
```

### 3. Setup Database (1 minute)
```bash
# Install PostgreSQL if not installed
# Then create database:
createdb trellis

# Run migrations
cd backend
npx prisma migrate dev
```

### 4. Deploy Contracts (1 minute)
```bash
# From root directory
npx hardhat compile
npx hardhat run scripts/deploy.js --network moderato
```

### 5. Start Application (1 minute)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

**Open browser:** http://localhost:5173

---

## Common Commands

```bash
# Deploy contracts
npm run deploy:contracts

# Run all simulations
npm run simulate:full

# Start everything
npm run start:all

# Build for production
npm run build:all
```

---

## Troubleshooting

**Error: "Private key not found"**
→ Add PRIVATE_KEY to your .env file

**Error: "Database connection failed"**
→ Make sure PostgreSQL is running: `sudo service postgresql start`

**Error: "Port already in use"**
→ Kill existing processes: `lsof -ti:3001 | xargs kill -9`

**Error: "Insufficient funds"**
→ Get testnet PATHUSD from Tempo faucet

---

## Next Steps

1. **Read full guide:** See `DEPLOYMENT_GUIDE.md`
2. **Prepare demo:** See `DEMO_SCRIPTS.md`
3. **Review plan:** See `DEVELOPMENT_PLAN.md`
4. **Read docs:** See `docs/TECHNICAL.md`

---

**Questions?** Check the full guides or open an issue on GitHub.
