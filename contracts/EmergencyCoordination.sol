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
    
    // ==================== Constructor ====================
    
    constructor() {
        owner = msg.sender;
        incidentCounter = 0;
        announcementCounter = 0;
        
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
            trustScore: 50,
            createdAt: block.timestamp,
            exists: true
        });
        
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
        userProfiles[_user].isVerified = true;
        userProfiles[_user].trustScore = 75;
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
            exists: true
        });
        
        allIncidentIds.push(incidentCounter);
        
        emit IncidentCreated(incidentCounter, msg.sender, _category, _severity);
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
