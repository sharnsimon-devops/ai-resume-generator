import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.heroSection}>
      <div className={styles.trustGuarantee}>
        <svg className={styles.trustIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className={styles.trustText}>Verified, not embellished. Nothing invented.</span>
      </div>
      
      <h1 className={styles.title}>
        A resume tailored to the job.<br />
        <span className={styles.titleHighlight}>Built on the truth.</span>
      </h1>
      
      <p className={styles.subtitle}>
        Paste a job description and get a precise, one-page resume in 30 seconds. We guarantee every claim matches your actual profile.
      </p>

      <Link to="/signup">
        <Button variant="primary" size="lg">
          Build my resume
        </Button>
      </Link>

      {/* Mock Visual representation of the flow */}
      <div className={styles.visualContainer}>
        <div style={{ backgroundColor: '#F3F4F6', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>[ Flow Visual: Paste JD → Tailored Resume → Guardrail Verification ]</p>
        </div>
      </div>
    </div>
  );
}
