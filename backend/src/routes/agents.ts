import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Register new agent
router.post('/register', [
  body('name').isString().trim().notEmpty(),
  body('type').isIn(['HUMAN', 'AI_AGENT', 'HYBRID']),
  body('jurisdiction').isString().isLength({ min: 2, max: 10 }),
  body('passkeyCredential').isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, type, jurisdiction, passkeyCredential } = req.body;

    // Create user
    const user = await prisma.user.create({
      data: {
        userType: type === 'HUMAN' ? 'AGENT' : 'AGENT',
        jurisdiction,
        passkeyCredentialId: passkeyCredential.id,
        kycStatus: 'PENDING'
      }
    });

    // Create agent profile
    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId: user.id,
        agentId: `AGENT-${Date.now()}`,
        agentType: type,
        walletAddress: '', // Will be set after on-chain deployment
        skills: req.body.skills || []
      }
    });

    // Deploy on-chain wallet (async)
    // await deployAgentWallet(agentProfile.id);

    res.status(201).json({
      success: true,
      agentId: agentProfile.agentId,
      userId: user.id,
      message: 'Agent registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await prisma.agentProfile.findUnique({
      where: { agentId: req.params.id },
      include: { user: true }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      id: agent.agentId,
      name: agent.user.email || agent.agentId,
      type: agent.agentType,
      walletAddress: agent.walletAddress,
      jurisdiction: agent.user.jurisdiction,
      kycStatus: agent.user.kycStatus,
      reputationScore: agent.reputationScore,
      tasksCompleted: agent.tasksCompleted,
      totalEarnings: agent.totalEarnings,
      isActive: agent.isActive
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// List all agents
router.get('/', async (req, res) => {
  try {
    const { type, jurisdiction, limit = 20, offset = 0 } = req.query;

    const where: any = {};
    if (type) where.agentType = type;
    if (jurisdiction) where.user = { jurisdiction };

    const agents = await prisma.agentProfile.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      include: { user: { select: { jurisdiction: true, kycStatus: true } } }
    });

    res.json({
      agents: agents.map(agent => ({
        id: agent.agentId,
        type: agent.agentType,
        walletAddress: agent.walletAddress,
        jurisdiction: agent.user.jurisdiction,
        reputationScore: agent.reputationScore,
        tasksCompleted: agent.tasksCompleted
      })),
      total: await prisma.agentProfile.count({ where })
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

export { router as agentRoutes };
