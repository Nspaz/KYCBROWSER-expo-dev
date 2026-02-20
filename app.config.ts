import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

type ExtraWithEas = {
  eas?: { projectId?: string };
  [key: string]: unknown;
};

const extra = (appJson.expo?.extra as ExtraWithEas | undefined) ?? {};
const easConfig = extra.eas ?? {};

const envProjectId = process.env.EAS_PROJECT_ID?.trim();
const projectId = envProjectId || easConfig.projectId;
const easBase = projectId ? { ...easConfig, projectId } : easConfig;
const eas = Object.keys(easBase).length > 0 ? easBase : undefined;

if (!projectId) {
  // Surface missing configuration early for local dev and CI
  // eslint-disable-next-line no-console
  console.warn(
    "EAS projectId is not set. Provide EAS_PROJECT_ID or run `eas init` to write it into app.json."
  );
}

const config: ExpoConfig = {
  ...appJson.expo,
  extra: eas ? { ...extra, eas } : extra,
};

export default config;
