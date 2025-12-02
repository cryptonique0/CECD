export interface Donation {
  id: string;
  donor: string;
  amount: string;
  token: 'CELO' | 'cUSD' | 'cEUR';
  txHash: string;
  timestamp: Date;
  purpose?: string;
}

export interface DonationStats {
  totalCELO: number;
  totalcUSD: number;
  totalcEUR: number;
  donorCount: number;
  lastDonation?: Donation;
}
