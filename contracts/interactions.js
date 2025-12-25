// Contract Interaction Examples
// Emergency Coordination Dashboard - Web3.js & Ethers.js Integration

const CONTRACT_ADDRESS = "0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF";

// ==================== WEB3.JS EXAMPLES ====================

// 1. Setup Web3.js
async function initWeb3() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return web3;
        } catch (error) {
            console.error('User denied account access:', error);
        }
    } else {
        console.error('MetaMask not installed');
    }
}

// 2. Contract Instance (Web3.js)
async function getContractInstance() {
    const web3 = new Web3(window.ethereum);
    
    const contractABI = [
        // ... Include full ABI from compiled contract
        {
            "inputs": [
                {"internalType": "string", "name": "_name", "type": "string"},
                {"internalType": "string", "name": "_email", "type": "string"},
                {"internalType": "uint8", "name": "_appRole", "type": "uint8"}
            ],
            "name": "createUserProfile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        // ... Add more functions as needed
    ];
    
    return new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
}

// 3. Create User Profile (Web3.js)
async function createUserProfileWeb3(name, email, role) {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        const accounts = await web3.eth.getAccounts();
        
        const tx = contract.methods.createUserProfile(name, email, role);
        const gas = await tx.estimateGas({ from: accounts[0] });
        
        const receipt = await tx.send({
            from: accounts[0],
            gas: Math.round(gas * 1.1),
        });
        
        console.log("User Profile Created:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}

// 4. Register Volunteer (Web3.js)
async function registerVolunteerWeb3(name, email, skills, latitude, longitude) {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        const accounts = await web3.eth.getAccounts();
        
        const tx = contract.methods.registerVolunteer(
            name,
            email,
            skills,
            Math.round(latitude * 1e6),
            Math.round(longitude * 1e6)
        );
        
        const gas = await tx.estimateGas({ from: accounts[0] });
        
        const receipt = await tx.send({
            from: accounts[0],
            gas: Math.round(gas * 1.1),
        });
        
        console.log("Volunteer Registered:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error registering volunteer:", error);
        throw error;
    }
}

// 5. Create Incident (Web3.js)
async function createIncidentWeb3(title, description, category, severity, latitude, longitude) {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        const accounts = await web3.eth.getAccounts();
        
        const tx = contract.methods.createIncident(
            title,
            description,
            category,
            severity,
            Math.round(latitude * 1e6),
            Math.round(longitude * 1e6)
        );
        
        const gas = await tx.estimateGas({ from: accounts[0] });
        
        const receipt = await tx.send({
            from: accounts[0],
            gas: Math.round(gas * 1.1),
        });
        
        console.log("Incident Created:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating incident:", error);
        throw error;
    }
}

// 6. Get All Incidents (Web3.js)
async function getAllIncidentsWeb3() {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        
        const incidents = await contract.methods.getAllIncidents().call();
        console.log("All Incidents:", incidents);
        return incidents;
    } catch (error) {
        console.error("Error fetching incidents:", error);
        throw error;
    }
}

// 7. Get Incident Stats (Web3.js)
async function getIncidentStatsWeb3() {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        
        const stats = await contract.methods.getIncidentStats().call();
        console.log("Incident Stats:", {
            total: stats.total,
            reported: stats.reported,
            inProgress: stats.inProgress,
            resolved: stats.resolved,
            closed: stats.closed
        });
        return stats;
    } catch (error) {
        console.error("Error fetching stats:", error);
        throw error;
    }
}

// 8. Get Available Volunteers (Web3.js)
async function getAvailableVolunteersWeb3() {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = await getContractInstance();
        
        const volunteers = await contract.methods.getAvailableVolunteers().call();
        console.log("Available Volunteers:", volunteers);
        return volunteers;
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        throw error;
    }
}

// ==================== ETHERS.JS EXAMPLES ====================

// 9. Setup Ethers.js
async function initEthers() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            await provider.send("eth_requestAccounts", []);
            return provider;
        } catch (error) {
            console.error('User denied account access:', error);
        }
    } else {
        console.error('MetaMask not installed');
    }
}

// 10. Contract Instance (Ethers.js)
async function getContractInstanceEthers() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const contractABI = [
        // ... Include full ABI from compiled contract
    ];
    
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

