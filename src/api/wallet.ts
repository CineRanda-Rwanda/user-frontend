import axios from './axios';

export interface WalletBalance {
  balance: number;
  bonusBalance: number;
  totalBalance: number;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface TopUpRequest {
  amount: number;
  provider?: string;
}

export interface TopUpResponse {
  paymentLink: string;
  transactionRef: string;
}

/**
 * Get current wallet balance
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await axios.get('/payments/wallet/balance');
  return response.data.data.wallet;
};

/**
 * Initiate wallet top-up via Flutterwave
 */
export const topUpWallet = async (amount: number, provider: string = 'flutterwave'): Promise<TopUpResponse> => {
  const response = await axios.post('/payments/wallet/topup', { amount, provider });
  return response.data.data;
};

/**
 * Get user's wallet transactions
 */
export const getWalletTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get('/auth/profile');
  return response.data.data.user.wallet.transactions;
};
