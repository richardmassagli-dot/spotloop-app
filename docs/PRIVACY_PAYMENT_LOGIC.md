# Spotloop — Privacy & Payment Logic

Spotloop ist langfristig eine **universelle Payment- und Loyalty-Karte**.

Der Member zahlt mit der **Spotloop Card** bei teilnehmenden Spots. Je nach Spot werden automatisch **Stempel oder Punkte nur in der jeweiligen Spot-Stempelkarte** gesammelt.

## Wichtig: Keine universellen Punkte

- Spotloop vergibt **keine** app-weiten Punkte.
- Jeder Spot hat **eigenes** Loyalty-System, eigene Rewards und eigene Regeln.
- Die Wallet zeigt dem Member **seine** Karten; Spots sehen **anonymisierte Loyalty-Profile**.

---

## Privacy & Datenschutz

Spots sehen **nicht automatisch**:

- echte Namen
- komplette Zahlungsdaten (Kartennummer, IBAN, etc.)
- private Nutzerinformationen

Stattdessen:

- **pseudonymisierte Member-IDs** (z. B. `Member #A72X91`)
- **anonymisierte Loyalty-Daten** (Besuche, Stufe, Rewards — nur wenn der Member zustimmt)
- **datenschutzfreundliche Insights** (Aggregate, keine Roh-Zahlungsdaten)

### Was ein Spot sehen kann (mit Zustimmung)

| Feld | Beispiel |
|------|----------|
| Pseudonym | Member #A72X91 |
| Aktiv seit | März 2025 |
| Besuche | 12 |
| Ø Besuchswert | 22 € *(nur wenn „Ausgaben teilen“ aktiv)* |
| Rewards eingelöst | 2 |
| Stammgast-Level | Gold |
| Lieblingszeiten | abgeleitet aus Check-ins |

### Was ein Spot **nicht** sieht

- E-Mail, Telefon, vollständiger Name (Wallet-Gäste)
- Zahlungsmittel-Details
- Aktivität bei anderen Spots (außer aggregierte Benchmarks ohne Identität)

---

## Privacy by Design

- DSGVO-konform, transparent, **privacy-first**
- Members steuern in **Datenschutz & Sicherheit**:
  - ob Spots **Ausgaben** sehen dürfen
  - ob **personalisierte Kampagnen** erlaubt sind
  - ob **Loyalty-Insights** für Spots freigegeben sind
  - Social- und Standort-Optionen (separat)

Technische Umsetzung: `src/lib/privacy.js`, Migration `017_privacy_preferences.sql`.

---

## Smart Member Profile (Merchant)

UI-Komponente: `SmartMemberProfile.jsx`  
Daten: `buildSmartMemberProfile()` — nur freigegebene Felder.

---

## Payment (Roadmap)

| Status | Beschreibung |
|--------|----------------|
| ✅ UI | Spotloop Card, Zahlungshistorie pro Spot, Auto-Stempel |
| 🔜 Backend | `payments`-Tabelle, PSP-Anbindung, minimal retention |
| 🔜 Merchant | Aggregierte Umsatz-Insights ohne Member-PII |

---

## Zielbild

**Members:** „Meine Daten sind geschützt.“  
**Spots:** „Ich verstehe meine Stammgäste besser — ohne ihre Privatsphäre zu verletzen.“
