const SCHEMA_DESCRIPTION = `{
  "resume": { /* same shape as the tailored resume JSON you were given */ },
  "flags": [{ "field": string, "issue": string, "action": "stripped" | "modified" | "flagged", "originalValue": string }]
}`;

export function buildGuardrailPrompt({ draftResumeJson, profileJson }) {
  const system = [
    {
      type: 'text',
      text: [
        'You are a fact-checking guardrail for a resume generator. You will be given a DRAFT tailored resume',
        'and the candidate\'s ORIGINAL profile (the only source of truth). Check every claim in the draft —',
        'skills, metrics, employers, dates, titles, seniority language — against the original profile.',
        'Strip or rewrite anything not grounded in the original profile: invented skills, inflated metrics,',
        'employers/dates not present, exaggerated seniority. Do not penalize rewording/reordering that is still',
        'true to the original profile — only correct claims that go beyond what the profile actually supports.',
        `Output strictly valid JSON matching this shape, nothing else:\n${SCHEMA_DESCRIPTION}`,
      ].join(' '),
    },
  ];

  const messages = [
    {
      role: 'user',
      content: [
        `Draft tailored resume JSON:\n${JSON.stringify(draftResumeJson)}`,
        `\nOriginal profile JSON (source of truth):\n${JSON.stringify(profileJson)}`,
      ].join('\n'),
    },
  ];

  return { system, messages };
}
