# Contract Interaction Test Scenarios

## Overview
This document outlines comprehensive test scenarios for the EmergencyCoordination smart contract. Each scenario includes step-by-step instructions and expected outcomes.

---

## Test Scenario 1: User Registration & Verification

### Objective
Test the complete user registration and verification flow.

### Steps

**Step 1: Create User Profile**
```javascript
// Using Ethers.js
const tx1 = await contract.createUserProfile(
    "Alice Johnson",
    "alice@emergency.com",
    0  // 0 = Citizen role
);
await tx1.wait();
```

**Expected Result:**
- User profile created
- Initial trust score: 50
- Verification status: false
- Event: UserProfileCreated emitted

**Step 2: Verify as Emergency Desk (Owner)**
```javascript
const ownerContract = contract.connect(ownerSigner);
await ownerContract.verifyUser(aliceAddress);
```

**Expected Result:**
- User verified
- Trust score increased to 75
- Can now create incidents

**Step 3: Retrieve User Profile**
```javascript
const profile = await contract.getUserProfile(aliceAddress);
console.log(profile);
// Expected: { name: "Alice Johnson", isVerified: true, trustScore: 75, ... }
```

---

## Test Scenario 2: Volunteer Registration

### Objective
Test volunteer registration and status updates.

### Steps

**Step 1: Register as Volunteer**
```javascript
const skills = ["First Aid", "CPR", "Search & Rescue"];
const tx = await contract.registerVolunteer(
    "Bob Smith",
    "bob@volunteers.com",
    skills,
    40758000,  // Latitude: 40.758 * 1e6
    -73968000  // Longitude: -73.968 * 1e6
);
await tx.wait();
```

**Expected Result:**
- Volunteer profile created
- Initial availability: Available
- Verification status: false
- Rating: 50
- Event: VolunteerRegistered emitted

**Step 2: Verify Volunteer (Emergency Desk)**
```javascript
const ownerContract = contract.connect(ownerSigner);
await ownerContract.verifyVolunteer(bobAddress);
```

**Expected Result:**
- Volunteer verified
- Rating increased to 75
- Can now be assigned to incidents

**Step 3: Update Volunteer Status**
```javascript
const tx = await contract.updateVolunteerStatus(2); // 2 = Busy
await tx.wait();
```

**Expected Result:**
- Availability status changed to Busy
- Event: VolunteerStatusUpdated emitted

**Step 4: Get Volunteer Details**
```javascript
const volunteer = await contract.getVolunteer(bobAddress);
console.log(volunteer);
// Expected: Full volunteer profile with updated status
```

---

## Test Scenario 3: Incident Reporting & Management

### Objective
Test incident creation, status updates, and volunteer assignment.

### Prerequisites
- At least 2 verified users (one verified volunteer)

### Steps

**Step 1: Create Incident (as Verified User)**
```javascript
const tx = await contract.createIncident(
    "Medical Emergency",
    "Person collapsed at Main Street intersection",
    0,  // 0 = Medical category
    2,  // 2 = High severity
    40758000,   // Latitude
    -73968000   // Longitude
);
const receipt = await tx.wait();
const incidentId = 1; // From return value or event
```

**Expected Result:**
- Incident created with ID
- Status: Reported
- Reporter: caller address
- Event: IncidentCreated emitted

**Step 2: Retrieve Incident Details**
```javascript
const incident = await contract.getIncident(incidentId);
console.log(incident);
// Expected: Full incident details with Reported status
```

**Step 3: Update Incident Status (Emergency Desk)**
```javascript
const ownerContract = contract.connect(ownerSigner);
const tx = await ownerContract.updateIncidentStatus(
    incidentId,
    1  // 1 = Acknowledged
);
await tx.wait();
```

**Expected Result:**
- Status changed to Acknowledged
- updatedAt timestamp updated
- Event: IncidentUpdated emitted

**Step 4: Assign Volunteer to Incident (Emergency Desk)**
```javascript
const ownerContract = contract.connect(ownerSigner);
const tx = await ownerContract.assignVolunteerToIncident(
    incidentId,
    bobAddress
);
await tx.wait();
```

**Expected Result:**
- Volunteer assigned to incident
- Volunteer status changed to Busy
- Event: VolunteerAssigned emitted

**Step 5: Update Incident to In Progress**
```javascript
const ownerContract = contract.connect(ownerSigner);
const tx = await ownerContract.updateIncidentStatus(
    incidentId,
    2  // 2 = InProgress
);
await tx.wait();
```

**Expected Result:**
- Status changed to InProgress
- Timestamp updated

