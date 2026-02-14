# Trellis - Complete Deployment & Startup Guide

This guide walks you through deploying Trellis to Tempo Testnet and starting all application components.

---

## Prerequisites

### Required Software
- Node.js v18+ 
- npm or yarn
- Git
- PostgreSQL (for backend database)
- MetaMask or similar wallet (for contract deployment)

### Required Accounts & Keys
1. **Tempo Testnet Wallet**
   - Install MetaMask
   - Add Tempo Testnet (Moderato) network:
     - RPC URL: `https://rpc.moderato.tempo.xyz`
     - Chain ID: `42431`
     - Currency: `PATHUSD`
   - Get testnet PATHUSD from faucet (see below)

2. **GitHub Account**
   - For pushing code (already set up)

---

## Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Abraham12611/trellis-agent-payroll.git
cd trellis-agent-payroll

# Install all dependencies (root + all workspaces)
npm run install:all

# Or manually:
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../cli && npm install
cd ../sdk && npm install
cd ..
```

---

## Step 2: Environment Configuration

### Create Environment Files

**Root `.env`:**
```bash
# Copy example
cp .env.example .env

# Edit with your values:
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Blockchain
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
TEMPO_CHAIN_ID=42431
PRIVATE_KEY=your_wallet_private_key_here  # ⚠️ NEVER commit this!

# Contract Addresses (filled after deployment)
FACTORY_ADDRESS=
COMPLIANCE_ADDRESS=
PAYROLL_ADDRESS=
TAX_ADDRESS=

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/trellis
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001
VITE_CHAIN_ID=42431
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` files
- Never share your private key
- Use `.env.example` as a template only

---

## Step 3: Database Setup

### Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Create Database
```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE trellis;
CREATE USER trellis_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trellis TO trellis_user;
\q
```

### Run Migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 4: Get Testnet Funds

### Option A: Tempo Faucet (Official)
```bash
# Visit: https://faucet.moderato.tempo.xyz
# Or use curl:
curl -X POST https://faucet.moderato.tempo.xyz \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_WALLET_ADDRESS"}'
```

### Option B: Request from Tempo Discord
- Join Tempo Discord: https://discord.gg/tempo
- Go to `#testnet-faucet` channel
- Type: `!faucet YOUR_WALLET_ADDRESS`

### Verify Balance
```bash
# Using cast (foundry)
cast balance YOUR_WALLET_ADDRESS --rpc-url https://rpc.moderato.tempo.xyz

# Or check MetaMask
# You should see PATHUSD balance
```

---

## Step 5: Deploy Smart Contracts

This is the **critical deployment step**:

```bash
# Make sure you're in the root directory
cd /path/to/trellis-agent-payroll

# Compile contracts
npx hardhat compile

# Deploy to Tempo Testnet
npx hardhat run scripts/deploy.js --network moderato
```

### Expected Output
```
🌿 Trellis Contract Deployment

Deploying from: 0xYourAddress...
Balance: 1000.0 PATHUSD

Deploying ComplianceRegistry...
✓ ComplianceRegistry: 0x1234...5678

Deploying TaxEscrowManager...
✓ TaxEscrowManager: 0xabcd...efgh

Deploying AgentWalletFactory...
✓ AgentWalletFactory: 0x9876...5432

Deploying PayrollMaster...
✓ PayrollMaster: 0xdef0...1234

Configuring contracts...
  ✓ TaxEscrowManager linked to PayrollMaster
  ✓ PayrollMaster authorized in AgentWalletFactory
  ✓ Added jurisdiction: US
  ✓ Added jurisdiction: UK
  ✓ Added jurisdiction: EU
  ✓ Deployer set as compliance officer

✅ All contracts deployed and configured!

Deployment Info:
{
  "network": "moderato",
  "chainId": 42431,
  "contracts": {
    "complianceRegistry": "0x...",
    "taxEscrowManager": "0x...",
    "agentWalletFactory": "0x...",
    "payrollMaster": "0x..."
  }
}

📁 Environment variables saved to .env.moderato
```

### Update Environment Variables
```bash
# Copy deployed addresses to your .env
cat .env.moderato >> .env

# Or manually copy the addresses to your .env file
```

### Verify Contracts on Explorer
```bash
# Verify each contract (optional but recommended)
npx hardhat verify --network moderato COMPLIANCE_ADDRESS
npx hardhat verify --network moderato TAX_ADDRESS
npx hardhat verify --network moderato FACTORY_ADDRESS
npx hardhat verify --network moderato PAYROLL_ADDRESS
```

View on: https://explore.tempo.xyz

---

## Step 6: Start Backend API

```bash
cd backend

# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm start
```

