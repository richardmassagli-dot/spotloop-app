# Go-Live-Checkliste (Spotloop / Supabase)

Mit dieser Liste stellst du sicher, dass **Passwort-Reset**, **Auth-Redirects** und **Spot-Freischaltung** in Produktion zusammenspielen.

## 1. Supabase SQL (einmalig)

- [ ] Migration `supabase/migrations/002_admin_approve_spot.sql` im **SQL Editor** ausgeführt
- [ ] Optional: `supabase/migrations/003_is_app_admin_jwt_robust.sql` ausführen (robustere JWT-Erkennung für `is_admin` als Boolean)
- [ ] Optional: Verifikation mit `supabase/scripts/verify_admin_setup.sql` (Funktionen + Policy sichtbar)

## 2. Authentication → URL Configuration

- [ ] **Site URL** = Haupt-Frontend, z. B. `https://spotloop-app-wheat.vercel.app/` (mit Slash am Ende wie im Dashboard üblich)
- [ ] **Redirect URLs** enthalten mindestens:
  - `https://<dein-produktions-host>/**`
  - `http://localhost:5173/**` (Entwicklung)
  - ggf. ältere Aliase (z. B. `https://myspot-app-wheat.vercel.app/**`)

Ohne passende Redirect-URL schlägt der Link aus der Passwort-Mail fehl oder landet auf der falschen Domain.

## 3. Admin-Account

- [ ] **Authentication → Users** → deinen Account → **User Metadata** / Raw JSON: `"is_admin": true`
- [ ] Oder SQL: `supabase/scripts/set_app_admin_by_email.sql` — `YOUR_EMAIL` ersetzen, ausführen; im Ergebnis soll **eine Zeile** (`RETURNING id, email`) erscheinen. **Keine Zeile** = Mail stimmt nicht mit `auth.users` überein.
- [ ] **Neu einloggen** (oder einmal ab- und wieder anmelden), damit das JWT `user_metadata` den Claim `is_admin` enthält

## 4. App-Verhalten testen

- [ ] **Passwort vergessen:** E-Mail anfordern → Link öffnet `/reset-password` → neues Passwort speichern → Redirect zur Anmeldung
- [ ] **Admin:** Als Admin einloggen → unter **Datenschutz & Sicherheit** Link **Pending Spots prüfen** oder direkt `/admin/spots` → Liste laden, einen **pending** Spot **Freischalten** (kein Fehler von RPC)

## 5. Deploy

- [ ] `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` in Vercel (o. Ä.) gesetzt
- [ ] Produktions-Build: `npm run build` ohne Fehler
- [ ] Nach Deploy Smoke-Test auf der Live-URL

## Kurzreferenz Doku

| Thema | Datei |
|--------|--------|
| Passwort-Reset & Redirects | `PASSWORD_RESET.md` |
| Admin & Freischaltung | `ADMIN_VERIFICATION.md` |
| Admin per SQL | `supabase/scripts/set_app_admin_by_email.sql` |