**Step 6: Resolve Incident**
```javascript
const ownerContract = contract.connect(ownerSigner);
const tx = await ownerContract.updateIncidentStatus(
    incidentId,
    3  // 3 = Resolved
);
await tx.wait();
```

**Expected Result:**
- Status changed to Resolved
- Can now close the incident

---

## Test Scenario 4: Announcements

### Objective
Test announcement creation and retrieval.

### Prerequisites
- Owner must assign at least one community leader

### Steps

**Step 1: Add Community Leader (Owner)**
```javascript
const ownerContract = contract.connect(ownerSigner);
const tx = await ownerContract.addCommunityLeader(carolAddress);
await tx.wait();
```

**Expected Result:**
- Community leader role granted
- User profile updated with CommunityLeader role

**Step 2: Create Announcement (as Community Leader)**
```javascript
const carolContract = contract.connect(carolSigner);
const tx = await carolContract.createAnnouncement(
    "Evacuation Notice",
    "All residents in Zone A must evacuate immediately",
    3  // 3 = High priority
);
await tx.wait();
```

**Expected Result:**
- Announcement created with ID
- Creator: community leader address
- Event: AnnouncementCreated emitted

**Step 3: Get Announcement Details**
```javascript
const announcement = await contract.getAnnouncement(1);
console.log(announcement);
// Expected: Full announcement with high priority
```

**Step 4: Get All Announcements**
```javascript
const allAnnouncements = await contract.getAllAnnouncements();
console.log(allAnnouncements);
// Expected: Array of announcement IDs
```

---

## Test Scenario 5: Analytics & Statistics

### Objective
Test statistics retrieval and analytics functions.

### Prerequisites
- At least 3 incidents created with different statuses
- At least 2 volunteers registered

### Steps

**Step 1: Get Incident Statistics**
```javascript
const stats = await contract.getIncidentStats();
console.log({
    total: stats.total,
    reported: stats.reported,
    inProgress: stats.inProgress,
    resolved: stats.resolved,
    closed: stats.closed
});
// Expected: Updated statistics based on incidents created
```

**Step 2: Get Volunteer Statistics**
```javascript
const volunteerStats = await contract.getVolunteerStats();
console.log({
    total: volunteerStats.total,
    available: volunteerStats.available,
    busy: volunteerStats.busy,
    verified: volunteerStats.verified
});
// Expected: Statistics reflecting volunteer status
```

**Step 3: Get Total Users**
```javascript
const totalUsers = await contract.getTotalUsers();
console.log(`Total users: ${totalUsers}`);
```

**Step 4: Get All Incidents**
```javascript
const allIncidents = await contract.getAllIncidents();
console.log(`Total incidents: ${allIncidents.length}`);
```

**Step 5: Get Incidents by Status**
```javascript
const resolvedIncidents = await contract.getIncidentsByStatus(3);
console.log(`Resolved incidents: ${resolvedIncidents.length}`);
```

---

## Test Scenario 6: Access Control

### Objective
Test role-based access control restrictions.

### Steps

**Step 1: Attempt to Create Incident as Unverified User**
```javascript
const unverifiedContract = contract.connect(unverifiedSigner);
try {
    await unverifiedContract.createIncident(
        "Test",
        "Test",
        0,
        0,
        0,
        0
    );
    console.log("ERROR: Should have failed");
} catch (error) {
    console.log("Expected error:", error.message);
}
```

**Expected Result:**
- Transaction reverted
- Error: "User must be verified"

**Step 2: Attempt to Create Announcement as Non-Leader**
```javascript
const userContract = contract.connect(userSigner);
try {
    await userContract.createAnnouncement("Test", "Test", 1);
    console.log("ERROR: Should have failed");
} catch (error) {
    console.log("Expected error:", error.message);
}
```

**Expected Result:**
- Transaction reverted
- Error: "Only community leader can call this function"

**Step 3: Attempt to Update Incident as Non-Emergency Desk**
```javascript
const userContract = contract.connect(userSigner);
try {
    await userContract.updateIncidentStatus(1, 2);
    console.log("ERROR: Should have failed");
} catch (error) {
    console.log("Expected error:", error.message);
}
```

**Expected Result:**
- Transaction reverted
- Error: "Only emergency desk can call this function"

---

## Test Scenario 7: Event Listening

### Objective
Test event emissions and listening.

### Steps

