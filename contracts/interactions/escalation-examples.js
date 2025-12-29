/**
 * Incident Escalation & Multi-Signature Resolution
 * Integration Examples for Web3.js and Ethers.js
 * 
 * @version 2.0
 * @date December 29, 2025
 */

// ==================== Web3.js Examples ====================

const Web3 = require('web3');

// Contract ABI (add new functions)
const ESCALATION_ABI = [
    // ... existing ABI entries ...
    
    // Escalation Management
    {
        "inputs": [
            {"internalType": "uint256", "name": "_incidentId", "type": "uint256"},
            {"internalType": "string", "name": "_reason", "type": "string"}
        ],
        "name": "escalateIncident",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "checkAndAutoEscalate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "approveEscalatedResolution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "executeEscalatedResolution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_timeWindow", "type": "uint256"},
            {"internalType": "uint256", "name": "_requiredWeight", "type": "uint256"}
        ],
        "name": "updateEscalationConfig",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    
    // View Functions
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "getEscalationResolution",
        "outputs": [
            {"internalType": "uint256", "name": "incidentId", "type": "uint256"},
            {"internalType": "uint256", "name": "totalWeight", "type": "uint256"},
            {"internalType": "uint256", "name": "requiredWeight", "type": "uint256"},
            {"internalType": "uint256", "name": "approverCount", "type": "uint256"},
            {"internalType": "bool", "name": "executed", "type": "bool"},
            {"internalType": "uint256", "name": "nonce", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "getResolutionApprovers",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_incidentId", "type": "uint256"},
            {"internalType": "address", "name": "_approver", "type": "address"}
        ],
        "name": "getApprovalDetails",
        "outputs": [
            {"internalType": "address", "name": "approver", "type": "address"},
            {"internalType": "uint256", "name": "trustScore", "type": "uint256"},
            {"internalType": "uint256", "name": "approvedAt", "type": "uint256"},
            {"internalType": "bool", "name": "approved", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_incidentId", "type": "uint256"},
            {"internalType": "address", "name": "_approver", "type": "address"}
        ],
        "name": "hasApprovedResolution",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getEscalatedIncidents",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_incidentId", "type": "uint256"}],
        "name": "canAutoEscalate",
        "outputs": [
            {"internalType": "bool", "name": "canEscalate", "type": "bool"},
            {"internalType": "string", "name": "reason", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    
    // Events
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "incidentId", "type": "uint256"},
            {"indexed": false, "internalType": "uint8", "name": "severity", "type": "uint8"},
            {"indexed": false, "internalType": "string", "name": "reason", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "escalatedAt", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "requiredWeight", "type": "uint256"}
        ],
        "name": "IncidentEscalated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "incidentId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "approver", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "trustScore", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "currentWeight", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "requiredWeight", "type": "uint256"}
        ],
        "name": "ResolutionApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "incidentId", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "totalWeight", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "approverCount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "executedAt", "type": "uint256"}
        ],
        "name": "ResolutionExecuted",
        "type": "event"
    }
];

const CONTRACT_ADDRESS = "0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF";

/**
 * Example 1: Manual Escalation (Emergency Desk)
 */
async function manuallyEscalateIncident(web3, incidentId, reason) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        const tx = await contract.methods
            .escalateIncident(incidentId, reason)
            .send({ from: accounts[0], gas: 200000 });
        
        console.log('✅ Incident escalated manually');
        console.log('Transaction Hash:', tx.transactionHash);
        console.log('Gas Used:', tx.gasUsed);
        
        return tx;
    } catch (error) {
        console.error('❌ Escalation failed:', error.message);
        throw error;
    }
}

/**
 * Example 2: Check and Auto-Escalate
 */
async function checkAndAutoEscalate(web3, incidentId) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        // First check if can escalate
        const [canEscalate, reason] = await contract.methods
            .canAutoEscalate(incidentId)
            .call();
        
        console.log('Can Auto-Escalate:', canEscalate);
        console.log('Reason:', reason);
        
        if (!canEscalate) {
            console.log('⚠️ Cannot auto-escalate:', reason);
            return null;
        }
        
        // Proceed with auto-escalation
        const tx = await contract.methods
            .checkAndAutoEscalate(incidentId)
            .send({ from: accounts[0], gas: 200000 });
        
        console.log('✅ Auto-escalated successfully');
        console.log('Transaction Hash:', tx.transactionHash);
        
        return tx;
    } catch (error) {
        console.error('❌ Auto-escalation failed:', error.message);
        throw error;
    }
}

