import styles from './ShvaLogo.module.css';

export default function ShvaLogo() {
  return (
    <div className={styles.logo}>
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shvaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00BCD4" />
            <stop offset="100%" stopColor="#4A90D9" />
          </linearGradient>
        </defs>
        {/* Outer arc — top-right, clockwise */}
        <path
          d="M21 6 C30.941 6 39 14.059 39 24 C39 30 36 35 31 38"
          stroke="url(#shvaGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrowhead on outer arc */}
        <path
          d="M31 38 L26 35 M31 38 L34 33"
          stroke="url(#shvaGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner arc — bottom-left, counter-clockwise */}
        <path
          d="M21 36 C11.059 36 3 27.941 3 18 C3 12 6 7 11 4"
          stroke="url(#shvaGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrowhead on inner arc */}
        <path
          d="M11 4 L16 7 M11 4 L8 9"
          stroke="url(#shvaGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={styles.text}>shva</span>
    </div>
  );
}
