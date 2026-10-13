# Benacion Sports

React Native (Expo SDK 54, bare workflow with native `ios/` and `android/` folders). Android is the primary target; iOS is kept ready for release.

## Features
- **News** — feed of results, previews and live scores for followed sports (TheSportsDB)
- **Sports** — follow sports, browse leagues, matches by date, fixtures/results by round, tables, teams
- **Match & team pages** — details, highlights, favorites, kick-off reminders
- **My Games** — create games with teams and details, track them live: clock, periods, sport-specific actions (goals, points, cards…), player tagging, timeline, stats
- **My Teams** — logo, colors, roster, description, W/D/L, form, top scorers
- **Tournaments** — league (round robin, auto table) or knockout (bracket, byes, next round generation)
- **Custom sports** — define periods, scoring buttons, draw rules
- **Quiz, Statistics, Favorites, Reminders, Settings**

## Run
```bash
npm install
npm run android
# iOS: cd ios && pod install && cd .. && npm run ios
```
After changing `app.json` / plugins: `npx expo prebuild --platform all`
(note: prebuild rewrites `android/app/build.gradle`; the release signing block is kept in `support-files/build.gradle`).

## Configuration
- `src/utils/config.js` — TheSportsDB key (`123` = free test key), OneSignal / AppsFlyer keys, Firebase analytics flag
- `app/google-services.json`, `app/GoogleService-Info.plist` — **placeholders**, replace with real Firebase files
- `codemagic.yaml` — CI for Android (AAB) and iOS (TestFlight); secrets live in Codemagic, not in the repo

## Structure
```
App.js, index.js, navigationRef.js
src/
  api/        TheSportsDB client with cache
  components/ shared UI
  context/    AppContext (AsyncStorage persistence)
  data/       sports catalog, game rules, quiz questions
  screens/
  utils/      colors, helpers, game logic, notifications, SDK init
```
