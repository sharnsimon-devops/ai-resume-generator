import { useEffect, useState } from 'react';

import { apiClient } from '../../lib/apiClient.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Settings.module.css';

export function ApiKeyPage() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRotate, setShowRotate] = useState(false);

  function loadStatus() {
    apiClient
      .get('/api/keys/status')
      .then(setStatus)
      .catch((err) => setError(err.message));
  }

  useEffect(loadStatus, []);

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiClient.post('/api/keys', { apiKey });
      setStatus(result);
      setApiKey('');
      setShowRotate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete your saved Anthropic API key?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiClient.delete('/api/keys');
      setStatus(result);
      setShowRotate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!status) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.title}>Anthropic API key</h1>
        {error ? <div className={styles.errorAlert} role="alert">{error}</div> : <p>Loading...</p>}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Anthropic API key</h1>
        <p className={styles.description}>
          Your key is used server-side only, encrypted at rest, and never sent back to this page after saving.
        </p>
      </header>

      <Card>
        {status.hasKey ? (
          <>
            <div className={styles.keyStatusCard}>
              <div className={styles.keyStatusText}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Key active (ending in ****{status.last4})
              </div>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={submitting}>
                Delete
              </Button>
            </div>
            
            {!showRotate ? (
              <Button variant="secondary" onClick={() => setShowRotate(true)}>
                Rotate key
              </Button>
            ) : (
              <div className={styles.rotateSection}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Rotate key</h3>
                <form className={styles.form} onSubmit={handleSave}>
                  <Input 
                    label="New Anthropic API key" 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    required 
                    placeholder="sk-ant-..."
                  />
                  {error && <div className={styles.errorAlert} role="alert">{error}</div>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" isLoading={submitting}>
                      Save new key
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setShowRotate(false); setApiKey(''); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSave}>
            <Input 
              label="Anthropic API key" 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              required 
              placeholder="sk-ant-..."
              hint="Requires Claude 3.5 Sonnet access."
            />
            {error && <div className={styles.errorAlert} role="alert">{error}</div>}
            <div>
              <Button type="submit" isLoading={submitting}>
                Save & validate
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
