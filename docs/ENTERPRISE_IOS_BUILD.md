 # Enterprise iOS Build (Private WebKit Flags)
 
 This project includes an **enterprise-only** WebView configuration that enables
 private WebKit flags to unlock camera spoofing features when standard APIs are missing.
 
 ## ⚠️ Important
 - These settings are **not App Store safe**.
 - Use **internal or enterprise distribution only**.
 - Private WebKit flags can change or break between iOS releases.
 
 ## What this enables
 - Attempts to enable **WebCodecs** (`MediaStreamTrackGenerator` / `VideoFrame`)
 - Attempts to enable **captureStream** and media device flags
 - Allows the app to spoof `getUserMedia()` even on restricted WKWebView builds
 
 ## How it works
 We patch `react-native-webview` to apply private WebKit flags using KVC when the
 `RNCEnterpriseWebKit` Info.plist flag is set to true.
 
 ## Build Steps (Enterprise)
 1. Install dependencies:
    ```
    npm install
    ```
 
 2. Prebuild native iOS project:
    ```
    npx expo prebuild --clean --platform ios
    ```
 
 3. Build with EAS internal profile:
    ```
    eas build -p ios --profile sideload
    ```
 
 ## Info.plist Flag
 This is enabled in `app.json`:
 
 ```
 ios.infoPlist.RNCEnterpriseWebKit = true
 ```
 
 If you need to disable it for App Store builds, set it to false or remove it.
 
 ## Troubleshooting
 - If iOS reports spoofing is unavailable, WebKit may still block these features.
 - Use the in-app capability logs:
   ```
   [WebView Capabilities] { captureStream: ..., frameGenerator: ..., spoofingAvailable: ... }
   ```
 
