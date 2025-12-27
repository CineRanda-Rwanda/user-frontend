import React, { useEffect, useState } from 'react';
import { getWalletBalance, topUpWallet, getWalletTransactions } from '../../api/wallet';
import type { WalletBalance, Transaction } from '../../api/wallet';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount < 100) {
      toast.error('Minimum top-up amount is 100 FRW');
      return;
    }

    try {
      const response = await topUpWallet(amount);
      toast.success('Redirecting to payment...');
          // Redirect to Flutterwave checkout in the same tab
      if (response.paymentLink) {
            window.location.replace(response.paymentLink);
      } else {
        toast.error('Payment link not generated');
      }
      setShowTopUpModal(false);
      setTopUpAmount('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate top-up');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FRW Balance */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-90">FRW Balance</p>
              <p className="text-4xl font-bold mt-2">{formatCurrency(balance?.balance || 0)}</p>
              <p className="text-sm mt-1 opacity-80">Rwandan Francs</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="mt-4 w-full bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Top Up Wallet
          </button>
        </div>

        {/* Bonus Balance */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-90">Bonus Balance</p>
              <p className="text-4xl font-bold mt-2">{formatCurrency(balance?.bonusBalance || 0)}</p>
              <p className="text-sm mt-1 opacity-80">Bonus Credits</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            <p>Earn bonus through promotions</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex justify-between items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{transaction.description || 'Transaction'}</p>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(transaction.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-sm text-gray-400 capitalize">{transaction.type.replace('-', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Top Up Wallet</h3>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (FRW)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-400 mt-1">Minimum: 100 FRW</p>
              </div>

              <div className="flex gap-2">
                {[500, 1000, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTopUp}
                disabled={!topUpAmount || Number(topUpAmount) < 100}
                className="w-full bg-yellow-500 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
