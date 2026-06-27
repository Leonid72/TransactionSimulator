import { useState, useCallback, useEffect } from 'react';
import CountrySearch from '../CountrySearch/CountrySearch';
import Toast from '../Toast/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { submitTransaction } from '../../api/transactions';
import type { Transaction } from '../../types';
import styles from './SimulatorSection.module.css';

const TIMEZONES: Record<string, string> = {
  Israel: 'Asia/Jerusalem',
  France: 'Europe/Paris',
  USA: 'America/New_York',
  Japan: 'Asia/Tokyo',
  UK: 'Europe/London',
  Germany: 'Europe/Berlin',
  India: 'Asia/Kolkata',
};

function getLocalTime(region: string): { hour: number; minute: number } {
  const tz = TIMEZONES[region];
  if (!tz) return { hour: 0, minute: 0 };
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  return {
    hour: parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0'),
    minute: parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0'),
  };
}

interface Props {
  onTransactionSubmitted: () => void;
}

export default function SimulatorSection({ onTransactionSubmitted }: Props) {
  const { t } = useLanguage();
  const [region, setRegion] = useState('');
  const [localTime, setLocalTime] = useState<{ hour: number; minute: number } | null>(null);
  const [result, setResult] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!region) { setLocalTime(null); return; }
    setLocalTime(getLocalTime(region));
    const id = setInterval(() => setLocalTime(getLocalTime(region)), 60_000);
    return () => clearInterval(id);
  }, [region]);

  const handleSubmit = useCallback(async () => {
    if (!region) { setError('Please select a region first.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await submitTransaction({
        region,
        hour: localTime?.hour ?? 0,
        minute: localTime?.minute ?? 0,
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
  }, [region, localTime, onTransactionSubmitted]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={styles.section}>
      <div className={styles.left}>
        <CountrySearch value={region} onChange={setRegion} />

        <div className={styles.picker}>
          <span className={styles.pickerTitle}>{t.enterTime}</span>

          <div className={styles.pickerInputs}>
            <div className={styles.pickerField}>
              <div className={styles.timeBox}>
                {localTime ? pad(localTime.hour) : '--'}
              </div>
              <span className={styles.fieldLabel}>{t.hour}</span>
            </div>

            <span className={styles.separator}>:</span>

            <div className={styles.pickerField}>
              <div className={styles.timeBox}>
                {localTime ? pad(localTime.minute) : '--'}
              </div>
              <span className={styles.fieldLabel}>{t.minute}</span>
            </div>
          </div>

          <div className={styles.pickerActions}>
            <svg className={styles.clockIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#49454F" strokeWidth="2" />
              <path d="M12 7V12L15 14" stroke="#49454F" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className={styles.pickerButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setResult(null); setError(''); }}
                type="button"
              >
                {t.cancel}
              </button>
              <button
                className={styles.okBtn}
                onClick={handleSubmit}
                type="button"
                disabled={loading}
              >
                {loading ? '...' : t.ok}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <Toast
            title={error}
            type="error"
            onClose={() => setError('')}
          />
        )}

        {result && (
          <Toast
            type={result.status === 'Approved' ? 'success' : 'error'}
            title={`${t.submitResult}: ${result.status === 'Approved' ? t.approved : t.rejected}`}
            lines={[
              result.localTime ? `${t.time}: ${result.localTime} — ${result.region}` : '',
              result.status === 'Rejected' ? t.rejectionReason : '',
            ].filter(Boolean)}
            onClose={() => setResult(null)}
          />
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
