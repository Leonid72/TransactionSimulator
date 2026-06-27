import { useEffect } from 'react';
import styles from './Toast.module.css';

interface Props {
  title: string;
  lines?: string[];
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ title, lines = [], type, onClose, duration = 10000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.success : styles.error}`}>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {lines.map((line, i) => (
          <p key={i} className={styles.line}>{line}</p>
        ))}
      </div>
      <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
      <div className={styles.progress} style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
}