/**
 * Example 3: Approve Escalated Resolution
 */
async function approveResolution(web3, incidentId) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        // Check if already approved
        const hasApproved = await contract.methods
            .hasApprovedResolution(incidentId, accounts[0])
            .call();
        
        if (hasApproved) {
            console.log('⚠️ Already approved by this account');
            return null;
        }
        
        // Get current resolution status
        const resolution = await contract.methods
            .getEscalationResolution(incidentId)
            .call();
        
        console.log('Current Approval Weight:', resolution.totalWeight);
        console.log('Required Weight:', resolution.requiredWeight);
        console.log('Current Approvers:', resolution.approverCount);
        
        // Approve
        const tx = await contract.methods
            .approveEscalatedResolution(incidentId)
            .send({ from: accounts[0], gas: 200000 });
        
        console.log('✅ Resolution approved');
        console.log('Transaction Hash:', tx.transactionHash);
        
        // Check if auto-executed
        const updatedResolution = await contract.methods
            .getEscalationResolution(incidentId)
            .call();
        
        if (updatedResolution.executed) {
            console.log('🎉 Resolution auto-executed (threshold met)');
        } else {
            console.log('⏳ Waiting for more approvals');
            console.log('Progress:', 
                `${updatedResolution.totalWeight}/${updatedResolution.requiredWeight}`
            );
        }
        
        return tx;
    } catch (error) {
        console.error('❌ Approval failed:', error.message);
        throw error;
    }
}

/**
 * Example 4: Execute Resolution Manually
 */
async function executeResolution(web3, incidentId) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        const resolution = await contract.methods
            .getEscalationResolution(incidentId)
            .call();
        
        if (resolution.executed) {
            console.log('ℹ️ Resolution already executed');
            return null;
        }
        
        if (resolution.totalWeight < resolution.requiredWeight) {
            console.log('❌ Insufficient approval weight');
            console.log('Current:', resolution.totalWeight);
            console.log('Required:', resolution.requiredWeight);
            return null;
        }
        
        const tx = await contract.methods
            .executeEscalatedResolution(incidentId)
            .send({ from: accounts[0], gas: 150000 });
        
        console.log('✅ Resolution executed');
        console.log('Transaction Hash:', tx.transactionHash);
        
        return tx;
    } catch (error) {
        console.error('❌ Execution failed:', error.message);
        throw error;
    }
}

/**
 * Example 5: Get Escalation Details
 */
async function getEscalationDetails(web3, incidentId) {
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        // Get resolution
        const resolution = await contract.methods
            .getEscalationResolution(incidentId)
            .call();
        
        // Get approvers
        const approvers = await contract.methods
            .getResolutionApprovers(incidentId)
            .call();
        
        // Get approval details for each approver
        const approvalDetails = await Promise.all(
            approvers.map(async (approver) => {
                const details = await contract.methods
                    .getApprovalDetails(incidentId, approver)
                    .call();
                return {
                    approver: details.approver,
                    trustScore: details.trustScore,
                    approvedAt: new Date(details.approvedAt * 1000).toISOString(),
                    approved: details.approved
                };
            })
        );
        
        // Get incident
        const incident = await contract.methods
            .getIncident(incidentId)
            .call();
        
        const details = {
            incidentId: incidentId,
            incidentStatus: incident.status,
            escalationStatus: incident.escalationStatus,
            escalatedAt: new Date(incident.escalatedAt * 1000).toISOString(),
            resolution: {
                totalWeight: resolution.totalWeight,
                requiredWeight: resolution.requiredWeight,
                approverCount: resolution.approverCount,
                executed: resolution.executed,
                nonce: resolution.nonce,
                progress: `${((resolution.totalWeight / resolution.requiredWeight) * 100).toFixed(1)}%`
            },
            approvals: approvalDetails
        };
        
        console.log('📊 Escalation Details:', JSON.stringify(details, null, 2));
        
        return details;
    } catch (error) {
        console.error('❌ Failed to get details:', error.message);
        throw error;
    }
}

/**
 * Example 6: Monitor All Escalated Incidents
 */
