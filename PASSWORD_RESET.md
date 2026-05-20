# Passwort zurücksetzen

## App

- Login: **„Passwort vergessen?“** → E-Mail eingeben → **Link senden**
- Link in der E-Mail öffnet → Seite **`/reset-password`** → neues Passwort speichern

## Supabase (Pflicht)

1. **Authentication → URL Configuration → Redirect URLs**

   Eintragen (eigenes Deployment anpassen):

   - `http://localhost:5173/reset-password`
   - `http://localhost:5173/**`
   - Produktions-URLs (je nach Vercel-Projekt), z. B.:
     - `https://spotloop-app-wheat.vercel.app/reset-password`
     - `https://spotloop-app-wheat.vercel.app/**`
     - ggf. ältere/aliases: `https://myspot-app-wheat.vercel.app/reset-password`, `https://myspot-app-wheat.vercel.app/**`

2. **Authentication → Providers → Email** muss aktiv sein.

3. Für den Pilot: **Confirm email** kann aus bleiben; für Produktion bewusst aktivieren (User muss dann E-Mail bestätigen, bevor Reset greift).

## Technik

- `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- Nach Klick auf Mail-Link: `PASSWORD_RECOVERY` / Session mit Hash → `supabase.auth.updateUser({ password })`
