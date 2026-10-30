# Verxl native shells

All shells load the same product userspace:

`https://verxl.com/chat?app=1`

`app=1` hides the marketing header, the home link and the "Back to site" link, and exposes only the four product routes: **Chat, Playground, Registry, API**. The URL query is preserved across navigation. On phones the four routes become a bottom tab bar; on desktop they are the 64px left rail.

## PWA

The web app itself is installable:

- Chromium: install from the address bar or the browser menu.
- Safari / iOS: Share → Add to Home Screen.
- Start URL: `/chat?app=1`; display: standalone.
- Manifest: `public/manifest.webmanifest`; icons in `public/icon-*.png`.
- Service worker: `public/sw.js` (network-first navigation; hashed assets cache-first).

This covers iOS and any platform where the browser install is preferable to a native package.

## macOS / Windows / Linux — Electron

```bash
cd apps/desktop
npm install
npm start                 # local shell
npm run dist:mac          # .dmg
npm run dist:win          # .exe (run on Windows for the cleanest result)
npm run dist:linux        # .AppImage (run on Linux)
```

CI builds all three from `.github/workflows/native.yml`; download the artifacts from the Actions run.

The macOS build is unsigned/not notarized. On first open, right-click → Open. Windows builds are unsigned; SmartScreen may warn. Linux AppImage is unsigned.

## Android — Capacitor

The Android project is committed under `apps/mobile/android`. It uses the system WebView and the same remote userspace.

```bash
cd apps/mobile
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. The CI workflow builds it on every tag and on manual dispatch. A debug APK is installable but not Play Store-ready.

## Build all four

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions produces:

- `Verxl-0.1.0-mac-arm64.dmg`
- `Verxl-0.1.0-win-x64.exe`
- `Verxl-0.1.0-linux-x86_64.AppImage`
- `app-debug.apk`

The artifacts are unsigned; production signing/notarization/Play Store packaging is a separate distribution step.
