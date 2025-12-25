// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EmergencyCoordinationTest
 * @dev Test contract for EmergencyCoordination interactions
 * @notice Contains example scenarios and test cases
 */

import "./EmergencyCoordination.sol";

contract EmergencyCoordinationTest {
    
    EmergencyCoordination public emergencyCoordination;
    
    // Test scenario data
    struct TestScenario {
        string name;
        string description;
        bool completed;
        uint256 timestamp;
    }
    
    TestScenario[] public testScenarios;
    
    event TestScenarioCreated(string indexed scenarioName, string description);
    event TestScenarioCompleted(string indexed scenarioName, uint256 timestamp);
    
    constructor(address _contractAddress) {
        emergencyCoordination = EmergencyCoordination(_contractAddress);
    }
    
    // ==================== Test Scenario 1: User Registration ====================
    
    function testUserRegistration(
        string memory _name,
        string memory _email,
        uint8 _roleIndex
    ) public returns (bool) {
        EmergencyCoordination.AppRole role = EmergencyCoordination.AppRole(_roleIndex);
        
        try emergencyCoordination.createUserProfile(_name, _email, role) {
            recordTestScenario("User Registration", "Successfully created user profile");
            return true;
        } catch {
            return false;
        }
    }
    
    // ==================== Test Scenario 2: Volunteer Registration ====================
    
    function testVolunteerRegistration(
        string memory _name,
        string memory _email,
        string[] memory _skills,
        int256 _latitude,
        int256 _longitude
    ) public returns (bool) {
        try emergencyCoordination.registerVolunteer(_name, _email, _skills, _latitude, _longitude) {
            recordTestScenario("Volunteer Registration", "Successfully registered as volunteer");
            return true;
        } catch {
            return false;
        }
    }
    
    // ==================== Test Scenario 3: Update Volunteer Status ====================
    
    function testUpdateVolunteerStatus(uint8 _statusIndex) public returns (bool) {
        EmergencyCoordination.VolunteerStatus status = EmergencyCoordination.VolunteerStatus(_statusIndex);
        
        try emergencyCoordination.updateVolunteerStatus(status) {
            recordTestScenario("Update Volunteer Status", "Successfully updated volunteer availability");
            return true;
        } catch {
            return false;
        }
    }
    
    // ==================== Test Scenario 4: Create Incident ====================
    
    function testCreateIncident(
        string memory _title,
        string memory _description,
        uint8 _categoryIndex,
        uint8 _severityIndex,
        int256 _latitude,
        int256 _longitude
    ) public returns (uint256) {
        EmergencyCoordination.IncidentCategory category = EmergencyCoordination.IncidentCategory(_categoryIndex);
        EmergencyCoordination.IncidentSeverity severity = EmergencyCoordination.IncidentSeverity(_severityIndex);
        
        try emergencyCoordination.createIncident(
            _title,
            _description,
            category,
            severity,
            _latitude,
            _longitude
        ) returns (uint256 incidentId) {
            recordTestScenario("Create Incident", "Successfully created emergency incident");
            return incidentId;
        } catch {
            return 0;
        }
    }
    
    // ==================== Test Scenario 5: Retrieve Incidents ====================
    
    function testGetAllIncidents() public view returns (uint256[] memory) {
        return emergencyCoordination.getAllIncidents();
    }
    
    function testGetIncidentStats() public view returns (
        uint256 total,
        uint256 reported,
        uint256 inProgress,
        uint256 resolved,
        uint256 closed
    ) {
        return emergencyCoordination.getIncidentStats();
    }
    
    // ==================== Test Scenario 6: Get Volunteers ====================
    
    function testGetAllVolunteers() public view returns (address[] memory) {
        return emergencyCoordination.getAllVolunteers();
    }
    
    function testGetAvailableVolunteers() public view returns (address[] memory) {
        return emergencyCoordination.getAvailableVolunteers();
    }
    
    // ==================== Test Scenario 7: Check User Profile ====================
    
    function testGetMyProfile() public view returns (EmergencyCoordination.UserProfile memory) {
        return emergencyCoordination.getMyProfile();
    }
    
    // ==================== Internal Helper Functions ====================
    
    function recordTestScenario(string memory _name, string memory _description) internal {
        testScenarios.push(TestScenario({
            name: _name,
            description: _description,
            completed: true,
            timestamp: block.timestamp
        }));
        
        emit TestScenarioCreated(_name, _description);
        emit TestScenarioCompleted(_name, block.timestamp);
    }
    
    function getTestScenariosCount() public view returns (uint256) {
        return testScenarios.length;
    }
    
    function getTestScenario(uint256 _index) public view returns (TestScenario memory) {
        require(_index < testScenarios.length, "Test scenario index out of bounds");
        return testScenarios[_index];
    }
}
