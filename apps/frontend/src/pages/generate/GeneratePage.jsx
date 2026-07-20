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
import { AtsWarningPanel } from './components/AtsWarningPanel.jsx';
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
  
  // ATS State
  const [isCheckingAts, setIsCheckingAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);

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

  async function checkAtsAndGenerate() {
    setAtsError(null);
    setAtsResult(null);
    setIsCheckingAts(true);
    
    try {
      const scoreData = await apiClient.post('/api/ats/score', { jdText });
      
      if (scoreData.overall_score > 80) {
        // Automatically proceed
        setIsCheckingAts(false);
        await triggerGeneration();
      } else {
        // Pause and show warning
        setAtsResult(scoreData);
        setIsCheckingAts(false);
      }
    } catch (err) {
      console.error(err);
      setAtsError(err.message || 'Failed to analyze job fit.');
      setIsCheckingAts(false);
    }
  }

  async function triggerGeneration() {
    setPreviewResume(null);
    setAtsResult(null);
    await generate({ jdText, steering, renderEngine, templateId });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!jdText.trim()) return;
    
    // First run ATS check
    await checkAtsAndGenerate();
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

            <Button type="submit" size="lg" isLoading={running || isCheckingAts} disabled={jdText.trim().length === 0 || (renderEngine === 'latex' && !templateId)}>
              {isCheckingAts ? 'Analyzing Job Fit...' : 'Check Fit & Tailor'}
            </Button>
            
            {(error || atsError) && (
              <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', padding: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--border-radius-md)' }}>
                {error || atsError}
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Preview & Progress */}
        <div className={styles.previewPanel}>
          {isCheckingAts && (
            <Card style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }}></div>
              <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing job match using ATS algorithm...</p>
            </Card>
          )}

          {atsResult && !running && (
             <AtsWarningPanel 
               atsResult={atsResult} 
               onProceed={triggerGeneration} 
               onCancel={() => setAtsResult(null)} 
             />
          )}

          {running && !isCheckingAts && (
            <ProgressStream stageLabel={stageLabel} />
          )}

          {!running && !result && !isCheckingAts && !atsResult && (
            <Card style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Your tailored resume will appear here.</p>
            </Card>
          )}

          {result && !running && !atsResult && !isCheckingAts && (
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
                    <Button variant="primary" onClick={async (e) => {
                      const btn = e.currentTarget;
                      const originalText = btn.innerText;
                      btn.innerText = 'Saving...';
                      btn.disabled = true;
                      try {
                        if (previewResume) {
                          await apiClient.put(`/api/generations/${result.generationId}`, { resume });
                        }
                        btn.innerText = 'Downloading...';
                        await downloadGenerationPdf(result.generationId);
                      } catch (err) {
                        console.error('Failed to download PDF:', err);
                        alert('Failed to save or download PDF.');
                      } finally {
                        btn.innerText = originalText;
                        btn.disabled = false;
                      }
                    }}>
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
