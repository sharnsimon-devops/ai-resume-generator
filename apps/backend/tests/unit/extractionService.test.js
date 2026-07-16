import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractProfile } from '../../src/services/extractionService.js';
import { ProfileSchema } from '../../src/utils/validation.js';

test('extractProfile returns a schema-valid profile in mock mode', async () => {
  const profile = await extractProfile({ rawText: 'irrelevant in mock mode', apiKey: null });
  const result = ProfileSchema.safeParse(profile);
  assert.equal(result.success, true);
  assert.ok(profile.workHistory.length > 0);
});

test('ProfileSchema rejects malformed AI output', () => {
  const malformed = { workHistory: 'not-an-array', skills: 42 };
  const result = ProfileSchema.safeParse(malformed);
  assert.equal(result.success, false);
});
