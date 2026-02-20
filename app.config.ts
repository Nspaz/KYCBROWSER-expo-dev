import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

const projectId =
  process.env.EAS_PROJECT_ID ??
  (appJson.expo?.extra as { eas?: { projectId?: string } } | undefined)?.eas
    ?.projectId ??
  "";

const config: ExpoConfig = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    eas: {
      ...(appJson.expo.extra as { eas?: { projectId?: string } } | undefined)
        ?.eas,
      projectId,
    },
  },
};

export default config;
