# Roxit

Hyrox London training app (8-week plan, guided workouts, race forecast). Static site + Supabase, deploy on Vercel.

- Supabase: run `supabase/schema.sql`; set URL/key in `config.js`. Add your Vercel URL under Auth > URL Configuration.
- Optional coach read: set `ANTHROPIC_API_KEY` in Vercel env.
- Deploy: import this repo in Vercel (no build step).
