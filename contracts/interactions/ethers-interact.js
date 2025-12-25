// Ethers.js Interaction Script for Emergency Coordination Contract
// Contract Address: 0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF

const { ethers } = require('ethers');
const contractABI = require('../abi.json');

// Configuration
const CONTRACT_ADDRESS = '0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// Contract instance (read-only)
const contractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// Contract instance (with signer for transactions)
const contract = wallet ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet) : contractReadOnly;

// ==================== Enums ====================

const AppRole = {
    Citizen: 0,
    Volunteer: 1,
    CommunityLeader: 2,
    EmergencyDesk: 3
};

const IncidentCategory = {
    Medical: 0,
    Fire: 1,
    Flood: 2,
    Storm: 3,
    Earthquake: 4,
    Other: 5
};

const IncidentSeverity = {
    Low: 0,
    Medium: 1,
    High: 2,
    Critical: 3
};

const IncidentStatus = {
    Reported: 0,
    Acknowledged: 1,
    InProgress: 2,
    Resolved: 3,
    Closed: 4
};

const VolunteerStatus = {
    Available: 0,
    Unavailable: 1,
    Busy: 2
};

// ==================== Helper Functions ====================

function coordsToInt(coord) {
    return Math.round(coord * 1e6);
}

function intToCoords(int) {
    return Number(int) / 1e6;
}

function formatProfile(profile) {
    return {
        name: profile.name,
        email: profile.email,
        appRole: Object.keys(AppRole)[profile.appRole],
        isVerified: profile.isVerified,
        trustScore: profile.trustScore.toString(),
        createdAt: new Date(Number(profile.createdAt) * 1000).toISOString()
    };
}

