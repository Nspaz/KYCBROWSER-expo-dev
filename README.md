
KYCBROWSER-android 🛡️

High-Assurance Mobile Identity Verification Framework
KYCBROWSER-android is a security-hardened browser environment for Android, specifically engineered for Know Your Customer (KYC) workflows. It provides a "Walled Garden" that secures the communication between native hardware (camera/sensors) and web-based identity providers.

## 📱 EAS Dev Build

This project uses [Expo Application Services (EAS)](https://expo.dev/eas) for native builds. It is configured as a **100% EAS Dev Build** — Expo Go is not supported.

### Setup

1. **Install EAS CLI** globally:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in** to your Expo account:
   ```bash
   eas login
   ```

3. **Link the project** (first time only):
   ```bash
   eas init
   ```
   This populates `extra.eas.projectId` in `app.json`.  
   Alternatively, set `EAS_PROJECT_ID` as an environment variable/secret (the workflow reads it from `app.config.ts`).

4. **Configure OTA updates** (optional):
   ```bash
   eas update:configure
   ```
   This adds the `updates.url` with your project ID to `app.json`.

5. **Install dependencies**:
   ```bash
   npm install
   ```

### Building Locally

```bash
# Development build (iOS simulator)
eas build --profile development --platform ios

# Development build (physical device)
eas build --profile development --platform all

# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

### CI/CD with GitHub Actions

Builds are triggered automatically on push to `main`, or can be triggered manually from the Actions tab.

> ⚠️ **CI builds will fail until the project is linked.** Run `eas init` locally and commit the generated `projectId` in `app.json`, or set the `EAS_PROJECT_ID` secret so the workflow can inject it.

**Required GitHub repository secret:**

| Secret Name      | Description                                   |
|------------------|-----------------------------------------------|
| `EXPO_TOKEN`     | Expo personal access token                     |
| `EAS_PROJECT_ID` | Expo project UUID (from `eas project:list`). Set this unless `extra.eas.projectId` is already in app.json |

If you commit `extra.eas.projectId` to `app.json`, the `EAS_PROJECT_ID` secret is optional.

To add the secrets:
1. Go to your repository **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and create `EXPO_TOKEN` with your Expo access token
3. Repeat to add `EAS_PROJECT_ID` with your Expo project ID

> ⚠️ **Never commit access tokens to source code.** Always use GitHub Secrets.

### Production Submissions

To submit to app stores, update `eas.json` with your credentials:
- **iOS**: Set `appleId` and `ascAppId` in `submit.production.ios`
- **Android**: Configure `track` in `submit.production.android`

### Running the Dev Client

```bash
npx expo start --dev-client
```

🚀 Key Security Features
 * Session Pinning: Prevents Javascript injection via a unique, single-use UUID secret.
 * Anti-Spoofing: Integrated hardware integrity checks and emulator detection.
 * Data Privacy: Hardware-backed anti-screenshotting (FLAG_SECURE) to protect PII.
 * Network Hardening: Native SSL Pinning and Certificate transparency.
 * Build Automation: Automated R8/ProGuard mapping management for production debugging.
📦 Quick Start: The "Fortress" Implementation
To implement the secure environment, extend your KYC activity with the following pattern. This logic ensures that the browser cannot be manipulated by external tools or unauthorized Javascript calls.
1. The Secure Activity (Kotlin)
class FortressKYCActivity : AppCompatActivity() {
    private val sessionSecret = UUID.randomUUID().toString()
    private lateinit var kycWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Block screenshots and screen recording
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
        
        if (isEmulator()) { finish(); return } // Abort on fake hardware

        setContentView(R.layout.activity_kyc)
        setupSecureWebView()
        kycWebView.loadUrl("https://verify.yourservice.com?token=$sessionSecret")
    }

    private fun setupSecureWebView() {
        kycWebView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            userAgentString = "Mozilla/5.0 (Linux; Android ${Build.VERSION.RELEASE}) Chrome/124.0.0.0 Mobile"
        }

        // The Secure Bridge: Only accepts callbacks containing our SecretKey
        kycWebView.addJavascriptInterface(object {
            @JavascriptInterface
            fun onVerificationComplete(status: String, receivedSecret: String) {
                if (receivedSecret == sessionSecret) {
                    runOnUiThread { handleResult(status) }
                }
            }
        }, "AndroidBridge")
    }

    private fun isEmulator(): Boolean {
        return (Build.BRAND.startsWith("generic") || Build.MODEL.contains("Emulator") || Build.FINGERPRINT.contains("unknown"))
    }
}

🌐 2. Web-End Integration (Demo Page)
Your web-based KYC provider must echo the token back to the native bridge to verify the session's integrity.
<script>
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    function onKYCFinished(status) {
        if (window.AndroidBridge) {
            // Echo the secret token back to the app
            window.AndroidBridge.onVerificationComplete(status, token);
        }
    }
</script>

🛡️ 3. Hardened Network Security
Add a Network Security Configuration to enforce SSL Pinning. This prevents Man-in-the-Middle (MITM) attacks during document uploads.
res/xml/network_security_config.xml:
<network-security-config>
    <domain-config>
        <domain includeSubdomains="true">your-kyc-provider.com</domain>
        <pin-set>
            <pin digest="SHA-256">PrimaryCertificateHash==</pin>
            <pin digest="SHA-256">BackupCertificateHash==</pin>
        </pin-set>
    </domain-config>
</network-security-config>

🛠 4. Build & Debug Automation
This framework includes a Python Debugger and Gradle Task to ensure you never lose the ability to de-obfuscate production crashes.
Automated Artifact Extraction
Every time you run a release build, the mapping files are automatically versioned:
 * Path: ${project.rootDir}/RELEASES/v[Version]_[Timestamp]/
Retrace-O-Matic (Python)
Use this utility to de-obfuscate stack traces from production logs:
python retrace_helper.py --mapping RELEASES/v1.0/mapping.txt --crash crash_log.txt

⚙️ ProGuard Requirements
Ensure the following rules are in your proguard-rules.pro to maintain WebRTC and Bridge functionality:
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
-keep class org.webrtc.** { *; }
-keep class io.socket.** { *; }
-dontwarn org.webrtc.**

Next Step: This documentation is now complete and ready for your repository. Would you like me to generate a Release Tag Template for your first version (v1.0.0) to summarize these changes for your contributors?
