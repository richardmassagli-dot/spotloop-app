# Spotloop (Frontend)

React + Vite App mit Supabase Auth und Spot-/Treue-Logik.

## Schnellstart

```bash
npm install
npm run dev
```

Umgebungsvariablen (z. B. `.env.local`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (oder `VITE_SUPABASE_PUBLISHABLE_KEY`)

## Wichtige Routen

- `/` — Anmeldung / App
- `/reset-password` — Neues Passwort nach E-Mail-Link
- `/admin/spots` — Ausstehende Spots freischalten (nur mit `is_admin` in User Metadata)

## Produktion & Supabase

Siehe **[GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md)** für die vollständige Abnahme (Redirects, Migration, Admin-User, Tests).

- Passwort-Reset: [PASSWORD_RESET.md](./PASSWORD_RESET.md)
- Admin / RPC: [ADMIN_VERIFICATION.md](./ADMIN_VERIFICATION.md)

## Scripts

| Script | Zweck |
|--------|--------|
| `npm run build` | Produktions-Build |
| `npm run lint` | ESLint |
| `npm run setup:check` | Supabase-Env prüfen |

SQL-Hilfen liegen unter `supabase/scripts/`.
