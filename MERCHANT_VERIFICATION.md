# Händler-Verifizierung (spotloop)

## Status-Modell

| Status | Bedeutung |
|--------|-----------|
| `pending` | Registriert, wartet auf Freigabe |
| `verified` | Freigeschaltet — sichtbar für Gäste, Stempel & Kampagnen aktiv |
| `rejected` | Abgelehnt — optional mit `verification_note` |

Spalten in `public.spots`: `verification_status`, `verification_note`, `verified_at`.

## Was blockiert ist (ohne `verified`)

- Spot erscheint **nicht** in Gäste-Suche / Karte (RLS)
- Gäste können **keine** Stempel / Check-ins sammeln (RLS)
- Händler kann **keine** Kampagnen senden (RLS)
- Händler-Dashboard ist gesperrt → Screen **„Verifizierung ausstehend“**

## Migration (bestehendes Supabase-Projekt)

Im **SQL Editor** ausführen:

`supabase/migrations/001_merchant_verification.sql`

Neue Projekte: volles `supabase/schema.sql` enthält die Spalten bereits.

## Händler freischalten (Admin)

Im SQL Editor (Projekt `jhyxufqmcwxhvwwkqhnt`):

```sql
-- Freigabe
update public.spots
set
  verification_status = 'verified',
  verified_at = now(),
  verification_note = null
where id = 'HÄNDLER-USER-UUID';

-- Ablehnung
update public.spots
set
  verification_status = 'rejected',
  verification_note = 'Bitte gültige Geschäftsadresse nachreichen.'
where id = 'HÄNDLER-USER-UUID';
```

Die Händler-UUID findest du unter **Authentication → Users** oder:

```sql
select id, name, verification_status, created_at
from public.spots
where verification_status = 'pending'
order by created_at desc;
```

Händler klickt in der App auf **„Status aktualisieren“**, sobald du freigeschaltet hast.

## Technik

- Trigger `spots_guard_verification`: Händler können `verification_status` nicht selbst auf `verified` setzen.
- Nur Service Role / SQL als Admin kann freischalten.
- Demo-Modus (ohne Supabase): Spots werden lokal automatisch als `verified` gespeichert.
