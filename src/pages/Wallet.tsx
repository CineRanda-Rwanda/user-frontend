import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import {
  getWalletBalance,
  getWalletTransactions,
  topUpWallet,
  Transaction,
  WalletBalance,
} from '../api/wallet';
import { formatCurrency } from '../utils/formatters';
import styles from './Wallet.module.css';

const quickAmounts = [2000, 5000, 10000, 20000];

const Wallet = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }
    navigate('/browse');
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletBalance, walletTransactions] = await Promise.all([
          getWalletBalance(),
          getWalletTransactions(),
        ]);
        setBalance(walletBalance);
        setTransactions(walletTransactions);
      } catch (error) {
        toast.error('Unable to load wallet details. Please retry.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formattedTransactions = useMemo(() => {
    return transactions.map((transaction) => ({
      ...transaction,
      displayAmount: `${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}`,
      displayDate: new Date(transaction.createdAt).toLocaleString('en-RW', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [transactions]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleTopUp = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1000) {
      toast.error('Enter at least FRW 1,000 to top up.');
      return;
    }

    try {
      setIsTopUpLoading(true);
      const { paymentLink } = await topUpWallet(numericAmount);
      toast.success('Redirecting you to Flutterwave...');
      window.open(paymentLink, '_blank');
    } catch (error) {
      toast.error('Top-up failed. Please try again.');
    } finally {
      setIsTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader />
      </div>
    );
  }

  return (
    <Layout>
      <section className={styles.page}>
        <div className={styles.pageToolbar}>
          <button type="button" className={styles.backButton} onClick={handleGoBack}>
            <FiArrowLeft />
            <span>Back</span>
          </button>
        </div>
        <div className={styles.hero}>
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <p className={styles.balanceAmount}>{formatCurrency(balance?.balance ?? 0)}</p>
            <p className={styles.balanceSub}>Bonus {formatCurrency(balance?.bonusBalance ?? 0)}</p>
            <div className={styles.glow} />
          </div>
          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Bonus Vault</p>
              <p className={styles.statValue}>{formatCurrency(balance?.bonusBalance ?? 0)}</p>
              <p className={styles.statHint}>Auto-applied on eligible rentals.</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Total Assets</p>
              <p className={styles.statValue}>{formatCurrency(balance?.totalBalance ?? 0)}</p>
              <p className={styles.statHint}>Cash + promo credits.</p>
            </article>
          </div>
        </div>

        <div className={styles.topUpCard}>
          <div className={styles.topUpHeader}>
            <div>
              <h2 className={styles.topUpTitle}>Instant Top-Up</h2>
              <p className={styles.topUpSubtitle}>Fund your wallet via Flutterwave in seconds.</p>
            </div>
          </div>
          <div className={styles.amountRow}>
            <input
              type="number"
              className={styles.amountInput}
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min={1000}
            />
            <div className={styles.quickButtons}>
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={styles.quickButton}
                  onClick={() => handleQuickAmount(value)}
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.topUpAction}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleTopUp}
              disabled={isTopUpLoading}
            >
              {isTopUpLoading ? 'Connecting to Flutterwave…' : 'Top Up Wallet'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => toast.success('Coming soon!')}>
              Redeem Voucher
            </button>
          </div>
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Recent Transactions</h2>
              <p className={styles.topUpSubtitle}>A live feed of your rentals, subscriptions, and bonuses.</p>
            </div>
          </div>
          <div className={styles.transactions}>
            {formattedTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No transactions yet. Fund your wallet to get started.</p>
              </div>
            ) : (
              <div className={styles.transactionList}>
                {formattedTransactions.map((transaction) => (
                  <div key={transaction._id} className={styles.transactionItem}>
                    <div>
                      <p className={styles.transactionDescription}>{transaction.description || 'Wallet activity'}</p>
                      <p className={styles.transactionDate}>{transaction.displayDate}</p>
                    </div>
                    <span className={
                      transaction.type === 'credit' ? styles.amountPositive : styles.amountNegative
                    }>
                      {transaction.displayAmount}
                    </span>
                    <span className={styles.transactionDate}>{transaction.type.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Wallet;
