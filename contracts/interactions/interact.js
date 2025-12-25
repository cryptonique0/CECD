// Emergency Coordination Contract Interaction Script
// Contract Address: 0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF

const Web3 = require('web3');
const contractABI = require('./abi.json');

// Configuration
const CONTRACT_ADDRESS = '0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF';
const RPC_URL = 'YOUR_RPC_URL'; // Replace with your RPC endpoint
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // Replace with your private key

// Initialize Web3
const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Contract instance
const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

// ==================== User Profile Functions ====================

async function createUserProfile(name, email, role) {
    console.log(`Creating user profile for ${name}...`);
    try {
        const tx = await contract.methods.createUserProfile(name, email, role).send({
            from: account.address,
            gas: 500000
        });
        console.log('✅ Profile created:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error creating profile:', error.message);
    }
}

async function getMyProfile() {
    console.log('Fetching your profile...');
    try {
        const profile = await contract.methods.getMyProfile().call({ from: account.address });
        console.log('✅ Your Profile:');
        console.log('  Name:', profile.name);
        console.log('  Email:', profile.email);
        console.log('  Role:', profile.appRole);
        console.log('  Verified:', profile.isVerified);
        console.log('  Trust Score:', profile.trustScore);
        return profile;
    } catch (error) {
        console.error('❌ Error fetching profile:', error.message);
    }
}

async function verifyUser(userAddress) {
    console.log(`Verifying user ${userAddress}...`);
    try {
        const tx = await contract.methods.verifyUser(userAddress).send({
            from: account.address,
            gas: 200000
        });
        console.log('✅ User verified:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error verifying user:', error.message);
    }
}

// ==================== Incident Management ====================

async function createIncident(title, description, category, severity, lat, lng) {
    console.log(`Creating incident: ${title}...`);
    try {
        // Convert coordinates to int256 (multiply by 1e6)
        const latitude = Math.round(lat * 1e6);
        const longitude = Math.round(lng * 1e6);
        
        const tx = await contract.methods.createIncident(
            title,
            description,
            category,
            severity,
            latitude,
            longitude
        ).send({
            from: account.address,
            gas: 800000
        });
        
        console.log('✅ Incident created:', tx.transactionHash);
        console.log('   Incident ID:', tx.events.IncidentCreated.returnValues.incidentId);
        return tx;
    } catch (error) {
        console.error('❌ Error creating incident:', error.message);
    }
}

async function getIncident(incidentId) {
    console.log(`Fetching incident #${incidentId}...`);
    try {
        const incident = await contract.methods.getIncident(incidentId).call();
        console.log('✅ Incident Details:');
        console.log('  ID:', incident.id);
        console.log('  Title:', incident.title);
        console.log('  Category:', incident.category);
        console.log('  Severity:', incident.severity);
        console.log('  Status:', incident.status);
        console.log('  Reporter:', incident.reportedBy);
        console.log('  Latitude:', incident.latitude / 1e6);
        console.log('  Longitude:', incident.longitude / 1e6);
        return incident;
    } catch (error) {
        console.error('❌ Error fetching incident:', error.message);
    }
}

async function getAllIncidents() {
    console.log('Fetching all incidents...');
    try {
        const incidentIds = await contract.methods.getAllIncidents().call();
        console.log(`✅ Found ${incidentIds.length} incidents:`, incidentIds);
        return incidentIds;
    } catch (error) {
        console.error('❌ Error fetching incidents:', error.message);
    }
}

async function updateIncidentStatus(incidentId, status) {
    console.log(`Updating incident #${incidentId} to status ${status}...`);
    try {
        const tx = await contract.methods.updateIncidentStatus(incidentId, status).send({
            from: account.address,
            gas: 200000
        });
        console.log('✅ Incident updated:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error updating incident:', error.message);
    }
}

// ==================== Volunteer Management ====================

async function registerVolunteer(name, email, skills, lat, lng) {
    console.log(`Registering volunteer: ${name}...`);
    try {
        const latitude = Math.round(lat * 1e6);
        const longitude = Math.round(lng * 1e6);
        
        const tx = await contract.methods.registerVolunteer(
            name,
            email,
            skills,
            latitude,
            longitude
        ).send({
            from: account.address,
            gas: 600000
        });
        
        console.log('✅ Volunteer registered:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error registering volunteer:', error.message);
    }
}

