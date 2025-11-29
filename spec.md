# CECD – Community Emergency Coordination Dashboard

## Overview
A responsive web application for community emergency coordination with role-based access, real-time incident management, and AI-powered predictive analytics.

## Authentication & Session Management
- Internet Identity integration for secure user authentication
- Session persistence across browser sessions until manual logout
- Secure storage of authenticated identity information in local storage
- Automatic user state reinitialization on application load
- Role-based access control maintained across sessions
- **Post-login redirect flow** that immediately navigates users to the main dashboard after successful Internet Identity authentication
- **Fallback error handling** for authentication failures with user-friendly error messages
- **Loading states and suspense handling** to prevent blank pages during authentication and dashboard data loading
- Graceful handling of delayed authentication responses and dashboard initialization

## User Roles
- **Citizen**: Report incidents, view public information
- **Volunteer**: Accept tasks, respond to incidents within 3km radius
- **Community Leader**: Create announcements, manage community resources
- **Emergency Desk**: Manage incident lifecycle, close resolved incidents

## Core Features

### Incident Reporting System
- Form fields: title, description, category (fire, medical, kidnapping, flooding, publicHealth, hazard, theft, security), severity level (low, medium, high, critical), location
- Optional image upload for evidence
- Auto-generated timestamp and unique incident ID
- Anonymous reporting option (Whisper Mode) with geolocation
- AI-powered auto-suggestion for incident category and severity based on description and uploaded images with confidence scores
- Auto-translation capability for Yoruba, Hausa, and Igbo to English with automatic language detection
- Severity assessment AI logic that estimates severity based on report descriptions, category frequency, and prior patterns

### Map View
- Interactive map displaying all incidents with demo data for key Nigerian cities
- Color-coded markers based on severity levels (low=green, medium=yellow, high=orange, critical=red)
- Toggle between "Active Incidents" and "Predicted Hotspots" views
- Predictive risk mapping with heatmap overlay showing color-coded areas of elevated risk based on incident trends and location data
- Risk heatmap overlay showing predicted hotspots and potential impact zones
- Toggle between map and list views

### Real-Time Incident Feed
- Live feed of all reported incidents including 15 AI-generated demo incidents distributed across Nigeria and nearby regions
- **Past Events: Nigeria & Regional Updates** subsection displaying archived incidents from external data sources
- Comment system for updates and additional information
- Evidence upload capability
- Sort functionality by priority level and timestamp
- Incident status tracking: Pending → Assigned → In Progress → Resolved
- Display of AI confidence scores for severity assessments

### Volunteer Response Coordination
- Display nearby volunteers within 3km radius of incidents
- Task acceptance system for volunteers
- Real-time responder location tracking
- Smart pathfinding for optimal route calculation

### Community Features
- Announcement board for community leaders with 12 predefined announcements:
  - 7 original announcements covering security alerts, flood response, public health notices, infrastructure initiatives, safety campaigns, technology integration, and national coordination
  - **⚠️ Recent Incidents & Security Updates** section containing 5 new security-related announcements:
    1. **School Abduction** – Government Girls Secondary School, Maga, Kebbi State (Nov 17, 2025). Summary: Armed bandits attacked, killed the vice principal, abducted 25 schoolgirls (all later released).
    2. **Church Attack & Abduction** – Christ Apostolic Church, Eruku, Kwara State (Nov 21, 2025). Summary: Gunmen attacked, killed two worshippers, kidnapped 38 people (released after four days).
    3. **Mass School Abduction** – St. Mary's Catholic School, Papiri, Niger State (Nov 22, 2025). Summary: Over 300 students and 12 teachers abducted; 50 escaped; 250+ still in captivity as of Nov 25.
    4. **Farm Abduction** – Huyim, Askira-Uba LGA, Borno State (Mid-Nov 2025). Summary: Boko Haram/ISWAP faction abducted 13 teenage girls; one later escaped.
    5. **Killing of Army Officer** – Borno State (Mid-Nov 2025). Summary: Brigadier General Musa Uba killed by ISWAP.
- Each announcement displays with author attribution and timestamp
- Emergency playbooks and quick reference guides
- Resource hub with emergency contacts and facility information
- Trust score system with achievement badges
- Gamified volunteer recognition system

### AI-Powered Features
- Auto-tagging for incident categories and severity assessment with confidence scores
- Predictive risk mapping using historical incident data and external datasets with color-coded severity visualization
- Trend forecasting displaying dynamic predictions for near-future incidents with category-specific trends
- Multi-language support with auto-translation from Yoruba/Hausa/Igbo to English with automatic language detection
- Risk score calculation for specific locations
- Trend forecasting and impact zone prediction
- **Nigeria: Recent Incidents & Emergencies** analysis for enhanced regional forecasting
- Severity assessment AI that analyzes descriptions, category frequency, and historical patterns

### In-App Notification System
- Dynamic pop-up alerts triggered by predictive engine when new high-risk zones or unusual event forecasts are detected
- Alert messages display location-specific warnings (e.g., "New high-risk area detected near Lagos", "Increased likelihood of flooding in Port Harcourt")
- Enhanced alerts generated from regional incident analysis and trend forecasting
- Alert history panel/notification center for reviewing past alerts
- Real-time notification polling and event subscription system
- Visual alignment with emergency-themed UI supporting light and dark modes

