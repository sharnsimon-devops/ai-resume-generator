const SCHEMA_DESCRIPTION = `{
  "contact": { "name": string, "email": string, "phone": string, "location": string, "links": [{ "label": string, "url": string }] },
  "summary": string,
  "workHistory": [{ "organization": string, "title": string, "startDate": string, "endDate": string, "location": string, "bullets": [string] }],
  "skills": [string],
  "education": [{ "institution": string, "credential": string, "field": string, "startDate": string, "endDate": string }],
  "achievements": [string],
  "additionalSections": [{ "title": string, "items": [string] }]
}`;

export function buildExtractionPrompt({ rawText }) {
  const system = [
    {
      type: 'text',
      text: [
        'You extract structured resume profile data from raw text supplied by a user.',
        'You must not invent, infer, or embellish anything not explicitly present in the source text —',
        'no skills, employers, dates, titles, or achievements that are not written there.',
        'If a field or section has no supporting text, omit it rather than guessing.',
        'This must work for any profession (nurse, teacher, salesperson, engineer, etc.) — use',
        '"additionalSections" for domain-specific groupings that do not fit the fixed fields',
        '(e.g. "Clinical placements", "Certifications", "Publications").',
        `Output strictly valid JSON matching this shape, nothing else:\n${SCHEMA_DESCRIPTION}`,
      ].join(' '),
    },
  ];

  const messages = [{ role: 'user', content: rawText }];

  return { system, messages };
}
