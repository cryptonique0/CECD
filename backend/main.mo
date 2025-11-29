import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";

persistent actor {
  let accessControlState = AccessControl.initState();
  let storage = Storage.new();
  include MixinStorage(storage);

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Application-specific roles mapped to access control roles
  public type AppRole = {
    #citizen;
    #volunteer;
    #communityLeader;
    #emergencyDesk;
  };

  public type UserProfile = {
    name : Text;
    trustScore : Nat;
    role : AccessControl.UserRole;
    appRole : AppRole;
    location : ?Text;
    badges : [Text];
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  // Helper function to get app role
  private func getAppRole(caller : Principal) : ?AppRole {
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { null };
      case (?profile) { ?profile.appRole };
    };
  };

  // Helper function to check if caller has specific app role
  private func hasAppRole(caller : Principal, requiredRole : AppRole) : Bool {
    switch (getAppRole(caller)) {
      case (null) { false };
      case (?role) { role == requiredRole };
    };
  };

  // Helper function to check if caller is Emergency Desk
  private func isEmergencyDesk(caller : Principal) : Bool {
    hasAppRole(caller, #emergencyDesk);
  };

  // Helper function to check if caller is Community Leader
  private func isCommunityLeader(caller : Principal) : Bool {
    hasAppRole(caller, #communityLeader);
  };

  // Helper function to check if caller is Volunteer
  private func isVolunteer(caller : Principal) : Bool {
    hasAppRole(caller, #volunteer);
  };

  // Helper function to check if an appRole is privileged
  private func isPrivilegedAppRole(appRole : AppRole) : Bool {
    switch (appRole) {
      case (#emergencyDesk) { true };
      case (#communityLeader) { true };
      case (#volunteer) { false };
      case (#citizen) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    
    // Return profile with actual role from accessControlState
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { null };
      case (?profile) {
        let actualRole = AccessControl.getUserRole(accessControlState, caller);
        ?{
          profile with
          role = actualRole;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    
    // Return profile with actual role from accessControlState
    switch (principalMap.get(userProfiles, user)) {
      case (null) { null };
      case (?profile) {
        let actualRole = AccessControl.getUserRole(accessControlState, user);
        ?{
          profile with
          role = actualRole;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };

    // SECURITY: Get the actual role from accessControlState - users cannot set their own role
    let actualRole = AccessControl.getUserRole(accessControlState, caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    // SECURITY: Prevent users from elevating their own appRole to privileged roles
    // Only admins can assign privileged roles (emergencyDesk, communityLeader)
    if (isPrivilegedAppRole(profile.appRole) and not isAdmin) {
      Debug.trap("Unauthorized: Only admins can assign privileged roles (emergencyDesk, communityLeader)");
    };

    // Additional check: if user has an existing profile and is trying to change to a privileged role
    switch (principalMap.get(userProfiles, caller)) {
      case (?existingProfile) {
        // Prevent changing from non-privileged to privileged role without admin rights
        if (not isPrivilegedAppRole(existingProfile.appRole) and 
            isPrivilegedAppRole(profile.appRole) and 
            not isAdmin) {
          Debug.trap("Unauthorized: Only admins can upgrade to privileged roles");
        };
      };
      case (null) {
        // New profile creation already checked above
      };
    };

    // Store profile with actual role from accessControlState (ignore user-provided role field)
    let secureProfile = {
      profile with
      role = actualRole;
    };

    userProfiles := principalMap.put(userProfiles, caller, secureProfile);
  };

  public type IncidentCategory = {
    #fire;
    #medical;
    #theft;
    #flooding;
    #hazard;
    #kidnapping;
    #publicHealth;
    #security;
  };

  public type IncidentSeverity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type IncidentStatus = {
    #pending;
    #assigned;
    #inProgress;
    #resolved;
  };

  public type Incident = {
    id : Nat;
    title : Text;
    description : Text;
    category : IncidentCategory;
    severity : IncidentSeverity;
    location : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    status : IncidentStatus;
    reporter : ?Principal;
    assignedVolunteers : [Principal];
    comments : [Text];
    isAnonymous : Bool;
    isArchived : Bool;
  };

  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
  var incidents = natMap.empty<Incident>();
  var nextIncidentId = 0;

  public shared ({ caller }) func reportIncident(
    title : Text,
    description : Text,
    category : IncidentCategory,
    severity : IncidentSeverity,
    location : Text,
    image : ?Storage.ExternalBlob,
    isAnonymous : Bool,
  ) : async Nat {
    // Anyone can report incidents (including anonymous/guest users for Whisper Mode)
    // No authentication check needed - guests can report anonymously

    let incident : Incident = {
      id = nextIncidentId;
      title;
      description;
      category;
      severity;
      location;
      image;
      timestamp = Time.now();
      status = #pending;
      reporter = if (isAnonymous) null else ?caller;
      assignedVolunteers = [];
      comments = [];
      isAnonymous;
      isArchived = false;
    };

    incidents := natMap.put(incidents, nextIncidentId, incident);
    nextIncidentId += 1;
    incident.id;
  };

  public query func getIncident(incidentId : Nat) : async ?Incident {
    // Public information - anyone can view incidents (including guests)
    natMap.get(incidents, incidentId);
  };

  public query func getAllIncidents() : async [Incident] {
    // Public information - anyone can view incidents (including guests)
    Iter.toArray(natMap.vals(incidents));
  };

  public query func getArchivedIncidents() : async [Incident] {
    // Public information - anyone can view archived incidents (including guests)
    Array.filter(
      Iter.toArray(natMap.vals(incidents)),
      func(i : Incident) : Bool { i.isArchived },
    );
  };

  public query func getActiveIncidents() : async [Incident] {
    // Public information - anyone can view active incidents (including guests)
    Array.filter(
      Iter.toArray(natMap.vals(incidents)),
      func(i : Incident) : Bool { not i.isArchived },
    );
  };

  public shared ({ caller }) func updateIncidentStatus(incidentId : Nat, newStatus : IncidentStatus) : async () {
    // Only Emergency Desk can update incident status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update incident status");
    };

    if (not isEmergencyDesk(caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk can update incident status");
    };

    switch (natMap.get(incidents, incidentId)) {
      case (null) { Debug.trap("Incident not found") };
      case (?incident) {
        let updatedIncident = {
          incident with
          status = newStatus;
        };
        incidents := natMap.put(incidents, incidentId, updatedIncident);
      };
    };
  };

  public shared ({ caller }) func closeIncident(incidentId : Nat) : async () {
    // Only Emergency Desk can close incidents
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can close incidents");
    };

    if (not isEmergencyDesk(caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk can close incidents");
    };

    switch (natMap.get(incidents, incidentId)) {
      case (null) { Debug.trap("Incident not found") };
      case (?incident) {
        let updatedIncident = {
          incident with
          status = #resolved;
        };
        incidents := natMap.put(incidents, incidentId, updatedIncident);
      };
    };
  };

  public shared ({ caller }) func addComment(incidentId : Nat, comment : Text) : async () {
    // All authenticated users can add comments
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can add comments");
    };

    switch (natMap.get(incidents, incidentId)) {
      case (null) { Debug.trap("Incident not found") };
      case (?incident) {
        let updatedIncident = {
          incident with
          comments = Array.append(incident.comments, [comment]);
        };
        incidents := natMap.put(incidents, incidentId, updatedIncident);
      };
    };
  };

  public type Volunteer = {
    principal : Principal;
    location : Text;
    isAvailable : Bool;
    assignedIncidents : [Nat];
  };

  var volunteers = principalMap.empty<Volunteer>();

  public shared ({ caller }) func registerVolunteer(location : Text) : async () {
    // Any authenticated user can register as a volunteer
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can register as volunteers");
    };

    let volunteer : Volunteer = {
      principal = caller;
      location;
      isAvailable = true;
      assignedIncidents = [];
    };

    volunteers := principalMap.put(volunteers, caller, volunteer);

    // Update user profile to reflect volunteer status
    switch (principalMap.get(userProfiles, caller)) {
      case (?profile) {
        let updatedProfile = {
          profile with
          appRole = #volunteer;
          location = ?location;
        };
        userProfiles := principalMap.put(userProfiles, caller, updatedProfile);
      };
      case (null) {
        // Create a new profile if one doesn't exist
        let actualRole = AccessControl.getUserRole(accessControlState, caller);
        let newProfile : UserProfile = {
          name = "";
          trustScore = 0;
          role = actualRole;
          appRole = #volunteer;
          location = ?location;
          badges = [];
        };
        userProfiles := principalMap.put(userProfiles, caller, newProfile);
      };
    };
  };

  public query ({ caller }) func getAvailableVolunteers() : async [Volunteer] {
    // Emergency Desk and Community Leaders can view volunteers
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view volunteers");
    };

    if (not isEmergencyDesk(caller) and not isCommunityLeader(caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Community Leaders can view volunteers");
    };

    Array.filter(
      Iter.toArray(principalMap.vals(volunteers)),
      func(v : Volunteer) : Bool { v.isAvailable },
    );
  };

  public shared ({ caller }) func assignVolunteerToIncident(volunteer : Principal, incidentId : Nat) : async () {
    // Only Emergency Desk can assign volunteers
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can assign volunteers");
    };

    if (not isEmergencyDesk(caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk can assign volunteers to incidents");
    };

    switch (principalMap.get(volunteers, volunteer)) {
      case (null) { Debug.trap("Volunteer not found") };
      case (?vol) {
        let updatedVolunteer = {
          vol with
          assignedIncidents = Array.append(vol.assignedIncidents, [incidentId]);
        };
        volunteers := principalMap.put(volunteers, volunteer, updatedVolunteer);
      };
    };

    switch (natMap.get(incidents, incidentId)) {
      case (null) { Debug.trap("Incident not found") };
      case (?incident) {
        let updatedIncident = {
          incident with
          assignedVolunteers = Array.append(incident.assignedVolunteers, [volunteer]);
          status = #assigned;
        };
        incidents := natMap.put(incidents, incidentId, updatedIncident);
      };
    };
  };

  public shared ({ caller }) func acceptTask(incidentId : Nat) : async () {
    // SECURITY: Only authenticated users who are registered as volunteers can accept tasks
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can accept tasks");
    };

    // SECURITY: Verify that the caller is registered as a volunteer
    switch (principalMap.get(volunteers, caller)) {
      case (null) { Debug.trap("Unauthorized: You must be registered as a volunteer to accept tasks") };
      case (?vol) {
        // SECURITY: Additional check - verify the user has volunteer appRole
        if (not isVolunteer(caller)) {
          Debug.trap("Unauthorized: Only users with volunteer role can accept tasks");
        };

        let updatedVolunteer = {
          vol with
          assignedIncidents = Array.append(vol.assignedIncidents, [incidentId]);
        };
        volunteers := principalMap.put(volunteers, caller, updatedVolunteer);
      };
    };

    switch (natMap.get(incidents, incidentId)) {
      case (null) { Debug.trap("Incident not found") };
      case (?incident) {
        let updatedIncident = {
          incident with
          assignedVolunteers = Array.append(incident.assignedVolunteers, [caller]);
          status = if (incident.status == #pending) #assigned else incident.status;
        };
        incidents := natMap.put(incidents, incidentId, updatedIncident);
      };
    };
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    message : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  var announcements = natMap.empty<Announcement>();
  var nextAnnouncementId = 0;

  public shared ({ caller }) func createAnnouncement(title : Text, message : Text) : async Nat {
    // Only Community Leaders can create announcements
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can create announcements");
    };

    if (not isCommunityLeader(caller)) {
      Debug.trap("Unauthorized: Only Community Leaders can create announcements");
    };

    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      message;
      author = caller;
      timestamp = Time.now();
    };

    announcements := natMap.put(announcements, nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
    announcement.id;
  };

  public query func getAllAnnouncements() : async [Announcement] {
    // Public information - anyone can view announcements (including guests)
    Iter.toArray(natMap.vals(announcements));
  };

  // Predictive Risk Engine Types
  public type RiskScore = {
    location : Text;
    score : Nat;
    category : Text;
    confidence : Nat;
  };

  public type IncidentTagSuggestion = {
    category : Text;
    severity : Text;
    confidence : Nat;
  };

  // Predictive Risk Engine Functions
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getRiskScore(location : Text) : async Nat {
    // Public safety information - anyone can get risk scores (including guests)

    // Simulate risk score calculation based on location
    let riskScore = switch (location) {
      case ("Lagos") { 85 };
      case ("Abuja") { 70 };
      case ("Kano") { 65 };
      case ("Port Harcourt") { 75 };
      case ("Ibadan") { 60 };
      case ("Enugu") { 55 };
      case ("Kaduna") { 50 };
      case ("Benin City") { 45 };
      case ("Jos") { 40 };
      case ("Abeokuta") { 35 };
      case ("Ilorin") { 30 };
      case ("Calabar") { 25 };
      case ("Uyo") { 20 };
      case ("Owerri") { 15 };
      case ("Akure") { 10 };
      case ("Maiduguri") { 5 };
      case (_) { 50 };
    };

    riskScore;
  };

  public query func suggestIncidentTags(description : Text, imageHash : ?Text) : async IncidentTagSuggestion {
    // Public AI service - anyone can get incident tag suggestions (including guests)

    // Simulate AI-powered tag suggestion based on description and image hash
    let suggestion = if (Text.contains(description, #text "fire") or Text.contains(description, #text "burning")) {
      {
        category = "fire";
        severity = "high";
        confidence = 90;
      };
    } else if (Text.contains(description, #text "flood") or Text.contains(description, #text "water")) {
      {
        category = "flooding";
        severity = "medium";
        confidence = 80;
      };
    } else if (Text.contains(description, #text "accident") or Text.contains(description, #text "injury")) {
      {
        category = "medical";
        severity = "critical";
        confidence = 85;
      };
    } else if (Text.contains(description, #text "theft") or Text.contains(description, #text "robbery")) {
      {
        category = "theft";
        severity = "high";
        confidence = 75;
      };
    } else if (Text.contains(description, #text "hazard") or Text.contains(description, #text "danger")) {
      {
        category = "hazard";
        severity = "medium";
        confidence = 70;
      };
    } else if (Text.contains(description, #text "kidnap") or Text.contains(description, #text "abduction")) {
      {
        category = "kidnapping";
        severity = "critical";
        confidence = 95;
      };
    } else if (Text.contains(description, #text "health") or Text.contains(description, #text "disease")) {
      {
        category = "publicHealth";
        severity = "high";
        confidence = 85;
      };
    } else if (Text.contains(description, #text "security") or Text.contains(description, #text "threat")) {
      {
        category = "security";
        severity = "high";
        confidence = 80;
      };
    } else {
      {
        category = "general";
        severity = "low";
        confidence = 50;
      };
    };

    suggestion;
  };

  public shared ({ caller }) func fetchExternalDataset(url : Text) : async Text {
    // Only Emergency Desk and Admins can fetch external datasets
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can fetch external datasets");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can fetch external datasets");
    };

    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func trainModelWithExternalData(datasetUrl : Text) : async () {
    // Only Emergency Desk and Admins can train models with external data
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can train models with external data");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can train models with external data");
    };

    let _ = await OutCall.httpGetRequest(datasetUrl, [], transform);
  };

  public shared ({ caller }) func updateModelParameters(params : Text) : async () {
    // Only Emergency Desk and Admins can update model parameters
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update model parameters");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can update model parameters");
    };
  };

  public query func getRiskHeatmapData() : async [RiskScore] {
    // Public safety information - anyone can get risk heatmap data (including guests)

    // Simulate risk heatmap data
    let heatmapData : [RiskScore] = [
      {
        location = "Lagos";
        score = 85;
        category = "fire";
        confidence = 90;
      },
      {
        location = "Abuja";
        score = 70;
        category = "flooding";
        confidence = 80;
      },
      {
        location = "Kano";
        score = 65;
        category = "medical";
        confidence = 75;
      },
      {
        location = "Port Harcourt";
        score = 75;
        category = "theft";
        confidence = 85;
      },
      {
        location = "Ibadan";
        score = 60;
        category = "hazard";
        confidence = 70;
      },
      {
        location = "Kaduna";
        score = 80;
        category = "kidnapping";
        confidence = 85;
      },
      {
        location = "Enugu";
        score = 75;
        category = "publicHealth";
        confidence = 80;
      },
      {
        location = "Benin City";
        score = 70;
        category = "security";
        confidence = 75;
      },
    ];

    heatmapData;
  };

  public query func getTrendForecasts() : async [RiskScore] {
    // Public safety information - anyone can get trend forecasts (including guests)

    // Simulate trend forecast data
    let forecastData : [RiskScore] = [
      {
        location = "Lagos";
        score = 90;
        category = "fire";
        confidence = 95;
      },
      {
        location = "Abuja";
        score = 75;
        category = "flooding";
        confidence = 85;
      },
      {
        location = "Kano";
        score = 70;
        category = "medical";
        confidence = 80;
      },
      {
        location = "Port Harcourt";
        score = 80;
        category = "theft";
        confidence = 90;
      },
      {
        location = "Ibadan";
        score = 65;
        category = "hazard";
        confidence = 75;
      },
      {
        location = "Kaduna";
        score = 85;
        category = "kidnapping";
        confidence = 90;
      },
      {
        location = "Enugu";
        score = 80;
        category = "publicHealth";
        confidence = 85;
      },
      {
        location = "Benin City";
        score = 75;
        category = "security";
        confidence = 80;
      },
    ];

    forecastData;
  };

  // Notification System Types
  public type AlertType = {
    #highRiskZone;
    #unusualEvent;
    #weatherWarning;
    #systemAlert;
    #regionalTrend;
  };

  public type AlertNotification = {
    id : Nat;
    message : Text;
    alertType : AlertType;
    location : ?Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  var notifications = natMap.empty<AlertNotification>();
  var nextNotificationId = 0;

  public shared ({ caller }) func createAlertNotification(
    message : Text,
    alertType : AlertType,
    location : ?Text,
  ) : async Nat {
    // Only Emergency Desk and Admins can create alert notifications
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can create alert notifications");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can create alert notifications");
    };

    let notification : AlertNotification = {
      id = nextNotificationId;
      message;
      alertType;
      location;
      timestamp = Time.now();
      isRead = false;
    };

    notifications := natMap.put(notifications, nextNotificationId, notification);
    nextNotificationId += 1;
    notification.id;
  };

  public query func getAllNotifications() : async [AlertNotification] {
    // Public information - anyone can view notifications (including guests)
    Iter.toArray(natMap.vals(notifications));
  };

  public query func getUnreadNotifications() : async [AlertNotification] {
    // Public information - anyone can view notifications (including guests)
    Array.filter(
      Iter.toArray(natMap.vals(notifications)),
      func(n : AlertNotification) : Bool { not n.isRead },
    );
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    // All authenticated users can mark notifications as read
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can mark notifications as read");
    };

    switch (natMap.get(notifications, notificationId)) {
      case (null) { Debug.trap("Notification not found") };
      case (?notification) {
        let updatedNotification = {
          notification with
          isRead = true;
        };
        notifications := natMap.put(notifications, notificationId, updatedNotification);
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    // All authenticated users can mark all notifications as read
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can mark notifications as read");
    };

    let allNotifications = Iter.toArray(natMap.vals(notifications));
    for (notification in allNotifications.vals()) {
      let updatedNotification = {
        notification with
        isRead = true;
      };
      notifications := natMap.put(notifications, notification.id, updatedNotification);
    };
  };

  public query func getNotificationById(notificationId : Nat) : async ?AlertNotification {
    // Public information - anyone can view notifications (including guests)
    natMap.get(notifications, notificationId);
  };

  public query func getNotificationsByType(alertType : AlertType) : async [AlertNotification] {
    // Public information - anyone can view notifications (including guests)
    Array.filter(
      Iter.toArray(natMap.vals(notifications)),
      func(n : AlertNotification) : Bool { n.alertType == alertType },
    );
  };

  public query func getNotificationsByLocation(location : Text) : async [AlertNotification] {
    // Public information - anyone can view notifications (including guests)
    Array.filter(
      Iter.toArray(natMap.vals(notifications)),
      func(n : AlertNotification) : Bool {
        switch (n.location) {
          case (null) { false };
          case (?loc) { loc == location };
        };
      },
    );
  };

  public query func getNotificationCount() : async Nat {
    // Public information - anyone can view notification count (including guests)
    natMap.size(notifications);
  };

  public query func getUnreadNotificationCount() : async Nat {
    // Public information - anyone can view notification count (including guests)
    let unreadNotifications = Array.filter(
      Iter.toArray(natMap.vals(notifications)),
      func(n : AlertNotification) : Bool { not n.isRead },
    );
    unreadNotifications.size();
  };

  public shared ({ caller }) func deleteNotification(notificationId : Nat) : async () {
    // Only Emergency Desk and Admins can delete notifications
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can delete notifications");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can delete notifications");
    };

    switch (natMap.get(notifications, notificationId)) {
      case (null) { Debug.trap("Notification not found") };
      case (?_) {
        notifications := natMap.delete(notifications, notificationId);
      };
    };
  };

  public shared ({ caller }) func clearAllNotifications() : async () {
    // Only Emergency Desk and Admins can clear all notifications
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can clear notifications");
    };

    if (not isEmergencyDesk(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only Emergency Desk and Admins can clear notifications");
    };

    notifications := natMap.empty<AlertNotification>();
  };

  // Demo Data Types
  public type DemoCoordinate = {
    city : Text;
    latitude : Float;
    longitude : Float;
  };

  public type DemoIncident = {
    id : Nat;
    title : Text;
    description : Text;
    category : IncidentCategory;
    severity : IncidentSeverity;
    location : Text;
    coordinates : DemoCoordinate;
    timestamp : Time.Time;
    status : IncidentStatus;
    isArchived : Bool;
  };

  // Analytics Dashboard Types
  public type IncidentTrend = {
    date : Text;
    count : Nat;
  };

  public type CategoryBreakdown = {
    category : Text;
    count : Nat;
  };

  public type SeverityBreakdown = {
    severity : Text;
    count : Nat;
  };

  public type StatusBreakdown = {
    status : Text;
    count : Nat;
  };

  public type PredictiveTrend = {
    category : Text;
    predictedCount : Nat;
    confidence : Nat;
  };

  public type HeatmapData = {
    location : Text;
    intensity : Nat;
    category : Text;
    confidence : Nat;
  };

  public type AnalyticsDashboard = {
    incidentTrends : [IncidentTrend];
    categoryBreakdown : [CategoryBreakdown];
    severityBreakdown : [SeverityBreakdown];
    statusBreakdown : [StatusBreakdown];
    predictiveTrends : [PredictiveTrend];
    heatmapData : [HeatmapData];
  };

  public query func getAnalyticsDashboard() : async AnalyticsDashboard {
    // Public information - anyone can view analytics dashboard (including guests)

    // Simulate 7-day incident trends
    let incidentTrends : [IncidentTrend] = [
      {
        date = "2024-06-01";
        count = 120;
      },
      {
        date = "2024-06-02";
        count = 135;
      },
      {
        date = "2024-06-03";
        count = 150;
      },
      {
        date = "2024-06-04";
        count = 140;
      },
      {
        date = "2024-06-05";
        count = 160;
      },
      {
        date = "2024-06-06";
        count = 155;
      },
      {
        date = "2024-06-07";
        count = 170;
      },
    ];

    // Expanded category breakdown
    let categoryBreakdown : [CategoryBreakdown] = [
      {
        category = "fire";
        count = 80;
      },
      {
        category = "flooding";
        count = 65;
      },
      {
        category = "medical";
        count = 90;
      },
      {
        category = "theft";
        count = 75;
      },
      {
        category = "hazard";
        count = 60;
      },
      {
        category = "kidnapping";
        count = 55;
      },
      {
        category = "publicHealth";
        count = 70;
      },
      {
        category = "security";
        count = 85;
      },
    ];

    // Expanded severity breakdown
    let severityBreakdown : [SeverityBreakdown] = [
      {
        severity = "low";
        count = 50;
      },
      {
        severity = "medium";
        count = 80;
      },
      {
        severity = "high";
        count = 120;
      },
      {
        severity = "critical";
        count = 150;
      },
    ];

    // Expanded status breakdown
    let statusBreakdown : [StatusBreakdown] = [
      {
        status = "pending";
        count = 100;
      },
      {
        status = "assigned";
        count = 90;
      },
      {
        status = "inProgress";
        count = 110;
      },
      {
        status = "resolved";
        count = 150;
      },
    ];

    // Updated predictive trends
    let predictiveTrends : [PredictiveTrend] = [
      {
        category = "fire";
        predictedCount = 95;
        confidence = 90;
      },
      {
        category = "flooding";
        predictedCount = 80;
        confidence = 85;
      },
      {
        category = "medical";
        predictedCount = 100;
        confidence = 88;
      },
      {
        category = "theft";
        predictedCount = 85;
        confidence = 82;
      },
      {
        category = "hazard";
        predictedCount = 70;
        confidence = 80;
      },
      {
        category = "kidnapping";
        predictedCount = 65;
        confidence = 87;
      },
      {
        category = "publicHealth";
        predictedCount = 80;
        confidence = 86;
      },
      {
        category = "security";
        predictedCount = 90;
        confidence = 89;
      },
    ];

    // Simulated heatmap data
    let heatmapData : [HeatmapData] = [
      {
        location = "Lagos";
        intensity = 85;
        category = "fire";
        confidence = 90;
      },
      {
        location = "Abuja";
        intensity = 70;
        category = "flooding";
        confidence = 80;
      },
      {
        location = "Kano";
        intensity = 65;
        category = "medical";
        confidence = 75;
      },
      {
        location = "Port Harcourt";
        intensity = 75;
        category = "theft";
        confidence = 85;
      },
      {
        location = "Ibadan";
        intensity = 60;
        category = "hazard";
        confidence = 70;
      },
      {
        location = "Kaduna";
        intensity = 80;
        category = "kidnapping";
        confidence = 85;
      },
      {
        location = "Enugu";
        intensity = 75;
        category = "publicHealth";
        confidence = 80;
      },
      {
        location = "Benin City";
        intensity = 70;
        category = "security";
        confidence = 75;
      },
    ];

    {
      incidentTrends;
      categoryBreakdown;
      severityBreakdown;
      statusBreakdown;
      predictiveTrends;
      heatmapData;
    };
  };

  // Demo Data Initialization
  public shared ({ caller }) func initializeDemoData() : async () {
    // Only Admins can initialize demo data
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can initialize demo data");
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Only admins can initialize demo data");
    };

    let demoCoordinates : [DemoCoordinate] = [
      {
        city = "Lagos";
        latitude = 6.5244;
        longitude = 3.3792;
      },
      {
        city = "Abuja";
        latitude = 9.0579;
        longitude = 7.4951;
      },
      {
        city = "Kano";
        latitude = 12.0022;
        longitude = 8.5919;
      },
      {
        city = "Port Harcourt";
        latitude = 4.8156;
        longitude = 7.0498;
      },
      {
        city = "Ibadan";
        latitude = 7.3775;
        longitude = 3.9470;
      },
      {
        city = "Enugu";
        latitude = 6.5244;
        longitude = 7.5086;
      },
      {
        city = "Kaduna";
        latitude = 10.5105;
        longitude = 7.4165;
      },
      {
        city = "Benin City";
        latitude = 6.3350;
        longitude = 5.6037;
      },
      {
        city = "Jos";
        latitude = 9.8965;
        longitude = 8.8583;
      },
      {
        city = "Abeokuta";
        latitude = 7.1608;
        longitude = 3.3481;
      },
      {
        city = "Ilorin";
        latitude = 8.4966;
        longitude = 4.5421;
      },
      {
        city = "Calabar";
        latitude = 4.9589;
        longitude = 8.3229;
      },
      {
        city = "Uyo";
        latitude = 5.0377;
        longitude = 7.9128;
      },
      {
        city = "Owerri";
        latitude = 5.4836;
        longitude = 7.0330;
      },
      {
        city = "Akure";
        latitude = 7.2508;
        longitude = 5.1931;
      },
      {
        city = "Maiduguri";
        latitude = 11.8333;
        longitude = 13.1500;
      },
    ];

    let demoIncidents : [DemoIncident] = [
      {
        id = 0;
        title = "Fire Outbreak in Lagos Market";
        description = "Large fire reported at Balogun Market, Lagos Island. Multiple shops affected.";
        category = #fire;
        severity = #high;
        location = "Lagos";
        coordinates = demoCoordinates[0];
        timestamp = Time.now() - 3600_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 1;
        title = "Flooding in Abuja Residential Area";
        description = "Severe flooding reported in Gwarinpa Estate, Abuja. Roads submerged.";
        category = #flooding;
        severity = #critical;
        location = "Abuja";
        coordinates = demoCoordinates[1];
        timestamp = Time.now() - 7200_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 2;
        title = "Medical Emergency in Kano";
        description = "Multiple injuries reported after road accident near Sabon Gari, Kano.";
        category = #medical;
        severity = #critical;
        location = "Kano";
        coordinates = demoCoordinates[2];
        timestamp = Time.now() - 1800_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 3;
        title = "Theft Incident in Port Harcourt";
        description = "Armed robbery reported at Mile 1 Market, Port Harcourt. Suspects fled scene.";
        category = #theft;
        severity = #high;
        location = "Port Harcourt";
        coordinates = demoCoordinates[3];
        timestamp = Time.now() - 5400_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 4;
        title = "Hazardous Chemical Spill in Ibadan";
        description = "Chemical spill reported at Bodija Market, Ibadan. Area cordoned off.";
        category = #hazard;
        severity = #medium;
        location = "Ibadan";
        coordinates = demoCoordinates[4];
        timestamp = Time.now() - 3600_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 5;
        title = "Kidnapping Attempt in Kaduna";
        description = "Attempted kidnapping reported near Kaduna Polytechnic. Suspects apprehended.";
        category = #kidnapping;
        severity = #critical;
        location = "Kaduna";
        coordinates = demoCoordinates[6];
        timestamp = Time.now() - 7200_000_000_000;
        status = #resolved;
        isArchived = false;
      },
      {
        id = 6;
        title = "Public Health Alert in Enugu";
        description = "Outbreak of cholera reported in Ogui New Layout, Enugu. Health officials deployed.";
        category = #publicHealth;
        severity = #high;
        location = "Enugu";
        coordinates = demoCoordinates[5];
        timestamp = Time.now() - 1800_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 7;
        title = "Security Threat in Benin City";
        description = "Suspicious activity reported near University of Benin. Security patrols increased.";
        category = #security;
        severity = #medium;
        location = "Benin City";
        coordinates = demoCoordinates[7];
        timestamp = Time.now() - 5400_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 8;
        title = "Fire Outbreak in Jos";
        description = "Fire reported at Terminus Market, Jos. Firefighters on scene.";
        category = #fire;
        severity = #high;
        location = "Jos";
        coordinates = demoCoordinates[8];
        timestamp = Time.now() - 3600_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 9;
        title = "Flooding in Abeokuta";
        description = "Heavy flooding reported in Lafenwa Market, Abeokuta. Roads impassable.";
        category = #flooding;
        severity = #critical;
        location = "Abeokuta";
        coordinates = demoCoordinates[9];
        timestamp = Time.now() - 7200_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 10;
        title = "Medical Emergency in Ilorin";
        description = "Multiple injuries reported after building collapse in Ilorin. Rescue operations ongoing.";
        category = #medical;
        severity = #critical;
        location = "Ilorin";
        coordinates = demoCoordinates[10];
        timestamp = Time.now() - 1800_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 11;
        title = "Theft Incident in Calabar";
        description = "Armed robbery reported at Watt Market, Calabar. Police investigating.";
        category = #theft;
        severity = #high;
        location = "Calabar";
        coordinates = demoCoordinates[11];
        timestamp = Time.now() - 5400_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 12;
        title = "Hazardous Material Spill in Uyo";
        description = "Chemical spill reported at Itam Market, Uyo. Area evacuated.";
        category = #hazard;
        severity = #medium;
        location = "Uyo";
        coordinates = demoCoordinates[12];
        timestamp = Time.now() - 3600_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 13;
        title = "Kidnapping Attempt in Owerri";
        description = "Attempted kidnapping reported near Federal Polytechnic, Owerri. Suspects arrested.";
        category = #kidnapping;
        severity = #critical;
        location = "Owerri";
        coordinates = demoCoordinates[13];
        timestamp = Time.now() - 7200_000_000_000;
        status = #resolved;
        isArchived = false;
      },
      {
        id = 14;
        title = "Public Health Alert in Akure";
        description = "Outbreak of malaria reported in Akure. Health officials conducting screenings.";
        category = #publicHealth;
        severity = #high;
        location = "Akure";
        coordinates = demoCoordinates[14];
        timestamp = Time.now() - 1800_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 15;
        title = "Security Threat in Maiduguri";
        description = "Suspicious activity reported near University of Maiduguri. Security patrols increased.";
        category = #security;
        severity = #medium;
        location = "Maiduguri";
        coordinates = demoCoordinates[15];
        timestamp = Time.now() - 5400_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
    ];

    // Add demo incidents to the main incidents map
    for (demoIncident in demoIncidents.vals()) {
      let incident : Incident = {
        id = demoIncident.id;
        title = demoIncident.title;
        description = demoIncident.description;
        category = demoIncident.category;
        severity = demoIncident.severity;
        location = demoIncident.location;
        image = null;
        timestamp = demoIncident.timestamp;
        status = demoIncident.status;
        reporter = null;
        assignedVolunteers = [];
        comments = [];
        isAnonymous = true;
        isArchived = demoIncident.isArchived;
      };

      incidents := natMap.put(incidents, demoIncident.id, incident);
      nextIncidentId += 1;
    };

    // Add predefined announcements
    let predefinedAnnouncements : [(Text, Text)] = [
      (
        "Security Alert: Mass Abduction Rescue Operations Successful in Kebbi State",
        "Authorities have successfully rescued multiple victims from a mass abduction in Kebbi State. Security has been heightened in the region. Residents are advised to remain vigilant and report any suspicious activity immediately."
      ),
      (
        "Flood Response Plan: Volunteers Needed for Relief Coordination in Lagos",
        "Severe flooding has been reported in several areas of Lagos. Volunteers are urgently needed to assist with relief coordination and distribution of emergency supplies. Please register at the nearest community center if you are able to help."
      ),
      (
        "Public Health Notice: New Lassa Fever Containment Measures Implemented Nationwide",
        "The Ministry of Health has implemented new containment measures to combat the spread of Lassa fever. All healthcare facilities are on high alert. Citizens are advised to follow health guidelines and report any symptoms immediately."
      ),
      (
        "Infrastructure Initiative: Community Rebuilding Effort Launched in Niger State",
        "A major community rebuilding initiative has been launched in Niger State following recent disasters. The project aims to restore critical infrastructure and support affected families. Volunteers and donations are welcome."
      ),
      (
        "Safety Campaign: Emergency Response Training Sessions Scheduled Across Regional Centers",
        "Emergency response training sessions have been scheduled at regional centers nationwide. The training will cover first aid, disaster preparedness, and crisis management. All community members are encouraged to participate."
      ),
      (
        "Technology Integration: CECD Introduces AI Risk Prediction Module to Community Hubs",
        "The CECD has introduced a new AI-powered risk prediction module to community hubs. The system will help identify potential threats and improve emergency response times. Training sessions are available for community leaders."
      ),
      (
        "National Coordination: Joint Task Force Formed for Upcoming Security and Disaster Preparedness",
        "A national joint task force has been formed to enhance security and disaster preparedness. The task force will coordinate efforts across regions and ensure rapid response to emergencies. Further updates will be provided as the initiative progresses."
      ),
      (
        "⚠️ Recent Incidents & Security Updates: School Abduction – Government Girls Secondary School, Maga, Kebbi State (Nov 17, 2025)",
        "Armed bandits attacked the Government Girls Secondary School in Maga, Kebbi State, killing the vice principal and abducting 25 schoolgirls. All victims were later released. Security has been heightened in the region."
      ),
      (
        "⚠️ Recent Incidents & Security Updates: Church Attack & Abduction – Christ Apostolic Church, Eruku, Kwara State (Nov 21, 2025)",
        "Gunmen attacked the Christ Apostolic Church in Eruku, Kwara State, killing two worshippers and kidnapping 38 people. All victims were released after four days. Security measures have been increased in the area."
      ),
      (
        "⚠️ Recent Incidents & Security Updates: Mass School Abduction – St. Mary's Catholic School, Papiri, Niger State (Nov 22, 2025)",
        "Over 300 students and 12 teachers were abducted from St. Mary's Catholic School in Papiri, Niger State. 50 managed to escape, but 250+ remain in captivity as of Nov 25. Authorities are conducting rescue operations."
      ),
      (
        "⚠️ Recent Incidents & Security Updates: Farm Abduction – Huyim, Askira-Uba LGA, Borno State (Mid-Nov 2025)",
        "Boko Haram/ISWAP faction abducted 13 teenage girls from farms in Huyim, Askira-Uba LGA, Borno State. One victim later escaped. Security forces are actively searching for the remaining victims."
      ),
      (
        "⚠️ Recent Incidents & Security Updates: Killing of Army Officer – Borno State (Mid-Nov 2025)",
        "Brigadier General Musa Uba was killed by ISWAP in Borno State. The military has launched a major operation in response to the attack. Residents are advised to remain vigilant and report any suspicious activity."
      ),
    ];

    for ((title, message) in predefinedAnnouncements.vals()) {
      let announcement : Announcement = {
        id = nextAnnouncementId;
        title;
        message;
        author = caller;
        timestamp = Time.now();
      };

      announcements := natMap.put(announcements, nextAnnouncementId, announcement);
      nextAnnouncementId += 1;
    };
  };

  public query func getDemoCoordinates() : async [DemoCoordinate] {
    // Public information - anyone can view demo coordinates (including guests)
    let demoCoordinates : [DemoCoordinate] = [
      {
        city = "Lagos";
        latitude = 6.5244;
        longitude = 3.3792;
      },
      {
        city = "Abuja";
        latitude = 9.0579;
        longitude = 7.4951;
      },
      {
        city = "Kano";
        latitude = 12.0022;
        longitude = 8.5919;
      },
      {
        city = "Port Harcourt";
        latitude = 4.8156;
        longitude = 7.0498;
      },
      {
        city = "Ibadan";
        latitude = 7.3775;
        longitude = 3.9470;
      },
      {
        city = "Enugu";
        latitude = 6.5244;
        longitude = 7.5086;
      },
      {
        city = "Kaduna";
        latitude = 10.5105;
        longitude = 7.4165;
      },
      {
        city = "Benin City";
        latitude = 6.3350;
        longitude = 5.6037;
      },
      {
        city = "Jos";
        latitude = 9.8965;
        longitude = 8.8583;
      },
      {
        city = "Abeokuta";
        latitude = 7.1608;
        longitude = 3.3481;
      },
      {
        city = "Ilorin";
        latitude = 8.4966;
        longitude = 4.5421;
      },
      {
        city = "Calabar";
        latitude = 4.9589;
        longitude = 8.3229;
      },
      {
        city = "Uyo";
        latitude = 5.0377;
        longitude = 7.9128;
      },
      {
        city = "Owerri";
        latitude = 5.4836;
        longitude = 7.0330;
      },
      {
        city = "Akure";
        latitude = 7.2508;
        longitude = 5.1931;
      },
      {
        city = "Maiduguri";
        latitude = 11.8333;
        longitude = 13.1500;
      },
    ];

    demoCoordinates;
  };

  public query func getDemoIncidents() : async [DemoIncident] {
    // Public information - anyone can view demo incidents (including guests)
    let demoCoordinates : [DemoCoordinate] = [
      {
        city = "Lagos";
        latitude = 6.5244;
        longitude = 3.3792;
      },
      {
        city = "Abuja";
        latitude = 9.0579;
        longitude = 7.4951;
      },
      {
        city = "Kano";
        latitude = 12.0022;
        longitude = 8.5919;
      },
      {
        city = "Port Harcourt";
        latitude = 4.8156;
        longitude = 7.0498;
      },
      {
        city = "Ibadan";
        latitude = 7.3775;
        longitude = 3.9470;
      },
      {
        city = "Enugu";
        latitude = 6.5244;
        longitude = 7.5086;
      },
      {
        city = "Kaduna";
        latitude = 10.5105;
        longitude = 7.4165;
      },
      {
        city = "Benin City";
        latitude = 6.3350;
        longitude = 5.6037;
      },
      {
        city = "Jos";
        latitude = 9.8965;
        longitude = 8.8583;
      },
      {
        city = "Abeokuta";
        latitude = 7.1608;
        longitude = 3.3481;
      },
      {
        city = "Ilorin";
        latitude = 8.4966;
        longitude = 4.5421;
      },
      {
        city = "Calabar";
        latitude = 4.9589;
        longitude = 8.3229;
      },
      {
        city = "Uyo";
        latitude = 5.0377;
        longitude = 7.9128;
      },
      {
        city = "Owerri";
        latitude = 5.4836;
        longitude = 7.0330;
      },
      {
        city = "Akure";
        latitude = 7.2508;
        longitude = 5.1931;
      },
      {
        city = "Maiduguri";
        latitude = 11.8333;
        longitude = 13.1500;
      },
    ];

    let demoIncidents : [DemoIncident] = [
      {
        id = 0;
        title = "Fire Outbreak in Lagos Market";
        description = "Large fire reported at Balogun Market, Lagos Island. Multiple shops affected.";
        category = #fire;
        severity = #high;
        location = "Lagos";
        coordinates = demoCoordinates[0];
        timestamp = Time.now() - 3600_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 1;
        title = "Flooding in Abuja Residential Area";
        description = "Severe flooding reported in Gwarinpa Estate, Abuja. Roads submerged.";
        category = #flooding;
        severity = #critical;
        location = "Abuja";
        coordinates = demoCoordinates[1];
        timestamp = Time.now() - 7200_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 2;
        title = "Medical Emergency in Kano";
        description = "Multiple injuries reported after road accident near Sabon Gari, Kano.";
        category = #medical;
        severity = #critical;
        location = "Kano";
        coordinates = demoCoordinates[2];
        timestamp = Time.now() - 1800_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 3;
        title = "Theft Incident in Port Harcourt";
        description = "Armed robbery reported at Mile 1 Market, Port Harcourt. Suspects fled scene.";
        category = #theft;
        severity = #high;
        location = "Port Harcourt";
        coordinates = demoCoordinates[3];
        timestamp = Time.now() - 5400_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 4;
        title = "Hazardous Chemical Spill in Ibadan";
        description = "Chemical spill reported at Bodija Market, Ibadan. Area cordoned off.";
        category = #hazard;
        severity = #medium;
        location = "Ibadan";
        coordinates = demoCoordinates[4];
        timestamp = Time.now() - 3600_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 5;
        title = "Kidnapping Attempt in Kaduna";
        description = "Attempted kidnapping reported near Kaduna Polytechnic. Suspects apprehended.";
        category = #kidnapping;
        severity = #critical;
        location = "Kaduna";
        coordinates = demoCoordinates[6];
        timestamp = Time.now() - 7200_000_000_000;
        status = #resolved;
        isArchived = false;
      },
      {
        id = 6;
        title = "Public Health Alert in Enugu";
        description = "Outbreak of cholera reported in Ogui New Layout, Enugu. Health officials deployed.";
        category = #publicHealth;
        severity = #high;
        location = "Enugu";
        coordinates = demoCoordinates[5];
        timestamp = Time.now() - 1800_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 7;
        title = "Security Threat in Benin City";
        description = "Suspicious activity reported near University of Benin. Security patrols increased.";
        category = #security;
        severity = #medium;
        location = "Benin City";
        coordinates = demoCoordinates[7];
        timestamp = Time.now() - 5400_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 8;
        title = "Fire Outbreak in Jos";
        description = "Fire reported at Terminus Market, Jos. Firefighters on scene.";
        category = #fire;
        severity = #high;
        location = "Jos";
        coordinates = demoCoordinates[8];
        timestamp = Time.now() - 3600_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 9;
        title = "Flooding in Abeokuta";
        description = "Heavy flooding reported in Lafenwa Market, Abeokuta. Roads impassable.";
        category = #flooding;
        severity = #critical;
        location = "Abeokuta";
        coordinates = demoCoordinates[9];
        timestamp = Time.now() - 7200_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 10;
        title = "Medical Emergency in Ilorin";
        description = "Multiple injuries reported after building collapse in Ilorin. Rescue operations ongoing.";
        category = #medical;
        severity = #critical;
        location = "Ilorin";
        coordinates = demoCoordinates[10];
        timestamp = Time.now() - 1800_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 11;
        title = "Theft Incident in Calabar";
        description = "Armed robbery reported at Watt Market, Calabar. Police investigating.";
        category = #theft;
        severity = #high;
        location = "Calabar";
        coordinates = demoCoordinates[11];
        timestamp = Time.now() - 5400_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
      {
        id = 12;
        title = "Hazardous Material Spill in Uyo";
        description = "Chemical spill reported at Itam Market, Uyo. Area evacuated.";
        category = #hazard;
        severity = #medium;
        location = "Uyo";
        coordinates = demoCoordinates[12];
        timestamp = Time.now() - 3600_000_000_000;
        status = #assigned;
        isArchived = false;
      },
      {
        id = 13;
        title = "Kidnapping Attempt in Owerri";
        description = "Attempted kidnapping reported near Federal Polytechnic, Owerri. Suspects arrested.";
        category = #kidnapping;
        severity = #critical;
        location = "Owerri";
        coordinates = demoCoordinates[13];
        timestamp = Time.now() - 7200_000_000_000;
        status = #resolved;
        isArchived = false;
      },
      {
        id = 14;
        title = "Public Health Alert in Akure";
        description = "Outbreak of malaria reported in Akure. Health officials conducting screenings.";
        category = #publicHealth;
        severity = #high;
        location = "Akure";
        coordinates = demoCoordinates[14];
        timestamp = Time.now() - 1800_000_000_000;
        status = #pending;
        isArchived = false;
      },
      {
        id = 15;
        title = "Security Threat in Maiduguri";
        description = "Suspicious activity reported near University of Maiduguri. Security patrols increased.";
        category = #security;
        severity = #medium;
        location = "Maiduguri";
        coordinates = demoCoordinates[15];
        timestamp = Time.now() - 5400_000_000_000;
        status = #inProgress;
        isArchived = false;
      },
    ];

    demoIncidents;
  };
};
