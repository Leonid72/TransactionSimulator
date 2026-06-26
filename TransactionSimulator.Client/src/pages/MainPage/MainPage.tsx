import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/Header/Header';
import SimulatorSection from '../../components/SimulatorSection/SimulatorSection';
import ApprovedTransactions from '../../components/ApprovedTransactions/ApprovedTransactions';
import { getApprovedTransactions } from '../../api/transactions';
import type { Transaction } from '../../types';
import styles from './MainPage.module.css';

export default function MainPage() {
  const { isRtl } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await getApprovedTransactions();
      if (res.data.isSuccessful) setTransactions(res.data.data);
    } catch {
      // silent — no transactions yet
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className={`${styles.page} ${isRtl ? styles.rtl : ''}`}>
      <Header />
      <main>
        <SimulatorSection onTransactionSubmitted={fetchTransactions} />
        <div className={styles.divider} />
        <ApprovedTransactions transactions={transactions} loading={loadingTx} />
      </main>
    </div>
  );
}
