// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentWalletFactory
 * @notice Factory for deploying TIP-20 compliant agent wallets with passkey authentication
 * @dev Creates smart contract wallets for AI agents and humans with embedded compliance
 */
contract AgentWalletFactory {
    
    struct AgentProfile {
        address walletAddress;
        string agentId;
        string jurisdiction;
        bytes32 passkeyPublicKey;
        bool isActive;
        uint256 createdAt;
        AgentType agentType;
    }
    
    enum AgentType {
        HUMAN,
        AI_AGENT,
        HYBRID
    }
    
    // Mappings
    mapping(address => AgentProfile) public agents;
    mapping(string => address) public agentIdToWallet;
    mapping(address => bool) public authorizedDeployers;
    
    // State
    address public complianceRegistry;
    address public payrollMaster;
    uint256 public totalAgents;
    
    // Events
    event AgentWalletCreated(
        address indexed walletAddress,
        string indexed agentId,
        AgentType agentType,
        string jurisdiction,
        uint256 timestamp
    );
    
    event AgentStatusUpdated(address indexed walletAddress, bool isActive);
    event PasskeyRegistered(address indexed walletAddress, bytes32 publicKey);
    
    modifier onlyAuthorized() {
        require(authorizedDeployers[msg.sender], "Not authorized");
        _;
    }
    
    constructor(address _complianceRegistry) {
        complianceRegistry = _complianceRegistry;
        authorizedDeployers[msg.sender] = true;
    }
    
    /**
     * @notice Create a new agent wallet with passkey authentication
     * @param _agentId Unique identifier for the agent
     * @param _jurisdiction Tax/compliance jurisdiction (ISO code)
     * @param _passkeyPublicKey WebAuthn public key for authentication
     * @param _agentType Type of agent (HUMAN, AI_AGENT, HYBRID)
     * @return walletAddress Address of the deployed wallet
     */
    function createAgentWallet(
        string calldata _agentId,
        string calldata _jurisdiction,
        bytes32 _passkeyPublicKey,
        AgentType _agentType
    ) external onlyAuthorized returns (address walletAddress) {
        require(bytes(_agentId).length > 0, "Agent ID required");
        require(agentIdToWallet[_agentId] == address(0), "Agent ID already exists");
        require(_passkeyPublicKey != bytes32(0), "Passkey required");
        
        // Deploy new AgentWallet contract
        AgentWallet wallet = new AgentWallet(
            _agentId,
            _jurisdiction,
            _passkeyPublicKey,
            _agentType,
            complianceRegistry,
            msg.sender
        );
        
        walletAddress = address(wallet);
        
        // Store agent profile
        agents[walletAddress] = AgentProfile({
            walletAddress: walletAddress,
            agentId: _agentId,
            jurisdiction: _jurisdiction,
            passkeyPublicKey: _passkeyPublicKey,
            isActive: true,
            createdAt: block.timestamp,
            agentType: _agentType
        });
        
        agentIdToWallet[_agentId] = walletAddress;
        totalAgents++;
        
        emit AgentWalletCreated(
            walletAddress,
            _agentId,
            _agentType,
            _jurisdiction,
            block.timestamp
        );
        
        emit PasskeyRegistered(walletAddress, _passkeyPublicKey);
    }
    
    /**
     * @notice Update agent status (active/inactive)
     * @param _walletAddress Agent wallet address
     * @param _isActive New status
     */
    function updateAgentStatus(address _walletAddress, bool _isActive) external onlyAuthorized {
        require(agents[_walletAddress].walletAddress != address(0), "Agent not found");
        agents[_walletAddress].isActive = _isActive;
        emit AgentStatusUpdated(_walletAddress, _isActive);
    }
    
    /**
     * @notice Add authorized deployer
     * @param _deployer Address to authorize
     */
    function addAuthorizedDeployer(address _deployer) external onlyAuthorized {
        authorizedDeployers[_deployer] = true;
    }
    
    /**
     * @notice Get agent profile by wallet address
     */
    function getAgentProfile(address _walletAddress) external view returns (AgentProfile memory) {
        return agents[_walletAddress];
    }
    
    /**
     * @notice Get agent wallet by ID
     */
    function getWalletByAgentId(string calldata _agentId) external view returns (address) {
        return agentIdToWallet[_agentId];
    }
    
    /**
     * @notice Check if wallet is valid agent
     */
    function isValidAgent(address _walletAddress) external view returns (bool) {
        return agents[_walletAddress].isActive && agents[_walletAddress].walletAddress != address(0);
    }
}

/**
 * @title AgentWallet
 * @notice Individual agent wallet with passkey authentication and TIP-20 compliance
 */
contract AgentWallet {
    
    struct Transaction {
        address to;
        uint256 amount;
        bytes32 memo;
        bool executed;
        uint256 timestamp;
    }
    
    // Identity
    string public agentId;
    string public jurisdiction;
    bytes32 public passkeyPublicKey;
    AgentWalletFactory.AgentType public agentType;
    
    // State
    address public factory;
    address public complianceRegistry;
    address public owner;
    mapping(bytes32 => bool) public executedNonces;
    Transaction[] public transactionHistory;
    
    // Events
    event TransactionExecuted(
        address indexed to,
        uint256 amount,
        bytes32 indexed memo,
        uint256 timestamp
    );
    
    event PasskeyAuthSuccess(bytes32 indexed nonce);
    
    modifier onlyOwner() {
        require(msg.sender == owner || msg.sender == factory, "Not authorized");
        _;
    }
    
    constructor(
        string memory _agentId,
        string memory _jurisdiction,
        bytes32 _passkeyPublicKey,
        AgentWalletFactory.AgentType _agentType,
        address _complianceRegistry,
        address _owner
    ) {
        agentId = _agentId;
        jurisdiction = _jurisdiction;
        passkeyPublicKey = _passkeyPublicKey;
        agentType = _agentType;
        complianceRegistry = _complianceRegistry;
        factory = msg.sender;
        owner = _owner;
    }
    
    /**
     * @notice Execute transaction with passkey authentication
     * @param _to Recipient address
     * @param _amount Amount to transfer
     * @param _memo Payment memo (employee ID, invoice, etc.)
     * @param _signature WebAuthn signature
     * @param _nonce Unique nonce for replay protection
     */
    function executeTransaction(
        address _to,
        uint256 _amount,
        bytes32 _memo,
        bytes calldata _signature,
        bytes32 _nonce
    ) external onlyOwner returns (bool) {
        require(!executedNonces[_nonce], "Nonce already used");
        require(verifyPasskeySignature(_signature, _nonce), "Invalid signature");
        
        executedNonces[_nonce] = true;
        
        // Record transaction
        transactionHistory.push(Transaction({
            to: _to,
            amount: _amount,
            memo: _memo,
            executed: true,
            timestamp: block.timestamp
        }));
        
        emit TransactionExecuted(_to, _amount, _memo, block.timestamp);
        emit PasskeyAuthSuccess(_nonce);
        
        return true;
    }
    
    /**
     * @notice Verify WebAuthn/Passkey signature
     * @dev Simplified verification - in production uses P256 curve validation
     */
    function verifyPasskeySignature(bytes calldata _signature, bytes32 _nonce) internal view returns (bool) {
        // In production: Validate P256 signature using WebAuthn standard
        // For hackathon demo: Check signature length and format
        return _signature.length >= 64 && _nonce != bytes32(0);
    }
    
    /**
     * @notice Get transaction history count
     */
    function getTransactionCount() external view returns (uint256) {
        return transactionHistory.length;
    }
    
    /**
     * @notice Receive ETH/Tokens
     */
    receive() external payable {}
}
