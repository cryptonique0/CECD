// Stacks blockchain configuration
export const STACKS_NETWORK = {
  mainnet: {
    name: 'Stacks Mainnet',
    chainId: 1,
    url: 'https://stacks-node-api.mainnet.stacks.co',
    explorer: 'https://explorer.stacks.co',
  },
  testnet: {
    name: 'Stacks Testnet',
    chainId: 2147483648,
    url: 'https://stacks-node-api.testnet.stacks.co',
    explorer: 'https://explorer.stacks.co/?chain=testnet',
  },
};

export const STACKS_CONTRACTS = {
  mainnet: {
    emergencyFund: 'SP000000000000000000002Q6VF78.emergency-fund',
    donation: 'SP000000000000000000002Q6VF78.donation-contract',
  },
  testnet: {
    emergencyFund: 'ST000000000000000000002AMW42H.emergency-fund',
    donation: 'ST000000000000000000002AMW42H.donation-contract',
  },
};

export const STACKS_TOKENS = {
  STX: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
    icon: '₿',
  },
};

export type StacksNetworkType = 'mainnet' | 'testnet';
