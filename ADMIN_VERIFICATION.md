# Spot-Freischaltung & Admin

## Beste Ansätze (Kurzüberblick)

| Variante | Vorteil | Nachteil |
|---------|---------|----------|
| **Nur Supabase Dashboard** (SQL / Table Editor) | Kein Code, maximale Kontrolle | Umständlich bei vielen Spots |
| **RPC + „Admin“-User in der App** (dieses Projekt) | Schnelle Freischaltung, bleibt bei **anon key** + RLS | Einmal SQL-Migration; Admin-User muss vertrauenswürdig sein |
| **Eigenes Backend mit Service Role** | Volle Admin-Logik | Mehr Infrastruktur |

**Du brauchst keinen separaten „Admin-Account“ außerhalb von Supabase:** Ein normaler Auth-User reicht. Du markierst ihn in Supabase mit **`is_admin: true`** in den **User Metadata**. Die Datenbank-Funktion `is_app_admin()` prüft das JWT — nur dann darf `admin_approve_spot` ausgeführt werden und nur Admins sehen alle Spots inkl. `pending`.

**Sicherheit:** Der öffentliche **anon** Key bleibt öffentlich; sensible Aktionen laufen über **SECURITY DEFINER**-RPCs, die intern prüfen, ob der Aufrufer Admin ist. Niemand kann ohne Admin-Flag `pending` → `verified` setzen (Merchant-Trigger verhindert zudem Selbst-Freischaltung).

---

## Einmalige Einrichtung

### 1. SQL ausführen

Im **SQL Editor** die Datei

`supabase/migrations/002_admin_approve_spot.sql`

ausführen (oder bei Neuinstallation steckt der Inhalt bereits in `supabase/schema.sql`).

### 2. Admin-User setzen

**Authentication → Users** → deinen Account wählen → **Raw user meta data**:

```json
{
  "is_admin": true
}
```

(Weitere Felder wie `name`, `role` können bleiben.)

Alternativ im **SQL Editor**: `supabase/scripts/set_app_admin_by_email.sql` — E-Mail ersetzen und ausführen (Zeilenanzahl 0 bedeutet: keine User mit genau dieser Mail).

Speichern. **Neu einloggen**, damit das JWT den neuen Claim enthält.

Als Admin findest du unter **Datenschutz & Sicherheit** einen Link **„Pending Spots prüfen“** (nur sichtbar mit `is_admin`).

### 3. Admin-Oberfläche

Im Browser (eingeloggt als Admin):

**`/admin/spots`** (direkt in der Adresszeile eintragen — funktioniert für Gäste und Händler)

- **Gast-Account:** unten **Profil** → **Datenschutz & Sicherheit** → Abschnitt **Admin** → „Pending Spots prüfen“
- **Händler-Account:** im Dashboard Menü **Einstellungen** → Tab **Sicherheit** → Button **Spot-Freischaltung (Admin)**

→ Liste aller **pending** Spots → **Freischalten** setzt `verification_status = 'verified'` und `verified_at`.

---

## Hinweis zum Status-Namen

In der Datenbank heißt der Status **`verified`** (nicht `approved`). Die UI spricht von „Freischalten“ — technisch ist es `verified`.
