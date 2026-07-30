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

    // Use the new /api/resume/generate endpoint when gap context is available,
    // fall back to the existing /api/generations endpoint for backward compat
    const endpoint = useResumeEndpoint ? '/api/resume/generate' : '/api/generations';
    const body = { jdText, steering, renderEngine, templateId };
    if (useResumeEndpoint) {
      body.gapAnswers = gapAnswers || [];
      body.keywordList = keywordList || [];
    }

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

