import { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../hooks/useAuth.js';
import { GenerationListItem } from './components/GenerationListItem.jsx';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import styles from './History.module.css';

export function HistoryPage() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('generations')
      .select('id, jd_text, steering_json, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setGenerations(data);
        }
      });
  }, [user.id]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.description}>Your previously generated resumes.</p>
      </header>
      
      {error && <div className={styles.errorAlert} role="alert">{error}</div>}
      
      {!generations && !error && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      
      {generations && generations.length === 0 && (
        <div className={styles.emptyState}>
          <p style={{ marginBottom: '1rem' }}>You haven't generated any resumes yet.</p>
          <Link to="/generate">
            <Button variant="primary">Generate your first resume</Button>
          </Link>
        </div>
      )}
      
      {generations && generations.length > 0 && (
        <ul className={styles.list}>
          {generations.map((generation) => (
            <GenerationListItem key={generation.id} generation={generation} />
          ))}
        </ul>
      )}
    </div>
  );
}
