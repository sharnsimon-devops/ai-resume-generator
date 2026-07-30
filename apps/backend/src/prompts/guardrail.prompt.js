const SCHEMA_DESCRIPTION = `{
  "resume": { /* same shape as the tailored resume JSON you were given */ },
  "flags": [{ "field": string, "issue": string, "action": "stripped" | "modified" | "flagged", "originalValue": string }]
}`;

export function buildGuardrailPrompt({ draftResumeJson, profileJson, gapAnswers }) {
  const hasGapContext = Array.isArray(gapAnswers) && gapAnswers.length > 0;

  const rules = [
    'You are a fact-checking guardrail for a resume generator. You will be given a DRAFT tailored resume',
    'and the candidate\'s ORIGINAL profile (the main source of truth)' + (hasGapContext ? ' along with CONFIRMED GAP ANSWERS (an additional source of truth).' : '.'),
    'Check every claim in the draft — skills, metrics, employers, dates, titles, seniority language — against ' + (hasGapContext ? 'the original profile OR the confirmed gap answers.' : 'the original profile.'),
    'Strip or rewrite anything not grounded in the ' + (hasGapContext ? 'original profile or confirmed gap answers' : 'original profile') + ': invented skills, inflated metrics,',
    'employers/dates not present, exaggerated seniority. Do not penalize rewording/reordering that is still',
    'true to the ' + (hasGapContext ? 'original profile/gap answers' : 'original profile') + ' — only correct claims that go beyond what the ' + (hasGapContext ? 'sources' : 'profile') + ' actually support.',
    `Output strictly valid JSON matching this shape, nothing else:\n${SCHEMA_DESCRIPTION}`,
  ];

  const system = [
    {
      type: 'text',
      text: rules.join(' '),
    },
  ];

  const userContent = [
    `Draft tailored resume JSON:\n${JSON.stringify(draftResumeJson)}`,
    `\nOriginal profile JSON (source of truth):\n${JSON.stringify(profileJson)}`,
  ];
  
  if (hasGapContext) {
    userContent.push(`\nCONFIRMED GAP ANSWERS (additional source of truth):\n${JSON.stringify(gapAnswers, null, 2)}`);
  }

  const messages = [
    {
      role: 'user',
      content: userContent.join('\n'),
    },
  ];

  return { system, messages };
}
