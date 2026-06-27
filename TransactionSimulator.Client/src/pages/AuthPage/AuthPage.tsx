import { useState } from 'react';
import { login, register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Translations } from '../../i18n/en';
import ShvaLogo from '../../components/ShvaLogo/ShvaLogo';
import styles from './AuthPage.module.css';

// Backend may return PascalCase or camelCase keys
type AnyData = Record<string, unknown>;

function getMsg(data: AnyData): string {
  return ((data['message'] ?? data['Message']) as string | undefined ?? '').toLowerCase();
}

function isOk(data: AnyData): boolean {
  return !!(data['isSuccessful'] ?? data['IsSuccessful']);
}

function resolveError(msg: string, t: Translations, mode: 'login' | 'register'): string {
  if (msg.includes('not found') || msg.includes('not exist') || msg.includes('no user'))
    return t.userNotFound;
  if (msg.includes('exist') || msg.includes('already'))
    return t.emailExists;
  if (msg.includes('invalid') || msg.includes('password') || msg.includes('credential'))
    return t.loginFailed;
  if (msg.includes('validation'))
    return t.registerFailed;
  return mode === 'login' ? t.loginFailed : t.connectionError;
}

export default function AuthPage() {
  const { signIn } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (val: string) => {
    if (!EMAIL_REGEX.test(val)) { setEmailError(t.invalidEmail); return false; }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        const data = res.data as unknown as AnyData;
        if (isOk(data)) {
          signIn(res.data.data);
        } else {
          setError(resolveError(getMsg(data), t, 'login'));
        }
      } else {
        const res = await register(email, password, fullName);
        const data = res.data as unknown as AnyData;
        if (isOk(data)) {
          setMode('login');
          setError('');
        } else {
          setError(resolveError(getMsg(data), t, 'register'));
        }
      }
    } catch (err: unknown) {
      const data = ((err as { response?: { data?: AnyData } })?.response?.data ?? {}) as AnyData;
      const msg = getMsg(data);
      setError(resolveError(msg, t, mode));
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
            <button className={lang === 'en' ? styles.langActive : styles.langInactive} onClick={() => setLang('en')}>
              {t.eng}
            </button>
            <button className={lang === 'he' ? styles.langActive : styles.langInactive} onClick={() => setLang('he')}>
              {t.hebrew}
            </button>
          </div>
        </div>

        <h2 className={styles.title}>{mode === 'login' ? t.login : t.register}</h2>

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
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={(e) => validateEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {emailError && <span className={styles.fieldError}>{emailError}</span>}
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
            {mode === 'register' && <span className={styles.hint}>{t.passwordHint}</span>}
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
