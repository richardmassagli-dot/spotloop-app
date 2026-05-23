# App lädt nicht — Checkliste

## 1. Richtige URL
**Live:** https://spotloop.vercel.app

Nicht `Desktop/spotloop` in Cursor — das ist ein alter Prototyp.

## 2. Cache leeren (wichtig auf dem iPhone)
**Safari:** Einstellungen → Safari → Verlauf & Websitedaten → löschen  
oder nur für `spotloop.vercel.app` die Website-Daten entfernen.

**Mac:** Cmd+Shift+R auf der Seite

## 3. Lokal starten
```bash
cd /Users/richardmassagli/myspot-app
npm install
npm run dev
```
Terminal-URL öffnen (z. B. http://localhost:5173)

## 4. Was du sehen solltest
- Nach wenigen Sekunden: **Login** mit blauem Header „Willkommen zurück“
- Wenn nach 25 Sek. eine **Fehlermeldung** kommt: Screenshot an uns — dann ist ein JavaScript-Fehler aktiv

## 5. Noch eingeloggt als Merchant?
Abmelden oder privates Browserfenster — leerer Merchant-Spinner kann wie „hängt“ wirken.
