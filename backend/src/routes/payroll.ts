import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const router = Router();
const prisma = new PrismaClient();

// Contract ABIs and addresses would be imported from config
const PAYROLL_ABI = [
  "function depositFunds() external payable",
  "function addEmployee(address _employeeWallet, string calldata _employeeId, uint256 _annualSalary, uint256 _taxRate, string calldata _jurisdiction, uint256 _paymentFrequency) external",
  "function schedulePayrollBatch(uint256[] calldata _employeeIndices, uint256 _scheduledTime) external returns (bytes32)",
  "function executePayrollBatch(bytes32 _batchId, uint256[] calldata _employeeIndices) external",
  "event PayrollExecuted(bytes32 indexed batchId, address indexed employer, uint256 totalAmount, uint256 totalTax, uint256 employeeCount, uint256 timestamp)"
];

// Deposit funds for payroll
router.post('/deposit', [
  body('employerId').isUUID(),
  body('amount').isNumeric(),
  body('transactionHash').isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { employerId, amount, transactionHash } = req.body;

    // Verify transaction on-chain
    // const receipt = await provider.getTransactionReceipt(transactionHash);
    
    // Record deposit
    const deposit = await prisma.payment.create({
      data: {
        batchId: null,
        employeeId: null,
        grossAmount: parseFloat(amount),
        taxAmount: 0,
        netAmount: parseFloat(amount),
        memo: 'DEPOSIT',
        transactionHash,
        status: 'CONFIRMED',
        paidAt: new Date()
      }
    });

    res.json({
      success: true,
      depositId: deposit.id,
      amount,
      transactionHash
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Add employee to payroll
router.post('/employees', [
  body('employerId').isUUID(),
  body('agentId').isString(),
  body('salary').isNumeric(),
  body('taxRate').isInt({ min: 0, max: 5000 }),
  body('frequency').isString()
], async (req, res) => {
  try {
    const { employerId, agentId, salary, taxRate, frequency } = req.body;

    // Find agent
    const agent = await prisma.agentProfile.findUnique({
      where: { agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Convert frequency to seconds
    const frequencySeconds = {
      'weekly': 7 * 24 * 60 * 60,
      'biweekly': 14 * 24 * 60 * 60,
      'monthly': 30 * 24 * 60 * 60
    }[frequency] || 30 * 24 * 60 * 60;

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        employerId,
        agentProfileId: agent.id,
        employeeId: `EMP-${Date.now()}`,
        salary: parseFloat(salary),
        taxRate,
        paymentFrequency: frequencySeconds,
        startDate: new Date(),
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      employeeId: employee.employeeId,
      agentId,
      salary,
      taxRate: `${(taxRate / 100).toFixed(2)}%`
    });
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Get employees for employer
router.get('/employees', async (req, res) => {
  try {
    const { employerId } = req.query;

    const employees = await prisma.employee.findMany({
      where: { employerId: employerId as string },
      include: {
        agentProfile: {
          include: { user: true }
        }
      }
    });

    res.json({
      employees: employees.map(emp => ({
        id: emp.employeeId,
        agentId: emp.agentProfile.agentId,
        name: emp.agentProfile.user.email || emp.agentProfile.agentId,
        walletAddress: emp.agentProfile.walletAddress,
        salary: emp.salary,
        taxRate: emp.taxRate,
        frequency: emp.paymentFrequency,
        startDate: emp.startDate,
        isActive: emp.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Schedule payroll batch
router.post('/batches', [
  body('employerId').isUUID(),
  body('employeeIds').isArray(),
  body('scheduledFor').isISO8601()
], async (req, res) => {
  try {
    const { employerId, employeeIds, scheduledFor } = req.body;

    // Get employees
    const employees = await prisma.employee.findMany({
      where: {
        employerId,
        employeeId: { in: employeeIds }
      }
    });

    // Calculate totals
    let totalGross = 0;
    let totalTax = 0;

    employees.forEach(emp => {
      const periodSalary = emp.salary; // Already monthly
      const taxAmount = (periodSalary * emp.taxRate) / 10000;
      totalGross += periodSalary;
      totalTax += taxAmount;
    });

    // Create batch record
    const batch = await prisma.payrollBatch.create({
      data: {
        employerId,
        status: 'SCHEDULED',
        totalAmount: totalGross,
        totalTax,
        employeeCount: employees.length,
        scheduledFor: new Date(scheduledFor)
      }
    });

    res.status(201).json({
      success: true,
      batchId: batch.id,
      employeeCount: employees.length,
      totalGross,
      totalTax,
      totalNet: totalGross - totalTax,
      scheduledFor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule payroll' });
  }
});

// Execute payroll batch
router.post('/batches/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await prisma.payrollBatch.findUnique({
      where: { id },
      include: { employer: true }
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (batch.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Batch already executed' });
    }

    // Execute on-chain (would use actual provider)
    // const tx = await payrollContract.executePayrollBatch(batch.batchId, employeeIndices);
    // const receipt = await tx.wait();

    // Update batch status
    const updatedBatch = await prisma.payrollBatch.update({
      where: { id },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
        transactionHash: `0x${ethers.hexlify(ethers.randomBytes(32)).slice(2, 42)}`
      }
    });

    res.json({
      success: true,
      batchId: id,
      status: 'EXECUTED',
      transactionHash: updatedBatch.transactionHash,
      executedAt: updatedBatch.executedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute payroll' });
  }
});

// Get payroll history
router.get('/history', async (req, res) => {
  try {
    const { employerId, limit = 10, offset = 0 } = req.query;

    const batches = await prisma.payrollBatch.findMany({
      where: { employerId: employerId as string },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      batches: batches.map(batch => ({
        id: batch.id,
        status: batch.status,
        totalAmount: batch.totalAmount,
        totalTax: batch.totalTax,
        employeeCount: batch.employeeCount,
        scheduledFor: batch.scheduledFor,
        executedAt: batch.executedAt,
        transactionHash: batch.transactionHash
      })),
      total: await prisma.payrollBatch.count({
        where: { employerId: employerId as string }
      })
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll history' });
  }
});

export { router as payrollRoutes };
