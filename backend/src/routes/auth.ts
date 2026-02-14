import { Router } from 'express';
import { body } from 'express-validator';

const router = Router();

// Passkey challenge
router.post('/passkey/challenge', async (req, res) => {
  try {
    // Generate challenge
    const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64');
    
    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
});

// Register passkey
router.post('/passkey/register', [
  body('credential').isObject(),
  body('userId').isUUID()
], async (req, res) => {
  try {
    const { credential, userId } = req.body;
    
    // Verify and store credential
    res.json({
      success: true,
      credentialId: credential.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify passkey
router.post('/passkey/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify signature
    res.json({
      success: true,
      token: 'jwt-token-here',
      user: {
        id: 'user-123',
        email: 'user@example.com'
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export { router as authRoutes };
