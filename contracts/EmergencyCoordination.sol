// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EmergencyCoordination
 * @dev Community Emergency Coordination Dashboard Smart Contract
 * @notice This contract manages emergency incidents, volunteers, and announcements
 */
contract EmergencyCoordination {
    
    // ==================== Data Structures ====================
    
    enum AppRole { Citizen, Volunteer, CommunityLeader, EmergencyDesk }
    enum IncidentCategory { Medical, Fire, Flood, Storm, Earthquake, Other }
    enum IncidentSeverity { Low, Medium, High, Critical }
    enum IncidentStatus { Reported, Acknowledged, InProgress, Resolved, Closed }
    enum VolunteerStatus { Available, Unavailable, Busy }
    enum EscalationStatus { None, Escalated, UnderReview, Approved, Rejected }
    
    struct UserProfile {
        string name;
        string email;
        AppRole appRole;
        bool isVerified;
        uint256 trustScore;
        uint256 createdAt;
        bool exists;
    }
    
    struct Incident {
        uint256 id;
        string title;
        string description;
        IncidentCategory category;
        IncidentSeverity severity;
        IncidentStatus status;
        int256 latitude;
        int256 longitude;
        address reportedBy;
        uint256 createdAt;
        uint256 updatedAt;
        address[] assignedVolunteers;
        bool exists;
        EscalationStatus escalationStatus;
        uint256 escalatedAt;
        uint256 resolutionNonce;
    }
    
    struct Announcement {
        uint256 id;
        string title;
        string message;
        uint256 priority; // 1: Low, 2: Medium, 3: High
        address author;
        uint256 createdAt;
        bool exists;
    }
    
    struct Volunteer {
        string name;
        string email;
        string[] skills;
        VolunteerStatus availability;
        int256 latitude;
        int256 longitude;
        bool isVerified;
        uint256 rating; // 0-100
        uint256 tasksCompleted;
        bool exists;
    }
    
    struct EscalationApproval {
        address approver;
        uint256 trustScoreAtApproval;
        uint256 approvedAt;
        bool approved;
    }
    
    struct EscalationResolution {
        uint256 incidentId;
        uint256 totalApprovalWeight;
        uint256 requiredWeight;
        address[] approvers;
        mapping(address => bool) hasApproved;
        mapping(address => EscalationApproval) approvals;
        bool executed;
        uint256 nonce;
    }
    
    // ==================== State Variables ====================
    
    address public owner;
    uint256 public incidentCounter;
    uint256 public announcementCounter;
    
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => Incident) public incidents;
    mapping(uint256 => Announcement) public announcements;
    mapping(address => Volunteer) public volunteers;
    mapping(address => bool) public emergencyDesks;
    mapping(address => bool) public communityLeaders;
    
    address[] public allUsers;
    uint256[] public allIncidentIds;
    uint256[] public allAnnouncementIds;
    address[] public allVolunteers;
    
    // Escalation configuration and state
    uint256 public escalationTimeWindow; // Time in seconds before auto-escalation
    uint256 public requiredApprovalWeight; // Minimum total trust score weight required
    mapping(uint256 => EscalationResolution) public escalationResolutions;
    uint256[] public escalatedIncidentIds;
    
    // Escalation timeout constants
    uint256 public constant MIN_ESCALATION_WINDOW = 300; // 5 minutes minimum
    uint256 public constant MAX_ESCALATION_WINDOW = 86400; // 24 hours maximum
    uint256 public constant DEFAULT_ESCALATION_WINDOW = 3600; // 1 hour default
    uint256 public constant CRITICAL_ESCALATION_DELAY = 0; // Immediate for critical
    
    // Trust score management
    uint256 public constant MAX_TRUST_SCORE = 100;
    uint256 public constant MIN_TRUST_SCORE = 10;
    uint256 public constant DEFAULT_TRUST_SCORE = 50;
    uint256 public constant VERIFIED_TRUST_SCORE = 75;
    
    // Trust score decay configuration
    uint256 public trustScoreDecayRate; // Points lost per decay period
    uint256 public trustScoreDecayPeriod; // Time period for decay (in seconds)
    bool public trustScoreDecayEnabled;
    mapping(address => uint256) public lastTrustScoreUpdate;
    mapping(address => uint256) public lastActivityTimestamp;
    
    // ==================== Events ====================
    
    event UserProfileCreated(address indexed user, string name, AppRole role);
    event UserProfileUpdated(address indexed user, string name);
    event IncidentCreated(uint256 indexed incidentId, address indexed reporter, IncidentCategory category, IncidentSeverity severity);
    event IncidentUpdated(uint256 indexed incidentId, IncidentStatus status);
    event VolunteerAssigned(uint256 indexed incidentId, address indexed volunteer);
    event AnnouncementCreated(uint256 indexed announcementId, address indexed author, uint256 priority);
    event VolunteerRegistered(address indexed volunteer, string name);
    event VolunteerStatusUpdated(address indexed volunteer, VolunteerStatus status);
    event EmergencyDeskAdded(address indexed desk);
    event CommunityLeaderAdded(address indexed leader);
    
    // Escalation events
    event IncidentEscalated(
        uint256 indexed incidentId,
        IncidentSeverity severity,
        string reason,
        uint256 escalatedAt,
        uint256 requiredWeight
    );
    event ResolutionApproved(
        uint256 indexed incidentId,
        address indexed approver,
        uint256 trustScore,
        uint256 currentWeight,
        uint256 requiredWeight
    );
    event ResolutionExecuted(
        uint256 indexed incidentId,
        uint256 totalWeight,
        uint256 approverCount,
        uint256 executedAt
    );
    event EscalationConfigUpdated(
        uint256 escalationTimeWindow,
        uint256 requiredApprovalWeight
    );
    event TrustScoreDecayed(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 decayAmount
    );
    event TrustScoreReduced(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 reductionAmount,
        string reason
    );
    event TrustScoreIncreased(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        string reason
    );
    event TrustScoreDecayConfigUpdated(
        uint256 decayRate,
        uint256 decayPeriod,
        bool enabled
    );
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyEmergencyDesk() {
        require(emergencyDesks[msg.sender] || msg.sender == owner, "Only emergency desk can call this function");
        _;
    }
    
    modifier onlyCommunityLeader() {
        require(communityLeaders[msg.sender] || msg.sender == owner, "Only community leader can call this function");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(userProfiles[msg.sender].exists && userProfiles[msg.sender].isVerified, "User must be verified");
        _;
    }
    
    modifier incidentExists(uint256 _incidentId) {
        require(incidents[_incidentId].exists, "Incident does not exist");
        _;
    }
    
    modifier canApproveResolution() {
        require(
            emergencyDesks[msg.sender] || communityLeaders[msg.sender] || msg.sender == owner,
            "Only emergency desk or community leaders can approve"
        );
        require(userProfiles[msg.sender].isVerified, "Approver must be verified");
        _;
    }
    
    modifier incidentEscalated(uint256 _incidentId) {
        require(
            incidents[_incidentId].escalationStatus == EscalationStatus.Escalated ||
            incidents[_incidentId].escalationStatus == EscalationStatus.UnderReview,
            "Incident is not escalated"
        );
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor() {
        owner = msg.sender;
        incidentCounter = 0;
        announcementCounter = 0;
        
        // Escalation configuration defaults
        escalationTimeWindow = DEFAULT_ESCALATION_WINDOW;
        requiredApprovalWeight = 150; // Default minimum trust score weight
        
        // Trust score decay configuration
        trustScoreDecayRate = 1; // 1 point per decay period
        trustScoreDecayPeriod = 86400; // 1 day (in seconds)
        trustScoreDecayEnabled = true;
        
        // Create owner profile
        userProfiles[msg.sender] = UserProfile({
            name: "System Administrator",
            email: "",
            appRole: AppRole.EmergencyDesk,
            isVerified: true,
            trustScore: 100,
            createdAt: block.timestamp,
            exists: true
        });
        
        emergencyDesks[msg.sender] = true;
        allUsers.push(msg.sender);
    }
    
    // ==================== User Profile Functions ====================
    
    function createUserProfile(
        string memory _name,
        string memory _email,
        AppRole _appRole
    ) public {
        require(!userProfiles[msg.sender].exists, "Profile already exists");
        
        userProfiles[msg.sender] = UserProfile({
            name: _name,
            email: _email,
            appRole: _appRole,
            isVerified: false,
            trustScore: DEFAULT_TRUST_SCORE,
            createdAt: block.timestamp,
            exists: true
        });
        
        // Initialize trust score decay tracking
        lastTrustScoreUpdate[msg.sender] = block.timestamp;
        lastActivityTimestamp[msg.sender] = block.timestamp;
        
        allUsers.push(msg.sender);
        emit UserProfileCreated(msg.sender, _name, _appRole);
    }
    
    function updateUserProfile(string memory _name, string memory _email) public {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        
        userProfiles[msg.sender].name = _name;
        userProfiles[msg.sender].email = _email;
        
        emit UserProfileUpdated(msg.sender, _name);
    }
    
    function verifyUser(address _user) public onlyEmergencyDesk {
        require(userProfiles[_user].exists, "User profile does not exist");
        
        // Apply decay before verification
        if (trustScoreDecayEnabled) {
            _applyTrustScoreDecay(_user);
        }
        
        userProfiles[_user].isVerified = true;
        
        uint256 oldScore = userProfiles[_user].trustScore;
        userProfiles[_user].trustScore = VERIFIED_TRUST_SCORE;
        lastTrustScoreUpdate[_user] = block.timestamp;
        
        if (oldScore != VERIFIED_TRUST_SCORE) {
            emit TrustScoreIncreased(_user, oldScore, VERIFIED_TRUST_SCORE, "User verified");
        }
    }
    
    function getUserProfile(address _user) public view returns (UserProfile memory) {
        require(userProfiles[_user].exists, "User profile does not exist");
        return userProfiles[_user];
    }
    
    function getMyProfile() public view returns (UserProfile memory) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender];
    }
    
    // ==================== Incident Management ====================
    
    function createIncident(
        string memory _title,
        string memory _description,
        IncidentCategory _category,
        IncidentSeverity _severity,
        int256 _latitude,
        int256 _longitude
    ) public onlyVerifiedUser returns (uint256) {
        incidentCounter++;
        
        incidents[incidentCounter] = Incident({
            id: incidentCounter,
            title: _title,
            description: _description,
            category: _category,
            severity: _severity,
            status: IncidentStatus.Reported,
            latitude: _latitude,
            longitude: _longitude,
            reportedBy: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            assignedVolunteers: new address[](0),
            exists: true,
            escalationStatus: EscalationStatus.None,
            escalatedAt: 0,
            resolutionNonce: 0
        });
        
        allIncidentIds.push(incidentCounter);
        
        emit IncidentCreated(incidentCounter, msg.sender, _category, _severity);
        
        // Auto-escalate if critical severity
        if (_severity == IncidentSeverity.Critical) {
            _escalateIncident(incidentCounter, "Critical severity - auto-escalated");
        }
        
        return incidentCounter;
    }
    
    function updateIncidentStatus(
        uint256 _incidentId,
        IncidentStatus _status
    ) public onlyEmergencyDesk incidentExists(_incidentId) {
        incidents[_incidentId].status = _status;
        incidents[_incidentId].updatedAt = block.timestamp;
        
        emit IncidentUpdated(_incidentId, _status);
    }
    
    function assignVolunteerToIncident(
        uint256 _incidentId,
        address _volunteer
    ) public onlyEmergencyDesk incidentExists(_incidentId) {
        require(volunteers[_volunteer].exists, "Volunteer not registered");
        require(volunteers[_volunteer].isVerified, "Volunteer not verified");
        
        incidents[_incidentId].assignedVolunteers.push(_volunteer);
        volunteers[_volunteer].availability = VolunteerStatus.Busy;
        
        emit VolunteerAssigned(_incidentId, _volunteer);
    }
    
    function getIncident(uint256 _incidentId) public view incidentExists(_incidentId) returns (Incident memory) {
        return incidents[_incidentId];
    }
    
    function getAllIncidents() public view returns (uint256[] memory) {
        return allIncidentIds;
    }
    
    function getIncidentsByStatus(IncidentStatus _status) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allIncidentIds.length; i++) {
            if (incidents[allIncidentIds[i]].status == _status) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allIncidentIds.length; i++) {
            if (incidents[allIncidentIds[i]].status == _status) {
                result[index] = allIncidentIds[i];
                index++;
            }
        }
        
        return result;
    }
    
    // ==================== Volunteer Management ====================
    
    function registerVolunteer(
        string memory _name,
        string memory _email,
        string[] memory _skills,
        int256 _latitude,
        int256 _longitude
    ) public {
        require(!volunteers[msg.sender].exists, "Volunteer already registered");
        
        volunteers[msg.sender] = Volunteer({
            name: _name,
            email: _email,
            skills: _skills,
            availability: VolunteerStatus.Available,
            latitude: _latitude,
            longitude: _longitude,
            isVerified: false,
            rating: 50,
            tasksCompleted: 0,
            exists: true
        });
        
        allVolunteers.push(msg.sender);
        
        // Update user profile if exists
        if (userProfiles[msg.sender].exists) {
            userProfiles[msg.sender].appRole = AppRole.Volunteer;
        } else {
            createUserProfile(_name, _email, AppRole.Volunteer);
        }
        
        emit VolunteerRegistered(msg.sender, _name);
    }
    
    function updateVolunteerStatus(VolunteerStatus _status) public {
        require(volunteers[msg.sender].exists, "Volunteer not registered");
        volunteers[msg.sender].availability = _status;
        
        emit VolunteerStatusUpdated(msg.sender, _status);
    }
    
    function verifyVolunteer(address _volunteer) public onlyEmergencyDesk {
        require(volunteers[_volunteer].exists, "Volunteer not registered");
        volunteers[_volunteer].isVerified = true;
        volunteers[_volunteer].rating = 75;
    }
    
    function getVolunteer(address _volunteer) public view returns (Volunteer memory) {
        require(volunteers[_volunteer].exists, "Volunteer not registered");
        return volunteers[_volunteer];
    }
    
    function getAllVolunteers() public view returns (address[] memory) {
        return allVolunteers;
    }
    
    function getAvailableVolunteers() public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allVolunteers.length; i++) {
            if (volunteers[allVolunteers[i]].availability == VolunteerStatus.Available && 
                volunteers[allVolunteers[i]].isVerified) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allVolunteers.length; i++) {
            if (volunteers[allVolunteers[i]].availability == VolunteerStatus.Available && 
                volunteers[allVolunteers[i]].isVerified) {
                result[index] = allVolunteers[i];
                index++;
            }
        }
        
        return result;
    }
    
    // ==================== Announcement Management ====================
    
    function createAnnouncement(
        string memory _title,
        string memory _message,
        uint256 _priority
    ) public onlyCommunityLeader {
        require(_priority >= 1 && _priority <= 3, "Priority must be between 1 and 3");
        
        announcementCounter++;
        
        announcements[announcementCounter] = Announcement({
            id: announcementCounter,
            title: _title,
            message: _message,
            priority: _priority,
            author: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        allAnnouncementIds.push(announcementCounter);
        
        emit AnnouncementCreated(announcementCounter, msg.sender, _priority);
    }
    
    function getAnnouncement(uint256 _announcementId) public view returns (Announcement memory) {
        require(announcements[_announcementId].exists, "Announcement does not exist");
        return announcements[_announcementId];
    }
    
    function getAllAnnouncements() public view returns (uint256[] memory) {
        return allAnnouncementIds;
    }
    
    // ==================== Role Management ====================
    
    function addEmergencyDesk(address _desk) public onlyOwner {
        emergencyDesks[_desk] = true;
        
        if (userProfiles[_desk].exists) {
            userProfiles[_desk].appRole = AppRole.EmergencyDesk;
            userProfiles[_desk].isVerified = true;
        }
        
        emit EmergencyDeskAdded(_desk);
    }
    
    function addCommunityLeader(address _leader) public onlyOwner {
        communityLeaders[_leader] = true;
        
        if (userProfiles[_leader].exists) {
            userProfiles[_leader].appRole = AppRole.CommunityLeader;
            userProfiles[_leader].isVerified = true;
        }
        
        emit CommunityLeaderAdded(_leader);
    }
    
    function removeEmergencyDesk(address _desk) public onlyOwner {
        emergencyDesks[_desk] = false;
    }
    
    function removeCommunityLeader(address _leader) public onlyOwner {
        communityLeaders[_leader] = false;
    }
    
    // ==================== Trust Score Management ====================
    
    /**
     * @notice Apply trust score decay based on inactivity
     * @param _user The user to apply decay to
     */
    function _applyTrustScoreDecay(address _user) internal {
        if (!userProfiles[_user].exists || !trustScoreDecayEnabled) {
            return;
        }
        
        uint256 timeSinceUpdate = block.timestamp - lastTrustScoreUpdate[_user];
        
        if (timeSinceUpdate < trustScoreDecayPeriod) {
            return; // Not enough time passed
        }
        
        uint256 periods = timeSinceUpdate / trustScoreDecayPeriod;
        uint256 decayAmount = periods * trustScoreDecayRate;
        
        uint256 oldScore = userProfiles[_user].trustScore;
        
        if (oldScore > MIN_TRUST_SCORE) {
            uint256 newScore = oldScore > decayAmount 
                ? oldScore - decayAmount 
                : MIN_TRUST_SCORE;
            
            if (newScore < MIN_TRUST_SCORE) {
                newScore = MIN_TRUST_SCORE;
            }
            
            userProfiles[_user].trustScore = newScore;
            lastTrustScoreUpdate[_user] = block.timestamp;
            
            emit TrustScoreDecayed(_user, oldScore, newScore, decayAmount);
        }
    }
    
    /**
     * @notice Manually apply trust score decay for a user
     * @param _user The user to apply decay to
     */
    function applyTrustScoreDecay(address _user) public {
        require(userProfiles[_user].exists, "User does not exist");
        require(trustScoreDecayEnabled, "Trust score decay is disabled");
        _applyTrustScoreDecay(_user);
    }
    
    /**
     * @notice Batch apply trust score decay for multiple users
     * @param _users Array of user addresses
     */
    function batchApplyTrustScoreDecay(address[] memory _users) public {
        require(trustScoreDecayEnabled, "Trust score decay is disabled");
        
        for (uint256 i = 0; i < _users.length; i++) {
            if (userProfiles[_users[i]].exists) {
                _applyTrustScoreDecay(_users[i]);
            }
        }
    }
    
    /**
     * @notice Reduce trust score for bad behavior
     * @param _user The user to reduce trust score for
     * @param _amount Amount to reduce
     * @param _reason Reason for reduction
     */
    function reduceTrustScore(
        address _user,
        uint256 _amount,
        string memory _reason
    ) public onlyEmergencyDesk {
        require(userProfiles[_user].exists, "User does not exist");
        require(_amount > 0, "Reduction amount must be greater than zero");
        
        // Apply decay first
        if (trustScoreDecayEnabled) {
            _applyTrustScoreDecay(_user);
        }
        
        uint256 oldScore = userProfiles[_user].trustScore;
        uint256 newScore = oldScore > _amount ? oldScore - _amount : MIN_TRUST_SCORE;
        
        if (newScore < MIN_TRUST_SCORE) {
            newScore = MIN_TRUST_SCORE;
        }
        
        userProfiles[_user].trustScore = newScore;
        lastTrustScoreUpdate[_user] = block.timestamp;
        
        emit TrustScoreReduced(_user, oldScore, newScore, _amount, _reason);
    }
    
    /**
     * @notice Increase trust score for good behavior
     * @param _user The user to increase trust score for
     * @param _amount Amount to increase
     * @param _reason Reason for increase
     */
    function increaseTrustScore(
        address _user,
        uint256 _amount,
        string memory _reason
    ) public onlyEmergencyDesk {
        require(userProfiles[_user].exists, "User does not exist");
        require(_amount > 0, "Increase amount must be greater than zero");
        
        // Apply decay first
        if (trustScoreDecayEnabled) {
            _applyTrustScoreDecay(_user);
        }
        
        uint256 oldScore = userProfiles[_user].trustScore;
        uint256 newScore = oldScore + _amount;
        
        if (newScore > MAX_TRUST_SCORE) {
            newScore = MAX_TRUST_SCORE;
        }
        
        userProfiles[_user].trustScore = newScore;
        lastTrustScoreUpdate[_user] = block.timestamp;
        
        emit TrustScoreIncreased(_user, oldScore, newScore, _reason);
    }
    
    /**
     * @notice Update trust score decay configuration
     * @param _decayRate Points lost per decay period
     * @param _decayPeriod Time period for decay (in seconds)
     * @param _enabled Whether decay is enabled
     */
    function updateTrustScoreDecayConfig(
        uint256 _decayRate,
        uint256 _decayPeriod,
        bool _enabled
    ) public onlyOwner {
        require(_decayRate > 0, "Decay rate must be greater than zero");
        require(_decayPeriod >= 3600, "Decay period must be at least 1 hour");
        
        trustScoreDecayRate = _decayRate;
        trustScoreDecayPeriod = _decayPeriod;
        trustScoreDecayEnabled = _enabled;
        
        emit TrustScoreDecayConfigUpdated(_decayRate, _decayPeriod, _enabled);
    }
    
    /**
     * @notice Update user activity timestamp
     * @param _user The user whose activity to update
     */
    function _updateActivity(address _user) internal {
        lastActivityTimestamp[_user] = block.timestamp;
    }
    
    /**
     * @notice Get trust score decay status for a user
     * @param _user The user to check
     * @return currentScore Current trust score
     * @return timeSinceUpdate Time since last update
     * @return periodsElapsed Decay periods elapsed
     * @return pendingDecay Pending decay amount
     */
    function getTrustScoreDecayStatus(address _user)
        public
        view
        returns (
            uint256 currentScore,
            uint256 timeSinceUpdate,
            uint256 periodsElapsed,
            uint256 pendingDecay
        )
    {
        require(userProfiles[_user].exists, "User does not exist");
        
        currentScore = userProfiles[_user].trustScore;
        timeSinceUpdate = block.timestamp - lastTrustScoreUpdate[_user];
        periodsElapsed = timeSinceUpdate / trustScoreDecayPeriod;
        pendingDecay = periodsElapsed * trustScoreDecayRate;
        
        return (currentScore, timeSinceUpdate, periodsElapsed, pendingDecay);
    }
    
    // ==================== Escalation & Multi-Signature Resolution ====================
    
    /**
     * @notice Manually escalate an incident (for authorized users)
     * @param _incidentId The incident to escalate
     * @param _reason Reason for escalation
     */
    function escalateIncident(uint256 _incidentId, string memory _reason) 
        public 
        onlyEmergencyDesk 
        incidentExists(_incidentId) 
    {
        require(
            incidents[_incidentId].escalationStatus == EscalationStatus.None,
            "Incident already escalated"
        );
        _escalateIncident(_incidentId, _reason);
    }
    
    /**
     * @notice Check and auto-escalate incidents that exceed time window
     * @param _incidentId The incident to check
     */
    function checkAndAutoEscalate(uint256 _incidentId) 
        public 
        incidentExists(_incidentId) 
    {
        Incident storage incident = incidents[_incidentId];
        
        require(
            incident.escalationStatus == EscalationStatus.None,
            "Incident already escalated"
        );
        require(
            incident.status == IncidentStatus.Reported,
            "Only reported incidents can be auto-escalated"
        );
        
        // Check if time window exceeded
        require(
            block.timestamp >= incident.createdAt + escalationTimeWindow,
            "Escalation time window not exceeded"
        );
        
        _escalateIncident(_incidentId, "Auto-escalated: acknowledgment timeout");
    }
    
    /**
     * @notice Internal function to escalate an incident
     * @param _incidentId The incident to escalate
     * @param _reason Reason for escalation
     */
    function _escalateIncident(uint256 _incidentId, string memory _reason) internal {
        Incident storage incident = incidents[_incidentId];
        
        incident.escalationStatus = EscalationStatus.Escalated;
        incident.escalatedAt = block.timestamp;
        incident.resolutionNonce++;
        incident.updatedAt = block.timestamp;
        
        // Initialize escalation resolution
        EscalationResolution storage resolution = escalationResolutions[_incidentId];
        resolution.incidentId = _incidentId;
        resolution.totalApprovalWeight = 0;
        resolution.requiredWeight = requiredApprovalWeight;
        resolution.executed = false;
        resolution.nonce = incident.resolutionNonce;
        
        escalatedIncidentIds.push(_incidentId);
        
        emit IncidentEscalated(
            _incidentId,
            incident.severity,
            _reason,
            block.timestamp,
            requiredApprovalWeight
        );
    }
    
    /**
     * @notice Approve resolution for an escalated incident
     * @param _incidentId The escalated incident to approve
     */
    function approveEscalatedResolution(uint256 _incidentId)
        public
        canApproveResolution
        incidentExists(_incidentId)
        incidentEscalated(_incidentId)
    {
        // Apply trust score decay before using trust score
        if (trustScoreDecayEnabled) {
            _applyTrustScoreDecay(msg.sender);
        }
        
        // Update activity timestamp
        _updateActivity(msg.sender);
        
        EscalationResolution storage resolution = escalationResolutions[_incidentId];
        Incident storage incident = incidents[_incidentId];
        
        // Validate nonce for replay protection
        require(
            resolution.nonce == incident.resolutionNonce,
            "Resolution nonce mismatch - potential replay"
        );
        
        // Prevent duplicate approvals
        require(
            !resolution.hasApproved[msg.sender],
            "Already approved by this address"
        );
        
        // Resolution must not be executed
        require(!resolution.executed, "Resolution already executed");
        
        // Get approver's trust score (after decay applied)
        uint256 trustScore = userProfiles[msg.sender].trustScore;
        require(trustScore > 0, "Trust score must be greater than zero");
        
        // Record approval
        resolution.hasApproved[msg.sender] = true;
        resolution.approvals[msg.sender] = EscalationApproval({
            approver: msg.sender,
            trustScoreAtApproval: trustScore,
            approvedAt: block.timestamp,
            approved: true
        });
        resolution.approvers.push(msg.sender);
        resolution.totalApprovalWeight += trustScore;
        
        // Update status
        if (incident.escalationStatus == EscalationStatus.Escalated) {
            incident.escalationStatus = EscalationStatus.UnderReview;
        }
        
        emit ResolutionApproved(
            _incidentId,
            msg.sender,
            trustScore,
            resolution.totalApprovalWeight,
            resolution.requiredWeight
        );
        
        // Auto-execute if threshold met
        if (resolution.totalApprovalWeight >= resolution.requiredWeight) {
            _executeResolution(_incidentId);
        }
    }
    
    /**
     * @notice Execute approved resolution
     * @param _incidentId The incident to resolve
     */
    function executeEscalatedResolution(uint256 _incidentId)
        public
        onlyEmergencyDesk
        incidentExists(_incidentId)
        incidentEscalated(_incidentId)
    {
        EscalationResolution storage resolution = escalationResolutions[_incidentId];
        
        require(!resolution.executed, "Resolution already executed");
        require(
            resolution.totalApprovalWeight >= resolution.requiredWeight,
            "Insufficient approval weight"
        );
        
        _executeResolution(_incidentId);
    }
    
    /**
     * @notice Internal function to execute resolution
     * @param _incidentId The incident to resolve
     */
    function _executeResolution(uint256 _incidentId) internal {
        EscalationResolution storage resolution = escalationResolutions[_incidentId];
        Incident storage incident = incidents[_incidentId];
        
        resolution.executed = true;
        incident.escalationStatus = EscalationStatus.Approved;
        incident.status = IncidentStatus.Resolved;
        incident.updatedAt = block.timestamp;
        
        emit ResolutionExecuted(
            _incidentId,
            resolution.totalApprovalWeight,
            resolution.approvers.length,
            block.timestamp
        );
        
        emit IncidentUpdated(_incidentId, IncidentStatus.Resolved);
    }
    
    /**
     * @notice Update escalation configuration (owner only)
     * @param _timeWindow New time window in seconds
     * @param _requiredWeight New required approval weight
     */
    function updateEscalationConfig(
        uint256 _timeWindow,
        uint256 _requiredWeight
    ) public onlyOwner {
        require(
            _timeWindow >= MIN_ESCALATION_WINDOW && _timeWindow <= MAX_ESCALATION_WINDOW,
            "Time window must be between MIN and MAX constants"
        );
        require(_requiredWeight > 0, "Required weight must be greater than zero");
        require(_requiredWeight <= MAX_TRUST_SCORE * 10, "Required weight too high");
        
        escalationTimeWindow = _timeWindow;
        requiredApprovalWeight = _requiredWeight;
        
        emit EscalationConfigUpdated(_timeWindow, _requiredWeight);
    }
    
    /**
     * @notice Get escalation resolution details
     * @param _incidentId The incident ID
     * @return incidentId The incident ID
     * @return totalWeight Total approval weight
     * @return requiredWeight Required approval weight
     * @return approverCount Number of approvers
     * @return executed Whether resolution is executed
     * @return nonce Current nonce for replay protection
     */
    function getEscalationResolution(uint256 _incidentId)
        public
        view
        incidentExists(_incidentId)
        returns (
            uint256 incidentId,
            uint256 totalWeight,
            uint256 requiredWeight,
            uint256 approverCount,
            bool executed,
            uint256 nonce
        )
    {
        EscalationResolution storage resolution = escalationResolutions[_incidentId];
        return (
            resolution.incidentId,
            resolution.totalApprovalWeight,
            resolution.requiredWeight,
            resolution.approvers.length,
            resolution.executed,
            resolution.nonce
        );
    }
    
    /**
     * @notice Get list of approvers for an escalated incident
     * @param _incidentId The incident ID
     * @return Array of approver addresses
     */
    function getResolutionApprovers(uint256 _incidentId)
        public
        view
        incidentExists(_incidentId)
        returns (address[] memory)
    {
        return escalationResolutions[_incidentId].approvers;
    }
    
    /**
     * @notice Get approval details for a specific approver
     * @param _incidentId The incident ID
     * @param _approver The approver address
     * @return approver The approver address
     * @return trustScore Trust score at time of approval
     * @return approvedAt Timestamp of approval
     * @return approved Whether approved
     */
    function getApprovalDetails(uint256 _incidentId, address _approver)
        public
        view
        incidentExists(_incidentId)
        returns (
            address approver,
            uint256 trustScore,
            uint256 approvedAt,
            bool approved
        )
    {
        EscalationApproval storage approval = escalationResolutions[_incidentId].approvals[_approver];
        return (
            approval.approver,
            approval.trustScoreAtApproval,
            approval.approvedAt,
            approval.approved
        );
    }
    
    /**
     * @notice Check if an address has approved a resolution
     * @param _incidentId The incident ID
     * @param _approver The approver address
     * @return Whether the address has approved
     */
    function hasApprovedResolution(uint256 _incidentId, address _approver)
        public
        view
        incidentExists(_incidentId)
        returns (bool)
    {
        return escalationResolutions[_incidentId].hasApproved[_approver];
    }
    
    /**
     * @notice Get all escalated incident IDs
     * @return Array of escalated incident IDs
     */
    function getEscalatedIncidents() public view returns (uint256[] memory) {
        return escalatedIncidentIds;
    }
    
    /**
     * @notice Check if an incident can be auto-escalated
     * @param _incidentId The incident to check
     * @return canEscalate Whether the incident can be escalated
     * @return reason Reason why it can or cannot be escalated
     */
    function canAutoEscalate(uint256 _incidentId)
        public
        view
        incidentExists(_incidentId)
        returns (bool canEscalate, string memory reason)
    {
        Incident storage incident = incidents[_incidentId];
        
        if (incident.escalationStatus != EscalationStatus.None) {
            return (false, "Already escalated");
        }
        
        if (incident.status != IncidentStatus.Reported) {
            return (false, "Not in Reported status");
        }
        
        if (block.timestamp < incident.createdAt + escalationTimeWindow) {
            return (false, "Time window not exceeded");
        }
        
        return (true, "Can be auto-escalated");
    }
    
    // ==================== Analytics & Statistics ====================
    
    function getIncidentStats() public view returns (
        uint256 total,
        uint256 reported,
        uint256 inProgress,
        uint256 resolved,
        uint256 closed
    ) {
        total = allIncidentIds.length;
        
        for (uint256 i = 0; i < allIncidentIds.length; i++) {
            IncidentStatus status = incidents[allIncidentIds[i]].status;
            if (status == IncidentStatus.Reported) reported++;
            else if (status == IncidentStatus.InProgress) inProgress++;
            else if (status == IncidentStatus.Resolved) resolved++;
            else if (status == IncidentStatus.Closed) closed++;
        }
    }
    
    function getVolunteerStats() public view returns (
        uint256 total,
        uint256 available,
        uint256 busy,
        uint256 verified
    ) {
        total = allVolunteers.length;
        
        for (uint256 i = 0; i < allVolunteers.length; i++) {
            if (volunteers[allVolunteers[i]].availability == VolunteerStatus.Available) available++;
            if (volunteers[allVolunteers[i]].availability == VolunteerStatus.Busy) busy++;
            if (volunteers[allVolunteers[i]].isVerified) verified++;
        }
    }
    
    function getTotalUsers() public view returns (uint256) {
        return allUsers.length;
    }
}
