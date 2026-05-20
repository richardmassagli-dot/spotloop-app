# myspot – Supabase Setup (5 Min)

> Basiert auf deiner Anleitung aus `Desktop/spotloop/SUPABASE_SETUP.md`,  
> angepasst an **`myspot-app`** (blaues Design, Port 5173).

## 1. Projekt erstellen

1. https://supabase.com → **New project**
2. Name: `myspot` · Region: **Frankfurt (eu-central-1)**

## 2. Zugangsdaten in `.env.local`

Im Projektordner `/Users/richardmassagli/myspot-app`:

**Settings → API** → Project URL + `anon` public key kopieren:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Datei: `.env.local` (liegt schon vor — Werte eintragen, nicht committen).

## 3. Datenbank einrichten

**SQL Editor → New query** → komplette Datei ausführen:

```
supabase/schema.sql
```

### Wichtig (Unterschied zur älteren spotloop-Anleitung)

| Thema | Ältere Anleitung | Diese App (`myspot-app`) |
|--------|------------------|---------------------------|
| `spots.id` | `gen_random_uuid()` | **= Händler-User-ID** (`auth.users.id`) |
| QR-Check-in | separate Spot-UUID | Link `?checkin=<merchant-uuid>` |
| Koordinaten | nicht im Schema | `lat`, `lng` für Discover-Karte |
| Check-ins | — | Tabelle `checkins` für Analytics |

Ohne `id = merchant_id` funktionieren QR-Code, Dashboard und `createSpot()` nicht.

## 4. Row Level Security

Ist bereits in `supabase/schema.sql` enthalten (Spots lesbar, Händler schreibt eigenen Spot, Gäste eigene Stamps/Follows).

## 5. Auth konfigurieren

**Authentication → Providers → Email** aktivieren.

**Authentication → URL configuration:**

| Feld | Wert (Entwicklung) |
|------|---------------------|
| Site URL | `http://localhost:5173` |
| Redirect URLs | `http://localhost:5173/**` |

**Email confirmations:** für Entwicklung **aus**, für Produktion **an**.

## 6. App starten

```bash
export PATH="$HOME/.local/node/bin:$PATH"   # falls npm nicht global
cd /Users/richardmassagli/myspot-app
npm run dev
```

Öffnen: **http://localhost:5173/**

Gelber Banner „Demo-Modus“ = Supabase-Keys fehlen oder Server neu starten nach `.env.local`.

---

## Testen

### Als Händler

1. Registrieren → **Als Händler**
2. Setup (Kategorie, Stadtteil, Reward)
3. Optional: in Supabase **Table Editor → spots** `lat` / `lng` setzen (z. B. `48.7758`, `9.1829`) damit der Spot auf der Karte erscheint
4. QR aus dem Dashboard → Link `http://localhost:5173/?checkin=<deine-user-uuid>`

### Als Gast

1. Inkognito → **Als Gast** registrieren
2. QR-Link des Händlers öffnen → Check-in → Punkt sichern
3. **Wallet** zeigt echte Stempelkarte (keine Demo-Spots mehr)

---

## Deployment (Vercel)

```bash
npm run build
npx vercel --prod
```

In Vercel **Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase **Site URL** auf deine Vercel-Domain setzen.

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Demo-Spots auf der Karte | `.env.local` prüfen, `npm run dev` neu starten |
| „Spot nicht gefunden“ beim Check-in | Händler-Setup abgeschlossen? `spots`-Zeile mit `id = merchant uuid`? |
| Registrierung schlägt fehl | Email-Provider an, Confirmations aus (Dev) |
| RLS-Fehler beim Stamp | `schema.sql` vollständig ausgeführt? |

Mehr Details: `PRODUCTION.md`