### Verify Backend is Running
```bash
# In another terminal
curl http://localhost:3001/health

# Expected response:
# {"status": "ok", "timestamp": "2025-02-14T..."}
```

---

## Step 7: Start Frontend Web App

```bash
# In a new terminal
cd frontend

# Start development server
npm run dev
```

### Access Web App
- Open browser: http://localhost:5173
- You should see the Trellis landing page
- Connect your MetaMask wallet (Tempo Testnet)

---

## Step 8: Test CLI Tool

```bash
# In a new terminal
cd cli

# Build CLI
npm run build

# Link globally (optional)
npm link

# Test commands
trellis --help
trellis agents list
trellis --version
```

---

## Step 9: Test SDK

```bash
cd sdk

# Build SDK
npm run build

# Link for local testing
npm link

# Use in another project
cd /path/to/test-project
npm link @trellis/sdk
```

---

## Running All Components Together

### Quick Start (All at once)
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Check everything
# Backend: http://localhost:3001/health
# Frontend: http://localhost:5173
# MetaMask: Connected to Tempo Testnet
```

### Using Concurrently (One Command)
```bash
# From root directory
npm run start:all

# This starts both backend and frontend simultaneously
```

---

## Verification Checklist

After starting everything, verify:

- [ ] Contracts deployed on https://explore.tempo.xyz
- [ ] Backend responding at http://localhost:3001/health
- [ ] Frontend loading at http://localhost:5173
- [ ] MetaMask connected to Tempo Testnet
- [ ] Database connected (check backend logs)
- [ ] Can view landing page
- [ ] Can navigate to dashboard
- [ ] CLI responding to commands

---

## Common Issues & Solutions

### Issue 1: "Insufficient funds for gas"
**Solution:** Get more PATHUSD from faucet

### Issue 2: "Database connection failed"
**Solution:** 
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify credentials in DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

### Issue 3: "Port already in use"
**Solution:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Issue 4: "Contract deployment failed"
**Solution:**
```bash
# Check RPC is accessible
curl -X POST https://rpc.moderato.tempo.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verify you have PATHUSD balance
```

### Issue 5: "Module not found" errors
**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules frontend/node_modules backend/node_modules cli/node_modules sdk/node_modules
npm run install:all
```

---

## Production Deployment

### Deploy Backend to Cloud

**Option A: Railway/Render (Easiest)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up
```

**Option B: AWS/GCP**
```bash
# Build Docker image
docker build -t trellis-backend .

# Push to registry
docker push your-registry/trellis-backend

# Deploy to ECS/GKE
```

### Deploy Frontend

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

cd frontend
vercel

# Follow prompts
```

**Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Production Environment Variables

```env
# Backend (Production)
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:password@prod-db:5432/trellis_prod
REDIS_URL=redis://prod-redis:6379
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (Production)
VITE_API_URL=https://your-api-domain.com
VITE_CHAIN_ID=42431
```

---

## Monitoring & Maintenance

### Logs
```bash
# Backend logs
pm2 logs trellis-backend

# Or
cd backend && npm run dev 2>&1 | tee backend.log
```

### Database Backups
```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20250214.sql
```

### Contract Upgrades
```bash
# If you need to upgrade contracts (use proxy pattern)
npx hardhat run scripts/upgrade.js --network moderato
```

---

## Support & Troubleshooting

### Getting Help
1. Check logs: `backend/logs/`
2. Review this guide
3. Check Tempo docs: https://docs.tempo.xyz
4. Join Tempo Discord: https://discord.gg/tempo

### Useful Commands
```bash
# Check contract on explorer
open https://explore.tempo.xyz/address/CONTRACT_ADDRESS

# Check wallet balance
cast balance WALLET_ADDRESS --rpc-url https://rpc.moderato.tempo.xyz

# Reset everything
npm run clean  # Custom script to clean build artifacts
```

---

## Next Steps After Deployment

1. **Create first employer account** via web app
2. **Onboard test agents** (human & AI)
3. **Add employees** to payroll
4. **Run test payroll** (small amount first)
5. **Verify compliance** checks work
6. **Test CLI** commands
7. **Test SDK** integration
8. **Invite beta users**

---

## Summary Commands

```bash
# Full deployment from scratch
git clone https://github.com/Abraham12611/trellis-agent-payroll.git
cd trellis-agent-payroll
npm run install:all
cp .env.example .env
# Edit .env with your keys

# Deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network moderato

# Setup database
cd backend
npx prisma migrate dev

# Start everything
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Done! Visit http://localhost:5173
```

---

**You're now ready to deploy and run Trellis!** 🚀

For demo scripts, see `DEMO_SCRIPTS.md`
