import { useEffect, useState } from 'react';

import { apiClient, API_BASE_URL } from '../../lib/apiClient.js';
import { supabase } from '../../lib/supabaseClient.js';
import { ResumePasteForm } from './components/ResumePasteForm.jsx';
import { ResumeUploadForm } from './components/ResumeUploadForm.jsx';
import { ProfileSectionEditor } from './components/ProfileSectionEditor.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Profile.module.css';

const EMPTY_PROFILE = {
  contact: {},
  summary: '',
  workHistory: [],
  skills: [],
  education: [],
  achievements: [],
  additionalSections: [],
};

const MODES = { paste: 'paste', upload: 'upload', manual: 'manual' };

export function ProfileBuilderPage() {
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  useEffect(() => {
    apiClient
      .get('/api/profile')
      .then((data) => {
        const p = data.profile;
        if (p) {
          const hasData =
            (p.contact && Object.keys(p.contact).length > 0) ||
            (p.summary && p.summary.trim() !== '') ||
            (p.workHistory && p.workHistory.length > 0) ||
            (p.education && p.education.length > 0) ||
            (p.skills && p.skills.length > 0) ||
            (p.achievements && p.achievements.length > 0) ||
            (p.additionalSections && p.additionalSections.length > 0);

          if (hasData) {
            setProfile(p);
          }
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handlePasteExtract(rawText) {
    setExtracting(true);
    setError(null);
    try {
      const { profile: draft } = await apiClient.post('/api/profile/extract', { rawText });
      setProfile({ ...EMPTY_PROFILE, ...draft });
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleUploadExtract(file) {
    setExtracting(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/profile/upload`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const { profile: draft } = await res.json();
      setProfile({ ...EMPTY_PROFILE, ...draft });
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  function startManual() {
    setProfile(EMPTY_PROFILE);
    setMode(MODES.manual);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveConfirmed(false);
    try {
      await apiClient.put('/api/profile', { profile });
      setSaveConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>Build your profile</h1>
          <p className={styles.description}>This is a one-time setup. Choose how you'd like to start:</p>
        </header>

        <div className={styles.startOptions}>
          <Button variant={mode === MODES.paste ? 'primary' : 'secondary'} onClick={() => setMode(MODES.paste)}>
            Paste resume text
          </Button>
          <Button variant={mode === MODES.upload ? 'primary' : 'secondary'} onClick={() => setMode(MODES.upload)}>
            Upload a file
          </Button>
          <Button variant={mode === MODES.manual ? 'primary' : 'secondary'} onClick={startManual}>
            Fill out a form
          </Button>
        </div>

        {error && <div className={styles.errorAlert} role="alert">{error}</div>}
        
        {mode === MODES.paste && (
          <Card>
            <ResumePasteForm onExtract={handlePasteExtract} submitting={extracting} />
          </Card>
        )}
        {mode === MODES.upload && (
          <Card>
            <ResumeUploadForm onExtract={handleUploadExtract} submitting={extracting} />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Your profile</h1>
          <p className={styles.description}>Review and edit the extracted information below, then save.</p>
        </div>
        <Button variant="secondary" onClick={() => {
          setProfile(null);
          setMode(null);
        }}>
          Back / Start Over
        </Button>
      </header>

      {error && <div className={styles.errorAlert} role="alert">{error}</div>}
      {saveConfirmed && <div className={styles.successAlert}>Profile saved successfully.</div>}

      <Card>
        <ProfileSectionEditor profile={profile} onChange={setProfile} />
        
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} isLoading={saving} size="lg">
            Save profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
