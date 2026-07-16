import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import styles from './Settings.module.css';

export function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/templates');
      setTemplates(res.templates || []);
    } catch (err) {
      setError(err.publicMessage || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    try {
      await apiClient.post('/api/templates/upload', { name, content });
      setName('');
      setContent('');
      await fetchTemplates();
    } catch (err) {
      setError(err.publicMessage || err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>LaTeX Templates</h1>
        <p className={styles.description}>Upload custom Handlebars-enabled LaTeX templates for the sandboxed rendering engine.</p>
      </header>

      {error && <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr', '@media (min-width: 900px)': { gridTemplateColumns: '1fr 1fr' } }}>
        <Card>
          <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: '1rem' }}>Upload New Template</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Modern Two-Column"
              required
            />
            <Textarea
              label="LaTeX Content (Handlebars supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="\documentclass{article}&#10;\begin{document}&#10;\textbf{ {{contact.name}} }&#10;...&#10;\end{document}"
              rows={15}
              required
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <Button type="submit" isLoading={uploading} disabled={!name || !content}>
              Upload Template
            </Button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: '1rem' }}>Your Templates</h2>
          {loading && <div className="spinner" style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          {!loading && templates.length === 0 && <p style={{ color: 'var(--color-text-secondary)' }}>No templates uploaded yet.</p>}
          {!loading && templates.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {templates.map(t => (
                <li key={t.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--color-bg-base)' }}>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    Uploaded {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
