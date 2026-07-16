import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import pdfParse from 'pdf-parse';

import { renderResumeToPdf, closeBrowser } from '../../src/services/renderService.js';
import { tailorMock } from '../../src/prompts/mocks/tailor.mock.js';

after(async () => {
  await closeBrowser();
});

test('renders a PDF containing sections that have data, omitting empty ones', async () => {
  const pdfBuffer = await renderResumeToPdf(tailorMock);
  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.ok(pdfBuffer.length > 0);

  const { text } = await pdfParse(pdfBuffer);

  assert.match(text, /Jordan Rivera/);
  assert.match(text, /EXPERIENCE/i);
  assert.match(text, /CERTIFICATIONS/i);
  // tailorMock.achievements is an empty array — its heading must not render.
  assert.doesNotMatch(text, /ACHIEVEMENTS/i);
});

test('a domain-specific additional section (not a hardcoded heading) renders correctly', async () => {
  const pdfBuffer = await renderResumeToPdf({
    contact: { name: 'Alex Doe' },
    workHistory: [],
    skills: [],
    education: [],
    achievements: [],
    additionalSections: [{ title: 'Clinical Placements', items: ['Pediatric ward, 12 weeks'] }],
  });

  const { text } = await pdfParse(pdfBuffer);
  assert.match(text, /Clinical Placements/i);
  assert.doesNotMatch(text, /EXPERIENCE/i);
});
