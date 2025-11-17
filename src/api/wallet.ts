import axios from './axios';

export interface WalletBalance {
  balance: number; // RWF balance
  coinBalance?: number;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: 'welcome-bonus' | 'admin-adjustment' | 'purchase' | 'refund' | 'topup';
  description: string;
  createdAt: string;
}

export interface CoinWallet {
  balance: number;
  _id: string;
  transactions: Transaction[];
}

export interface TopUpRequest {
  amount: number;
}

export interface TopUpResponse {
  paymentLink: string;
  transactionRef: string;
}

/**
 * Get current wallet balance (RWF and coins)
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  // Get RWF balance from wallet endpoint
  const walletResponse = await axios.get('/payments/wallet/balance');
  const rwfBalance = walletResponse.data.data.balance;
  
  // Get coin balance from user profile
  const profileResponse = await axios.get('/auth/profile');
  const coinBalance = profileResponse.data.data.user.coinWallet.balance;
  
  return {
    balance: rwfBalance,
    coinBalance: coinBalance
  };
};

/**
 * Initiate wallet top-up via Flutterwave
 */
export const topUpWallet = async (amount: number): Promise<TopUpResponse> => {
  const response = await axios.post('/payments/wallet/topup', { amount });
  return response.data.data;
};

/**
 * Get user's coin wallet transactions
 * Note: This comes from the user profile endpoint
 */
export const getCoinTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get('/auth/profile');
  return response.data.data.user.coinWallet.transactions;
};
