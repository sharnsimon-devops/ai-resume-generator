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

export function buildTailorPrompt({ profileJson, jdText, steering, gapAnswers, keywordList }) {
  // When gap answers are present, use the enhanced prompt from the analyze→generate pipeline
  const hasGapContext = Array.isArray(gapAnswers) && gapAnswers.length > 0;
  const hasKeywords = Array.isArray(keywordList) && keywordList.length > 0;

  const baseRules = hasGapContext
    ? [
        'You write a tailored, one-page resume as strictly valid JSON. Follow every rule exactly.',
        '',
        'POSITIONING',
        'Sell the candidate as a problem-solver, not a skills list. For every JD requirement matched to real experience,',
        'describe the specific problem they solved with it — not a bare keyword mention.',
        '',
        'BULLET FORMULA',
        'Every achievement bullet: Accomplished X, measured by Y (a real number, only if the profile or confirmed',
        'answers actually contain one), by doing Z (the method — this is the JD keyword being matched).',
        'Do not invent a number that isn\'t present in the source material.',
        '',
        'KEYWORD MIRRORING',
        'Use the JD\'s own terms from the keyword list, wherever the candidate\'s real background genuinely supports it.',
        'Do not force a keyword onto an unrelated bullet.',
        '',
        'HONESTY — HARD CONSTRAINTS',
        '- Never state a skill, tool, employer, title, date, or achievement that isn\'t in the candidate\'s profile or their confirmed gap answers.',
        '- Where a gap was flagged and the user\'s answer only partially confirms the requirement, phrase the bullet exactly as caveated by their answer — never round up to a full, confident claim.',
        '- Do not merge or conflate two different roles/projects into one to make a stronger claim.',
        '',
        'FORMAT',
        '- Reverse-chronological order, current/most recent role first.',
        '- Summary section: 2-3 lines, a hook, not a list.',
        '- One page unless the user\'s real history genuinely can\'t fit — cut low-relevance content before shrinking font/margins.',
        '- Cut anything that doesn\'t map to a JD keyword or requirement — no filler.',
      ]
    : [
        'You are a resume tailoring assistant. You will be given a candidate\'s full profile as JSON',
        '(their complete, verified history) and a job description. Produce a tailored one-page resume',
        'by selecting and reprioritizing content FROM THE PROFILE ONLY.',
        'Rules: (1) Never invent skills, employers, dates, titles, or achievements not present in the profile.',
        '(2) Mirror the job description\'s exact terminology in the skills/bullets wherever the profile genuinely',
        'supports it, for ATS matching. (3) Select only the most relevant profile content for this job — do not',
        'dump everything. (4) Write a short 3-4 line professional summary that hooks, not lists. (5) This must work',
        'for any profession — do not assume a technical/software shape.',
      ];

  const system = [
    {
      type: 'text',
      text: [
        ...baseRules,
        `\nOutput strictly valid JSON matching this shape, nothing else:\n${SCHEMA_DESCRIPTION}`,
      ].join('\n'),
      cache_control: PROMPT_CACHE_CONTROL,
    },
    {
      type: 'text',
      text: `Candidate profile JSON:\n${JSON.stringify(profileJson)}`,
      cache_control: PROMPT_CACHE_CONTROL,
    },
  ];

  // Add confirmed gap answers to the system context if present
  if (hasGapContext) {
    system.push({
      type: 'text',
      text: `CONFIRMED GAP ANSWERS:\n${JSON.stringify(gapAnswers, null, 2)}`,
      cache_control: PROMPT_CACHE_CONTROL,
    });
  }

  const steeringLines = [];
  if (steering?.targetRole) steeringLines.push(`Target role: ${steering.targetRole}`);
  if (steering?.tone) steeringLines.push(`Tone: ${steering.tone}`);
  if (steering?.seniority) steeringLines.push(`Seniority framing: ${steering.seniority}`);
  if (steering?.emphasis) steeringLines.push(`Emphasize (reprioritize existing content only, do not add new claims): ${steering.emphasis}`);

  const userContentParts = [`Job description:\n${jdText}`];
  if (steeringLines.length > 0) userContentParts.push(`\nSteering hints:\n${steeringLines.join('\n')}`);
  if (hasKeywords) userContentParts.push(`\nKEYWORDS TO MIRROR:\n${keywordList.join(', ')}`);

  const messages = [
    {
      role: 'user',
      content: userContentParts.join('\n'),
    },
  ];

  return { system, messages };
}

