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
import { GapAnalysisPanel } from './components/GapAnalysisPanel.jsx';
import { HybridScorePanel } from './components/HybridScorePanel.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Generate.module.css';

/**
 * Flow phases:
 *   idle → analyzing → gaps → generating → done
 *                 ↘ (no gaps) → generating → done
 *   idle → generating → done  (Tailor Immediately bypass)
 */

export function GeneratePage() {
  const location = useLocation();
  const [jdText, setJdText] = useState(location.state?.jdText || '');
  const [steering, setSteering] = useState(location.state?.steering || {});
  const [renderEngine, setRenderEngine] = useState('html');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  const [previewResume, setPreviewResume] = useState(null);

  // 3-step pipeline state
  const [flowPhase, setFlowPhase] = useState('idle'); // idle | analyzing | gaps | generating | done
  const [analysisResult, setAnalysisResult] = useState(null);
  const [gapAnswers, setGapAnswers] = useState({});
  const [analyzeError, setAnalyzeError] = useState(null);

  // Post-generation scoring state
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

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

  // When generation finishes, update flow phase
  useEffect(() => {
    if (result && !running) {
      setFlowPhase('done');
    }
  }, [result, running]);

  /**
   * Step 1: Analyze JD against user's profile
   */
  async function handleAnalyzeAndGenerate(e) {
    e.preventDefault();
    if (!jdText.trim()) return;

    setAnalyzeError(null);
    setAnalysisResult(null);
    setGapAnswers({});
    setPreviewResume(null);
    setScoreResult(null);
    setScoreError(null);
    setFlowPhase('analyzing');

    try {
      const analysis = await apiClient.post('/api/resume/analyze', { jdText });
      setAnalysisResult(analysis);

      if (analysis.flagged_gaps && analysis.flagged_gaps.length > 0) {
        // Show gap resolution UI
        setFlowPhase('gaps');
      } else {
        // No gaps — skip straight to generation
        setFlowPhase('generating');
        await generate({
          jdText,
          steering,
          renderEngine,
          templateId,
          gapAnswers: [],
          keywordList: analysis.keyword_list || [],
          useResumeEndpoint: true,
        });
      }
    } catch (err) {
      console.error(err);
      setAnalyzeError(err.message || 'Failed to analyze job description.');
      setFlowPhase('idle');
    }
  }

  /**
   * Step 2: Generate with gap answers (after user resolves all gaps)
   */
  async function handleGenerateWithGaps() {
    if (!analysisResult) return;

    setPreviewResume(null);
    setScoreResult(null);
    setScoreError(null);
    setFlowPhase('generating');

    // Convert gap answers map to array format for the API
    const gapAnswersArray = Object.entries(gapAnswers).map(([id, answer]) => ({ id, answer }));

    await generate({
      jdText,
      steering,
      renderEngine,
      templateId,
      gapAnswers: gapAnswersArray,
      keywordList: analysisResult.keyword_list || [],
      useResumeEndpoint: true,
    });
  }

  /**
   * Bypass: Tailor immediately without analyze step (existing behavior)
   */
  async function handleTailorImmediately() {
    setPreviewResume(null);
    setAnalysisResult(null);
    setGapAnswers({});
    setScoreResult(null);
    setScoreError(null);
    setFlowPhase('generating');
    await generate({ jdText, steering, renderEngine, templateId });
  }

  /**
   * Step 3: Score the generated resume using hybrid scorer
   */
  async function handleScoreResume() {
    if (!result?.resume && !previewResume) return;

    setIsScoring(true);
    setScoreError(null);

    try {
      const resumeToScore = previewResume || result.resume;
      const data = await apiClient.post('/api/resume/score', {
        resumeJson: resumeToScore,
        jdText,
        keywordList: analysisResult?.keyword_list || [],
      });
      setScoreResult(data);
    } catch (err) {
      console.error(err);
      setScoreError(err.message || 'Failed to score resume.');
    } finally {
      setIsScoring(false);
    }
  }

  function handleGapAnswerChange(gapId, value) {
    setGapAnswers(prev => ({ ...prev, [gapId]: value }));
  }

  function handleBackToIdle() {
    setFlowPhase('idle');
    setAnalysisResult(null);
    setGapAnswers({});
    setAnalyzeError(null);
  }

  const resume = previewResume || result?.resume;
  const isInputDisabled = flowPhase === 'analyzing' || flowPhase === 'generating' || running;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tailor your resume</h1>
        <p className={styles.description}>Paste the job description and let the agent analyze gaps, then tailor your profile to fit.</p>
      </header>

      <div className={styles.splitScreen}>
        {/* Left Side: Inputs */}
        <div className={styles.inputPanel}>
          <form onSubmit={handleAnalyzeAndGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <Button
                type="submit"
                size="lg"
                style={{ flex: 1 }}
                isLoading={flowPhase === 'analyzing'}
                disabled={jdText.trim().length === 0 || (renderEngine === 'latex' && !templateId) || isInputDisabled}
              >
                {flowPhase === 'analyzing' ? 'Analyzing JD…' : 'Analyze & Tailor'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                style={{ flex: 1 }}
                onClick={handleTailorImmediately}
                isLoading={flowPhase === 'generating' && !analysisResult}
                disabled={jdText.trim().length === 0 || (renderEngine === 'latex' && !templateId) || isInputDisabled}
              >
                Tailor Immediately
              </Button>
            </div>

            {(error || analyzeError) && (
              <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', padding: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--border-radius-md)' }}>
                {error || analyzeError}
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Flow states */}
        <div className={styles.previewPanel}>
          {/* Analyzing spinner */}
          {flowPhase === 'analyzing' && (
            <Card style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }}></div>
              <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing job description against your profile…</p>
            </Card>
          )}

          {/* Gap Resolution UI (Step 1 → Step 2 bridge) */}
          {flowPhase === 'gaps' && analysisResult && (
            <GapAnalysisPanel
              analysis={analysisResult}
              gapAnswers={gapAnswers}
              onGapAnswerChange={handleGapAnswerChange}
              onProceed={handleGenerateWithGaps}
              onCancel={handleBackToIdle}
            />
          )}

          {/* Generation progress */}
          {(flowPhase === 'generating' && running) && (
            <ProgressStream stageLabel={stageLabel} />
          )}

          {/* Idle state placeholder */}
          {flowPhase === 'idle' && !result && (
            <Card style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Your tailored resume will appear here.</p>
            </Card>
          )}

          {/* Results */}
          {flowPhase === 'done' && result && !running && (
            <>
              {/* Guardrail verification */}
              <GuardrailFlagsPanel flags={result.flags} />

              {/* Hybrid ATS Score */}
              {scoreResult && <HybridScorePanel scoreResult={scoreResult} />}

              <div className={styles.previewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Resume Preview</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      onClick={handleScoreResume}
                      isLoading={isScoring}
                    >
                      Calculate ATS Score
                    </Button>
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
                {scoreError && (
                  <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--border-radius-md)' }}>
                    {scoreError}
                  </div>
                )}
                <ResumePreview resume={resume} onChange={setPreviewResume} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
