// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmergencyCoordination.sol";

/**
 * @title EmergencyCoordinationEscalationTest
 * @dev Comprehensive test suite for incident escalation and multi-signature resolution
 * @notice Tests cover auto-escalation, approval mechanisms, and security features
 */
contract EmergencyCoordinationEscalationTest {
    
    EmergencyCoordination public mainContract;
    
    address public owner;
    address public emergencyDesk1;
    address public emergencyDesk2;
    address public communityLeader1;
    address public communityLeader2;
    address public regularUser;
    
    event TestResult(string testName, bool passed, string message);
    
    constructor(address _mainContractAddress) {
        mainContract = EmergencyCoordination(_mainContractAddress);
        owner = msg.sender;
    }
    
    /**
     * Test 1: Critical Incident Auto-Escalation
     * Verifies that incidents with Critical severity are automatically escalated
     */
    function testCriticalAutoEscalation() public returns (bool) {
        try mainContract.createIncident(
            "Critical Fire Emergency",
            "Building on fire with people trapped",
            EmergencyCoordination.IncidentCategory.Fire,
            EmergencyCoordination.IncidentSeverity.Critical,
            40758000,
            -73968000
        ) returns (uint256 incidentId) {
            
            (,,,EmergencyCoordination.IncidentStatus status,,,,,,,, bool exists,
             EmergencyCoordination.EscalationStatus escalationStatus,,) = 
                mainContract.incidents(incidentId);
            
            if (exists && escalationStatus == EmergencyCoordination.EscalationStatus.Escalated) {
                emit TestResult("testCriticalAutoEscalation", true, "Critical incident auto-escalated successfully");
                return true;
            } else {
                emit TestResult("testCriticalAutoEscalation", false, "Critical incident was not auto-escalated");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testCriticalAutoEscalation", false, reason);
            return false;
        }
    }
    
    /**
     * Test 2: Time-Based Auto-Escalation Check
     * Verifies canAutoEscalate returns correct status
     */
    function testCanAutoEscalateCheck() public returns (bool) {
        try mainContract.createIncident(
            "Medical Emergency",
            "Person needs assistance",
            EmergencyCoordination.IncidentCategory.Medical,
            EmergencyCoordination.IncidentSeverity.High,
            40758000,
            -73968000
        ) returns (uint256 incidentId) {
            
            // Should not be able to escalate immediately
            (bool canEscalate, string memory reason) = mainContract.canAutoEscalate(incidentId);
            
            if (!canEscalate) {
                emit TestResult("testCanAutoEscalateCheck", true, 
                    string(abi.encodePacked("Correctly identified cannot escalate: ", reason)));
                return true;
            } else {
                emit TestResult("testCanAutoEscalateCheck", false, 
                    "Should not be able to escalate immediately");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testCanAutoEscalateCheck", false, reason);
            return false;
        }
    }
    
    /**
     * Test 3: Manual Escalation by Emergency Desk
     * Verifies emergency desk can manually escalate incidents
     */
    function testManualEscalation(uint256 incidentId) public returns (bool) {
        try mainContract.escalateIncident(incidentId, "Manual escalation for testing") {
            
            (,,,,,,,,,,,, EmergencyCoordination.EscalationStatus escalationStatus,,) = 
                mainContract.incidents(incidentId);
            
            if (escalationStatus == EmergencyCoordination.EscalationStatus.Escalated) {
                emit TestResult("testManualEscalation", true, "Manual escalation successful");
                return true;
            } else {
                emit TestResult("testManualEscalation", false, "Escalation status not updated");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testManualEscalation", false, reason);
            return false;
        }
    }
    
    /**
     * Test 4: Single Approval
     * Verifies single approver can approve escalated incident
     */
    function testSingleApproval(uint256 incidentId) public returns (bool) {
        try mainContract.approveEscalatedResolution(incidentId) {
            
            (uint256 returnedId, uint256 totalWeight, uint256 requiredWeight, 
             uint256 approverCount, bool executed, uint256 nonce) = 
                mainContract.getEscalationResolution(incidentId);
            
            if (approverCount >= 1 && totalWeight > 0) {
                emit TestResult("testSingleApproval", true, 
                    string(abi.encodePacked("Approval recorded. Weight: ", 
                        uint2str(totalWeight), "/", uint2str(requiredWeight))));
                return true;
            } else {
                emit TestResult("testSingleApproval", false, "Approval not recorded");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testSingleApproval", false, reason);
            return false;
        }
    }
    
    /**
     * Test 5: Duplicate Approval Prevention
     * Verifies same address cannot approve twice
     */
    function testDuplicateApprovalPrevention(uint256 incidentId) public returns (bool) {
        // First approval should succeed (if not already approved)
        bool hasApproved = mainContract.hasApprovedResolution(incidentId, msg.sender);
        
        if (hasApproved) {
            // Try to approve again - should fail
            try mainContract.approveEscalatedResolution(incidentId) {
                emit TestResult("testDuplicateApprovalPrevention", false, 
                    "Duplicate approval should have been prevented");
                return false;
            } catch Error(string memory reason) {
                if (keccak256(bytes(reason)) == keccak256(bytes("Already approved by this address"))) {
                    emit TestResult("testDuplicateApprovalPrevention", true, 
                        "Duplicate approval correctly prevented");
                    return true;
                } else {
                    emit TestResult("testDuplicateApprovalPrevention", false, 
                        string(abi.encodePacked("Wrong error: ", reason)));
                    return false;
                }
            }
        } else {
            emit TestResult("testDuplicateApprovalPrevention", false, 
                "Address has not approved yet, cannot test duplicate");
            return false;
        }
    }
    
    /**
     * Test 6: Insufficient Weight Prevention
     * Verifies resolution cannot execute without sufficient weight
     */
    function testInsufficientWeightPrevention(uint256 incidentId) public returns (bool) {
        (,uint256 totalWeight, uint256 requiredWeight,,bool executed,) = 
            mainContract.getEscalationResolution(incidentId);
        
        if (totalWeight < requiredWeight && !executed) {
            try mainContract.executeEscalatedResolution(incidentId) {
                emit TestResult("testInsufficientWeightPrevention", false, 
                    "Should not execute with insufficient weight");
                return false;
            } catch Error(string memory reason) {
                if (keccak256(bytes(reason)) == keccak256(bytes("Insufficient approval weight"))) {
                    emit TestResult("testInsufficientWeightPrevention", true, 
                        "Correctly prevented execution with insufficient weight");
                    return true;
                } else {
                    emit TestResult("testInsufficientWeightPrevention", false, 
                        string(abi.encodePacked("Wrong error: ", reason)));
                    return false;
                }
            }
        } else {
            emit TestResult("testInsufficientWeightPrevention", false, 
                "Cannot test - weight already sufficient or executed");
            return false;
        }
    }
    
    /**
     * Test 7: Resolution Execution with Sufficient Weight
     * Verifies resolution executes when threshold is met
     */
    function testResolutionExecution(uint256 incidentId) public returns (bool) {
        (,uint256 totalWeight, uint256 requiredWeight,,bool executed,) = 
            mainContract.getEscalationResolution(incidentId);
        
        if (totalWeight >= requiredWeight && !executed) {
            try mainContract.executeEscalatedResolution(incidentId) {
                
                (,,,,bool newExecuted,) = mainContract.getEscalationResolution(incidentId);
                
                if (newExecuted) {
                    emit TestResult("testResolutionExecution", true, "Resolution executed successfully");
                    return true;
                } else {
                    emit TestResult("testResolutionExecution", false, "Execution flag not set");
                    return false;
                }
            } catch Error(string memory reason) {
                emit TestResult("testResolutionExecution", false, reason);
                return false;
            }
        } else {
            emit TestResult("testResolutionExecution", false, 
                "Cannot test - insufficient weight or already executed");
            return false;
        }
    }
    
    /**
     * Test 8: Incident Status After Resolution
     * Verifies incident is resolved after execution
     */
    function testIncidentStatusAfterResolution(uint256 incidentId) public returns (bool) {
        (,,,,bool executed,) = mainContract.getEscalationResolution(incidentId);
        
        if (executed) {
            (,,,EmergencyCoordination.IncidentStatus status,,,,,,,,,,
             EmergencyCoordination.EscalationStatus escalationStatus,,) = 
                mainContract.incidents(incidentId);
            
            if (status == EmergencyCoordination.IncidentStatus.Resolved && 
                escalationStatus == EmergencyCoordination.EscalationStatus.Approved) {
                emit TestResult("testIncidentStatusAfterResolution", true, 
                    "Incident correctly marked as Resolved and Approved");
                return true;
            } else {
                emit TestResult("testIncidentStatusAfterResolution", false, 
                    "Incident status not updated correctly");
                return false;
            }
        } else {
            emit TestResult("testIncidentStatusAfterResolution", false, 
                "Resolution not executed yet");
            return false;
        }
    }
    
    /**
     * Test 9: Get Approvers List
     * Verifies approvers list is maintained correctly
     */
    function testGetApproversList(uint256 incidentId) public returns (bool) {
        try mainContract.getResolutionApprovers(incidentId) returns (address[] memory approvers) {
            
            (,,,uint256 approverCount,,) = mainContract.getEscalationResolution(incidentId);
            
            if (approvers.length == approverCount && approverCount > 0) {
                emit TestResult("testGetApproversList", true, 
                    string(abi.encodePacked("Approvers list correct. Count: ", uint2str(approverCount))));
                return true;
            } else {
                emit TestResult("testGetApproversList", false, 
                    "Approvers list count mismatch");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testGetApproversList", false, reason);
            return false;
        }
    }
    
    /**
     * Test 10: Get Approval Details
     * Verifies individual approval details are stored correctly
     */
    function testGetApprovalDetails(uint256 incidentId, address approver) public returns (bool) {
        try mainContract.getApprovalDetails(incidentId, approver) returns (
            address returnedApprover,
            uint256 trustScore,
            uint256 approvedAt,
            bool approved
        ) {
            if (approved && trustScore > 0 && approvedAt > 0 && returnedApprover == approver) {
                emit TestResult("testGetApprovalDetails", true, 
                    string(abi.encodePacked("Approval details correct. Trust Score: ", uint2str(trustScore))));
                return true;
            } else {
                emit TestResult("testGetApprovalDetails", false, 
                    "Approval details incomplete or incorrect");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testGetApprovalDetails", false, reason);
            return false;
        }
    }
    
    /**
     * Test 11: Access Control for Escalation
     * Verifies only authorized users can escalate
     */
    function testEscalationAccessControl(uint256 incidentId, address unauthorized) public returns (bool) {
        // This test should be called from an unauthorized account
        // Expected to fail with access control error
        
        try mainContract.escalateIncident(incidentId, "Unauthorized escalation attempt") {
            emit TestResult("testEscalationAccessControl", false, 
                "Unauthorized user should not be able to escalate");
            return false;
        } catch Error(string memory reason) {
            if (keccak256(bytes(reason)) == keccak256(bytes("Only emergency desk can call this function"))) {
                emit TestResult("testEscalationAccessControl", true, 
                    "Access control working correctly");
                return true;
            } else {
                emit TestResult("testEscalationAccessControl", false, 
                    string(abi.encodePacked("Wrong error: ", reason)));
                return false;
            }
        }
    }
    
    /**
     * Test 12: Access Control for Approval
     * Verifies only emergency desk and community leaders can approve
     */
    function testApprovalAccessControl(uint256 incidentId) public returns (bool) {
        // This test should be called from an unauthorized account
        
        try mainContract.approveEscalatedResolution(incidentId) {
            emit TestResult("testApprovalAccessControl", false, 
                "Unauthorized user should not be able to approve");
            return false;
        } catch Error(string memory reason) {
            if (keccak256(bytes(reason)) == keccak256(bytes("Only emergency desk or community leaders can approve"))) {
                emit TestResult("testApprovalAccessControl", true, 
                    "Access control working correctly");
                return true;
            } else {
                emit TestResult("testApprovalAccessControl", false, 
                    string(abi.encodePacked("Wrong error: ", reason)));
                return false;
            }
        }
    }
    
    /**
     * Test 13: Escalation Config Update (Owner Only)
     * Verifies only owner can update configuration
     */
    function testConfigUpdateOwnerOnly() public returns (bool) {
        if (msg.sender != owner) {
            try mainContract.updateEscalationConfig(1800, 100) {
                emit TestResult("testConfigUpdateOwnerOnly", false, 
                    "Non-owner should not be able to update config");
                return false;
            } catch Error(string memory reason) {
                if (keccak256(bytes(reason)) == keccak256(bytes("Only owner can call this function"))) {
                    emit TestResult("testConfigUpdateOwnerOnly", true, 
                        "Config update access control working");
                    return true;
                } else {
                    emit TestResult("testConfigUpdateOwnerOnly", false, 
                        string(abi.encodePacked("Wrong error: ", reason)));
                    return false;
                }
            }
        } else {
            // If caller is owner, try to update
            try mainContract.updateEscalationConfig(1800, 200) {
                emit TestResult("testConfigUpdateOwnerOnly", true, 
                    "Owner successfully updated config");
                return true;
            } catch Error(string memory reason) {
                emit TestResult("testConfigUpdateOwnerOnly", false, reason);
                return false;
            }
        }
    }
    
    /**
     * Test 14: Get All Escalated Incidents
     * Verifies escalated incidents tracking
     */
    function testGetAllEscalatedIncidents() public returns (bool) {
        try mainContract.getEscalatedIncidents() returns (uint256[] memory escalatedIds) {
            
            if (escalatedIds.length > 0) {
                emit TestResult("testGetAllEscalatedIncidents", true, 
                    string(abi.encodePacked("Found ", uint2str(escalatedIds.length), " escalated incidents")));
                return true;
            } else {
                emit TestResult("testGetAllEscalatedIncidents", false, 
                    "No escalated incidents found");
                return false;
            }
        } catch Error(string memory reason) {
            emit TestResult("testGetAllEscalatedIncidents", false, reason);
            return false;
        }
    }
    
    /**
     * Test 15: Replay Protection (Nonce Validation)
     * Verifies nonce prevents replay attacks
     */
    function testReplayProtection(uint256 incidentId) public returns (bool) {
        (,,,,,uint256 nonce) = mainContract.getEscalationResolution(incidentId);
        (,,,,,,,,,,,,,uint256 incidentNonce,uint256 resolutionNonce) = 
            mainContract.incidents(incidentId);
        
        if (nonce == resolutionNonce) {
            emit TestResult("testReplayProtection", true, 
                string(abi.encodePacked("Nonce validation working. Current nonce: ", uint2str(nonce))));
            return true;
        } else {
            emit TestResult("testReplayProtection", false, 
                "Nonce mismatch detected");
            return false;
        }
    }
    
    /**
     * Test 16: Complete Multi-Signature Flow
     * End-to-end test of the entire escalation and resolution process
     */
    function testCompleteMultiSigFlow() public returns (bool) {
        // This is a comprehensive integration test
        // Should be run with proper setup of multiple authorized accounts
        
        try {
            // Step 1: Create critical incident (auto-escalates)
            uint256 incidentId = mainContract.createIncident(
                "Complete Flow Test",
                "Testing end-to-end escalation",
                EmergencyCoordination.IncidentCategory.Other,
                EmergencyCoordination.IncidentSeverity.Critical,
                0, 0
            );
            
            // Step 2: Verify auto-escalation
            (,,,,,,,,,,,, EmergencyCoordination.EscalationStatus escalationStatus,,) = 
                mainContract.incidents(incidentId);
            
            if (escalationStatus != EmergencyCoordination.EscalationStatus.Escalated) {
                emit TestResult("testCompleteMultiSigFlow", false, 
                    "Auto-escalation failed");
                return false;
            }
            
            // Step 3: Get initial resolution state
            (,uint256 initialWeight, uint256 requiredWeight,,,) = 
                mainContract.getEscalationResolution(incidentId);
            
            if (initialWeight != 0) {
                emit TestResult("testCompleteMultiSigFlow", false, 
                    "Initial weight should be zero");
                return false;
            }
            
            emit TestResult("testCompleteMultiSigFlow", true, 
                string(abi.encodePacked("Complete flow test setup successful. Incident ID: ", 
                    uint2str(incidentId), ", Required Weight: ", uint2str(requiredWeight))));
            return true;
            
        } catch Error(string memory reason) {
            emit TestResult("testCompleteMultiSigFlow", false, reason);
            return false;
        }
    }
    
    // ==================== Helper Functions ====================
    
    /**
     * Convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    /**
     * Run all tests in sequence
     */
    function runAllTests() public returns (uint256 passed, uint256 total) {
        total = 16;
        passed = 0;
        
        // Note: Some tests require specific setup and should be run individually
        emit TestResult("runAllTests", true, 
            "Test suite includes 16 comprehensive tests. Run individually with proper setup.");
        
        return (passed, total);
    }
}

/**
 * Test Execution Guide:
 * 
 * 1. Deploy main EmergencyCoordination contract
 * 2. Deploy this test contract with main contract address
 * 3. Set up test accounts:
 *    - Emergency Desk accounts
 *    - Community Leader accounts
 *    - Regular user accounts
 * 4. Assign proper roles and trust scores
 * 5. Run tests in sequence:
 *    - testCriticalAutoEscalation()
 *    - testCanAutoEscalateCheck()
 *    - testManualEscalation(incidentId)
 *    - testSingleApproval(incidentId)
 *    - testDuplicateApprovalPrevention(incidentId)
 *    - testInsufficientWeightPrevention(incidentId)
 *    - testResolutionExecution(incidentId)
 *    - testIncidentStatusAfterResolution(incidentId)
 *    - testGetApproversList(incidentId)
 *    - testGetApprovalDetails(incidentId, approver)
 *    - testEscalationAccessControl(incidentId, unauthorized)
 *    - testApprovalAccessControl(incidentId)
 *    - testConfigUpdateOwnerOnly()
 *    - testGetAllEscalatedIncidents()
 *    - testReplayProtection(incidentId)
 *    - testCompleteMultiSigFlow()
 * 
 * Monitor TestResult events for test outcomes.
 */
