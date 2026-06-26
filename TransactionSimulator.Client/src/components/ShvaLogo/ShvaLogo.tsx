import styles from './ShvaLogo.module.css';

export default function ShvaLogo() {
  return (
    <div className={styles.logo}>
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 4C10.716 4 4 10.716 4 19C4 27.284 10.716 34 19 34C27.284 34 34 27.284 34 19"
          stroke="#65558F"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M34 19L28 13M34 19L28 25" stroke="#65558F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M13 14C13 14 15 12 19 12C23 12 25 14.5 25 17C25 19.5 23 21 19 21C15 21 13 22.5 13 25C13 27.5 15 29 19 29C23 29 25 27 25 27"
          stroke="#4A3A7A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.text}>shva</span>
    </div>
  );
}
