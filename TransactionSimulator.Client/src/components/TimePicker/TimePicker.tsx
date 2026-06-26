import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './TimePicker.module.css';

interface Props {
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  onCancel: () => void;
}

export default function TimePicker({ hour, minute, onConfirm, onCancel }: Props) {
  const { t } = useLanguage();
  const [h, setH] = useState(String(hour).padStart(2, '0'));
  const [m, setM] = useState(String(minute).padStart(2, '0'));
  const [activeField, setActiveField] = useState<'hour' | 'minute'>('hour');

  const handleHourChange = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 2);
    setH(num);
  };

  const handleMinuteChange = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 2);
    setM(num);
  };

  const handleConfirm = () => {
    const hNum = Math.min(23, Math.max(0, parseInt(h || '0')));
    const mNum = Math.min(59, Math.max(0, parseInt(m || '0')));
    onConfirm(hNum, mNum);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.pickerHeader}>
        <span className={styles.title}>{t.enterTime}</span>
      </div>

      <div className={styles.inputs}>
        <div className={styles.field}>
          <input
            className={`${styles.timeInput} ${activeField === 'hour' ? styles.active : ''}`}
            value={h}
            onChange={(e) => handleHourChange(e.target.value)}
            onFocus={() => setActiveField('hour')}
            maxLength={2}
            inputMode="numeric"
            aria-label={t.hour}
          />
          <span className={styles.fieldLabel}>{t.hour}</span>
        </div>

        <span className={styles.separator}>:</span>

        <div className={styles.field}>
          <input
            className={`${styles.timeInput} ${activeField === 'minute' ? styles.active : ''}`}
            value={m}
            onChange={(e) => handleMinuteChange(e.target.value)}
            onFocus={() => setActiveField('minute')}
            maxLength={2}
            inputMode="numeric"
            aria-label={t.minute}
          />
          <span className={styles.fieldLabel}>{t.minute}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.clockIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#49454F" strokeWidth="2" />
            <path d="M12 7V12L15 14" stroke="#49454F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel} type="button">
            {t.cancel}
          </button>
          <button className={styles.okBtn} onClick={handleConfirm} type="button">
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
}
