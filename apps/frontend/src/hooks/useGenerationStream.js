import { useState } from 'react';

import { sseFetch } from '../lib/sseFetch.js';

const STAGE_LABELS = {
  tailoring: 'Tailoring your resume…',
  verifying: 'Verifying facts…',
  rendering: 'Rendering PDF…',
};

export function useGenerationStream() {
  const [stageLabel, setStageLabel] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  async function generate({ jdText, steering }) {
    setRunning(true);
    setError(null);
    setResult(null);
    setStageLabel(STAGE_LABELS.tailoring);

    try {
      await sseFetch('/api/generations', { jdText, steering }, {
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
