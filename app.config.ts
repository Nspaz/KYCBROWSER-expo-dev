import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

const easConfig =
  (appJson.expo?.extra as { eas?: { projectId?: string } } | undefined)?.eas ??
  {};

const projectId =
  process.env.EAS_PROJECT_ID ??
  easConfig.projectId ??
  "";

if (!projectId) {
  // Surface missing configuration early for local dev and CI
  // eslint-disable-next-line no-console
  console.warn(
    "EAS projectId is not set. Provide EAS_PROJECT_ID or run `eas init` to write it into app.json."
  );
}

const config: ExpoConfig = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    eas: {
      ...easConfig,
      projectId,
    },
  },
};

export default config;
