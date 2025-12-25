// src/services/contractService.ts
// Smart Contract Integration Service for Emergency Coordination Dashboard

import { ethers } from 'ethers';
import type { Eip1193Provider } from 'ethers';

// Contract configuration
export const CONTRACT_CONFIG = {
  ADDRESS: '0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF',
  CHAIN_ID: 1, // Update based on your deployment network
  RPC_URL: process.env.VITE_RPC_URL || 'https://eth-rpc.example.com',
  ABI: [
    // User Profile Functions
    {
      inputs: [
        { internalType: 'string', name: '_name', type: 'string' },
        { internalType: 'string', name: '_email', type: 'string' },
        { internalType: 'uint8', name: '_appRole', type: 'uint8' }
      ],
      name: 'createUserProfile',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'string', name: '_name', type: 'string' },
        { internalType: 'string', name: '_email', type: 'string' }
      ],
      name: 'updateUserProfile',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
      name: 'verifyUser',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getMyProfile',
      outputs: [
        {
          components: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'email', type: 'string' },
            { internalType: 'uint8', name: 'appRole', type: 'uint8' },
            { internalType: 'bool', name: 'isVerified', type: 'bool' },
            { internalType: 'uint256', name: 'trustScore', type: 'uint256' },
            { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
            { internalType: 'bool', name: 'exists', type: 'bool' }
          ],
          internalType: 'struct EmergencyCoordination.UserProfile',
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
      name: 'getUserProfile',
      outputs: [
        {
          components: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'email', type: 'string' },
            { internalType: 'uint8', name: 'appRole', type: 'uint8' },
            { internalType: 'bool', name: 'isVerified', type: 'bool' },
            { internalType: 'uint256', name: 'trustScore', type: 'uint256' },
            { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
            { internalType: 'bool', name: 'exists', type: 'bool' }
          ],
          internalType: 'struct EmergencyCoordination.UserProfile',
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },

    // Incident Functions
    {
      inputs: [
        { internalType: 'string', name: '_title', type: 'string' },
        { internalType: 'string', name: '_description', type: 'string' },
        { internalType: 'uint8', name: '_category', type: 'uint8' },
        { internalType: 'uint8', name: '_severity', type: 'uint8' },
        { internalType: 'int256', name: '_latitude', type: 'int256' },
        { internalType: 'int256', name: '_longitude', type: 'int256' }
      ],
      name: 'createIncident',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_incidentId', type: 'uint256' },
        { internalType: 'uint8', name: '_status', type: 'uint8' }
      ],
      name: 'updateIncidentStatus',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: '_incidentId', type: 'uint256' }],
      name: 'getIncident',
      outputs: [
        {
          components: [
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'string', name: 'title', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            { internalType: 'uint8', name: 'category', type: 'uint8' },
            { internalType: 'uint8', name: 'severity', type: 'uint8' },
            { internalType: 'uint8', name: 'status', type: 'uint8' },
            { internalType: 'int256', name: 'latitude', type: 'int256' },
            { internalType: 'int256', name: 'longitude', type: 'int256' },
            { internalType: 'address', name: 'reportedBy', type: 'address' },
            { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
            { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
            { internalType: 'address[]', name: 'assignedVolunteers', type: 'address[]' },
            { internalType: 'bool', name: 'exists', type: 'bool' }
          ],
          internalType: 'struct EmergencyCoordination.Incident',
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getAllIncidents',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint8', name: '_status', type: 'uint8' }],
      name: 'getIncidentsByStatus',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function'
    },

    // Volunteer Functions
    {
      inputs: [
        { internalType: 'string', name: '_name', type: 'string' },
        { internalType: 'string', name: '_email', type: 'string' },
        { internalType: 'string[]', name: '_skills', type: 'string[]' },
        { internalType: 'int256', name: '_latitude', type: 'int256' },
        { internalType: 'int256', name: '_longitude', type: 'int256' }
      ],
      name: 'registerVolunteer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint8', name: '_status', type: 'uint8' }],
      name: 'updateVolunteerStatus',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '_volunteer', type: 'address' }],
      name: 'getVolunteer',
      outputs: [
        {
          components: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'email', type: 'string' },
            { internalType: 'string[]', name: 'skills', type: 'string[]' },
            { internalType: 'uint8', name: 'availability', type: 'uint8' },
            { internalType: 'int256', name: 'latitude', type: 'int256' },
            { internalType: 'int256', name: 'longitude', type: 'int256' },
            { internalType: 'bool', name: 'isVerified', type: 'bool' },
            { internalType: 'uint256', name: 'rating', type: 'uint256' },
            { internalType: 'uint256', name: 'tasksCompleted', type: 'uint256' },
            { internalType: 'bool', name: 'exists', type: 'bool' }
          ],
          internalType: 'struct EmergencyCoordination.Volunteer',
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getAllVolunteers',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getAvailableVolunteers',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function'
    },

    // Announcement Functions
    {
      inputs: [
        { internalType: 'string', name: '_title', type: 'string' },
        { internalType: 'string', name: '_message', type: 'string' },
        { internalType: 'uint256', name: '_priority', type: 'uint256' }
      ],
      name: 'createAnnouncement',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: '_announcementId', type: 'uint256' }],
      name: 'getAnnouncement',
      outputs: [
        {
          components: [
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'string', name: 'title', type: 'string' },
            { internalType: 'string', name: 'message', type: 'string' },
            { internalType: 'uint256', name: 'priority', type: 'uint256' },
            { internalType: 'address', name: 'author', type: 'address' },
            { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
            { internalType: 'bool', name: 'exists', type: 'bool' }
          ],
          internalType: 'struct EmergencyCoordination.Announcement',
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getAllAnnouncements',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function'
    },

    // Analytics Functions
    {
      inputs: [],
      name: 'getIncidentStats',
      outputs: [
        { internalType: 'uint256', name: 'total', type: 'uint256' },
        { internalType: 'uint256', name: 'reported', type: 'uint256' },
        { internalType: 'uint256', name: 'inProgress', type: 'uint256' },
        { internalType: 'uint256', name: 'resolved', type: 'uint256' },
        { internalType: 'uint256', name: 'closed', type: 'uint256' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getVolunteerStats',
      outputs: [
        { internalType: 'uint256', name: 'total', type: 'uint256' },
        { internalType: 'uint256', name: 'available', type: 'uint256' },
        { internalType: 'uint256', name: 'busy', type: 'uint256' },
        { internalType: 'uint256', name: 'verified', type: 'uint256' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getTotalUsers',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
};

// Contract Service Class
export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  async initializeProvider() {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not installed');
    }
    const ethereum = window.ethereum as unknown as Eip1193Provider;
    this.provider = new ethers.BrowserProvider(ethereum);
  }

  async connectWallet() {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }
      // Request accounts from the injected provider
      if (typeof (window as any).ethereum?.request === 'function') {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      }
      const signer = await this.provider!.getSigner();
      this.signer = signer;
      this.contract = new ethers.Contract(
        CONTRACT_CONFIG.ADDRESS,
        CONTRACT_CONFIG.ABI,
        signer
      );
      return await signer.getAddress();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    this.signer = null;
    this.contract = null;
  }

  getContract() {
    return this.contract;
  }

  getSigner() {
    return this.signer;
  }

  getProvider() {
    return this.provider;
  }

  // User Profile Functions
  async createUserProfile(name: string, email: string, role: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.createUserProfile(name, email, role);
    return await tx.wait();
  }

  async updateUserProfile(name: string, email: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.updateUserProfile(name, email);
    return await tx.wait();
  }

  async getMyProfile() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getMyProfile();
  }

  async getUserProfile(address: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getUserProfile(address);
  }

  // Incident Functions
  async createIncident(
    title: string,
    description: string,
    category: number,
    severity: number,
    latitude: number,
    longitude: number
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    const latScaled = Math.round(latitude * 1e6);
    const longScaled = Math.round(longitude * 1e6);
    const tx = await this.contract.createIncident(
      title,
      description,
      category,
      severity,
      latScaled,
      longScaled
    );
    return await tx.wait();
  }

  async updateIncidentStatus(incidentId: number, status: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.updateIncidentStatus(incidentId, status);
    return await tx.wait();
  }

  async getIncident(incidentId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getIncident(incidentId);
  }

  async getAllIncidents() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getAllIncidents();
  }

  async getIncidentsByStatus(status: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getIncidentsByStatus(status);
  }

  // Volunteer Functions
  async registerVolunteer(
    name: string,
    email: string,
    skills: string[],
    latitude: number,
    longitude: number
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    const latScaled = Math.round(latitude * 1e6);
    const longScaled = Math.round(longitude * 1e6);
    const tx = await this.contract.registerVolunteer(
      name,
      email,
      skills,
      latScaled,
      longScaled
    );
    return await tx.wait();
  }

  async updateVolunteerStatus(status: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.updateVolunteerStatus(status);
    return await tx.wait();
  }

  async getVolunteer(address: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getVolunteer(address);
  }

  async getAllVolunteers() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getAllVolunteers();
  }

  async getAvailableVolunteers() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getAvailableVolunteers();
  }

  // Announcement Functions
  async createAnnouncement(title: string, message: string, priority: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.createAnnouncement(title, message, priority);
    return await tx.wait();
  }

  async getAnnouncement(announcementId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getAnnouncement(announcementId);
  }

  async getAllAnnouncements() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getAllAnnouncements();
  }

  // Analytics Functions
  async getIncidentStats() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getIncidentStats();
  }

  async getVolunteerStats() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getVolunteerStats();
  }

  async getTotalUsers() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getTotalUsers();
  }

  // Event listeners
  listenToIncidentCreated(callback: (incidentId: bigint, reporter: string, category: number, severity: number) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    this.contract.on('IncidentCreated', callback);
  }

  listenToVolunteerRegistered(callback: (volunteer: string, name: string) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    this.contract.on('VolunteerRegistered', callback);
  }

  listenToAnnouncementCreated(callback: (announcementId: bigint, author: string, priority: number) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    this.contract.on('AnnouncementCreated', callback);
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();
