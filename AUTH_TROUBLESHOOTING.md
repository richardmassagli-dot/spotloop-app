# Login / Registrierung funktioniert nicht

## 1. E-Mail-Bestätigung ausschalten (wichtig für Pilot)

Supabase Dashboard → **Authentication** → **Providers** → **Email**:

- **Confirm email** → **AUS**
- Speichern

Ohne das bekommst du nach der Registrierung oft **keine Session** und Login sagt „E-Mail bestätigen“.

## 2. E-Mail-Rate-Limit

Bei vielen Test-Registrierungen blockiert Supabase kurz neue Mails:

- Fehlermeldung: *„Zu viele Versuche…“*
- **15–60 Minuten warten** oder **andere E-Mail-Adresse** nutzen
- Oder in Supabase: **Authentication** → **Users** → Nutzer manuell anlegen / bestätigen

## 3. Bereits registriert, aber nicht bestätigt

**Authentication** → **Users** → Nutzer wählen → **Confirm user** / E-Mail als bestätigt markieren.

## 4. Live-URL in Supabase

**Authentication** → **URL Configuration**:

- Site URL: `https://myspot-app-wheat.vercel.app/`
- Redirect: `https://myspot-app-wheat.vercel.app/**`
- Für lokale Entwicklung zusätzlich: `http://localhost:5173/**`

## 5. Test

1. Neue E-Mail (noch nicht verwendet)
2. **Als Follower** oder **Als Spot** → Registrierung durchspielen
3. Oder **Anmelden** mit bestehendem Konto