async function getVolunteer(address) {
    console.log(`Fetching volunteer ${address}...`);
    try {
        const volunteer = await contract.methods.getVolunteer(address).call();
        console.log('✅ Volunteer Details:');
        console.log('  Name:', volunteer.name);
        console.log('  Email:', volunteer.email);
        console.log('  Skills:', volunteer.skills);
        console.log('  Status:', volunteer.availability);
        console.log('  Verified:', volunteer.isVerified);
        console.log('  Rating:', volunteer.rating);
        return volunteer;
    } catch (error) {
        console.error('❌ Error fetching volunteer:', error.message);
    }
}

async function getAllVolunteers() {
    console.log('Fetching all volunteers...');
    try {
        const volunteers = await contract.methods.getAllVolunteers().call();
        console.log(`✅ Found ${volunteers.length} volunteers:`, volunteers);
        return volunteers;
    } catch (error) {
        console.error('❌ Error fetching volunteers:', error.message);
    }
}

async function getAvailableVolunteers() {
    console.log('Fetching available volunteers...');
    try {
        const volunteers = await contract.methods.getAvailableVolunteers().call();
        console.log(`✅ Found ${volunteers.length} available volunteers:`, volunteers);
        return volunteers;
    } catch (error) {
        console.error('❌ Error fetching available volunteers:', error.message);
    }
}

async function verifyVolunteer(volunteerAddress) {
    console.log(`Verifying volunteer ${volunteerAddress}...`);
    try {
        const tx = await contract.methods.verifyVolunteer(volunteerAddress).send({
            from: account.address,
            gas: 200000
        });
        console.log('✅ Volunteer verified:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error verifying volunteer:', error.message);
    }
}

async function assignVolunteerToIncident(incidentId, volunteerAddress) {
    console.log(`Assigning volunteer to incident #${incidentId}...`);
    try {
        const tx = await contract.methods.assignVolunteerToIncident(incidentId, volunteerAddress).send({
            from: account.address,
            gas: 300000
        });
        console.log('✅ Volunteer assigned:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error assigning volunteer:', error.message);
    }
}

// ==================== Announcement Management ====================

async function createAnnouncement(title, message, priority) {
    console.log(`Creating announcement: ${title}...`);
    try {
        const tx = await contract.methods.createAnnouncement(title, message, priority).send({
            from: account.address,
            gas: 400000
        });
        console.log('✅ Announcement created:', tx.transactionHash);
        console.log('   Announcement ID:', tx.events.AnnouncementCreated.returnValues.announcementId);
        return tx;
    } catch (error) {
        console.error('❌ Error creating announcement:', error.message);
    }
}

async function getAnnouncement(announcementId) {
    console.log(`Fetching announcement #${announcementId}...`);
    try {
        const announcement = await contract.methods.getAnnouncement(announcementId).call();
        console.log('✅ Announcement Details:');
        console.log('  ID:', announcement.id);
        console.log('  Title:', announcement.title);
        console.log('  Message:', announcement.message);
        console.log('  Priority:', announcement.priority);
        console.log('  Author:', announcement.author);
        return announcement;
    } catch (error) {
        console.error('❌ Error fetching announcement:', error.message);
    }
}

async function getAllAnnouncements() {
    console.log('Fetching all announcements...');
    try {
        const announcementIds = await contract.methods.getAllAnnouncements().call();
        console.log(`✅ Found ${announcementIds.length} announcements:`, announcementIds);
        return announcementIds;
    } catch (error) {
        console.error('❌ Error fetching announcements:', error.message);
    }
}

// ==================== Role Management ====================

async function addEmergencyDesk(address) {
    console.log(`Adding emergency desk: ${address}...`);
    try {
        const tx = await contract.methods.addEmergencyDesk(address).send({
            from: account.address,
            gas: 200000
        });
        console.log('✅ Emergency desk added:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error adding emergency desk:', error.message);
    }
}

