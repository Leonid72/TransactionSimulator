import { useRef } from 'react';
import type { Transaction } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ApprovedTransactions.module.css';

interface Props {
  transactions: Transaction[];
  loading: boolean;
}

export default function ApprovedTransactions({ transactions, loading }: Props) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t.approvedTransactions}</h2>

      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.carousel} ref={scrollRef}>
          {loading ? (
            <div className={styles.message}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div className={styles.message}>{t.noTransactions}</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className={styles.card}>
                <p className={styles.cardTime}>
                  {t.time}: {tx.localTime}
                </p>
                <p className={styles.cardZone}>
                  {t.timeZone}: {tx.region}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
