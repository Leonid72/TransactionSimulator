import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './CountrySearch.module.css';

const COUNTRIES = ['France', 'Israel', 'Cyprus', 'Italy'];

interface Props {
  value: string;
  onChange: (country: string) => void;
}

export default function CountrySearch({ value, onChange }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: string) => {
    onChange(country);
    setQuery(country);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setOpen(true);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <label className={styles.label}>{t.regionLabel}</label>
        <input
          className={styles.input}
          type="text"
          value={query}
          placeholder={t.searchPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button className={styles.clearBtn} onClick={handleClear} type="button" aria-label="Clear">
            ✕
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className={styles.dropdown}>
          {filtered.map((country) => (
            <li
              key={country}
              className={`${styles.option} ${value === country ? styles.selected : ''}`}
              onMouseDown={() => handleSelect(country)}
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
