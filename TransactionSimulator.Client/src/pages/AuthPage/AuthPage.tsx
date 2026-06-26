import { useState } from 'react';
import { login, register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ShvaLogo from '../../components/ShvaLogo/ShvaLogo';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const { signIn } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.data.isSuccessful) {
          signIn(res.data.data);
        } else {
          setError(res.data.message || 'Login failed.');
        }
      } else {
        const res = await register(email, password, fullName);
        if (res.data.isSuccessful) {
          setMode('login');
          setError('');
        } else {
          setError(res.data.message || 'Registration failed.');
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <ShvaLogo />
          <div className={styles.langToggle}>
            <button
              className={lang === 'en' ? styles.langActive : styles.langInactive}
              onClick={() => setLang('en')}
            >
              {t.eng}
            </button>
            <button
              className={lang === 'he' ? styles.langActive : styles.langInactive}
              onClick={() => setLang('he')}
            >
              {t.hebrew}
            </button>
          </div>
        </div>

        <h2 className={styles.title}>
          {mode === 'login' ? t.login : t.register}
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>{t.fullName}</label>
              <input
                className={styles.input}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{t.email}</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.password}</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'register' && (
              <span className={styles.hint}>Min 8 chars, uppercase, lowercase, digit</span>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? t.signIn : t.signUp}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
          <button
            className={styles.toggleBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            type="button"
          >
            {mode === 'login' ? t.signUp : t.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}
