import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        toast.error(t('wallet.errors.loadFailed'));
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
      toast.error(t('wallet.errors.minTopUp'));
      return;
    }

    try {
      setIsTopUpLoading(true);
      const { paymentLink } = await topUpWallet(numericAmount);
      toast.success(t('wallet.toasts.redirectingFlutterwave'));
      window.location.replace(paymentLink);
    } catch (error) {
      toast.error(t('wallet.errors.topUpFailed'));
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
            <span>{t('common.back')}</span>
          </button>
        </div>
        <div className={styles.hero}>
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>{t('wallet.balance.available')}</p>
            <p className={styles.balanceAmount}>{formatCurrency(balance?.balance ?? 0)}</p>
            <p className={styles.balanceSub}>{t('wallet.balance.bonusLabel', { amount: formatCurrency(balance?.bonusBalance ?? 0) })}</p>
            <div className={styles.glow} />
          </div>
          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>{t('wallet.stats.bonusVault')}</p>
              <p className={styles.statValue}>{formatCurrency(balance?.bonusBalance ?? 0)}</p>
              <p className={styles.statHint}>{t('wallet.stats.bonusHint')}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>{t('wallet.stats.totalAssets')}</p>
              <p className={styles.statValue}>{formatCurrency(balance?.totalBalance ?? 0)}</p>
              <p className={styles.statHint}>{t('wallet.stats.totalHint')}</p>
            </article>
          </div>
        </div>

        <div className={styles.topUpCard}>
          <div className={styles.topUpHeader}>
            <div>
              <h2 className={styles.topUpTitle}>{t('wallet.topUp.title')}</h2>
              <p className={styles.topUpSubtitle}>{t('wallet.topUp.subtitle')}</p>
            </div>
          </div>
          <div className={styles.amountRow}>
            <input
              type="number"
              className={styles.amountInput}
              placeholder={t('wallet.topUp.placeholder')}
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
              {isTopUpLoading ? t('wallet.topUp.connecting') : t('wallet.topUp.cta')}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => toast.success(t('common.comingSoon'))}>
              {t('wallet.voucher.cta')}
            </button>
          </div>
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <div>
              <h2>{t('wallet.transactions.title')}</h2>
              <p className={styles.topUpSubtitle}>{t('wallet.transactions.subtitle')}</p>
            </div>
          </div>
          <div className={styles.transactions}>
            {formattedTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('wallet.transactions.empty')}</p>
              </div>
            ) : (
              <div className={styles.transactionList}>
                {formattedTransactions.map((transaction) => (
                  <div key={transaction._id} className={styles.transactionItem}>
                    <div>
                      <p className={styles.transactionDescription}>{transaction.description || t('wallet.transactions.fallbackDescription')}</p>
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
