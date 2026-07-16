import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
});

export const WorkHistoryEntrySchema = z.object({
  organization: z.string().optional(),
  title: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const EducationEntrySchema = z.object({
  institution: z.string().optional(),
  credential: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Freeform named sections (e.g. "Clinical placements", "Certifications", "Projects") so
// the schema stays domain-agnostic instead of hardcoding a fixed set of section names.
export const AdditionalSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.string()).default([]),
});

export const ProfileSchema = z.object({
  contact: ContactSchema.default({}),
  summary: z.string().optional(),
  workHistory: z.array(WorkHistoryEntrySchema).default([]),
  skills: z.array(z.string()).default([]),
  education: z.array(EducationEntrySchema).default([]),
  achievements: z.array(z.string()).default([]),
  additionalSections: z.array(AdditionalSectionSchema).default([]),
});

export const SteeringSchema = z.object({
  targetRole: z.string().max(200).optional(),
  tone: z.enum(['formal', 'plain', 'impact-focused']).optional(),
  seniority: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  emphasis: z.string().max(500).optional(),
});

// Tailored/verified resume content shares the profile's domain-agnostic shape —
// the tailor agent selects/reorders a subset of it, the guardrail corrects that subset.
export const DraftResumeSchema = ProfileSchema;
export const VerifiedResumeSchema = ProfileSchema;

export const FlagSchema = z.object({
  field: z.string(),
  issue: z.string(),
  action: z.enum(['stripped', 'modified', 'flagged']),
  originalValue: z.string().optional(),
});

export const FlagsSchema = z.array(FlagSchema);
