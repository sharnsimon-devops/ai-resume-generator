# Supabase project setup (manual, one-time)

These steps must be done by you in the Supabase dashboard — they can't be automated from here.

1. Go to https://supabase.com → **New project**. Pick an org, a project name (e.g. `resume-builder`), a strong DB password (save it somewhere — needed only if you use the CLI's direct DB connection), and a region. Wait for provisioning (~1-2 min).

2. **Project Settings → API**. Copy these three values:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (secret — never put this in the frontend `.env` or commit it anywhere)

3. Fill in `apps/backend/.env` (copy from `.env.example` if you haven't):
   ```
   SUPABASE_URL=<project url>
   SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```

4. Fill in `apps/frontend/.env` (copy from `.env.example` if you haven't):
   ```
   VITE_SUPABASE_URL=<project url>
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```

5. **Authentication → Providers**: confirm Email is enabled (it is by default).

6. **Authentication → Settings**: for local dev convenience you can disable "Confirm email" so signup works instantly without needing to click an email link. This is a dev-only convenience — re-enable it before any real deployment.

7. **Authentication → URL Configuration**: set Site URL to `http://localhost:5173` and add it to the Redirect URLs list.

8. Run the migration — either:
   - **Dashboard**: SQL Editor → paste the full contents of `supabase/migrations/0001_init.sql` → Run.
   - **CLI** (if you have the Supabase CLI installed): from the repo root, `supabase login`, `supabase link --project-ref <project-ref>` (the ref is in the project URL/settings), then `supabase db push`.

9. Verify: Table Editor should show `profiles` and `generations`, each with the RLS "enabled" shield icon.

10. Generate the BYOK master encryption key locally and add it to `apps/backend/.env`:
    ```
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
    Copy the output into `MASTER_KEY=`. Never commit this value.

Once steps 1-10 are done, tell me and I'll move on to wiring up auth against your project.
