import { useId } from 'react';

// Flagi jako SVG — renderują się identycznie na każdej platformie
// (emoji flag na Windowsie pokazują się jako litery, np. "PL").
// Kod "EN" mapujemy na flagę Wielkiej Brytanii (GB).

export default function Flag({ code, size = 20, title }) {
  const norm = code === 'EN' ? 'GB' : code;
  const uid = useId();
  const baseStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '2px',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
  };

  if (norm === 'PL') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 8 5" style={baseStyle} role="img" aria-label={title || 'Polski'}>
        <rect width="8" height="5" fill="#ffffff" />
        <rect width="8" height="2.5" y="2.5" fill="#dc143c" />
      </svg>
    );
  }

  if (norm === 'GB') {
    const clipAll = `${uid}-all`;
    const clipDiag = `${uid}-diag`;
    return (
      <svg width={size} height={size * 0.5} viewBox="0 0 60 30" style={baseStyle} role="img" aria-label={title || 'English'}>
        <clipPath id={clipAll}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={clipDiag}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath={`url(#${clipAll})`}>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${clipDiag})`} stroke="#c8102e" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        </g>
      </svg>
    );
  }

  return <span aria-label={title}>🏳️</span>;
}
