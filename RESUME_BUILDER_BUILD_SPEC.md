# AI Resume Builder — Full Build Specification

You are building a multi-user web application that generates tailored, ATS-optimised resumes from a job description. This document is the complete spec. Read all of it before writing code. Build in the phases defined at the end — do not build later phases before earlier ones work.

---

## 1. Product summary

A user creates an account, builds a structured profile once (by pasting an old resume, uploading a file, or filling a form), then repeatedly pastes a job description (JD) and gets back a tailored one-page resume as a downloadable PDF, produced in under a minute.

The core differentiator is a **guardrail step**: the app must never invent skills, metrics, employers, or achievements that are not present in the user's own profile. Every claim on the generated resume must trace back to something the user actually provided. This "verified, not embellished" property is the product's main selling point and must not be compromised by any feature.

The app is **domain-agnostic**: it must work equally for a nurse, teacher, salesperson, or software engineer. Nothing in the pipeline or templates may assume a technical/software resume.

---

## 2. Tech stack (fixed — do not substitute)

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database + Auth:** Supabase (managed Postgres). Use Supabase Auth for signup/login; the Express backend verifies Supabase-issued JWTs.
- **AI:** Anthropic API (`@anthropic-ai/sdk`). Use the current recommended model; make the model name a configurable constant, not hardcoded throughout.
- **Default render engine:** HTML/CSS → PDF via Puppeteer (Node-native).
- **Advanced render engine:** User-supplied LaTeX, compiled in an isolated sandbox (Phase 3).
- **API keys:** Bring-your-own-key (BYOK) — each user supplies their own Anthropic API key. No shared/billing key in the MVP.

---

## 3. Architecture overview

Shared pipeline, two output engines:

```
Profile (JSON) + pasted JD
        │
        ▼
  Tailor agent  (1 Anthropic call — drafts tailored resume as structured JSON)
        │
        ▼
  Guardrail agent (1 Anthropic call — verifies draft against original profile, strips/flags anything ungrounded)
        │
        ▼
  Verified content JSON
        │
        ├──────────────► HTML → PDF engine   (default, fast, safe)
        │
        └──────────────► LaTeX worker        (advanced, sandboxed, no secrets, no network)
        │
        ▼
     PDF to user
```

Rules that follow from this architecture:
- The guardrail runs on **both** render paths. Custom LaTeX controls layout only — never content. A user's template cannot reintroduce fabricated claims.
- Profile extraction runs **once** at profile setup, not per generation, so it does not count against the per-generation speed budget.
- Exactly **two** Anthropic calls per generation (tailor + guardrail). Do not add a third without explicit instruction — it breaks the speed target.

---

## 4. Speed target

End-to-end generation must complete in **under ~60 seconds** (realistic target 15–35s). To hold this:
- Use Anthropic **prompt caching** on the profile context so it is not re-sent/re-processed every generation.
- **Stream progress** to the UI (e.g. "tailoring…", "verifying…", "rendering…") so it feels fast even while calls run.
- Keep the render step deterministic (no LLM in rendering).

---

## 5. Data model (Supabase / Postgres)

Create these tables. Every table must have **Row Level Security (RLS) enabled** with policies scoping rows to the authenticated user (`auth.uid()`). This is non-negotiable — the app holds users' personal data and tenant isolation must be enforced at the database layer, not just in app code.

### `profiles`
- `id` (uuid, pk)
- `user_id` (uuid, fk → auth.users, unique)
- `profile_json` (jsonb) — structured profile: contact, summary, work history, skills, education, achievements. Schema must be flexible/domain-agnostic (sections defined by data, not hardcoded to tech).
- `anthropic_key_enc` (text) — user's Anthropic API key, encrypted (see §6). Never selectable from any client-readable path.
- `created_at`, `updated_at` (timestamptz)
- RLS: user can only read/write their own row.

### `generations`
- `id` (uuid, pk)
- `user_id` (uuid, fk → auth.users)
- `jd_text` (text) — the pasted job description
- `steering_json` (jsonb) — constrained user steering (tone, seniority, emphasis) — see §7
- `result_json` (jsonb) — the verified content JSON that was rendered
- `render_engine` (text) — 'html' or 'latex'
- `flags_json` (jsonb) — anything the guardrail flagged/stripped (for user transparency)
- `created_at` (timestamptz)
- RLS: user can only read their own generations.

Index `generations(user_id, created_at desc)` for history listing. Use JSONB GIN indexes where profile/result JSON is queried.

---

## 6. BYOK — encrypted API key handling (security-critical)

