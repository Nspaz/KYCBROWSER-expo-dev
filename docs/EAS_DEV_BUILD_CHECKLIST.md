# EAS Dev Build Checklist

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run pre-build verification (lint + tests)**
   ```bash
   npm run verify
   ```

3. **Kick off the dev build**
   ```bash
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android
   ```

4. **Run the dev client locally**
   ```bash
   npx expo start --dev-client
   ```
