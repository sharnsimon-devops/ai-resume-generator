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
      'PROFESSIONAL PROFILE',
      '- Open directly with a title/experience statement (e.g., "Registered Nurse with 5 years of experience in..." or "Marketing Manager with a track record of...").',
      '- Never use a generic hook like "I am passionate about...".',
      '- Back it with concrete evidence (a standout result or two) relevant to the target role.',
      '- Keep it tight (2-3 sentences max).',
      '',
      'BULLET FORMULA & EXPERIENCE REPHRASING',
      '- Rewrite and rephrase EVERY bullet point in the work history to heavily highlight relevance to the provided job description.',
      '- Shuffle and use a highly diverse, unique set of strong action verbs for every generation. Do not reuse the same repetitive verbs.',
      '- Ensure the phrasing and structure of the resume feels unique and tailored specifically for this JD every time it is generated.',
      '- Integrate JD keywords naturally into the experience bullets.',
      '- Use this formula: Accomplished X, measured by Y (a real number if one exists), by doing Z (the method/tool/approach).',
      '- Every bullet should read as "solved a specific problem" or "delivered a specific result," not "was responsible for X".',
      '- Quantify wherever a real number exists.',
      "- Do not invent a number that isn't present in the source material.",
      '',
      'GAP ANSWERS INTEGRATION',
      '- You MUST explicitly use the provided CONFIRMED GAP ANSWERS to write specific, value-adding bullet points in the work history or professional profile.',
      '- Do not ignore the gap answers, they are critical to match the job description.',
      '',
      'KEYWORD MIRRORING',
      "Use the JD's own terms from the keyword list, wherever the candidate's real background genuinely supports it.",
      'Do not force a keyword onto an unrelated bullet.',
      '',
      'HONESTY — HARD CONSTRAINTS',
      "- Never state a skill, tool, employer, title, date, or achievement that isn't in the candidate's profile or their confirmed gap answers.",
      "- Where a gap was flagged and the user's answer only partially confirms the requirement, phrase the bullet exactly as caveated by their answer — never round up to a full, confident claim.",
      '- Do not merge or conflate two different roles/projects into one to make a stronger claim.',
      '',
      'SKILLS CATEGORIZATION',
      '- Output skills as categorized strings using this exact format: "Category Name: Skill 1, Skill 2, Skill 3".',
      '- Example: "Cloud Platforms: AWS (EC2, EKS), Azure (Key Vault)".',
      '- Use markdown bolding (**term**) around the most important keywords that directly match the JD.',
      '',
      'FORMAT & LENGTH (CRITICAL)',
      '- Reverse-chronological order, current/most recent role first.',
      "- STRICT ONE PAGE LIMIT: You MUST ruthlessly cut low-relevance content.",
      "- MAXIMUM 700 WORDS TOTAL. If you exceed this, the PDF will break.",
      "- Cut anything that doesn't map to a JD keyword or requirement — no filler.",
    ]
    : [
      "You are a resume tailoring assistant. You will be given a candidate's full profile as JSON",
      '(their complete, verified history) and a job description. Produce a tailored one-page resume',
      'by selecting and reprioritizing content FROM THE PROFILE ONLY.',
      'Rules:',
      '(1) Professional Profile: Open directly with a title/experience statement. Back it with concrete evidence.',
      '(2) Bullet Formula & Experience Rephrasing: Rewrite and rephrase EVERY bullet point in the work history to heavily highlight relevance to the JD, integrating keywords naturally. Shuffle and use a highly diverse, unique set of strong action verbs for every generation to ensure unique phrasing. Use the formula: Accomplished X, measured by Y, by doing Z.',
      '(3) Never invent skills, employers, dates, titles, or achievements not present in the profile.',
      "(4) Mirror the job description's exact terminology in the skills/bullets wherever the profile genuinely",
      'supports it, for ATS matching.',
      '(5) Select only the most relevant profile content for this job — do not dump everything.',
      '(6) Categorize skills in the skills array using format "Category: Skill 1, Skill 2" and bold key terms using **term**.',
      '(7) STRICT ONE PAGE LIMIT: Maximum 700 words total. Be ruthless with cutting fluff.',
      '(8) This must work for any profession — do not assume a technical/software shape.',
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