- **Never store the key in plaintext.** Encrypt with **AES-256-GCM** before storing in `anthropic_key_enc`.
- The master encryption key lives in a backend env var (`MASTER_KEY`) or a secrets manager — never in the database, never in the frontend, never in the repo.
- **Encrypt and decrypt only in the Express backend.** Do not use Supabase client-side access for anything touching this column.
- Decrypt only at the moment of the Anthropic call; let the plaintext key go out of scope immediately after. Do not cache it.
- **Validate on entry:** when the user saves a key, make one cheap test call to the Anthropic API to confirm it works, and give immediate feedback if invalid.
- Never send the key back to the frontend after saving — not even masked/partial beyond a last-4 display generated at save time.
- **Never log the raw key** — not in app logs, not in error tracking, not in request dumps. This is the most common leak vector. Scrub it everywhere.
- Let users delete/rotate their key at any time.

Provide clean `encrypt(plaintext, masterKey)` and `decrypt(ciphertext, masterKey)` helpers (AES-256-GCM with a random IV per encryption, IV + auth tag stored alongside ciphertext).

---

## 7. User steering — constrained, NOT a free prompt (design-critical)

Users must be able to influence the resume, but they must **not** be able to write the full generation prompt, because that would let them defeat the guardrail (e.g. "make me sound like a senior architect" when they aren't one).

Provide **constrained** steering inputs only, which ride on top of the guardrail:
- Target role / title (text)
- Tone / register (select: e.g. formal, plain, impact-focused)
- Seniority framing (select — but the guardrail still prevents claiming experience the profile doesn't support)
- Optional "emphasise this" free-text box (used to *prioritise* existing profile content, never to add new claims)

The steering is passed to the tailor agent as structured hints. The guardrail agent ignores steering entirely and only checks generated content against the original profile. Steering can reorder and reframe; it can never introduce ungrounded facts.

---

## 8. The two agents (Anthropic calls)

### 8a. Extraction (runs once, at profile setup — not per generation)
- Input: raw resume text or uploaded file (PDF/docx text extracted server-side) or form data.
- Output: structured Profile JSON (domain-agnostic schema).
- Must not invent anything — only structure what the user provided.

### 8b. Tailor agent (per generation)
- Input: Profile JSON + JD text + steering hints.
- Output: structured Resume JSON — selected/prioritised bullets, a short 3–4 line professional summary, skills section with **exact JD keyword mirroring** for ATS, ordered to match the JD.
- Instruction: mirror the JD's exact terminology where the profile supports it. Select the most relevant profile content for this JD; do not dump everything. Keep the summary short (3–4 lines) — hook, don't list.
- Target: one page of content.

### 8c. Guardrail agent (per generation)
- Input: the tailor agent's Resume JSON **and** the original Profile JSON.
- Task: check every claim in the Resume JSON against the Profile JSON. Strip or flag anything not grounded in the profile — invented skills, inflated metrics, employers/dates not present, exaggerated seniority.
- Output: verified Resume JSON + a list of flags (what was removed/changed and why), stored in `flags_json` and optionally surfaced to the user for transparency.
- The guardrail is the product. It must run on every generation regardless of render engine.

---

## 9. Render engines

### 9a. HTML → PDF (default — build first, Phase 1)
- Take verified Resume JSON → render into a clean, **domain-agnostic** HTML/CSS template → Puppeteer → PDF.
- Sections are driven by the data present, not hardcoded — a resume with no "Projects" simply omits that section; a resume with "Clinical placements" renders that. Do not assume a software-engineering shape.
- Ship 1 template in Phase 1; 2–3 selectable designs in Phase 2.
- Fast, safe, no sandbox required.

### 9b. Sandboxed LaTeX worker (advanced — Phase 3)
User-supplied LaTeX is untrusted code and a known RCE vector. It must be compiled in a locked-down, ephemeral sandbox that contains **none** of the app's secrets and has **no network**.

Requirements (all mandatory):
- **`-no-shell-escape` always.** Never enable shell-escape.
- **One ephemeral container per compile** (Docker; consider gVisor/Firecracker for stronger isolation), destroyed after each run. Nothing persists between users.
- **No network:** run with `--network none`.
- **No secrets in the sandbox:** the container only ever sees the user's `.tex` file + their own resume JSON. Anthropic key, DB creds, `MASTER_KEY`, and all env vars stay in the app process, never in the compile container.
- **Non-root user, read-only filesystem** except a scratch temp dir; drop Linux capabilities.
- **Hard resource limits:** CPU, memory (`--memory`), wall-clock timeout (kill after ~10–20s), output file-size cap — to stop infinite-expansion / DoS templates.
- **Input validation:** before compiling, strip/reject dangerous primitives (`\write18`, absolute-path `\input`/`\include`, `\openin`, `\read`). Belt-and-braces on top of the sandbox, not instead of it.
- **Minimal TeX image:** don't ship a full texlive with every tool — smaller image = smaller attack surface.
- **Architecture:** render becomes "dispatch a job to an isolated worker" — a job queue + worker pattern, not an in-process call:
  ```
  app server → job queue → ephemeral sandboxed compile worker (no secrets, no net) → PDF back
  ```
- The guardrail still runs before this — the user's LaTeX controls layout only, never content.
- If a user just wants LaTeX output without server compile, also offer the generated `.tex` as a **download** they can compile themselves.

---

## 10. Backend / frontend boundary (security)

- **All sensitive operations go through the Express backend:** Anthropic calls, guardrail, key encryption/decryption, PDF render, LaTeX dispatch. Secrets and guardrail logic stay server-side.
- **Supabase direct client access from React is allowed only for simple, RLS-protected reads** (e.g. "list my past generations"). Never route Anthropic calls, key handling, or generation through the client.
- Backend verifies the Supabase JWT on every protected route.
- **Rate-limit generations per user** (regardless of whose key is used) so a compromised account can't hammer the backend or the user's Anthropic quota.

---

## 11. Core user flows to implement

1. **Sign up / log in** (Supabase Auth).
2. **Add / validate / rotate Anthropic API key** (BYOK, encrypted, validate-on-entry).
3. **Build profile once:** paste resume text / upload PDF or docx / fill form → extraction → editable Profile JSON saved. User can edit the structured profile afterwards.
4. **Generate:** paste JD → set constrained steering → tailor → guardrail → live preview (editable) → download PDF. Show progress states. Surface guardrail flags.
5. **History:** list past generations, re-download, re-generate.

The preview must be **editable** — AI output is a starting point, not take-it-or-leave-it. Edits by the user are allowed (the user editing their own resume is not a guardrail violation).

---

## 12. Non-negotiable principles (carry through every feature)

- **Never fabricate.** The guardrail is the product. No feature may bypass it.
- **Domain-agnostic.** Everything works for any profession. No hardcoded tech-resume assumptions in pipeline or templates.
- **Secrets stay server-side.** Keys never reach the frontend or the LaTeX sandbox.
- **RLS on every table.** Tenant isolation at the database layer.
- **Two Anthropic calls per generation.** Protect the speed budget.
- **Constrained steering, not free prompt.** Users steer; they can't override the guardrail.
- **Untrusted LaTeX is sandboxed.** No exceptions, no shell-escape, no network, no secrets.

---

## 13. Build phases (build in order; each phase ends in something demoable)

**Phase 1 — Core loop, HTML→PDF only (the MVP)**
- Supabase project; schema with RLS on all tables.
- Supabase Auth; backend JWT verification.
- BYOK: encrypted key storage, validate-on-entry, rotate/delete.
- Profile setup: paste/upload/form → extraction → editable Profile JSON.
- Generate: JD paste → constrained steering → tailor → guardrail → verified JSON.
- Render: 1 clean domain-agnostic HTML template → Puppeteer → PDF.
- Per-user rate limiting. Progress streaming. Guardrail flags surfaced.
- **Deliverable:** a working, safe, demoable end-to-end product.

**Phase 2 — Polish the safe path**
- 2–3 selectable template designs.
- Generation history / re-download / re-generate.
- Optional small free-tier quota on a shared key as a fallback for users who stall at BYOK (introduces server-side key usage — keep it rate-limited and separate from user keys).

**Phase 3 — LaTeX engine (differentiator)**
- Job queue + ephemeral sandboxed compile worker per §9b.
- Full sandbox hardening: no network, non-root, read-only FS, resource + timeout limits, `-no-shell-escape`, no secrets, input validation.
- User uploads `.tex` → guardrail-verified content injected → sandboxed compile → PDF. Also offer `.tex` download.

**Phase 4 — Deploy**
- Choose host (managed platform for speed, or AWS/Azure with Terraform/Bicep if infrastructure-as-code is desired). Secrets via the platform's secrets manager. CI/CD for deploys.

---

## 14. What to produce first

Start Phase 1 with: the Supabase schema + RLS policies, then Supabase Auth + backend JWT verification, then the BYOK encrypt/decrypt helpers and key-management endpoints. Then the extraction → profile flow, then the tailor + guardrail generation flow, then the HTML→PDF render. Confirm each piece works before moving on.