import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { downloadGenerationPdf } from '../../lib/downloadGenerationPdf.js';
import { apiClient } from '../../lib/apiClient.js';
import { useGenerationStream } from '../../hooks/useGenerationStream.js';
import { JobDescriptionInput } from './components/JobDescriptionInput.jsx';
import { SteeringForm } from './components/SteeringForm.jsx';
import { ProgressStream } from './components/ProgressStream.jsx';
import { ResumePreview } from './components/ResumePreview.jsx';
import { GuardrailFlagsPanel } from './components/GuardrailFlagsPanel.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Generate.module.css';

export function GeneratePage() {
  const location = useLocation();
  const [jdText, setJdText] = useState(location.state?.jdText || '');
  const [steering, setSteering] = useState(location.state?.steering || {});
  const [renderEngine, setRenderEngine] = useState('html');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  
  const [previewResume, setPreviewResume] = useState(null);
  const { generate, stageLabel, result, error, running } = useGenerationStream();

  useEffect(() => {
    apiClient.get('/api/templates')
      .then(res => {
        setTemplates(res.templates || []);
        if (res.templates?.length > 0 && !templateId) {
          setTemplateId(res.templates[0].id);
        }
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setPreviewResume(null);
    await generate({ jdText, steering, renderEngine, templateId });
  }

  const resume = previewResume || result?.resume;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tailor your resume</h1>
        <p className={styles.description}>Paste the job description and let the agent tailor your profile to fit.</p>
      </header>

      <div className={styles.splitScreen}>
        {/* Left Side: Inputs */}
        <div className={styles.inputPanel}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Card>
              <JobDescriptionInput value={jdText} onChange={setJdText} />
            </Card>
            
            <Card>
              <SteeringForm 
                steering={steering} 
                onChange={setSteering}
                renderEngine={renderEngine}
                setRenderEngine={setRenderEngine}
                templateId={templateId}
                setTemplateId={setTemplateId}
                templates={templates}
              />
            </Card>

            <Button type="submit" size="lg" isLoading={running} disabled={jdText.trim().length === 0 || (renderEngine === 'latex' && !templateId)}>
              Tailor my resume
            </Button>
            
            {error && <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', padding: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--border-radius-md)' }}>{error}</div>}
          </form>
        </div>

        {/* Right Side: Preview & Progress */}
        <div className={styles.previewPanel}>
          {running && (
            <ProgressStream stageLabel={stageLabel} />
          )}

          {!running && !result && (
            <Card style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Your tailored resume will appear here.</p>
            </Card>
          )}

          {result && !running && (
            <>
              {/* The Signature Verification Panel */}
              <GuardrailFlagsPanel flags={result.flags} />
              
              <div className={styles.previewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Resume Preview</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {result.texSource && (
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          const blob = new Blob([result.texSource], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `resume-${result.generationId}.tex`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Download .tex
                      </Button>
                    )}
                    <Button variant="primary" onClick={() => downloadGenerationPdf(result.generationId)}>
                      Download PDF
                    </Button>
                  </div>
                </div>
                <ResumePreview resume={resume} onChange={setPreviewResume} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