async function monitorEscalatedIncidents(web3) {
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        const escalatedIds = await contract.methods
            .getEscalatedIncidents()
            .call();
        
        console.log(`📋 Found ${escalatedIds.length} escalated incidents`);
        
        const details = await Promise.all(
            escalatedIds.map(async (id) => {
                const resolution = await contract.methods
                    .getEscalationResolution(id)
                    .call();
                
                const incident = await contract.methods
                    .getIncident(id)
                    .call();
                
                return {
                    id: id,
                    title: incident.title,
                    severity: incident.severity,
                    status: incident.status,
                    escalationStatus: incident.escalationStatus,
                    progress: `${resolution.totalWeight}/${resolution.requiredWeight}`,
                    executed: resolution.executed
                };
            })
        );
        
        console.table(details);
        
        return details;
    } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
        throw error;
    }
}

/**
 * Example 7: Update Escalation Configuration (Owner Only)
 */
async function updateConfig(web3, timeWindowSeconds, requiredWeight) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    try {
        const tx = await contract.methods
            .updateEscalationConfig(timeWindowSeconds, requiredWeight)
            .send({ from: accounts[0], gas: 100000 });
        
        console.log('✅ Configuration updated');
        console.log('Time Window:', timeWindowSeconds, 'seconds');
        console.log('Required Weight:', requiredWeight);
        console.log('Transaction Hash:', tx.transactionHash);
        
        return tx;
    } catch (error) {
        console.error('❌ Config update failed:', error.message);
        throw error;
    }
}

/**
 * Example 8: Listen to Escalation Events
 */
function listenToEscalationEvents(web3) {
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    // Listen to IncidentEscalated
    contract.events.IncidentEscalated({})
        .on('data', (event) => {
            console.log('⚠️ INCIDENT ESCALATED:');
            console.log('  Incident ID:', event.returnValues.incidentId);
            console.log('  Severity:', event.returnValues.severity);
            console.log('  Reason:', event.returnValues.reason);
            console.log('  Required Weight:', event.returnValues.requiredWeight);
            console.log('  Timestamp:', new Date(event.returnValues.escalatedAt * 1000).toISOString());
        })
        .on('error', console.error);
    
    // Listen to ResolutionApproved
    contract.events.ResolutionApproved({})
        .on('data', (event) => {
            console.log('✅ RESOLUTION APPROVED:');
            console.log('  Incident ID:', event.returnValues.incidentId);
            console.log('  Approver:', event.returnValues.approver);
            console.log('  Trust Score:', event.returnValues.trustScore);
            console.log('  Current Weight:', event.returnValues.currentWeight);
            console.log('  Required Weight:', event.returnValues.requiredWeight);
            console.log('  Progress:', 
                `${((event.returnValues.currentWeight / event.returnValues.requiredWeight) * 100).toFixed(1)}%`
            );
        })
        .on('error', console.error);
    
    // Listen to ResolutionExecuted
    contract.events.ResolutionExecuted({})
        .on('data', (event) => {
            console.log('🎉 RESOLUTION EXECUTED:');
            console.log('  Incident ID:', event.returnValues.incidentId);
            console.log('  Total Weight:', event.returnValues.totalWeight);
            console.log('  Approver Count:', event.returnValues.approverCount);
            console.log('  Executed At:', new Date(event.returnValues.executedAt * 1000).toISOString());
        })
        .on('error', console.error);
    
    console.log('👂 Listening to escalation events...');
}

// ==================== Ethers.js Examples ====================

const { ethers } = require('ethers');

/**
 * Example 9: Complete Escalation Flow (Ethers.js)
 */