function formatIncident(incident) {
    return {
        id: incident.id.toString(),
        title: incident.title,
        description: incident.description,
        category: Object.keys(IncidentCategory)[incident.category],
        severity: Object.keys(IncidentSeverity)[incident.severity],
        status: Object.keys(IncidentStatus)[incident.status],
        location: {
            lat: intToCoords(incident.latitude),
            lng: intToCoords(incident.longitude)
        },
        reportedBy: incident.reportedBy,
        createdAt: new Date(Number(incident.createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(incident.updatedAt) * 1000).toISOString(),
        volunteers: incident.assignedVolunteers
    };
}

function formatVolunteer(volunteer) {
    return {
        name: volunteer.name,
        email: volunteer.email,
        skills: volunteer.skills,
        availability: Object.keys(VolunteerStatus)[volunteer.availability],
        location: {
            lat: intToCoords(volunteer.latitude),
            lng: intToCoords(volunteer.longitude)
        },
        isVerified: volunteer.isVerified,
        rating: volunteer.rating.toString(),
        tasksCompleted: volunteer.tasksCompleted.toString()
    };
}

// ==================== Read Functions ====================

async function getMyProfile() {
    try {
        const profile = await contractReadOnly.getMyProfile();
        console.log('📋 Your Profile:', formatProfile(profile));
        return formatProfile(profile);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getUserProfile(address) {
    try {
        const profile = await contractReadOnly.getUserProfile(address);
        console.log('📋 User Profile:', formatProfile(profile));
        return formatProfile(profile);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getIncident(incidentId) {
    try {
        const incident = await contractReadOnly.getIncident(incidentId);
        console.log('🚨 Incident:', formatIncident(incident));
        return formatIncident(incident);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getAllIncidents() {
    try {
        const ids = await contractReadOnly.getAllIncidents();
        console.log(`📊 Found ${ids.length} incidents`);
        return ids.map(id => id.toString());
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getVolunteer(address) {
    try {
        const volunteer = await contractReadOnly.getVolunteer(address);
        console.log('🤝 Volunteer:', formatVolunteer(volunteer));
        return formatVolunteer(volunteer);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getAllVolunteers() {
    try {
        const volunteers = await contractReadOnly.getAllVolunteers();
        console.log(`👥 Found ${volunteers.length} volunteers`);
        return volunteers;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getAvailableVolunteers() {
    try {
        const volunteers = await contractReadOnly.getAvailableVolunteers();
        console.log(`✅ Found ${volunteers.length} available volunteers`);
        return volunteers;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getIncidentStats() {
    try {
        const stats = await contractReadOnly.getIncidentStats();
        const formatted = {
            total: stats.total.toString(),
            reported: stats.reported.toString(),
            inProgress: stats.inProgress.toString(),
            resolved: stats.resolved.toString(),
            closed: stats.closed.toString()
        };
        console.log('📊 Incident Statistics:', formatted);
        return formatted;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getVolunteerStats() {
    try {
        const stats = await contractReadOnly.getVolunteerStats();
        const formatted = {
            total: stats.total.toString(),
            available: stats.available.toString(),
            busy: stats.busy.toString(),
            verified: stats.verified.toString()
        };
        console.log('📊 Volunteer Statistics:', formatted);
        return formatted;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getTotalUsers() {
    try {
        const total = await contractReadOnly.getTotalUsers();
        console.log(`👤 Total Users: ${total.toString()}`);
        return total.toString();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// ==================== Write Functions ====================

async function createUserProfile(name, email, role) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Creating profile for ${name}...`);
        const tx = await contract.createUserProfile(name, email, role);
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Profile created! Block:', receipt.blockNumber);
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function createIncident(title, description, category, severity, lat, lng) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Creating incident: ${title}...`);
        const tx = await contract.createIncident(
            title,
            description,
            category,
            severity,
            coordsToInt(lat),
            coordsToInt(lng)
        );
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Incident created! Block:', receipt.blockNumber);
        
        // Parse event to get incident ID
        const event = receipt.logs.find(log => log.topics[0] === contract.interface.getEvent('IncidentCreated').topicHash);
        if (event) {
            const parsed = contract.interface.parseLog(event);
            console.log('🆔 Incident ID:', parsed.args.incidentId.toString());
        }
        
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function registerVolunteer(name, email, skills, lat, lng) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Registering volunteer: ${name}...`);
        const tx = await contract.registerVolunteer(
            name,
            email,
            skills,
            coordsToInt(lat),
            coordsToInt(lng)
        );
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Volunteer registered! Block:', receipt.blockNumber);
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function createAnnouncement(title, message, priority) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Creating announcement: ${title}...`);
        const tx = await contract.createAnnouncement(title, message, priority);
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Announcement created! Block:', receipt.blockNumber);
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function verifyUser(address) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Verifying user: ${address}...`);
        const tx = await contract.verifyUser(address);
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ User verified! Block:', receipt.blockNumber);
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function updateIncidentStatus(incidentId, status) {
    if (!wallet) throw new Error('Wallet not configured');
    
    try {
        console.log(`Updating incident #${incidentId}...`);
        const tx = await contract.updateIncidentStatus(incidentId, status);
        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Incident updated! Block:', receipt.blockNumber);
        return receipt;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// ==================== Complete Demo ====================

async function runCompleteDemo() {
    console.log('\n🚀 Emergency Coordination Contract - Complete Demo\n');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('Network:', await provider.getNetwork());
    
    if (wallet) {
        console.log('Wallet:', wallet.address);
        const balance = await provider.getBalance(wallet.address);
        console.log('Balance:', ethers.formatEther(balance), 'ETH\n');
    }
    
    // Read current state
    console.log('=== Current State ===\n');
    await getTotalUsers();
    await getIncidentStats();
    await getVolunteerStats();
    
    console.log('\n=== Fetching Data ===\n');
    await getAllIncidents();
    await getAllVolunteers();
    
    console.log('\n✅ Demo completed!\n');
}

// Export everything
module.exports = {
    // Enums
    AppRole,
    IncidentCategory,
    IncidentSeverity,
    IncidentStatus,
    VolunteerStatus,
    
    // Read functions
    getMyProfile,
    getUserProfile,
    getIncident,
    getAllIncidents,
    getVolunteer,
    getAllVolunteers,
    getAvailableVolunteers,
    getIncidentStats,
    getVolunteerStats,
    getTotalUsers,
    
    // Write functions
    createUserProfile,
    createIncident,
    registerVolunteer,
    createAnnouncement,
    verifyUser,
    updateIncidentStatus,
    
    // Demo
    runCompleteDemo,
    
    // Contract instances
    contract,
    contractReadOnly,
    provider,
    wallet
};

// Run demo if executed directly
if (require.main === module) {
    runCompleteDemo().catch(console.error);
}