**Step 1: Set Up Event Listeners**
```javascript
const filter = contract.filters.IncidentCreated();
const listener = (incidentId, reporter, category, severity) => {
    console.log(`New incident: #${incidentId} by ${reporter}`);
};
contract.on(filter, listener);
```

**Step 2: Trigger Event**
```javascript
const tx = await contract.createIncident(
    "Test Incident",
    "Testing event emission",
    0,
    1,
    40758000,
    -73968000
);
await tx.wait();
```

**Expected Result:**
- Event listener triggered
- Event data logged to console

---

## Test Scenario 8: Complete Emergency Response Flow

### Objective
Test a realistic emergency response scenario from start to finish.

### Steps

**Step 1: Report Emergency**
```javascript
// Verified citizen reports incident
const tx1 = await contract.createIncident(
    "Building Fire",
    "Fire detected in 5th floor, building evacuation in progress",
    1,  // Fire category
    3,  // Critical severity
    40758000,
    -73968000
);
await tx1.wait();
```

**Step 2: Emergency Desk Acknowledges**
```javascript
// Owner/Emergency desk acknowledges
const ownerContract = contract.connect(ownerSigner);
const tx2 = await ownerContract.updateIncidentStatus(1, 1); // Acknowledged
await tx2.wait();
```

**Step 3: Assign Available Volunteers**
```javascript
// Get available volunteers
const available = await contract.getAvailableVolunteers();

// Assign first volunteer
const tx3 = await ownerContract.assignVolunteerToIncident(1, available[0]);
await tx3.wait();
```

**Step 4: Mark In Progress**
```javascript
const tx4 = await ownerContract.updateIncidentStatus(1, 2); // InProgress
await tx4.wait();
```

**Step 5: Send Evacuation Announcement**
```javascript
// Community leader sends announcement
const leaderContract = contract.connect(leaderSigner);
const tx5 = await leaderContract.createAnnouncement(
    "URGENT: Building Evacuation",
    "Evacuate immediately via north and south exits. Avoid stairs. Use elevators for mobility-impaired.",
    3  // High priority
);
await tx5.wait();
```

**Step 6: Resolve Incident**
```javascript
const tx6 = await ownerContract.updateIncidentStatus(1, 3); // Resolved
await tx6.wait();
```

**Step 7: Verify Completion**
```javascript
const finalIncident = await contract.getIncident(1);
const stats = await contract.getIncidentStats();

console.log("Incident Status:", finalIncident.status); // Should be Resolved
console.log("Total Incidents:", stats.total);
console.log("Resolved Incidents:", stats.resolved);
```

---

## Test Scenario 9: Data Integrity

### Objective
Verify that data is correctly stored and retrieved.

### Steps

**Step 1: Create Profile with Special Characters**
```javascript
const tx = await contract.createUserProfile(
    "José García-López",
    "jose@example.com",
    0
);
await tx.wait();

const profile = await contract.getUserProfile(joseAddress);
console.log(profile.name); // Should be "José García-López"
```

**Step 2: Create Incident with Long Description**
```javascript
const longDesc = "A" * 500; // Long description
const tx = await contract.createIncident(
    "Test",
    longDesc,
    0,
    0,
    0,
    0
);
await tx.wait();

const incident = await contract.getIncident(1);
console.log(incident.description.length); // Should be 500
```

---

## Test Scenario 10: Performance Testing

### Objective
Test contract performance with large data sets.

### Steps

**Step 1: Bulk Create Users**
```javascript
for (let i = 0; i < 100; i++) {
    const tx = await contract.createUserProfile(
        `User${i}`,
        `user${i}@example.com`,
        0
    );
    await tx.wait();
}
```

**Step 2: Measure Query Performance**
```javascript
const start = Date.now();
const users = await contract.getTotalUsers();
const elapsed = Date.now() - start;
console.log(`Query took ${elapsed}ms`);
```

**Step 3: Create Multiple Incidents**
```javascript
for (let i = 0; i < 50; i++) {
    const tx = await contract.createIncident(
        `Incident${i}`,
        `Description ${i}`,
        i % 6,
        i % 4,
        40758000 + i,
        -73968000 + i
    );
    await tx.wait();
}
```

**Step 4: Retrieve All Incidents**
```javascript
const start = Date.now();
const incidents = await contract.getAllIncidents();
const elapsed = Date.now() - start;
console.log(`Retrieved ${incidents.length} incidents in ${elapsed}ms`);
```

---

## Success Criteria

✅ All transactions execute without errors  
✅ Events are correctly emitted  
✅ Data integrity is maintained  
✅ Access control rules are enforced  
✅ Statistics are accurately calculated  
✅ Performance remains acceptable  
✅ No state corruption occurs  

---

## Troubleshooting

### Common Issues

**"User must be verified" error**
- Solution: Verify user with emergency desk before creating incidents

**"Only emergency desk can call this function" error**
- Solution: Use owner account or an address with emergency desk role

**Gas estimation errors**
- Solution: Increase gas limit manually

**Transaction reverted with no reason**
- Solution: Check that contract has been deployed and address is correct

---

**Last Updated:** December 25, 2025
