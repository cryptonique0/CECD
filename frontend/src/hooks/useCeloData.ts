import { useQuery } from '@tanstack/react-query';

export interface GrantData {
  id: string;
  project: string;
  amount: number;
  currency: 'cUSD' | 'cEUR';
  status: 'pending' | 'approved' | 'sent' | 'settled';
  recipient: string;
  deadline: string;
}

export interface ValidatorData {
  id: string;
  name: string;
  uptime: number;
  latency: number;
  status: 'healthy' | 'degraded' | 'down';
  location: string;
}

// Mock API endpoints - replace with real Celo nodes/subgraph
const MOCK_GRANTS: GrantData[] = [
  {
    id: 'G-1042',
    project: 'Medical Relief Pods',
    amount: 12500,
    currency: 'cUSD',
    status: 'approved',
    recipient: '0x9f1...b27',
    deadline: '2026-01-10',
  },
  {
    id: 'G-1043',
    project: 'Clean Water Units',
    amount: 8200,
    currency: 'cUSD',
    status: 'sent',
    recipient: '0x7a2...cd3',
    deadline: '2026-01-05',
  },
];

const MOCK_VALIDATORS: ValidatorData[] = [
  {
    id: 'val-1',
    name: 'Validator One',
    uptime: 99.98,
    latency: 42,
    status: 'healthy',
    location: 'Frankfurt',
  },
  {
    id: 'val-2',
    name: 'Validator Two',
    uptime: 99.91,
    latency: 55,
    status: 'healthy',
    location: 'Iowa',
  },
];

// Hooks for live data fetching
export const useGrantData = () => {
  return useQuery({
    queryKey: ['celo-grants'],
    queryFn: async () => {
      // In production: fetch from Celo Subgraph or REST API
      // const response = await fetch('https://api.thegraph.com/subgraphs/...');
      // return response.json();
      return MOCK_GRANTS;
    },
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });
};

export const useValidatorHealth = () => {
  return useQuery({
    queryKey: ['celo-validators'],
    queryFn: async () => {
      // In production: fetch from Celo's Validator Set API
      // const response = await fetch('https://forno.celo.org/');
      // return response.json();
      return MOCK_VALIDATORS;
    },
    refetchInterval: 15000, // Poll every 15 seconds
    staleTime: 10000,
  });
};

export const useCeloGasPrice = () => {
  return useQuery({
    queryKey: ['celo-gas-price'],
    queryFn: async () => {
      // In production: fetch from Celo RPC
      return { gasPrice: 0.5, unit: 'gwei' };
    },
    refetchInterval: 5000,
  });
};

export const useCeloCarbonOffset = () => {
  return useQuery({
    queryKey: ['celo-carbon-offset'],
    queryFn: async () => {
      // In production: fetch from Celo carbon registry or ReFi protocol
      return {
        offset: 42.5,
        unit: 'tons CO2',
        renewable: 78,
      };
    },
    refetchInterval: 30000,
  });
};