async function completeEscalationFlow() {
    // Setup provider and signers
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const owner = await provider.getSigner(0);
    const emergencyDesk = await provider.getSigner(1);
    const communityLeader = await provider.getSigner(2);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ESCALATION_ABI, owner);
    
    try {
        // 1. Create critical incident (auto-escalates)
        console.log('📝 Step 1: Creating critical incident...');
        const createTx = await contract.createIncident(
            "Major Fire",
            "Building collapse imminent",
            1, // Fire
            3, // Critical
            40758000,
            -73968000
        );
        await createTx.wait();
        const incidentId = 1; // Assuming first incident
        console.log('✅ Incident created and auto-escalated');
        
        // 2. Get initial status
        console.log('\n📊 Step 2: Checking initial status...');
        let incident = await contract.getIncident(incidentId);
        console.log('Escalation Status:', incident.escalationStatus); // Should be 1 (Escalated)
        
        // 3. First approval (Emergency Desk)
        console.log('\n✅ Step 3: Emergency Desk approving...');
        const deskContract = contract.connect(emergencyDesk);
        const approveTx1 = await deskContract.approveEscalatedResolution(incidentId);
        await approveTx1.wait();
        
        let resolution = await contract.getEscalationResolution(incidentId);
        console.log('Progress:', resolution.totalWeight, '/', resolution.requiredWeight);
        
        // 4. Second approval (Community Leader)
        console.log('\n✅ Step 4: Community Leader approving...');
        const leaderContract = contract.connect(communityLeader);
        const approveTx2 = await leaderContract.approveEscalatedResolution(incidentId);
        await approveTx2.wait();
        
        // 5. Check final status
        console.log('\n🎉 Step 5: Checking final status...');
        resolution = await contract.getEscalationResolution(incidentId);
        incident = await contract.getIncident(incidentId);
        
        console.log('Final State:');
        console.log('  Total Weight:', resolution.totalWeight);
        console.log('  Executed:', resolution.executed);
        console.log('  Incident Status:', incident.status); // Should be 3 (Resolved)
        console.log('  Escalation Status:', incident.escalationStatus); // Should be 3 (Approved)
        
        return {
            incidentId,
            resolution,
            incident
        };
        
    } catch (error) {
        console.error('❌ Flow failed:', error.message);
        throw error;
    }
}

/**
 * Example 10: Batch Monitor (Ethers.js)
 */
async function batchMonitorEscalations(provider) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ESCALATION_ABI, provider);
    
    try {
        const escalatedIds = await contract.getEscalatedIncidents();
        
        const monitorData = await Promise.all(
            escalatedIds.map(async (id) => {
                const [incident, resolution, approvers] = await Promise.all([
                    contract.getIncident(id),
                    contract.getEscalationResolution(id),
                    contract.getResolutionApprovers(id)
                ]);
                
                return {
                    id: id.toString(),
                    title: incident.title,
                    severity: ['Low', 'Medium', 'High', 'Critical'][incident.severity],
                    status: ['Reported', 'Acknowledged', 'InProgress', 'Resolved', 'Closed'][incident.status],
                    escalationStatus: ['None', 'Escalated', 'UnderReview', 'Approved', 'Rejected'][incident.escalationStatus],
                    weight: `${resolution.totalWeight}/${resolution.requiredWeight}`,
                    approverCount: approvers.length,
                    executed: resolution.executed
                };
            })
        );
        
        console.log('📊 Escalation Monitor Dashboard:');
        console.table(monitorData);
        
        return monitorData;
        
    } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
        throw error;
    }
}

// ==================== Export Functions ====================

module.exports = {
    // Web3.js
    manuallyEscalateIncident,
    checkAndAutoEscalate,
    approveResolution,
    executeResolution,
    getEscalationDetails,
    monitorEscalatedIncidents,
    updateConfig,
    listenToEscalationEvents,
    
    // Ethers.js
    completeEscalationFlow,
    batchMonitorEscalations,
    
    // Constants
    ESCALATION_ABI,
    CONTRACT_ADDRESS
};

// ==================== Usage Examples ====================

/*

// Example: Complete workflow
async function example() {
    const web3 = new Web3('http://localhost:8545');
    
    // 1. Create and escalate incident
    await manuallyEscalateIncident(web3, 5, "Critical situation escalation");
    
    // 2. Monitor all escalated incidents
    await monitorEscalatedIncidents(web3);
    
    // 3. Approve from multiple accounts
    await approveResolution(web3, 5);
    
    // 4. Get detailed status
    await getEscalationDetails(web3, 5);
    
    // 5. Listen to events
    listenToEscalationEvents(web3);
}

// Example: Auto-escalation monitoring service
async function autoEscalationService() {
    const web3 = new Web3('http://localhost:8545');
    const contract = new web3.eth.Contract(ESCALATION_ABI, CONTRACT_ADDRESS);
    
    // Check all incidents periodically
    setInterval(async () => {
        const allIds = await contract.methods.getAllIncidents().call();
        
        for (const id of allIds) {
            try {
                const [canEscalate, reason] = await contract.methods
                    .canAutoEscalate(id)
                    .call();
                
                if (canEscalate) {
                    console.log(`⚠️ Auto-escalating incident ${id}: ${reason}`);
                    await checkAndAutoEscalate(web3, id);
                }
            } catch (error) {
                // Already escalated or other error
            }
        }
    }, 60000); // Check every minute
}

*/
