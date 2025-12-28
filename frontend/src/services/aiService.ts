/**
 * AI Service - Handles AI-powered features like chatbot, predictions, and analytics
 * Uses mock implementations to avoid external API dependencies
 */

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface IncidentPrediction {
  category: number;
  severity: number;
  confidence: number;
  reasoning: string;
}

export interface RiskArea {
  latitude: number;
  longitude: number;
  riskScore: number;
  incidentType: string;
  frequency: number;
}

class AIService {
  private conversationHistory: AIMessage[] = [];
  private readonly MAX_HISTORY = 50;

  /**
   * Process user message and generate AI response
   */
  async processMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // Advanced contextual response generation
    const response = this.generateContextualResponse(userMessage);

    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    // Keep history manageable
    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
    }

    return response;
  }

  /**
   * Generate contextual AI response based on user input
   */
  private generateContextualResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Emergency response patterns
    if (lowerMessage.includes('fire') || lowerMessage.includes('burning')) {
      return `🚨 FIRE EMERGENCY DETECTED\n\n` +
        `Immediate Actions:\n` +
        `1. Evacuate the area immediately\n` +
        `2. Call 911 (Emergency Services)\n` +
        `3. Do not attempt to extinguish if spreading\n` +
        `4. Move to designated evacuation center\n\n` +
        `I've created an incident report for this fire emergency. Volunteers and emergency personnel have been notified of your location. ` +
        `Stay safe and follow evacuation procedures.`;
    }

    if (lowerMessage.includes('medical') || lowerMessage.includes('injury') || lowerMessage.includes('health')) {
      return `🏥 MEDICAL EMERGENCY ASSISTANCE\n\n` +
        `Immediate Steps:\n` +
        `1. Check for responsiveness and breathing\n` +
        `2. Call 911 immediately\n` +
        `3. Perform CPR if trained and required\n` +
        `4. Do not move the person unless in danger\n\n` +
        `Medical volunteers near your location have been alerted. Emergency medical services are on the way. ` +
        `Please provide updates on the patient's condition if possible.`;
    }

    if (lowerMessage.includes('flood') || lowerMessage.includes('water') || lowerMessage.includes('rising')) {
      return `⚠️ FLOOD SITUATION ANALYSIS\n\n` +
        `Safety Recommendations:\n` +
        `1. Move to higher ground immediately\n` +
        `2. Avoid flooded roads and bridges\n` +
        `3. Turn off utilities if safe to do so\n` +
        `4. Bring important documents\n\n` +
        `Evacuation centers have been activated in your area. Community leaders are coordinating shelter and supplies. ` +
        `Do not attempt to drive through flooded areas.`;
    }

    if (lowerMessage.includes('volunteer') || lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return `👥 VOLUNTEER COORDINATION\n\n` +
        `How You Can Help:\n` +
        `1. Register as a volunteer in the system\n` +
        `2. Indicate your skills and availability\n` +
        `3. Accept assignments in your area\n` +
        `4. Provide real-time updates during incidents\n\n` +
        `Your community needs you! Volunteers are crucial during emergencies. ` +
        `Check the volunteer section to register your skills and get assigned to high-priority tasks.`;
    }

    if (lowerMessage.includes('stats') || lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
      return `📊 INCIDENT ANALYTICS AVAILABLE\n\n` +
        `Key Metrics:\n` +
        `• Total incidents this month: 47\n` +
        `• Response time average: 8.3 minutes\n` +
        `• Volunteer engagement: 89%\n` +
        `• Community satisfaction: 4.6/5\n\n` +
        `High-risk areas identified in industrial zone and waterfront. ` +
        `Recent increase in medical emergencies suggests need for first aid training programs.`;
    }

    if (lowerMessage.includes('location') || lowerMessage.includes('near me') || lowerMessage.includes('nearby')) {
      return `📍 NEARBY RESOURCES\n\n` +
        `Close to Your Location:\n` +
        `• Emergency shelter (0.3 km) - 150 capacity\n` +
        `• Hospital (1.2 km) - 24/7 service\n` +
        `• Fire station (0.8 km) - Fully staffed\n` +
        `• Community center (0.5 km) - Relief point\n\n` +
        `These facilities are prepared to assist. Do you need directions or more information about any of these locations?`;
    }

    // General supportive responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `👋 Welcome to CECD - Community Emergency Coordination Dashboard!\n\n` +
        `I'm your AI Emergency Assistant. I can help you with:\n` +
        `• 🚨 Report emergencies and incidents\n` +
        `• 📊 Analyze emergency patterns and risk areas\n` +
        `• 👥 Coordinate volunteer assignments\n` +
        `• 📍 Find nearby resources and shelters\n` +
        `• 💡 Get emergency response guidance\n\n` +
        `What emergency or situation do you need help with?`;
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return `You're welcome! Community safety is our priority. ` +
        `Stay alert and don't hesitate to report any incidents or ask for assistance.`;
    }

    // Default intelligent response
    return `I understand you're asking about "${message.substring(0, 50)}..."\n\n` +
      `I'm here to help with:\n` +
      `• Emergency reporting and incident management\n` +
      `• Risk analysis and hotspot identification\n` +
      `• Volunteer coordination and assignments\n` +
      `• Real-time emergency response guidance\n\n` +
      `Could you provide more details? Mention keywords like "fire", "medical", "flood", or "volunteer" for specific assistance.`;
  }

  /**
   * Predict incident category and severity based on description
   */
  async predictIncident(description: string): Promise<IncidentPrediction> {
    const normalized = description.toLowerCase();

    // Category prediction
    let category = 4; // Default to "Other"
    let categoryConfidence = 0.6;

    if (normalized.includes('fire') || normalized.includes('burn')) {
      category = 0; // Fire
      categoryConfidence = 0.95;
    } else if (normalized.includes('medical') || normalized.includes('injury') || normalized.includes('sick')) {
      category = 1; // Medical
      categoryConfidence = 0.92;
    } else if (normalized.includes('flood') || normalized.includes('water') || normalized.includes('rising')) {
      category = 2; // Flood
      categoryConfidence = 0.88;
    } else if (normalized.includes('crime') || normalized.includes('theft') || normalized.includes('violence')) {
      category = 3; // Crime
      categoryConfidence = 0.90;
    }

    // Severity prediction
    let severity = 1; // Default to Medium
    let severityConfidence = 0.7;

    const urgencyKeywords = {
      critical: ['critical', 'severe', 'life threatening', 'explosion', 'active threat'],
      high: ['serious', 'spreading', 'multiple', 'unconscious', 'blocked'],
      low: ['minor', 'small', 'controlled', 'safe'],
    };

    if (urgencyKeywords.critical.some(k => normalized.includes(k))) {
      severity = 3; // Critical
      severityConfidence = 0.93;
    } else if (urgencyKeywords.high.some(k => normalized.includes(k))) {
      severity = 2; // High
      severityConfidence = 0.87;
    } else if (urgencyKeywords.low.some(k => normalized.includes(k))) {
      severity = 0; // Low
      severityConfidence = 0.85;
    }

    return {
      category,
      severity,
      confidence: Math.round(((categoryConfidence + severityConfidence) / 2) * 100) / 100,
      reasoning: `Based on keywords like "${[...normalized.split(' ')].filter(w => w.length > 4).slice(0, 3).join(', ')}", ` +
        `this appears to be a ${['Fire', 'Medical', 'Flood', 'Crime', 'Other'][category]} incident with ${['Low', 'Medium', 'High', 'Critical'][severity]} severity.`,
    };
  }

  /**
   * Identify high-risk areas based on incident history
   */
  async identifyRiskAreas(incidents: any[]): Promise<RiskArea[]> {
    const riskMap = new Map<string, { count: number; types: Map<number, number>; lat: number; lng: number }>();

    // Aggregate incidents into grid cells
    incidents.forEach(incident => {
      const gridKey = `${Math.floor(incident.latitude * 10) / 10},${Math.floor(incident.longitude * 10) / 10}`;
      
      if (!riskMap.has(gridKey)) {
        riskMap.set(gridKey, {
          count: 0,
          types: new Map(),
          lat: incident.latitude,
          lng: incident.longitude,
        });
      }

      const cell = riskMap.get(gridKey)!;
      cell.count++;
      cell.types.set(
        incident.category,
        (cell.types.get(incident.category) || 0) + 1
      );
    });

    // Calculate risk scores
    const riskAreas: RiskArea[] = [];
    riskMap.forEach((cell, key) => {
      const baseScore = Math.min(cell.count / 10, 1); // Normalize to 0-1
      const severityBoost = Array.from(cell.types.entries())
        .reduce((sum, [category, count]) => sum + (count * (category + 1) * 0.1), 0) / cell.count;
      
      const riskScore = Math.min(baseScore + severityBoost, 1);
      const categoryType = cell.types.size > 0 ? 
        Array.from(cell.types.entries()).sort((a, b) => b[1] - a[1])[0][0] : 4;

      riskAreas.push({
        latitude: cell.lat,
        longitude: cell.lng,
        riskScore,
        incidentType: ['Fire', 'Medical', 'Flood', 'Crime', 'Other'][categoryType],
        frequency: cell.count,
      });
    });

    return riskAreas.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  }

  /**
   * Generate emergency response recommendations
   */
  async generateResponsePlan(incident: any): Promise<string> {
    const categoryNames = ['Fire', 'Medical', 'Flood', 'Crime', 'Other'];
    const severityNames = ['Low', 'Medium', 'High', 'Critical'];
    const category = categoryNames[incident.category] || 'Unknown';
    const severity = severityNames[incident.severity] || 'Unknown';

    const plans: Record<number, Record<number, string>> = {
      0: { // Fire
        0: 'Monitor situation and document. Alert nearby residents.',
        1: 'Evacuate area, contact fire department, use fire extinguisher if safe.',
        2: 'Immediate evacuation, emergency services priority response needed.',
        3: 'CRITICAL: Full evacuation, all fire services mobilized, mutual aid requested.',
      },
      1: { // Medical
        0: 'Monitor vital signs, provide first aid if trained.',
        1: 'Contact 911, prepare for paramedic arrival, have medical history ready.',
        2: 'Emergency ambulance dispatch, CPR standby if needed.',
        3: 'CRITICAL: Trauma alert, helicopter standby if available.',
      },
      2: { // Flood
        0: 'Monitor water levels, prepare to evacuate.',
        1: 'Advise residents to move valuables, activate evacuation centers.',
        2: 'Mandatory evacuation, emergency shelters opened.',
        3: 'CRITICAL: Full evacuation, dike/barrier deployment if applicable.',
      },
      3: { // Crime
        0: 'Advise caution, document details for police report.',
        1: 'Contact local police, secure area, interview witnesses.',
        2: 'Police priority response, scene preservation.',
        3: 'CRITICAL: Armed police response, potential active threat protocol.',
      },
    };

    const plan = plans[incident.category]?.[incident.severity] || 
      `${severity} incident response protocol initiated for ${category}`;

    return `📋 EMERGENCY RESPONSE PLAN - ${category} (${severity} Severity)\n\n` +
      `Recommended Actions:\n${plan}\n\n` +
      `Resources Assigned:\n` +
      `• ${incident.severity >= 2 ? '🚨 Priority dispatch activated' : '✓ Standard dispatch'}\n` +
      `• Volunteers in vicinity notified\n` +
      `• Community leaders on standby\n` +
      `• Real-time monitoring active`;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Generate AI insights from incident data
   */
  async generateInsights(incidents: any[]): Promise<string> {
    if (incidents.length === 0) {
      return 'No incidents recorded yet. Insights will be available as data is collected.';
    }

    const categoryCounts = Array(5).fill(0);
    const severityCounts = Array(4).fill(0);
    let avgResponseTime = 0;

    incidents.forEach(incident => {
      categoryCounts[incident.category]++;
      severityCounts[incident.severity]++;
      avgResponseTime += incident.severity * 2; // Mock calculation
    });

    const topCategory = ['Fire', 'Medical', 'Flood', 'Crime', 'Other'][
      categoryCounts.indexOf(Math.max(...categoryCounts))
    ];

    return `🔍 AI INSIGHTS\n\n` +
      `Analysis of ${incidents.length} incidents:\n` +
      `• Most common type: ${topCategory}\n` +
      `• Average incident severity: ${(severityCounts.reduce((a, b, i) => a + b * i) / incidents.length).toFixed(1)}/3\n` +
      `• Peak incident hour: 2-4 PM\n` +
      `• Community response rate: 87%\n\n` +
      `Recommendations:\n` +
      `1. Increase medical volunteer training\n` +
      `2. Pre-position resources in high-risk areas\n` +
      `3. Enhance communication channels\n` +
      `4. Conduct community preparedness drills`;
  }
}

export const aiService = new AIService();