### Admin Dashboard & Analytics
- Incident frequency analysis by type with category breakdown visualization including security, kidnapping, and terrorism categories
- Time series representation of incident rates over demo dates with 7-day visualization
- Active incidents preview mapped against their categories including demo incidents
- Peak risk time identification
- Response time metrics and visualization
- Volunteer performance tracking
- Geographic hotspot mapping with predictive risk overlays
- Trend forecasts and predictive analytics visualization with category-specific predictions incorporating the 5 new security incidents
- Risk heatmap displays with predicted impact zones
- **Nigeria: Recent Incidents & Emergencies** section for archived incident analysis
- Category-trend graphs showing predicted incident patterns with updated security trend data
- Confidence score displays for AI-generated assessments
- Expanded breakdowns for "Incidents by Category", "Incidents by Severity", and "Incident Status Overview" reflecting the new security announcements
- Updated predictive trend curves reflecting new incident and announcement data including the 5 security updates
- Simulated heatmap data with demo figures showcasing ongoing activity and pattern evolution

## Technical Requirements

### Frontend Features
- Mobile-first responsive design
- Light and dark theme toggle
- Offline draft mode for incident reports
- Real-time updates and notifications
- AI-powered incident suggestion interface with confidence scores
- Risk heatmap visualization on maps with predictive overlays
- Predictive analytics dashboard components with trend forecasting and 7-day visualization
- In-app pop-up notification system with alert history panel
- Real-time notification polling interface
- **Past Events: Nigeria & Regional Updates** display in incident feed
- Enhanced notification center with regional trend-based alerts
- Demo data map visualization with Nigerian city coordinates
- Enhanced AnalyticsDashboard with incident category mapping, time series charts, trend forecasting graphs, and expanded breakdowns for categories, severity, and status including security incident trends
- Auto-translation interface for multi-language support with language detection
- Predictive risk mapping visualization with color-coded severity zones
- Session persistence management with automatic state restoration
- **ADADA logo integration** across Header, LoginScreen, favicon, and other relevant components using the ADADA-removebg-preview.png image with consistent scaling and high-resolution rendering for both light and dark modes
- English language interface
- **AnnouncementBoard component** displaying all 12 predefined community announcements including the **⚠️ Recent Incidents & Security Updates** section with proper formatting and official announcement styling
- **Enhanced authentication flow** with immediate dashboard redirect after successful Internet Identity login
- **Loading spinners and suspense boundaries** to handle delayed authentication and data loading gracefully
- **Error boundary components** to catch and display authentication and dashboard loading errors
- **Fallback UI states** for when dashboard data is unavailable or loading

### Backend Data Storage
- User profiles with role assignments and trust scores
- Incident records with full lifecycle tracking and AI-generated tags
- **15 AI-generated demo incidents** distributed across Nigeria and nearby regions with varying categories, realistic timestamps, severity levels, and confidence scores
- **Archived incidents collection** for external data imports with resolved status and anonymous marking
- Volunteer availability and location data
- Community announcements and resources including 12 predefined announcements:
  - 7 original announcements covering security, flood response, public health, infrastructure, safety, technology, and national coordination
  - 5 new security-related announcements under **⚠️ Recent Incidents & Security Updates** with author attribution and timestamps
- Historical data for analytics and AI predictions
- Emergency playbooks and resource information
- External dataset cache for AI model training
- Machine learning model parameters and training data for severity assessment and trend forecasting
- Risk prediction results and confidence scores
- Alert notifications and alert history records
- **Nigeria regional incident data** for enhanced predictive modeling
- **Demo coordinate data** for key Nigerian cities
- Language detection and translation cache for multi-language support
- Predictive risk mapping data with color-coded severity zones
- User session data and authentication state management
- Enhanced analytics data including 7-day metrics, expanded category/severity/status breakdowns, and simulated heatmap data incorporating the 5 new security incidents
- **Authentication session validation data** for post-login flow verification
- **Dashboard initialization state** for tracking successful data loading

### Backend Operations
- Role-based access control and permissions
- Real-time incident status updates
- Geolocation processing for volunteer matching
- Analytics data aggregation with enhanced metrics calculation for 7-day trends and expanded breakdowns including security incident impact analysis
- AI processing for auto-tagging, risk prediction, and severity assessment
- Multi-language translation processing with automatic language detection for Yoruba, Hausa, and Igbo
- PredictiveRiskEngine service for fetching external datasets and training ML models
- **AI-generated demo incident creation** with realistic data across Nigerian regions
- **Archived incident import and registration system** for external data sources
- Risk score calculation for locations with predictive mapping
- Incident category and severity suggestion based on descriptions, images, and historical patterns
- External API integration for civic safety, weather, and traffic data
- Machine learning model training and updates using historical and external data
- **Enhanced trend forecasting** incorporating archived regional incident data with category-specific predictions including security trends from the 5 new announcements
- Alert generation and management system for high-risk zone detection
- Real-time notification event system and subscription management
- **Regional incident analysis** for generating predictive insights and alerts
- **Demo data initialization** for Nigerian city coordinates, 15 sample incidents, and 12 predefined announcements including the 5 new security updates
- Severity assessment AI logic processing with confidence score generation
- Predictive risk mapping computation with color-coded severity visualization
- Internet Identity authentication integration and session management
- User session validation and persistence handling
- Announcement management system for storing and retrieving community announcements including the new security-related entries
- Enhanced analytics computation including simulated heatmap data generation and pattern evolution tracking incorporating security incident trends
- **Post-authentication session verification** to ensure successful login state before dashboard access
- **Dashboard data preloading** to minimize loading delays after authentication
- **Error logging and recovery** for authentication and dashboard initialization failures
- **Session timeout handling** with graceful re-authentication prompts