// 11. Create User Profile (Ethers.js)
async function createUserProfileEthers(name, email, role) {
    try {
        const contract = await getContractInstanceEthers();
        
        const tx = await contract.createUserProfile(name, email, role);
        const receipt = await tx.wait();
        
        console.log("User Profile Created:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}

// 12. Register Volunteer (Ethers.js)
async function registerVolunteerEthers(name, email, skills, latitude, longitude) {
    try {
        const contract = await getContractInstanceEthers();
        
        const tx = await contract.registerVolunteer(
            name,
            email,
            skills,
            Math.round(latitude * 1e6),
            Math.round(longitude * 1e6)
        );
        
        const receipt = await tx.wait();
        console.log("Volunteer Registered:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error registering volunteer:", error);
        throw error;
    }
}

// 13. Create Incident (Ethers.js)
async function createIncidentEthers(title, description, category, severity, latitude, longitude) {
    try {
        const contract = await getContractInstanceEthers();
        
        const tx = await contract.createIncident(
            title,
            description,
            category,
            severity,
            Math.round(latitude * 1e6),
            Math.round(longitude * 1e6)
        );
        
        const receipt = await tx.wait();
        console.log("Incident Created:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating incident:", error);
        throw error;
    }
}

// 14. Update Volunteer Status (Ethers.js)
async function updateVolunteerStatusEthers(status) {
    try {
        const contract = await getContractInstanceEthers();
        
        const tx = await contract.updateVolunteerStatus(status);
        const receipt = await tx.wait();
        
        console.log("Volunteer Status Updated:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
}

// 15. Assign Volunteer to Incident (Ethers.js)
async function assignVolunteerEthers(incidentId, volunteerAddress) {
    try {
        const contract = await getContractInstanceEthers();
        
        const tx = await contract.assignVolunteerToIncident(incidentId, volunteerAddress);
        const receipt = await tx.wait();
        
        console.log("Volunteer Assigned:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error assigning volunteer:", error);
        throw error;
    }
}

// 16. Get User Profile (Ethers.js)
async function getUserProfileEthers(address) {
    try {
        const contract = await getContractInstanceEthers();
        
        const profile = await contract.getUserProfile(address);
        console.log("User Profile:", profile);
        return profile;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

// 17. Get Incident Details (Ethers.js)
async function getIncidentEthers(incidentId) {
    try {
        const contract = await getContractInstanceEthers();
        
        const incident = await contract.getIncident(incidentId);
        console.log("Incident Details:", incident);
        return incident;
    } catch (error) {
        console.error("Error fetching incident:", error);
        throw error;
    }
}

// 18. Get Volunteer Details (Ethers.js)
async function getVolunteerEthers(address) {
    try {
        const contract = await getContractInstanceEthers();
        
        const volunteer = await contract.getVolunteer(address);
        console.log("Volunteer Details:", volunteer);
        return volunteer;
    } catch (error) {
        console.error("Error fetching volunteer:", error);
        throw error;
    }
}

// 19. Get All Announcements (Ethers.js)
async function getAllAnnouncementsEthers() {
    try {
        const contract = await getContractInstanceEthers();
        
        const announcements = await contract.getAllAnnouncements().call();
        console.log("All Announcements:", announcements);
        return announcements;
    } catch (error) {
        console.error("Error fetching announcements:", error);
        throw error;
    }
}

// 20. Listen to Events (Ethers.js)
async function listenToEventsEthers() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // Listen to UserProfileCreated events
        contract.on("UserProfileCreated", (user, name, role) => {
            console.log(`New user created: ${name} (${user})`);
        });
        
        // Listen to IncidentCreated events
        contract.on("IncidentCreated", (incidentId, reporter, category, severity) => {
            console.log(`New incident #${incidentId} created by ${reporter}`);
        });
        
        // Listen to VolunteerRegistered events
        contract.on("VolunteerRegistered", (volunteer, name) => {
            console.log(`New volunteer registered: ${name} (${volunteer})`);
        });
        
    } catch (error) {
        console.error("Error setting up event listeners:", error);
    }
}

// ==================== HELPER FUNCTIONS ====================

// Format location coordinates
function formatCoordinates(latitude, longitude) {
    return {
        latitude: latitude / 1e6,
        longitude: longitude / 1e6
    };
}

// Parse incident category
function getIncidentCategory(index) {
    const categories = ['Medical', 'Fire', 'Flood', 'Storm', 'Earthquake', 'Other'];
    return categories[index] || 'Unknown';
}

// Parse severity level
function getSeverityLevel(index) {
    const levels = ['Low', 'Medium', 'High', 'Critical'];
    return levels[index] || 'Unknown';
}

// Parse volunteer status
function getVolunteerStatus(index) {
    const statuses = ['Available', 'Unavailable', 'Busy'];
    return statuses[index] || 'Unknown';
}

// ==================== EXAMPLE USAGE ====================

/*

// Example 1: Create User Profile
await createUserProfileEthers("John Doe", "john@example.com", 0); // 0 = Citizen

// Example 2: Register as Volunteer
await registerVolunteerEthers(
    "John Doe",
    "john@example.com",
    ["First Aid", "CPR", "Search & Rescue"],
    40.7128,  // NYC Latitude
    -74.0060  // NYC Longitude
);

// Example 3: Create an Incident
await createIncidentEthers(
    "Medical Emergency",
    "Person collapsed at Main Street",
    0,  // Medical category
    2,  // High severity
    40.7128,
    -74.0060
);

// Example 4: Update Volunteer Status
await updateVolunteerStatusEthers(2); // 2 = Busy

// Example 5: Get All Incidents
const incidents = await getAllIncidentsWeb3();
console.log("Total incidents:", incidents.length);

// Example 6: Get Incident Stats
const stats = await getIncidentStatsWeb3();
console.log("Active incidents:", stats.inProgress);

// Example 7: Listen to Events
await listenToEventsEthers();

*/

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initWeb3,
        getContractInstance,
        createUserProfileWeb3,
        registerVolunteerWeb3,
        createIncidentWeb3,
        getAllIncidentsWeb3,
        getIncidentStatsWeb3,
        getAvailableVolunteersWeb3,
        initEthers,
        getContractInstanceEthers,
        createUserProfileEthers,
        registerVolunteerEthers,
        createIncidentEthers,
        updateVolunteerStatusEthers,
        assignVolunteerEthers,
        getUserProfileEthers,
        getIncidentEthers,
        getVolunteerEthers,
        getAllAnnouncementsEthers,
        listenToEventsEthers,
        formatCoordinates,
        getIncidentCategory,
        getSeverityLevel,
        getVolunteerStatus
    };
}
