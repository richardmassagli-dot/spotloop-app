# myspot – Von Prototyp zur Praxis

Die App unter `http://localhost:5173` ist bereits eine **funktionsfähige React-App**. Für den echten Einsatz brauchst du **Supabase** als Backend (Auth + Datenbank). Ohne Supabase läuft alles nur lokal im Browser (Demo-Daten).

## Phase 1 – Backend einrichten (ca. 30 Min.)

### 1. Supabase-Projekt anlegen

1. [supabase.com](https://supabase.com) → neues Projekt
2. **Settings → API** → `Project URL` und `anon public` key kopieren

### 2. Umgebungsvariablen

```bash
cp .env.example .env.local
```

In `.env.local` eintragen:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Datenbank-Schema

Im Supabase **SQL Editor** die Datei `supabase/schema.sql` komplett ausführen.

Das legt an:

| Tabelle | Inhalt |
|---------|--------|
| `spots` | Händler-Profile (1 Spot = 1 Merchant-Account) |
| `stamps` | Stempelkarten der Gäste |
| `follows` | Follower pro Spot |
| `campaigns` | Händler-Kampagnen |
| `checkins` | Check-in-Historie (Analytics) |

### 4. Auth in Supabase

**Authentication → Providers → Email** aktivieren.

Optional: **Confirm email** für Produktion einschalten.

### 5. App neu starten

```bash
npm run dev
```

Mit gesetzten Env-Variablen:

- Keine Demo-Spots mehr auf der Karte (nur echte Händler)
- Login/Registrierung speichert in Supabase Auth
- Check-ins schreiben echte `stamps` + `checkins`

---

## Phase 2 – Erste Pilot-Händler (Praxis)

### Händler onboarden

1. Registrierung als **Händler** in der App
2. Setup: Kategorie, Reward, Punktezahl, Adresse
3. QR-Code aus dem Dashboard (`?checkin=<merchant-uuid>`)
4. QR ausdrucken / aufstellen

### Gäste

1. Registrierung als **Gast**
2. QR scannen oder Link öffnen → Punkt sammeln
3. Wallet zeigt echte Stempelkarten

### Koordinaten für die Karte

`MerchantSetup` speichert noch **keine GPS-Koordinaten**. Spots erscheinen auf der Discover-Karte erst mit `lat` / `lng`.

Kurzfristig in Supabase **Table Editor → spots** manuell setzen, z. B. Stuttgart Mitte: `48.7758`, `9.1829`.

Mittelfristig: Geocoding der Adresse beim Setup (Google/OSM API).

---

## Phase 3 – Was noch für „Production-ready“ fehlt

| Priorität | Thema | Status |
|-----------|--------|--------|
| Hoch | Supabase Schema + RLS | ✅ `supabase/schema.sql` |
| Hoch | Demo-Daten abschaltbar | ✅ nur im Local-Modus |
| Hoch | Echte Auth (Email) | ✅ vorhanden |
| Mittel | QR-Kamera-Scan | `html5-qrcode` installiert, noch nicht verdrahtet |
| Mittel | Sichere QR-Tokens (Ablauf) | UI vorhanden, Server-Prüfung fehlt |
| Mittel | Check-in Cooldown serverseitig | aktuell nur localStorage |
| Mittel | Push-Benachrichtigungen | noch Demo in `NotificationCenter` |
| Niedrig | Analytics aus echten `checkins` | Tabelle da, Dashboard teils Mock |
| Niedrig | Deployment (Vercel/Netlify) | `npm run build` → statisches Hosting |

---

## Deployment (Kurz)

```bash
npm run build
```

`dist/` auf Vercel/Netlify deployen. Env-Variablen `VITE_SUPABASE_*` im Hosting-Dashboard setzen.

**Supabase → Authentication → URL configuration:** deine Produktions-URL als Redirect erlauben.

---

## Zwei Modi im Überblick

| | Local (ohne `.env`) | Production (mit Supabase) |
|--|---------------------|---------------------------|
| Daten | localStorage + Demo-Spots | Postgres |
| Auth | Passwort im Klartext (nur Dev!) | Supabase Auth |
| Karte | Demo-Locations Stuttgart | Nur Spots mit lat/lng |
| Für Praxis | ❌ | ✅ |

---

## Nächster Schritt mit Cursor

Sag z. B.:

- „Supabase ist eingerichtet, mach Geocoding im Setup“
- „QR-Scanner einbauen“
- „Check-in mit Token-Validierung“
- „App auf Vercel deployen“

Dann setzen wir die nächste Phase direkt im Code um.
