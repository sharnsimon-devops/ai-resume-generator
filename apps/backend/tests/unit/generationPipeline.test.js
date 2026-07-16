import { test } from 'node:test';
import assert from 'node:assert/strict';

import { tailorResume } from '../../src/services/tailorService.js';
import { verifyResume } from '../../src/services/guardrailService.js';
import { extractionMock } from '../../src/prompts/mocks/extraction.mock.js';

test('tailor -> guardrail pipeline runs on mock fixtures and the guardrail strips an ungrounded claim', async () => {
  const draft = await tailorResume({
    profileJson: extractionMock,
    jdText: 'Seeking an ER nurse with trauma triage experience.',
    steering: { targetRole: 'ER Nurse', tone: 'impact-focused' },
    apiKey: null,
  });

  assert.ok(draft.skills.includes('Trauma care'), 'fixture draft should include the ungrounded skill pre-guardrail');

  const { resume, flags } = await verifyResume({
    draftResumeJson: draft,
    profileJson: extractionMock,
    apiKey: null,
  });

  assert.ok(!resume.skills.includes('Trauma care'), 'guardrail must strip skills not present in the original profile');
  assert.equal(flags.length, 1);
  assert.equal(flags[0].action, 'stripped');
});

test('guardrailService.verifyResume signature excludes steering entirely', () => {
  assert.equal(verifyResume.length <= 1, true, 'verifyResume should take a single options object, never a steering param');
});
