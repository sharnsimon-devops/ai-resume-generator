import { Badge } from '../../../components/ui/Badge.jsx';
import styles from '../Generate.module.css';

export function GuardrailFlagsPanel({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div className={styles.flagsPanel}>
        <div className={styles.flagsHeader}>
          <svg className={styles.flagsIconVerified} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Verification Log
        </div>
        <div className={styles.verifiedState}>
          <div className={styles.verifiedText}>
            <strong>All claims verified.</strong> The guardrail checked your generated resume and found no invented skills, inflated metrics, or ungrounded claims. Everything traces directly back to your profile.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.flagsPanel}>
      <div className={styles.flagsHeader}>
        <svg className={styles.flagsIconWarning} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Verification Log
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        The guardrail protected your resume by removing or adjusting the following items because they weren't grounded in your saved profile:
      </p>
      <ul className={styles.flagList}>
        {flags.map((flag, i) => (
          <li key={i} className={styles.flagItem}>
            <div className={styles.flagBadge}>
              <Badge variant="flagged">{flag.action}</Badge>
            </div>
            <div>
              <strong>{flag.field}</strong>: {flag.issue}
              {flag.originalValue ? <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '0.25rem', fontSize: '0.75rem' }}>Original draft: "{flag.originalValue}"</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
