import { useState } from 'react';

import { sseFetch } from '../lib/sseFetch.js';

const STAGE_LABELS = {
  analyzing: 'Analyzing job description…',
  tailoring: 'Tailoring your resume…',
  verifying: 'Verifying facts…',
  rendering: 'Rendering PDF…',
  injecting_template: 'Injecting template…',
  compiling_latex: 'Compiling LaTeX…',
};

export function useGenerationStream() {
  const [stageLabel, setStageLabel] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  async function generate({ jdText, steering, renderEngine, templateId, gapAnswers, keywordList, useResumeEndpoint }) {
    setRunning(true);
    setError(null);
    setResult(null);
    setStageLabel(STAGE_LABELS.tailoring);

    // Always use the /api/resume/generate endpoint
    const endpoint = '/api/resume/generate';
    const body = { 
      jdText, 
      steering, 
      renderEngine, 
      templateId,
      gapAnswers: gapAnswers || [],
      keywordList: keywordList || []
    };

    try {
      await sseFetch(endpoint, body, {
        onEvent: (event, data) => {
          if (event === 'progress') {
            setStageLabel(STAGE_LABELS[data.stage] || data.stage);
          } else if (event === 'done') {
            setResult(data);
            setStageLabel(null);
          } else if (event === 'error') {
            setError(data.error);
            setStageLabel(null);
          }
        },
      });
    } catch (err) {
      setError(err.message);
      setStageLabel(null);
    } finally {
      setRunning(false);
    }
  }

  return { generate, stageLabel, result, error, running };
}

