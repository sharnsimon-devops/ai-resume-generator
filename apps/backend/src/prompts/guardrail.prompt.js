const SCHEMA_DESCRIPTION = `{
  "resume": { /* same shape as the tailored resume JSON you were given */ },
  "flags": [{ "field": string, "issue": string, "action": "stripped" | "modified" | "flagged", "originalValue": string }]
}`;

export function buildGuardrailPrompt({ draftResumeJson, profileJson, gapAnswers }) {
  const hasGapContext = Array.isArray(gapAnswers) && gapAnswers.length > 0;

  const rules = [
    'You are a fact-checking guardrail for a resume generator. You will be given a DRAFT tailored resume',
    'and the candidate\'s ORIGINAL profile (the main source of truth)' + (hasGapContext ? ' along with CONFIRMED GAP ANSWERS (an additional source of truth).' : '.'),
    'Check every claim in the draft — employers, dates, titles, and core disciplines — against ' + (hasGapContext ? 'the original profile OR the confirmed gap answers.' : 'the original profile.'),
    'Strip or rewrite ONLY blatant lies: entirely fake employers, entirely fake dates, or completely different disciplines (e.g., inventing nursing for a developer).',
    'DO NOT penalize or strip new keywords, rephrased terminology, or adopted tools if they are reasonable synonyms, logical extensions, or industry-standard terms related to what the ' + (hasGapContext ? 'sources' : 'profile') + ' actually supports.',
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
