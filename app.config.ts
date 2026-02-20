import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

const easConfig =
  (appJson.expo?.extra as { eas?: { projectId?: string } } | undefined)?.eas ??
  {};

const envProjectId = process.env.EAS_PROJECT_ID?.trim();
const projectId = envProjectId || easConfig.projectId;
const eas =
  projectId && projectId !== ""
    ? { ...easConfig, projectId }
    : Object.keys(easConfig).length > 0
      ? easConfig
      : undefined;

if (!projectId) {
  // Surface missing configuration early for local dev and CI
  // eslint-disable-next-line no-console
  console.warn(
    "EAS projectId is not set. Provide EAS_PROJECT_ID or run `eas init` to write it into app.json."
  );
}

const config: ExpoConfig = {
  ...appJson.expo,
  extra: eas ? { ...appJson.expo.extra, eas } : appJson.expo.extra,
};

export default config;
