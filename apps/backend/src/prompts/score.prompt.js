// Tool schema for qualitative ATS scoring via forced tool call
export const ATS_QUALITATIVE_TOOL = {
  name: 'ats_qualitative_score',
  description: "Qualitative scoring of a resume's fit against a job description",
  input_schema: {
    type: 'object',
    required: ['quantification_score', 'relevance_score', 'clarity_score', 'notes'],
    properties: {
      quantification_score: {
        type: 'integer',
        description: '0-100: how well achievements are backed by real numbers',
      },
      relevance_score: {
        type: 'integer',
        description: '0-100: how tightly bullets map to this specific JD vs generic content',
      },
      clarity_score: {
        type: 'integer',
        description: '0-100: readability and scanability for a human reviewer in ~30 seconds',
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 short, specific, actionable improvement suggestions — not generic advice',
      },
    },
  },
};

export const ATS_QUALITATIVE_TOOL_CHOICE = { type: 'tool', name: 'ats_qualitative_score' };

export function buildScorePrompt({ resumeText, jdText }) {
  const system = [
    {
      type: 'text',
      text: [
        'You are an expert resume reviewer scoring a tailored resume against a specific job description.',
        'You are NOT rewriting the resume. You are evaluating it on three qualitative axes.',
        '',
        'Scoring criteria:',
        '- quantification_score (0-100): How well are achievements backed by real, specific numbers?',
        '  High = most bullets include measurable outcomes (%, $, time saved, users served, etc.).',
        '  Low = bullets are vague claims with no quantification.',
        '',
        '- relevance_score (0-100): How tightly do the resume bullets map to THIS specific JD?',
        '  High = every bullet clearly addresses a JD requirement.',
        '  Low = bullets are generic boilerplate that could apply to any job.',
        '',
        '- clarity_score (0-100): How readable and scannable is this resume for a human reviewer in ~30 seconds?',
        '  High = clear hierarchy, concise bullets, logical flow.',
        '  Low = dense paragraphs, confusing structure, buried key info.',
        '',
        '- notes: 3-5 short, specific, actionable improvement suggestions.',
        '  Bad example: "Add more numbers" (too vague).',
        '  Good example: "The second bullet under [Company] claims \'improved performance\' — specify the metric (latency, throughput, etc.) and the % improvement."',
        '',
        'Be honest and precise. Do not inflate scores to be encouraging.',
      ].join('\n'),
    },
  ];

  const messages = [
    {
      role: 'user',
      content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`,
    },
  ];

  return { system, messages };
}
