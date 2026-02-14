// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ComplianceRegistry
 * @notice Manages KYC/AML compliance and integrates with TIP-403 Policy Registry
 * @dev Provides compliance checks for all payroll operations
 */
contract ComplianceRegistry {
    
    enum ComplianceStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        SUSPENDED,
        EXPIRED
    }
    
    enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
    
    struct ComplianceRecord {
        address walletAddress;
        string jurisdiction;
        ComplianceStatus status;
        RiskLevel riskLevel;
        uint256 verifiedAt;
        uint256 expiresAt;
        string kycProvider;
        bytes32 verificationHash;
        bool isSanctioned;
        string[] flags;
    }
    
    struct Policy {
        bytes32 policyId;
        string policyType; // "whitelist", "blacklist", "kyc-required"
        string jurisdiction;
        bool isActive;
        uint256 createdAt;
    }
    
    // State
    address public owner;
    address public tip403Registry; // Integration with Tempo's TIP-403
    
    // Compliance records
    mapping(address => ComplianceRecord) public complianceRecords;
    mapping(string => address[]) public jurisdictionAgents;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted;
    
    // Policies
    mapping(bytes32 => Policy) public policies;
    bytes32[] public activePolicies;
    
    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public authorizedComplianceOfficers;
    
    // Jurisdiction requirements
    mapping(string => bool) public jurisdictionRequiresKYC;
    mapping(string => uint256) public jurisdictionVerificationValidity; // seconds
    
    // Events
    event ComplianceVerified(
        address indexed walletAddress,
        string jurisdiction,
        ComplianceStatus status,
        RiskLevel riskLevel,
        uint256 expiresAt
    );
    
    event ComplianceStatusUpdated(
        address indexed walletAddress,
        ComplianceStatus oldStatus,
        ComplianceStatus newStatus
    );
    
    event AddressBlacklisted(address indexed walletAddress, string reason);
    event AddressWhitelisted(address indexed walletAddress);
    event AddressRemovedFromBlacklist(address indexed walletAddress);
    event AddressRemovedFromWhitelist(address indexed walletAddress);
    
    event PolicyCreated(
        bytes32 indexed policyId,
        string policyType,
        string jurisdiction
    );
    
    event ComplianceCheckPassed(
        address indexed walletAddress,
        bytes32 indexed policyId,
        string checkType
    );
    
    event ComplianceCheckFailed(
        address indexed walletAddress,
        bytes32 indexed policyId,
        string reason
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || authorizedComplianceOfficers[msg.sender], "Not authorized");
        _;
    }
    
    modifier onlyComplianceOfficer() {
        require(authorizedComplianceOfficers[msg.sender], "Not compliance officer");
        _;
    }
    
    constructor(address _tip403Registry) {
        owner = msg.sender;
        tip403Registry = _tip403Registry;
        authorizedComplianceOfficers[msg.sender] = true;
        authorizedVerifiers[msg.sender] = true;
        
        // Set default jurisdiction requirements
        jurisdictionRequiresKYC["US"] = true;
        jurisdictionRequiresKYC["EU"] = true;
        jurisdictionRequiresKYC["UK"] = true;
        jurisdictionVerificationValidity["US"] = 365 days;
        jurisdictionVerificationValidity["EU"] = 365 days;
        jurisdictionVerificationValidity["UK"] = 365 days;
    }
    
    /**
     * @notice Verify compliance for an agent wallet
     * @param _walletAddress Agent wallet address
     * @param _jurisdiction Jurisdiction code
     * @param _riskLevel Assessed risk level
     * @param _kycProvider KYC provider identifier
     * @param _verificationHash Hash of off-chain verification documents
     */
    function verifyCompliance(
        address _walletAddress,
        string calldata _jurisdiction,
        RiskLevel _riskLevel,
        string calldata _kycProvider,
        bytes32 _verificationHash
    ) external onlyVerifier {
        require(_walletAddress != address(0), "Invalid address");
        require(!blacklisted[_walletAddress], "Address is blacklisted");
        
        uint256 validity = jurisdictionVerificationValidity[_jurisdiction];
        if (validity == 0) validity = 365 days; // Default 1 year
        
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        
        record.walletAddress = _walletAddress;
        record.jurisdiction = _jurisdiction;
        record.status = ComplianceStatus.VERIFIED;
        record.riskLevel = _riskLevel;
        record.verifiedAt = block.timestamp;
        record.expiresAt = block.timestamp + validity;
        record.kycProvider = _kycProvider;
        record.verificationHash = _verificationHash;
        record.isSanctioned = false;
        
        jurisdictionAgents[_jurisdiction].push(_walletAddress);
        
        // Auto-whitelist low-risk verified addresses
        if (_riskLevel == RiskLevel.LOW) {
            whitelisted[_walletAddress] = true;
            emit AddressWhitelisted(_walletAddress);
        }
        
        emit ComplianceVerified(
            _walletAddress,
            _jurisdiction,
            ComplianceStatus.VERIFIED,
            _riskLevel,
            record.expiresAt
        );
    }
    
    /**
     * @notice Check if address can receive payments (full compliance check)
     * @param _walletAddress Address to check
     * @param _jurisdiction Required jurisdiction
     * @return canReceive Whether address can receive payments
     * @return reason Reason if check fails
     */
    function canReceivePayments(
        address _walletAddress,
        string calldata _jurisdiction
    ) external view returns (bool canReceive, string memory reason) {
        // Check blacklist
        if (blacklisted[_walletAddress]) {
            return (false, "Address is blacklisted");
        }
        
        // Check whitelist if policy requires
        if (whitelisted[_walletAddress]) {
            return (true, "");
        }
        
        // Check compliance record
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        
        if (record.walletAddress == address(0)) {
            return (false, "No compliance record found");
        }
        
        if (record.status != ComplianceStatus.VERIFIED) {
            return (false, "Compliance not verified");
        }
        
        if (block.timestamp > record.expiresAt) {
            return (false, "Compliance verification expired");
        }
        
        if (record.isSanctioned) {
            return (false, "Address is sanctioned");
        }
        
        // Check jurisdiction
        if (jurisdictionRequiresKYC[_jurisdiction]) {
            if (keccak256(bytes(record.jurisdiction)) != keccak256(bytes(_jurisdiction))) {
                return (false, "Jurisdiction mismatch");
            }
        }
        
        // Check risk level
        if (record.riskLevel == RiskLevel.CRITICAL) {
            return (false, "Critical risk level");
        }
        
        return (true, "");
    }
    
    /**
     * @notice Quick check for payment processing
     * @param _from Sender address
     * @param _to Recipient address
     * @return allowed Whether transaction is allowed
     */
    function checkTransactionAllowed(
        address _from,
        address _to
    ) external view returns (bool allowed) {
        if (blacklisted[_from] || blacklisted[_to]) {
            return false;
        }
        
        ComplianceRecord storage fromRecord = complianceRecords[_from];
        ComplianceRecord storage toRecord = complianceRecords[_to];
        
        // Both must be verified and not expired
        if (fromRecord.status != ComplianceStatus.VERIFIED || 
            toRecord.status != ComplianceStatus.VERIFIED) {
            return false;
        }
        
        if (block.timestamp > fromRecord.expiresAt || 
            block.timestamp > toRecord.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @notice Add address to blacklist
     */
    function blacklistAddress(address _walletAddress, string calldata _reason) external onlyComplianceOfficer {
        blacklisted[_walletAddress] = true;
        whitelisted[_walletAddress] = false;
        
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        if (record.walletAddress != address(0)) {
            record.status = ComplianceStatus.SUSPENDED;
            record.flags.push(_reason);
        }
        
        emit AddressBlacklisted(_walletAddress, _reason);
        emit ComplianceStatusUpdated(_walletAddress, record.status, ComplianceStatus.SUSPENDED);
    }
    
    /**
     * @notice Remove address from blacklist
     */
    function removeFromBlacklist(address _walletAddress) external onlyComplianceOfficer {
        blacklisted[_walletAddress] = false;
        emit AddressRemovedFromBlacklist(_walletAddress);
    }
    
    /**
     * @notice Add address to whitelist
     */
    function whitelistAddress(address _walletAddress) external onlyComplianceOfficer {
        require(!blacklisted[_walletAddress], "Cannot whitelist blacklisted address");
        whitelisted[_walletAddress] = true;
        emit AddressWhitelisted(_walletAddress);
    }
    
    /**
     * @notice Remove address from whitelist
     */
    function removeFromWhitelist(address _walletAddress) external onlyComplianceOfficer {
        whitelisted[_walletAddress] = false;
        emit AddressRemovedFromWhitelist(_walletAddress);
    }
    
    /**
     * @notice Update compliance status
     */
    function updateComplianceStatus(
        address _walletAddress,
        ComplianceStatus _newStatus
    ) external onlyComplianceOfficer {
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        require(record.walletAddress != address(0), "Record not found");
        
        ComplianceStatus oldStatus = record.status;
        record.status = _newStatus;
        
        emit ComplianceStatusUpdated(_walletAddress, oldStatus, _newStatus);
    }
    
    /**
     * @notice Create compliance policy
     */
    function createPolicy(
        string calldata _policyType,
        string calldata _jurisdiction
    ) external onlyComplianceOfficer returns (bytes32 policyId) {
        policyId = keccak256(abi.encodePacked(_policyType, _jurisdiction, block.timestamp));
        
        policies[policyId] = Policy({
            policyId: policyId,
            policyType: _policyType,
            jurisdiction: _jurisdiction,
            isActive: true,
            createdAt: block.timestamp
        });
        
        activePolicies.push(policyId);
        
        emit PolicyCreated(policyId, _policyType, _jurisdiction);
    }
    
    /**
     * @notice Add compliance flag to address
     */
    function addComplianceFlag(
        address _walletAddress,
        string calldata _flag
    ) external onlyComplianceOfficer {
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        require(record.walletAddress != address(0), "Record not found");
        record.flags.push(_flag);
    }
    
    /**
     * @notice Set jurisdiction KYC requirement
     */
    function setJurisdictionKYCRequirement(
        string calldata _jurisdiction,
        bool _requiresKYC,
        uint256 _validityPeriod
    ) external onlyOwner {
        jurisdictionRequiresKYC[_jurisdiction] = _requiresKYC;
        jurisdictionVerificationValidity[_jurisdiction] = _validityPeriod;
    }
    
    /**
     * @notice Add authorized verifier
     */
    function addAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
    }
    
    /**
     * @notice Add compliance officer
     */
    function addComplianceOfficer(address _officer) external onlyOwner {
        authorizedComplianceOfficers[_officer] = true;
    }
    
    /**
     * @notice Get compliance record
     */
    function getComplianceRecord(address _walletAddress) external view returns (ComplianceRecord memory) {
        return complianceRecords[_walletAddress];
    }
    
    /**
     * @notice Check if compliance is valid (not expired)
     */
    function isComplianceValid(address _walletAddress) external view returns (bool) {
        ComplianceRecord storage record = complianceRecords[_walletAddress];
        return record.status == ComplianceStatus.VERIFIED && 
               block.timestamp <= record.expiresAt;
    }
    
    /**
     * @notice Get agents in jurisdiction
     */
    function getJurisdictionAgents(string calldata _jurisdiction) external view returns (address[] memory) {
        return jurisdictionAgents[_jurisdiction];
    }
    
    /**
     * @notice Bulk compliance check for payroll batch
     */
    function bulkComplianceCheck(
        address[] calldata _addresses,
        string calldata _jurisdiction
    ) external view returns (bool allCompliant, address[] memory nonCompliant) {
        uint256 nonCompliantCount = 0;
        
        // Count non-compliant first
        for (uint256 i = 0; i < _addresses.length; i++) {
            (bool canReceive, ) = this.canReceivePayments(_addresses[i], _jurisdiction);
            if (!canReceive) {
                nonCompliantCount++;
            }
        }
        
        if (nonCompliantCount == 0) {
            return (true, new address[](0));
        }
        
        // Collect non-compliant addresses
        address[] memory failed = new address[](nonCompliantCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < _addresses.length; i++) {
            (bool canReceive, ) = this.canReceivePayments(_addresses[i], _jurisdiction);
            if (!canReceive) {
                failed[idx] = _addresses[i];
                idx++;
            }
        }
        
        return (false, failed);
    }
    
    receive() external payable {}
}
