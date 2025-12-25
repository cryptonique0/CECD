// frontend/src/hooks/useWeb3Contract.ts
// React Hook for Smart Contract Interaction

import { useEffect, useState, useCallback } from 'react';
import { contractService, ContractService } from '../services/contractService';
import { toast } from 'sonner';

interface UseWeb3ContractReturn {
  isConnected: boolean;
  userAddress: string | null;
  contract: ContractService | null;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  // User functions
  createUserProfile: (name: string, email: string, role: number) => Promise<any>;
  getUserProfile: (address?: string) => Promise<any>;
  // Incident functions
  createIncident: (title: string, description: string, category: number, severity: number, lat: number, lng: number) => Promise<any>;
  getIncidents: () => Promise<any>;
  getIncidentStats: () => Promise<any>;
  // Volunteer functions
  registerVolunteer: (name: string, email: string, skills: string[], lat: number, lng: number) => Promise<any>;
  getVolunteers: () => Promise<any>;
  getAvailableVolunteers: () => Promise<any>;
  // Announcement functions
  getAnnouncements: () => Promise<any>;
}

export const useWeb3Contract = (): UseWeb3ContractReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider on mount
  useEffect(() => {
    const initProvider = async () => {
      try {
        await contractService.initializeProvider();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize provider';
        setError(errorMsg);
        toast.error('Failed to initialize Web3 provider: ' + errorMsg);
      }
    };

    initProvider();
  }, []);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await contractService.connectWallet();
      setUserAddress(address);
      setIsConnected(true);
      toast.success('Wallet connected successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      toast.error('Failed to connect wallet: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    await contractService.disconnectWallet();
    setIsConnected(false);
    setUserAddress(null);
    toast.success('Wallet disconnected');
  }, []);

  // User Profile Functions
  const createUserProfile = useCallback(
    async (name: string, email: string, role: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await contractService.createUserProfile(name, email, role);
        toast.success('User profile created successfully');
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create user profile';
        setError(errorMsg);
        toast.error('Error: ' + errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserProfile = useCallback(
    async (address?: string) => {
      setLoading(true);
      setError(null);
      try {
        const addr = address || userAddress;
        if (!addr) throw new Error('No address provided');
        const profile = await contractService.getUserProfile(addr);
        return profile;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user profile';
        setError(errorMsg);
        toast.error('Error: ' + errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userAddress]
  );

  // Incident Functions
  const createIncident = useCallback(
    async (title: string, description: string, category: number, severity: number, lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await contractService.createIncident(title, description, category, severity, lat, lng);
        toast.success('Incident reported successfully');
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create incident';
        setError(errorMsg);
        toast.error('Error: ' + errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const incidents = await contractService.getAllIncidents();
      return incidents;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch incidents';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIncidentStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await contractService.getIncidentStats();
      return stats;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch incident stats';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Volunteer Functions
  const registerVolunteer = useCallback(
    async (name: string, email: string, skills: string[], lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await contractService.registerVolunteer(name, email, skills, lat, lng);
        toast.success('Volunteer registration successful');
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to register volunteer';
        setError(errorMsg);
        toast.error('Error: ' + errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const volunteers = await contractService.getAllVolunteers();
      return volunteers;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch volunteers';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const volunteers = await contractService.getAvailableVolunteers();
      return volunteers;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch available volunteers';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Announcement Functions
  const getAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const announcements = await contractService.getAllAnnouncements();
      return announcements;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isConnected,
    userAddress,
    contract: contractService,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    createUserProfile,
    getUserProfile,
    createIncident,
    getIncidents,
    getIncidentStats,
    registerVolunteer,
    getVolunteers,
    getAvailableVolunteers,
    getAnnouncements,
  };
};
