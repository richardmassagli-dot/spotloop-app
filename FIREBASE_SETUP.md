# myspot Firebase Setup – 5 Minuten

## 1. Firebase Projekt erstellen
1. Gehe zu https://console.firebase.google.com
2. Klicke "+ Projekt hinzufügen"
3. Name: `myspot-app` → weiter
4. Google Analytics: kann deaktiviert bleiben → Projekt erstellen

## 2. Web-App registrieren
1. Im Projekt: Klicke auf das `</>` Symbol (Web)
2. App-Nickname: `myspot-web`
3. "App registrieren" → Du siehst die Konfiguration

## 3. Konfiguration in .env.local eintragen
Öffne `/Users/richardmassagli/myspot-app/.env.local` und trage die Werte ein:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=myspot-app-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myspot-app-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=myspot-app-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 4. Authentication aktivieren
1. Linkes Menü: Build → Authentication
2. "Jetzt loslegen"
3. Sign-in Method → E-Mail/Passwort → Aktivieren → Speichern

## 5. Firestore Database erstellen
1. Linkes Menü: Build → Firestore Database
2. "Datenbank erstellen"
3. Region: europe-west1 (Frankfurt)
4. Sicherheitsregeln: "Im Testmodus starten" (für Entwicklung)
5. Fertigstellen

## 6. Firestore Regeln (Produktion)
Im Firestore → Regeln Tab, füge ein:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /spots/{spotId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == spotId;
    }
    match /loyaltyCards/{cardId} {
      allow read, write: if request.auth != null &&
        resource.data.guestId == request.auth.uid;
    }
    match /checkins/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
    match /follows/{id} {
      allow read, write: if request.auth != null;
    }
    match /campaigns/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /redemptions/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

## 7. App neu starten
```bash
cd /Users/richardmassagli/myspot-app
npm run dev
```

---

## Testen

### Als Händler:
1. http://localhost:5173 öffnen
2. "Als Händler" → Registrieren
3. Setup durchlaufen → QR-Code wird generiert
4. QR-Code per Link an Gäste senden

### Als Gast:
1. In neuem Browser-Tab / Inkognito öffnen
2. "Als Gast" → Registrieren
3. Unter "Entdecken" den Spot des Händlers finden
4. Oder direkt den QR-Link des Händlers aufrufen
5. Check-in → Punkt sammeln → Wallet ansehen

## Deployment (optional)
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
