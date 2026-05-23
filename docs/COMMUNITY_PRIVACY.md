# Spotloop — Community & Privacy

Spotloop stärkt **Beziehungen** zwischen Spots und Stammgästen — nicht Ranking nach Ausgaben.

## Prinzipien

- **Loyalty & Engagement** statt „reichste Gäste“
- **Pseudonyme** Smart Member Profiles
- **Communities** mit Einladung & Member-Zustimmung
- **Privacy-first**, DSGVO-konform

## Smart Member Profile (Merchant)

Spots sehen z. B. `Member #A72X91` mit:

- Aktiv seit · Besuche · Rewards eingelöst
- Stammgast-Level (Besuche, nicht Umsatz)
- Engagement-Score (Besuche, Rewards, Community)
- Lieblingszeit · Community-Aktivität
- Ø Besuch **nur** wenn Member `share_spend_with_spots` aktiviert hat

## Community System

Merchants erstellen Clubs (z. B. Stammgast Club, Coffee Lovers) und laden **aktive Wallet-Members** per Pseudonym ein.

Members steuern:

- Community-Einladungen erlauben
- In Community sichtbar sein
- Beitritt annehmen / ablehnen

## Technik

| Modul | Pfad |
|-------|------|
| Logik | `src/lib/spotCommunities.js` |
| Privacy + Engagement | `src/lib/privacy.js` |
| Migration | `supabase/migrations/018_spot_communities.sql` |
| Merchant UI | `src/pages/merchant/MerchantCommunity.jsx` |
| Gast UI | `src/components/guest/SpotCommunityMembership.jsx` |
