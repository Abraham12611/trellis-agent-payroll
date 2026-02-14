import { Router } from 'express';

const router = Router();

// Get tax calculation
router.get('/calculate', async (req, res) => {
  try {
    const { amount, jurisdiction } = req.query;
    
    const taxRates: Record<string, number> = {
      'US': 0.25,
      'UK': 0.20,
      'EU': 0.22
    };
    
    const rate = taxRates[jurisdiction as string] || 0.25;
    const gross = parseFloat(amount as string);
    const tax = gross * rate;
    
    res.json({
      gross,
      taxRate: rate * 100,
      taxAmount: tax,
      netAmount: gross - tax,
      jurisdiction
    });
  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Get tax forms
router.get('/forms/:employer/:year', async (req, res) => {
  try {
    const { employer, year } = req.params;
    
    res.json({
      employer,
      year,
      forms: [
        { type: 'W-2', count: 5, totalTax: 45000 },
        { type: '1099', count: 3, totalTax: 12000 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forms' });
  }
});

export { router as taxRoutes };
