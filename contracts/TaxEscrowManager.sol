// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TaxEscrowManager
 * @notice Manages tax withholdings and remittances to tax authorities
 * @dev Holds withheld taxes and facilitates periodic remittance
 */
contract TaxEscrowManager {
    
    struct TaxRecord {
        address employer;
        string jurisdiction;
        uint256 amount;
        uint256 withheldAt;
        bool remitted;
        uint256 remittedAt;
        string taxFormType;
    }
    
    struct JurisdictionConfig {
        string jurisdictionCode;
        address taxAuthority;
        uint256 remittanceFrequency;  // How often to remit (seconds)
        bool isActive;
    }
    
    // State
    address public owner;
    address public payrollMaster;
    
    // Tax records
    TaxRecord[] public taxRecords;
    mapping(address => uint256[]) public employerTaxRecords;
    mapping(string => uint256[]) public jurisdictionTaxRecords;
    
    // Escrow balances
    mapping(string => uint256) public jurisdictionEscrow;  // jurisdiction => amount
    mapping(address => uint256) public employerTaxLiabilities;
    
    // Jurisdiction configs
    mapping(string => JurisdictionConfig) public jurisdictions;
    string[] public supportedJurisdictions;
    
    // Events
    event TaxWithheld(
        address indexed employer,
        string indexed jurisdiction,
        uint256 amount,
        uint256 recordId,
        uint256 timestamp
    );
    
    event TaxRemitted(
        string indexed jurisdiction,
        uint256 amount,
        address indexed taxAuthority,
        uint256 timestamp
    );
    
    event JurisdictionAdded(
        string jurisdictionCode,
        address taxAuthority,
        uint256 frequency
    );
    
    event TaxFormGenerated(
        address indexed employer,
        string indexed jurisdiction,
        string formType,
        uint256 totalAmount,
        uint256 year
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyPayrollMaster() {
        require(msg.sender == payrollMaster, "Not payroll master");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function setPayrollMaster(address _payrollMaster) external onlyOwner {
        payrollMaster = _payrollMaster;
    }
    
    /**
     * @notice Add supported jurisdiction
     */
    function addJurisdiction(
        string calldata _jurisdictionCode,
        address _taxAuthority,
        uint256 _remittanceFrequency
    ) external onlyOwner {
        jurisdictions[_jurisdictionCode] = JurisdictionConfig({
            jurisdictionCode: _jurisdictionCode,
            taxAuthority: _taxAuthority,
            remittanceFrequency: _remittanceFrequency,
            isActive: true
        });
        supportedJurisdictions.push(_jurisdictionCode);
        
        emit JurisdictionAdded(_jurisdictionCode, _taxAuthority, _remittanceFrequency);
    }
    
    /**
     * @notice Escrow tax amount from payroll
     * @param _jurisdiction Jurisdiction code
     * @param _amount Tax amount to escrow
     */
    function escrowTax(string calldata _jurisdiction, uint256 _amount) external payable onlyPayrollMaster {
        require(_amount > 0, "Amount must be positive");
        require(msg.value >= _amount, "Insufficient value sent");
        require(jurisdictions[_jurisdiction].isActive || keccak256(bytes(_jurisdiction)) == keccak256(bytes("BATCH")), "Invalid jurisdiction");
        
        string memory jurisdiction = keccak256(bytes(_jurisdiction)) == keccak256(bytes("BATCH")) 
            ? "MULTI" 
            : _jurisdiction;
        
        uint256 recordId = taxRecords.length;
        
        taxRecords.push(TaxRecord({
            employer: tx.origin,
            jurisdiction: jurisdiction,
            amount: _amount,
            withheldAt: block.timestamp,
            remitted: false,
            remittedAt: 0,
            taxFormType: ""
        }));
        
        employerTaxRecords[tx.origin].push(recordId);
        jurisdictionTaxRecords[jurisdiction].push(recordId);
        jurisdictionEscrow[jurisdiction] += _amount;
        employerTaxLiabilities[tx.origin] += _amount;
        
        emit TaxWithheld(tx.origin, jurisdiction, _amount, recordId, block.timestamp);
    }
    
    /**
     * @notice Remit taxes to tax authority for a jurisdiction
     * @param _jurisdiction Jurisdiction to remit taxes for
     */
    function remitTaxes(string calldata _jurisdiction) external onlyOwner {
        JurisdictionConfig storage config = jurisdictions[_jurisdiction];
        require(config.isActive, "Jurisdiction not active");
        
        uint256 amount = jurisdictionEscrow[_jurisdiction];
        require(amount > 0, "No taxes to remit");
        
        // Transfer to tax authority
        (bool success, ) = config.taxAuthority.call{value: amount}("");
        require(success, "Remittance failed");
        
        jurisdictionEscrow[_jurisdiction] = 0;
        
        // Mark records as remitted
        uint256[] storage records = jurisdictionTaxRecords[_jurisdiction];
        for (uint256 i = 0; i < records.length; i++) {
            if (!taxRecords[records[i]].remitted) {
                taxRecords[records[i]].remitted = true;
                taxRecords[records[i]].remittedAt = block.timestamp;
            }
        }
        
        emit TaxRemitted(_jurisdiction, amount, config.taxAuthority, block.timestamp);
    }
    
    /**
     * @notice Generate tax form for employer
     * @param _employer Employer address
     * @param _jurisdiction Jurisdiction code
     * @param _formType Type of tax form (W2, 1099, etc.)
     * @param _year Tax year
     */
    function generateTaxForm(
        address _employer,
        string calldata _jurisdiction,
        string calldata _formType,
        uint256 _year
    ) external view returns (uint256 totalTax, uint256 recordCount) {
        uint256[] storage records = employerTaxRecords[_employer];
        totalTax = 0;
        recordCount = 0;
        
        for (uint256 i = 0; i < records.length; i++) {
            TaxRecord storage record = taxRecords[records[i]];
            
            // Check year (simplified - would use proper date comparison)
            bool inYear = (record.withheldAt >= (_year - 1970) * 365 days) && 
                         (record.withheldAt < (_year - 1970 + 1) * 365 days);
            
            if (keccak256(bytes(record.jurisdiction)) == keccak256(bytes(_jurisdiction)) && inYear) {
                totalTax += record.amount;
                recordCount++;
            }
        }
        
        // In production: Store form hash on-chain, generate PDF off-chain
        emit TaxFormGenerated(_employer, _jurisdiction, _formType, totalTax, _year);
        
        return (totalTax, recordCount);
    }
    
    /**
     * @notice Get employer's total tax liability
     */
    function getEmployerTaxLiability(address _employer) external view returns (uint256) {
        return employerTaxLiabilities[_employer];
    }
    
    /**
     * @notice Get jurisdiction's escrowed amount
     */
    function getJurisdictionEscrow(string calldata _jurisdiction) external view returns (uint256) {
        return jurisdictionEscrow[_jurisdiction];
    }
    
    /**
     * @notice Get tax record count
     */
    function getTaxRecordCount() external view returns (uint256) {
        return taxRecords.length;
    }
    
    /**
     * @notice Get employer's tax records
     */
    function getEmployerTaxRecords(address _employer) external view returns (uint256[] memory) {
        return employerTaxRecords[_employer];
    }
    
    /**
     * @notice Get total unremitted taxes across all jurisdictions
     */
    function getTotalUnremittedTaxes() external view returns (uint256 total) {
        for (uint256 i = 0; i < supportedJurisdictions.length; i++) {
            total += jurisdictionEscrow[supportedJurisdictions[i]];
        }
        return total;
    }
    
    receive() external payable {}
}
