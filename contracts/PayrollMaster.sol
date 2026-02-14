// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AgentWalletFactory.sol";

/**
 * @title PayrollMaster
 * @notice Core payroll contract for batch disbursements, scheduling, and tax handling
 * @dev Leverages Tempo's native batching and scheduling capabilities
 */
contract PayrollMaster {
    
    struct Employee {
        address walletAddress;
        string employeeId;
        uint256 salary;           // Annual salary in smallest unit
        uint256 taxRate;          // Basis points (e.g., 2500 = 25%)
        string jurisdiction;
        uint256 lastPayDate;
        uint256 nextPayDate;
        bool isActive;
    }
    
    struct PayrollBatch {
        bytes32 batchId;
        address employer;
        uint256 totalAmount;
        uint256 totalTax;
        uint256 employeeCount;
        uint256 scheduledTime;
        bool executed;
        uint256 executedAt;
    }
    
    struct EmploymentContract {
        address employer;
        address employee;
        uint256 salary;
        uint256 frequency;        // Seconds between payments (e.g., 2592000 for monthly)
        uint256 startDate;
        uint256 endDate;
        string jurisdiction;
        bool isActive;
    }
    
    // State variables
    address public agentWalletFactory;
    address public complianceRegistry;
    address public taxEscrowManager;
    address public owner;
    
    // Mappings
    mapping(address => mapping(address => EmploymentContract)) public employmentContracts;
    mapping(address => Employee[]) public employerRosters;
    mapping(bytes32 => PayrollBatch) public payrollBatches;
    mapping(address => uint256) public employerBalances;
    mapping(address => bool) public authorizedEmployers;
    
    // Arrays for iteration
    bytes32[] public batchHistory;
    
    // Constants
    uint256 public constant MAX_TAX_RATE = 5000; // 50% max
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event EmployeeAdded(
        address indexed employer,
        address indexed employeeWallet,
        string employeeId,
        uint256 salary,
        string jurisdiction
    );
    
    event PayrollBatchScheduled(
        bytes32 indexed batchId,
        address indexed employer,
        uint256 employeeCount,
        uint256 scheduledTime,
        uint256 totalAmount
    );
    
    event PayrollExecuted(
        bytes32 indexed batchId,
        address indexed employer,
        uint256 totalAmount,
        uint256 totalTax,
        uint256 employeeCount,
        uint256 timestamp
    );
    
    event SalaryPaid(
        address indexed employer,
        address indexed employee,
        uint256 grossAmount,
        uint256 taxAmount,
        uint256 netAmount,
        bytes32 memo
    );
    
    event ContractCreated(
        address indexed employer,
        address indexed employee,
        uint256 salary,
        uint256 frequency
    );
    
    event EmployerAuthorized(address indexed employer);
    event FundsDeposited(address indexed employer, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedEmployer() {
        require(authorizedEmployers[msg.sender], "Not authorized employer");
        _;
    }
    
    constructor(
        address _agentWalletFactory,
        address _complianceRegistry,
        address _taxEscrowManager
    ) {
        agentWalletFactory = _agentWalletFactory;
        complianceRegistry = _complianceRegistry;
        taxEscrowManager = _taxEscrowManager;
        owner = msg.sender;
    }
    
    /**
     * @notice Deposit funds for payroll
     */
    function depositFunds() external payable onlyAuthorizedEmployer {
        employerBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Add employee to employer roster
     * @param _employeeWallet Employee's agent wallet address
     * @param _employeeId Unique employee identifier
     * @param _annualSalary Annual salary amount
     * @param _taxRate Tax rate in basis points (e.g., 2500 for 25%)
     * @param _jurisdiction Tax jurisdiction code
     * @param _paymentFrequency Seconds between payments
     */
    function addEmployee(
        address _employeeWallet,
        string calldata _employeeId,
        uint256 _annualSalary,
        uint256 _taxRate,
        string calldata _jurisdiction,
        uint256 _paymentFrequency
    ) external onlyAuthorizedEmployer {
        require(_taxRate <= MAX_TAX_RATE, "Tax rate too high");
        require(_annualSalary > 0, "Salary must be positive");
        require(_paymentFrequency > 0, "Frequency must be positive");
        
        // Verify employee wallet exists
        AgentWalletFactory factory = AgentWalletFactory(agentWalletFactory);
        require(factory.isValidAgent(_employeeWallet), "Invalid agent wallet");
        
        // Calculate per-period salary
        uint256 perPeriodSalary = _annualSalary / (365 days / _paymentFrequency);
        
        Employee memory newEmployee = Employee({
            walletAddress: _employeeWallet,
            employeeId: _employeeId,
            salary: perPeriodSalary,
            taxRate: _taxRate,
            jurisdiction: _jurisdiction,
            lastPayDate: 0,
            nextPayDate: block.timestamp + _paymentFrequency,
            isActive: true
        });
        
        employerRosters[msg.sender].push(newEmployee);
        
        // Create employment contract
        employmentContracts[msg.sender][_employeeWallet] = EmploymentContract({
            employer: msg.sender,
            employee: _employeeWallet,
            salary: perPeriodSalary,
            frequency: _paymentFrequency,
            startDate: block.timestamp,
            endDate: 0,
            jurisdiction: _jurisdiction,
            isActive: true
        });
        
        emit EmployeeAdded(
            msg.sender,
            _employeeWallet,
            _employeeId,
            perPeriodSalary,
            _jurisdiction
        );
        
        emit ContractCreated(
            msg.sender,
            _employeeWallet,
            perPeriodSalary,
            _paymentFrequency
        );
    }
    
    /**
     * @notice Schedule a payroll batch for future execution
     * @param _employeeIndices Indices of employees in roster to pay
     * @param _scheduledTime Unix timestamp for execution
     * @return batchId Unique identifier for the batch
     */
    function schedulePayrollBatch(
        uint256[] calldata _employeeIndices,
        uint256 _scheduledTime
    ) external onlyAuthorizedEmployer returns (bytes32 batchId) {
        require(_scheduledTime > block.timestamp, "Schedule time must be future");
        require(_employeeIndices.length > 0, "No employees selected");
        
        Employee[] storage roster = employerRosters[msg.sender];
        uint256 totalAmount = 0;
        uint256 totalTax = 0;
        
        // Calculate totals
        for (uint256 i = 0; i < _employeeIndices.length; i++) {
            require(_employeeIndices[i] < roster.length, "Invalid employee index");
            Employee storage emp = roster[_employeeIndices[i]];
            require(emp.isActive, "Employee not active");
            
            uint256 taxAmount = (emp.salary * emp.taxRate) / BASIS_POINTS;
            totalTax += taxAmount;
            totalAmount += emp.salary;
        }
        
        require(employerBalances[msg.sender] >= totalAmount, "Insufficient balance");
        
        // Generate batch ID
        batchId = keccak256(abi.encodePacked(
            msg.sender,
            _scheduledTime,
            block.timestamp,
            _employeeIndices
        ));
        
        payrollBatches[batchId] = PayrollBatch({
            batchId: batchId,
            employer: msg.sender,
            totalAmount: totalAmount,
            totalTax: totalTax,
            employeeCount: _employeeIndices.length,
            scheduledTime: _scheduledTime,
            executed: false,
            executedAt: 0
        });
        
        batchHistory.push(batchId);
        
        emit PayrollBatchScheduled(
            batchId,
            msg.sender,
            _employeeIndices.length,
            _scheduledTime,
            totalAmount
        );
        
        return batchId;
    }
    
    /**
     * @notice Execute a scheduled payroll batch
     * @param _batchId Batch identifier
     * @param _employeeIndices Employee indices to process
     */
    function executePayrollBatch(
        bytes32 _batchId,
        uint256[] calldata _employeeIndices
    ) external onlyAuthorizedEmployer {
        PayrollBatch storage batch = payrollBatches[_batchId];
        
        require(batch.employer == msg.sender, "Not batch owner");
        require(!batch.executed, "Batch already executed");
        require(block.timestamp >= batch.scheduledTime, "Too early to execute");
        require(employerBalances[msg.sender] >= batch.totalAmount, "Insufficient balance");
        
        Employee[] storage roster = employerRosters[msg.sender];
        uint256 totalTaxTransferred = 0;
        
        // Process each employee (using 2D nonces for parallel execution)
        for (uint256 i = 0; i < _employeeIndices.length; i++) {
            uint256 idx = _employeeIndices[i];
            require(idx < roster.length, "Invalid index");
            
            Employee storage emp = roster[idx];
            if (!emp.isActive) continue;
            
            uint256 taxAmount = (emp.salary * emp.taxRate) / BASIS_POINTS;
            uint256 netAmount = emp.salary - taxAmount;
            
            // Deduct from employer balance
            employerBalances[msg.sender] -= emp.salary;
            
            // Escrow tax
            totalTaxTransferred += taxAmount;
            
            // Update employee payment tracking
            emp.lastPayDate = block.timestamp;
            emp.nextPayDate = block.timestamp + employmentContracts[msg.sender][emp.walletAddress].frequency;
            
            // Generate payment memo
            bytes32 memo = keccak256(abi.encodePacked(
                emp.employeeId,
                block.timestamp,
                emp.jurisdiction
            ));
            
            emit SalaryPaid(
                msg.sender,
                emp.walletAddress,
                emp.salary,
                taxAmount,
                netAmount,
                memo
            );
        }
        
        // Transfer total tax to escrow
        employerBalances[msg.sender] -= totalTaxTransferred;
        (bool taxSuccess, ) = taxEscrowManager.call{value: totalTaxTransferred}(
            abi.encodeWithSignature("escrowTax(string,uint256)", "BATCH", totalTaxTransferred)
        );
        require(taxSuccess, "Tax escrow failed");
        
        // Mark batch as executed
        batch.executed = true;
        batch.executedAt = block.timestamp;
        
        emit PayrollExecuted(
            _batchId,
            msg.sender,
            batch.totalAmount,
            totalTaxTransferred,
            _employeeIndices.length,
            block.timestamp
        );
    }
    
    /**
     * @notice Execute immediate payroll (non-batched for single payment)
     * @param _employeeWallet Employee wallet address
     */
    function executeImmediatePayroll(address _employeeWallet) external onlyAuthorizedEmployer {
        EmploymentContract storage contract_ = employmentContracts[msg.sender][_employeeWallet];
        require(contract_.isActive, "Contract not active");
        
        Employee[] storage roster = employerRosters[msg.sender];
        Employee storage employee;
        bool found = false;
        
        for (uint256 i = 0; i < roster.length; i++) {
            if (roster[i].walletAddress == _employeeWallet) {
                employee = roster[i];
                found = true;
                break;
            }
        }
        
        require(found, "Employee not found");
        require(employee.isActive, "Employee not active");
        
        uint256 taxAmount = (employee.salary * employee.taxRate) / BASIS_POINTS;
        uint256 netAmount = employee.salary - taxAmount;
        
        require(employerBalances[msg.sender] >= employee.salary, "Insufficient balance");
        
        // Deduct from employer
        employerBalances[msg.sender] -= employee.salary;
        
        // Transfer tax to escrow
        employerBalances[msg.sender] -= taxAmount;
        (bool taxSuccess, ) = taxEscrowManager.call{value: taxAmount}(
            abi.encodeWithSignature("escrowTax(string,uint256)", employee.jurisdiction, taxAmount)
        );
        require(taxSuccess, "Tax escrow failed");
        
        // Update tracking
        employee.lastPayDate = block.timestamp;
        employee.nextPayDate = block.timestamp + contract_.frequency;
        
        bytes32 memo = keccak256(abi.encodePacked(
            employee.employeeId,
            block.timestamp,
            "IMMEDIATE"
        ));
        
        emit SalaryPaid(
            msg.sender,
            _employeeWallet,
            employee.salary,
            taxAmount,
            netAmount,
            memo
        );
    }
    
    /**
     * @notice Authorize new employer
     */
    function authorizeEmployer(address _employer) external onlyOwner {
        authorizedEmployers[_employer] = true;
        emit EmployerAuthorized(_employer);
    }
    
    /**
     * @notice Get employer roster size
     */
    function getRosterSize(address _employer) external view returns (uint256) {
        return employerRosters[_employer].length;
    }
    
    /**
     * @notice Get employee details
     */
    function getEmployee(address _employer, uint256 _index) external view returns (Employee memory) {
        require(_index < employerRosters[_employer].length, "Invalid index");
        return employerRosters[_employer][_index];
    }
    
    /**
     * @notice Get batch count
     */
    function getBatchCount() external view returns (uint256) {
        return batchHistory.length;
    }
    
    /**
     * @notice Check if employer can meet payroll
     */
    function canMeetPayroll(address _employer, uint256 _employeeCount) external view returns (bool) {
        Employee[] storage roster = employerRosters[_employer];
        uint256 totalNeeded = 0;
        uint256 count = _employeeCount > roster.length ? roster.length : _employeeCount;
        
        for (uint256 i = 0; i < count; i++) {
            if (roster[i].isActive) {
                totalNeeded += roster[i].salary;
            }
        }
        
        return employerBalances[_employer] >= totalNeeded;
    }
    
    /**
     * @notice Get upcoming payroll schedule
     */
    function getUpcomingPayrolls(address _employer) external view returns (Employee[] memory) {
        Employee[] storage roster = employerRosters[_employer];
        uint256 upcomingCount = 0;
        
        for (uint256 i = 0; i < roster.length; i++) {
            if (roster[i].isActive && roster[i].nextPayDate <= block.timestamp + 7 days) {
                upcomingCount++;
            }
        }
        
        Employee[] memory upcoming = new Employee[](upcomingCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < roster.length; i++) {
            if (roster[i].isActive && roster[i].nextPayDate <= block.timestamp + 7 days) {
                upcoming[idx] = roster[i];
                idx++;
            }
        }
        
        return upcoming;
    }
    
    receive() external payable {
        employerBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}
