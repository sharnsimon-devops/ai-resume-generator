import { tailorMock } from './tailor.mock.js';

export const guardrailMock = {
  resume: {
    ...tailorMock,
    skills: tailorMock.skills.filter((skill) => skill !== 'Trauma care'),
  },
  flags: [
    {
      field: 'skills',
      issue: '"Trauma care" does not appear in the original profile\'s skills list and was not grounded elsewhere in the profile.',
      action: 'stripped',
      originalValue: 'Trauma care',
    },
  ],
};
