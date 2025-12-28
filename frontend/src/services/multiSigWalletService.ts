/**
 * Multi-Signature Wallet Service
 * Handles multi-sig wallets for community treasury and emergency fund management
 */

export interface MultiSigWallet {
  address: string;
  name: string;
  owners: string[];
  requiredSignatures: number;
  balance: string;
  createdAt: number;
}

export interface MultiSigTransaction {
  id: string;
  walletAddress: string;
  to: string;
  amount: string;
  data?: string;
  purpose: string;
  proposedBy: string;
  signatures: Map<string, string>;
  requiredSignatures: number;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  createdAt: number;
  executedAt?: number;
}

class MultiSigWalletService {
  private wallets: Map<string, MultiSigWallet> = new Map();
  private transactions: Map<string, MultiSigTransaction> = new Map();

  /**
   * Create a new multi-signature wallet
   */
  async createWallet(
    name: string,
    owners: string[],
    requiredSignatures: number
  ): Promise<MultiSigWallet> {
    if (requiredSignatures > owners.length) {
      throw new Error('Required signatures cannot exceed number of owners');
    }

    const wallet: MultiSigWallet = {
      address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      name,
      owners,
      requiredSignatures,
      balance: '0',
      createdAt: Date.now(),
    };

    this.wallets.set(wallet.address, wallet);
    return wallet;
  }

  /**
   * Get wallet details
   */
  getWallet(address: string): MultiSigWallet | undefined {
    return this.wallets.get(address);
  }

  /**
   * Propose a transaction
   */
  async proposeTransaction(
    walletAddress: string,
    to: string,
    amount: string,
    purpose: string,
    proposedBy: string
  ): Promise<MultiSigTransaction> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const transaction: MultiSigTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      to,
      amount,
      purpose,
      proposedBy,
      signatures: new Map(),
      requiredSignatures: wallet.requiredSignatures,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transactionId: string, signer: string, signature: string): Promise<MultiSigTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const wallet = this.wallets.get(transaction.walletAddress);
    if (!wallet || !wallet.owners.includes(signer)) {
      throw new Error('Signer is not an owner of this wallet');
    }

    if (transaction.signatures.has(signer)) {
      throw new Error('Signer has already signed this transaction');
    }

    transaction.signatures.set(signer, signature);

    // Check if we have enough signatures
    if (transaction.signatures.size >= transaction.requiredSignatures) {
      transaction.status = 'approved';
      await this.executeTransaction(transactionId);
    }

    return transaction;
  }

  /**
   * Execute an approved transaction
   */
  private async executeTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.signatures.size < transaction.requiredSignatures) {
      throw new Error('Not enough signatures to execute');
    }

    try {
      // Simulate transaction execution
      const wallet = this.wallets.get(transaction.walletAddress);
      if (wallet) {
        const currentBalance = parseFloat(wallet.balance);
        const txAmount = parseFloat(transaction.amount);

        if (currentBalance >= txAmount) {
          wallet.balance = (currentBalance - txAmount).toFixed(2);
          transaction.status = 'executed';
          transaction.executedAt = Date.now();
        } else {
          transaction.status = 'rejected';
        }
      }
    } catch (error) {
      transaction.status = 'rejected';
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  getTransaction(transactionId: string): MultiSigTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all transactions for a wallet
   */
  getWalletTransactions(walletAddress: string): MultiSigTransaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.walletAddress === walletAddress
    );
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(walletAddress?: string): MultiSigTransaction[] {
    const pending = Array.from(this.transactions.values()).filter(
      tx => tx.status === 'pending'
    );

    if (walletAddress) {
      return pending.filter(tx => tx.walletAddress === walletAddress);
    }

    return pending;
  }

  /**
   * Add funds to wallet
   */
  async addFunds(walletAddress: string, amount: string): Promise<MultiSigWallet> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(wallet.balance);
    wallet.balance = (currentBalance + parseFloat(amount)).toFixed(2);

    return wallet;
  }

  /**
   * Get all wallets
   */
  getAllWallets(): MultiSigWallet[] {
    return Array.from(this.wallets.values());
  }

  /**
   * Get wallet statistics
   */
  getWalletStats(): {
    totalWallets: number;
    totalBalance: string;
    pendingTransactions: number;
    totalTransactions: number;
    avgSignaturesRequired: number;
  } {
    const allWallets = Array.from(this.wallets.values());
    const totalBalance = allWallets
      .reduce((sum, w) => sum + parseFloat(w.balance), 0)
      .toFixed(2);

    const allTransactions = Array.from(this.transactions.values());
    const pendingTransactions = allTransactions.filter(t => t.status === 'pending').length;
    const avgSignaturesRequired = allWallets.length > 0
      ? allWallets.reduce((sum, w) => sum + w.requiredSignatures, 0) / allWallets.length
      : 0;

    return {
      totalWallets: allWallets.length,
      totalBalance,
      pendingTransactions,
      totalTransactions: allTransactions.length,
      avgSignaturesRequired: Math.round(avgSignaturesRequired * 100) / 100,
    };
  }

  /**
   * Create emergency fund wallet
   */
  async createEmergencyFund(
    communityName: string,
    emergencyCoordinators: string[]
  ): Promise<MultiSigWallet> {
    // Emergency fund requires 2-of-3 or 3-of-5 signatures
    const requiredSignatures = Math.ceil(emergencyCoordinators.length * 0.6);

    return this.createWallet(
      `${communityName} Emergency Fund`,
      emergencyCoordinators,
      requiredSignatures
    );
  }

  /**
   * Create community relief wallet
   */
  async createReliefWallet(
    communityName: string,
    trustees: string[]
  ): Promise<MultiSigWallet> {
    return this.createWallet(
      `${communityName} Relief Fund`,
      trustees,
      Math.ceil(trustees.length * 0.5) // Majority rule
    );
  }

  /**
   * Propose emergency relief payment
   */
  async proposeReliefPayment(
    walletAddress: string,
    recipient: string,
    amount: string,
    reason: string,
    proposedBy: string
  ): Promise<MultiSigTransaction> {
    return this.proposeTransaction(
      walletAddress,
      recipient,
      amount,
      `Emergency Relief: ${reason}`,
      proposedBy
    );
  }

  /**
   * Get transaction approval status
   */
  getApprovalStatus(transactionId: string): {
    transaction: MultiSigTransaction | undefined;
    approvalsNeeded: number;
    approvalsReceived: number;
    approvers: string[];
    pendingApprovers: string[];
  } {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        transaction: undefined,
        approvalsNeeded: 0,
        approvalsReceived: 0,
        approvers: [],
        pendingApprovers: [],
      };
    }

    const wallet = this.wallets.get(transaction.walletAddress);
    const approvers = Array.from(transaction.signatures.keys());
    const pendingApprovers = wallet
      ? wallet.owners.filter(owner => !approvers.includes(owner))
      : [];

    return {
      transaction,
      approvalsNeeded: transaction.requiredSignatures,
      approvalsReceived: transaction.signatures.size,
      approvers,
      pendingApprovers,
    };
  }

  /**
   * Cancel a pending transaction
   */
  async cancelTransaction(transactionId: string, cancelledBy: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.proposedBy !== cancelledBy) {
      throw new Error('Only proposer can cancel transaction');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Can only cancel pending transactions');
    }

    transaction.status = 'rejected';
  }
}

export const multiSigWalletService = new MultiSigWalletService();
