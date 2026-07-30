// Mock fixture for the qualitative score endpoint — used when ANTHROPIC_MOCK_MODE=true
export const scoreMock = {
  quantification_score: 68,
  relevance_score: 75,
  clarity_score: 82,
  notes: [
    'The third bullet under the most recent role claims "improved system reliability" — specify the metric (uptime %, incident reduction, etc.).',
    'Skills section lists technologies but doesn\'t distinguish proficiency levels; consider grouping by expertise.',
    'Summary reads as a list of technologies rather than a hook about impact — lead with the biggest outcome.',
    'Several bullets start with "Responsible for" — rewrite with action verbs like "Designed", "Implemented", "Reduced".',
  ],
};
