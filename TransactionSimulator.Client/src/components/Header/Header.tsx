import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ShvaLogo from '../ShvaLogo/ShvaLogo';
import styles from './Header.module.css';

export default function Header() {
  const { isAuthenticated, signOut, authData } = useAuth();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className={styles.header}>
      <ShvaLogo />

      <div className={styles.right}>
        <nav className={styles.langToggle}>
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
        </nav>

        {isAuthenticated && (
          <div className={styles.authInfo}>
            <span className={styles.email}>{authData?.email}</span>
            <button className={styles.logoutBtn} onClick={signOut}>
              {t.logout}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
