// Mock fixture for the analyze endpoint — used when ANTHROPIC_MOCK_MODE=true
export const analyzeMock = {
  matched_requirements: [
    {
      requirement: 'JavaScript/TypeScript experience',
      evidence_ref: 'Skills: JavaScript, TypeScript; Work history at multiple companies using these technologies',
    },
    {
      requirement: 'React development',
      evidence_ref: 'Skills: React; Work history includes React-based projects',
    },
    {
      requirement: 'Team collaboration',
      evidence_ref: 'Work history shows cross-functional team experience across multiple roles',
    },
  ],
  flagged_gaps: [
    {
      id: 'gap_1',
      requirement: 'Kubernetes cluster management',
      reason: 'Profile lists Docker in skills but does not mention Kubernetes or container orchestration experience.',
      question: 'Do you have hands-on experience managing Kubernetes clusters, or is container orchestration something you\'ve only worked with indirectly?',
    },
    {
      id: 'gap_2',
      requirement: '5+ years of backend development',
      reason: 'Profile shows several roles but years of specifically backend-focused work are not clearly calculable from the dates and titles provided.',
      question: 'Can you confirm you have at least 5 years of dedicated backend development experience?',
    },
  ],
  keyword_list: [
    'React',
    'TypeScript',
    'Node.js',
    'Kubernetes',
    'CI/CD',
    'REST APIs',
    'microservices',
    'agile',
  ],
};
