# EAS Dev Build Checklist

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run pre-build verification (lint + tests)**
   ```bash
   npm run verify
   ```

3. **Provide the Expo project ID**
   - Export `EAS_PROJECT_ID` in your shell or set it as a GitHub Actions secret.
   - If not set, run `eas init` to write it into `app.json`.

4. **Kick off the dev build**
   ```bash
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android
   ```

5. **Run the dev client locally**
   ```bash
   npx expo start --dev-client
   ```
