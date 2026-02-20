const { execSync } = require("child_process");

try {
  const raw = execSync("npx --no-install expo config --json", {
    stdio: "pipe",
    env: { ...process.env, EXPO_NO_TELEMETRY: "1" },
  }).toString();
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (parseError) {
    console.error("Expo config output was not valid JSON. Output was:");
    console.error(raw);
    process.exit(1);
  }

  const projectId = cfg?.extra?.eas?.projectId ?? "";
  if (!projectId) {
    console.error(
      "EAS projectId is missing. Set EAS_PROJECT_ID env/secret or add extra.eas.projectId to app.json."
    );
    process.exit(1);
  }
  process.stdout.write(projectId);
} catch (error) {
  const stderr = error.stderr ? error.stderr.toString() : "";
  console.error(
    "Failed to read Expo config for projectId:",
    error instanceof Error ? error.message : String(error)
  );
  if (stderr) {
    console.error("Expo config stderr:", stderr);
  }
  process.exit(1);
}
