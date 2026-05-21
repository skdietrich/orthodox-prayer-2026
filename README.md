# Orthodox Daily Prayer 2026 PWA

A static, installable Progressive Web App for Orthodox daily prayer and devotional use from May 21, 2026 through December 31, 2026.

## What is included

- iPhone-friendly PWA shell with manifest and service worker.
- Dynamic 2026 Orthodox season engine.
- Old Calendar and New/Revised Julian fixed-feast modes.
- Dynamic theme colors for Ascension, Pentecost, Marian feasts, Cross feasts, and fasting periods.
- Morning and evening prayer rules.
- Rule tracker with local streak calculation.
- Diptyches for the living and departed.
- Accessibility settings for font, size, parchment mode, and low-light mode.
- Offline app shell after installation.
- IndexedDB cache for verified daily readings and commemorations retrieved from Orthocal.info.

## Important accuracy note

Daily calendar data can differ by Orthodox jurisdiction, parish usage, and Old/New Calendar practice. The app defaults to Old Calendar fixed feasts because the requested Nativity Fast date was November 28 on the civil calendar. Change this in Settings if you want New/Revised Julian fixed feasts.

The app uses Orthocal.info for live daily readings and commemorations. Orthocal.info states that its readings follow the Slavic calendar and fasting indications follow the Orthodox Church in America fasting seasons. The local engine supplies seasonal fallback data when offline.

## iPhone use

### Simple local use

1. Unzip the package in Files.
2. Open `index.html`.
3. The app will run in the browser. Local tracker and diptyches are stored on that device.

### Full PWA use

For true Home Screen PWA behavior, the folder must be served from HTTPS.

1. Upload the folder to any static HTTPS host.
2. Open the URL in Safari on iPhone.
3. Tap Share, then Add to Home Screen.
4. Keep Open as Web App turned on.
5. Open the app and use Settings, Sync May 21 to Dec 31 while online.

## Files

- `index.html`, app markup.
- `styles.css`, visual design.
- `app.js`, liturgical engine, storage, sync, UI.
- `sw.js`, offline app shell cache.
- `manifest.json`, PWA metadata.
- `icons/`, app icons.
