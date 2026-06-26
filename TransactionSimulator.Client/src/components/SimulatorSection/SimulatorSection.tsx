import { useState, useCallback } from 'react';
import CountrySearch from '../CountrySearch/CountrySearch';
import TimePicker from '../TimePicker/TimePicker';
import { useLanguage } from '../../context/LanguageContext';
import { submitTransaction } from '../../api/transactions';
import type { Transaction } from '../../types';
import styles from './SimulatorSection.module.css';

const CURRENCIES: Record<string, string> = {
  France: 'EUR',
  Israel: 'ILS',
  Cyprus: 'EUR',
  Italy: 'EUR',
};

interface Props {
  onTransactionSubmitted: () => void;
}

export default function SimulatorSection({ onTransactionSubmitted }: Props) {
  const { t } = useLanguage();
  const [region, setRegion] = useState('');
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);
  const [showPicker, setShowPicker] = useState(true);
  const [result, setResult] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = useCallback(async (h: number, m: number) => {
    setHour(h);
    setMinute(m);

    if (!region) {
      setError('Please select a region first.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await submitTransaction({
        amount: 100,
        currency: CURRENCIES[region] ?? 'USD',
        region,
      });
      if (res.data.isSuccessful) {
        setResult(res.data.data);
        onTransactionSubmitted();
      } else {
        setError(res.data.message || 'Simulation failed.');
      }
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [region, onTransactionSubmitted]);

  const handleCancel = () => {
    setResult(null);
    setError('');
    setShowPicker(false);
  };

  const displayTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <div className={styles.section}>
      <div className={styles.left}>
        <CountrySearch value={region} onChange={setRegion} />

        <div className={styles.pickerWrapper}>
          {showPicker ? (
            <TimePicker
              hour={hour}
              minute={minute}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <button
              className={styles.togglePicker}
              onClick={() => setShowPicker(true)}
              type="button"
            >
              ▼ {t.enterTime}: {displayTime}
            </button>
          )}
        </div>

        {loading && <p className={styles.loading}>{t.submitting}</p>}
        {error && <p className={styles.error}>{error}</p>}
        {result && (
          <div className={`${styles.result} ${result.status === 'Approved' ? styles.approved : styles.rejected}`}>
            <strong>{t.submitResult}:</strong>{' '}
            <span>{result.status === 'Approved' ? t.approved : t.rejected}</span>
            {result.localTime && (
              <p className={styles.reason}>
                {t.time}: {result.localTime} — {result.region}
              </p>
            )}
            {result.rejectionReason && (
              <p className={styles.reason}>{result.rejectionReason}</p>
            )}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.badge}>{t.transactionSimulator}</div>
        <h1 className={styles.question}>{t.question}</h1>
        <div className={styles.mockups}>
          <div className={styles.mockupDesktop} />
          <div className={styles.mockupMobile} />
        </div>
      </div>
    </div>
  );
}
