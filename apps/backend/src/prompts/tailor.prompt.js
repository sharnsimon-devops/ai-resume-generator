import { PROMPT_CACHE_CONTROL } from '../config/anthropicConfig.js';

const SCHEMA_DESCRIPTION = `{
  "contact": { "name": string, "email": string, "phone": string, "location": string, "links": [{ "label": string, "url": string }] },
  "summary": string,
  "workHistory": [{ "organization": string, "title": string, "startDate": string, "endDate": string, "location": string, "bullets": [string] }],
  "skills": [string],
  "education": [{ "institution": string, "credential": string, "field": string, "startDate": string, "endDate": string }],
  "achievements": [string],
  "additionalSections": [{ "title": string, "items": [string] }]
}`;

export function buildTailorPrompt({ profileJson, jdText, steering }) {
  const system = [
    {
      type: 'text',
      text: [
        'You are a resume tailoring assistant. You will be given a candidate\'s full profile as JSON',
        '(their complete, verified history) and a job description. Produce a tailored one-page resume',
        'by selecting and reprioritizing content FROM THE PROFILE ONLY.',
        'Rules: (1) Never invent skills, employers, dates, titles, or achievements not present in the profile.',
        '(2) Mirror the job description\'s exact terminology in the skills/bullets wherever the profile genuinely',
        'supports it, for ATS matching. (3) Select only the most relevant profile content for this job — do not',
        'dump everything. (4) Write a short 3-4 line professional summary that hooks, not lists. (5) This must work',
        'for any profession — do not assume a technical/software shape.',
        `Output strictly valid JSON matching this shape, nothing else:\n${SCHEMA_DESCRIPTION}`,
      ].join(' '),
      cache_control: PROMPT_CACHE_CONTROL,
    },
    {
      type: 'text',
      text: `Candidate profile JSON:\n${JSON.stringify(profileJson)}`,
      cache_control: PROMPT_CACHE_CONTROL,
    },
  ];

  const steeringLines = [];
  if (steering?.targetRole) steeringLines.push(`Target role: ${steering.targetRole}`);
  if (steering?.tone) steeringLines.push(`Tone: ${steering.tone}`);
  if (steering?.seniority) steeringLines.push(`Seniority framing: ${steering.seniority}`);
  if (steering?.emphasis) steeringLines.push(`Emphasize (reprioritize existing content only, do not add new claims): ${steering.emphasis}`);

  const messages = [
    {
      role: 'user',
      content: [
        `Job description:\n${jdText}`,
        steeringLines.length > 0 ? `\nSteering hints:\n${steeringLines.join('\n')}` : '',
      ].join('\n'),
    },
  ];

  return { system, messages };
}
