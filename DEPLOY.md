# spotloop live schalten (Link für Freunde)

`http://localhost:5173` funktioniert **nur auf deinem Rechner**. Für Freunde brauchst du eine **öffentliche URL** (z. B. Vercel).

## Schnellweg (~5 Minuten)

### 1. Einmalig bei Vercel anmelden

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /Users/richardmassagli/myspot-app
npx vercel login
```

Browser öffnet sich → mit GitHub oder E-Mail einloggen.

### 2. Deploy ausführen

```bash
./scripts/deploy-vercel.sh
```

Am Ende steht eine URL, z. B.:

- `https://myspot-app-xxx.vercel.app`  
  oder nach Umbenennung im Vercel-Dashboard: **`https://spotloop.vercel.app`**

**Diesen Link** kannst du an Freunde schicken:

### Live-URL (aktuell)

**https://spotloop-app-wheat.vercel.app** (blaue spotloop-App + Supabase)

Alias-Backup: `https://myspot-app-wheat.vercel.app`

### 3. Supabase für die Live-URL einstellen

Supabase Dashboard → **Authentication** → **URL Configuration**:

| Feld | Wert |
|------|------|
| **Site URL** | `https://DEINE-VERCEL-URL.vercel.app` |
| **Redirect URLs** | `https://DEINE-VERCEL-URL.vercel.app/**` |

Optional: **Email → Confirm email** für den Pilot aus, damit Follower sofort rein können.

### 4. Env auf Vercel (falls Deploy ohne Keys war)

Vercel Dashboard → Projekt → **Settings → Environment Variables**:

- `VITE_SUPABASE_URL` = aus `.env.local`
- `VITE_SUPABASE_ANON_KEY` = aus `.env.local`

→ **Redeploy** nach dem Speichern.

---

## Schönerer Link (optional)

Vercel → Projekt → **Settings → Domains** → z. B. `spotloop.vercel.app` oder eigene Domain `app.spotloop.de`.

---

## Checkliste vor Freunde einladen

- [ ] Migration `supabase/migrations/001_merchant_verification.sql` ausgeführt
- [ ] Pilot-Spots in Supabase auf `verification_status = 'verified'`
- [ ] Spots haben `lat` / `lng` (Stuttgart), sonst fehlen sie auf der Karte
- [ ] Live-URL in Supabase Redirects eingetragen

Siehe auch `MERCHANT_VERIFICATION.md` und `PRODUCTION.md`.