async function addCommunityLeader(address) {
    console.log(`Adding community leader: ${address}...`);
    try {
        const tx = await contract.methods.addCommunityLeader(address).send({
            from: account.address,
            gas: 200000
        });
        console.log('✅ Community leader added:', tx.transactionHash);
        return tx;
    } catch (error) {
        console.error('❌ Error adding community leader:', error.message);
    }
}

// ==================== Analytics ====================

async function getIncidentStats() {
    console.log('Fetching incident statistics...');
    try {
        const stats = await contract.methods.getIncidentStats().call();
        console.log('✅ Incident Statistics:');
        console.log('  Total:', stats.total);
        console.log('  Reported:', stats.reported);
        console.log('  In Progress:', stats.inProgress);
        console.log('  Resolved:', stats.resolved);
        console.log('  Closed:', stats.closed);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching stats:', error.message);
    }
}

async function getVolunteerStats() {
    console.log('Fetching volunteer statistics...');
    try {
        const stats = await contract.methods.getVolunteerStats().call();
        console.log('✅ Volunteer Statistics:');
        console.log('  Total:', stats.total);
        console.log('  Available:', stats.available);
        console.log('  Busy:', stats.busy);
        console.log('  Verified:', stats.verified);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching stats:', error.message);
    }
}

async function getTotalUsers() {
    console.log('Fetching total users...');
    try {
        const total = await contract.methods.getTotalUsers().call();
        console.log(`✅ Total registered users: ${total}`);
        return total;
    } catch (error) {
        console.error('❌ Error fetching total users:', error.message);
    }
}

// ==================== Demo Scenario ====================

async function runDemoScenario() {
    console.log('\n🚀 Running Demo Scenario...\n');
    
    // 1. Get your profile (owner already has a profile)
    await getMyProfile();
    
    // 2. Verify yourself (if not already verified)
    await verifyUser(account.address);
    
    // 3. Register as volunteer
    await registerVolunteer(
        'Emergency Responder',
        'responder@example.com',
        ['First Aid', 'CPR', 'Search & Rescue'],
        40.7589, // New York latitude
        -73.9851 // New York longitude
    );
    
    // 4. Verify your volunteer status
    await verifyVolunteer(account.address);
    
    // 5. Create a test incident
    await createIncident(
        'Medical Emergency',
        'Person collapsed at Central Park',
        0, // Medical
        2, // High severity
        40.7829,
        -73.9654
    );
    
    // 6. Get all incidents
    const incidents = await getAllIncidents();
    
    // 7. Update incident status (if any incidents exist)
    if (incidents && incidents.length > 0) {
        await updateIncidentStatus(incidents[0], 1); // Acknowledged
    }
    
    // 8. Create an announcement (requires community leader role)
    // First, add yourself as community leader
    await addCommunityLeader(account.address);
    
    await createAnnouncement(
        'Emergency Drill Scheduled',
        'Emergency preparedness drill scheduled for next week. All volunteers should participate.',
        2 // Medium priority
    );
    
    // 9. Get statistics
    await getIncidentStats();
    await getVolunteerStats();
    await getTotalUsers();
    
    console.log('\n✅ Demo scenario completed!\n');
}

// Export functions
module.exports = {
    // User functions
    createUserProfile,
    getMyProfile,
    verifyUser,
    
    // Incident functions
    createIncident,
    getIncident,
    getAllIncidents,
    updateIncidentStatus,
    
    // Volunteer functions
    registerVolunteer,
    getVolunteer,
    getAllVolunteers,
    getAvailableVolunteers,
    verifyVolunteer,
    assignVolunteerToIncident,
    
    // Announcement functions
    createAnnouncement,
    getAnnouncement,
    getAllAnnouncements,
    
    // Role management
    addEmergencyDesk,
    addCommunityLeader,
    
    // Analytics
    getIncidentStats,
    getVolunteerStats,
    getTotalUsers,
    
    // Demo
    runDemoScenario
};

// Run demo if executed directly
if (require.main === module) {
    runDemoScenario().catch(console.error);
}
