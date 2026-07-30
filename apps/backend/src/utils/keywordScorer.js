/**
 * Deterministic keyword/structure scoring — computed in code, not by the LLM.
 * This ensures reproducibility and auditability for the ATS score components
 * that real ATS systems actually filter on.
 */

/**
 * Calculate what percentage of the keyword list appears in the resume text.
 * Uses case-insensitive matching with basic word-boundary awareness.
 * @param {string} resumeText - Full text of the resume
 * @param {string[]} keywordList - Keywords to search for
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
export function calculateKeywordCoverage(resumeText, keywordList) {
  if (!keywordList || keywordList.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }

  const normalizedText = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const keyword of keywordList) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (!normalizedKeyword) continue;

    // Check for the keyword as a substring (case-insensitive)
    // This handles multi-word phrases like "CI/CD" or "REST APIs"
    if (normalizedText.includes(normalizedKeyword)) {
      matched.push(keyword);
    } else {
      // Try basic stemming: remove common suffixes and check again
      const stemmed = basicStem(normalizedKeyword);
      if (stemmed !== normalizedKeyword && normalizedText.includes(stemmed)) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  }

  const score = Math.round((matched.length / keywordList.length) * 100);
  return { score, matched, missing };
}

/**
 * Check if the resume contains basic contact information that ATS systems expect.
 * @param {object} resumeJson - Parsed resume JSON with contact field
 * @returns {{ score: number, details: object }}
 */
export function calculateContactCompleteness(resumeJson) {
  const contact = resumeJson?.contact || {};

  const hasName = Boolean(contact.name && contact.name.trim().length > 0);
  const hasEmailOrPhone = Boolean(
    (contact.email && contact.email.trim().length > 0) ||
    (contact.phone && contact.phone.trim().length > 0)
  );
  const hasLocation = Boolean(contact.location && contact.location.trim().length > 0);

  const checks = [hasName, hasEmailOrPhone, hasLocation];
  const passed = checks.filter(Boolean).length;
  const score = passed / checks.length;

  return {
    score,
    details: { hasName, hasEmailOrPhone, hasLocation },
  };
}

/**
 * Check if the resume has clearly labeled standard sections that ATS parsers rely on.
 * @param {object} resumeJson - Parsed resume JSON
 * @returns {{ score: number, details: object }}
 */
export function calculateSectionPresence(resumeJson) {
  const hasExperience = Array.isArray(resumeJson?.workHistory) && resumeJson.workHistory.length > 0;
  const hasSkills = Array.isArray(resumeJson?.skills) && resumeJson.skills.length > 0;
  const hasEducation = Array.isArray(resumeJson?.education) && resumeJson.education.length > 0;

  const checks = [hasExperience, hasSkills, hasEducation];
  const passed = checks.filter(Boolean).length;
  const score = passed / checks.length;

  return {
    score,
    details: { hasExperience, hasSkills, hasEducation },
  };
}

/**
 * Convert a resume JSON object to a flat text string for keyword searching.
 * @param {object} resumeJson
 * @returns {string}
 */
export function resumeJsonToText(resumeJson) {
  const parts = [];

  if (resumeJson?.contact) {
    const c = resumeJson.contact;
    if (c.name) parts.push(c.name);
    if (c.email) parts.push(c.email);
    if (c.phone) parts.push(c.phone);
    if (c.location) parts.push(c.location);
    if (c.links) c.links.forEach((l) => parts.push(`${l.label} ${l.url}`));
  }

  if (resumeJson?.summary) parts.push(resumeJson.summary);

  if (resumeJson?.workHistory) {
    for (const job of resumeJson.workHistory) {
      if (job.organization) parts.push(job.organization);
      if (job.title) parts.push(job.title);
      if (job.location) parts.push(job.location);
      if (job.bullets) parts.push(...job.bullets);
    }
  }

  if (resumeJson?.skills) parts.push(...resumeJson.skills);

  if (resumeJson?.education) {
    for (const edu of resumeJson.education) {
      if (edu.institution) parts.push(edu.institution);
      if (edu.credential) parts.push(edu.credential);
      if (edu.field) parts.push(edu.field);
    }
  }

  if (resumeJson?.achievements) parts.push(...resumeJson.achievements);

  if (resumeJson?.additionalSections) {
    for (const section of resumeJson.additionalSections) {
      if (section.title) parts.push(section.title);
      if (section.items) parts.push(...section.items);
    }
  }

  return parts.join(' ');
}

/**
 * Very basic English stemming — strips common suffixes.
 * Not a full Porter stemmer, but enough for "managed" → "manag", "development" → "develop", etc.
 */
function basicStem(word) {
  return word
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/ment$/, '')
    .replace(/ed$/, '')
    .replace(/ly$/, '')
    .replace(/er$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '');
}
