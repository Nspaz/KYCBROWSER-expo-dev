const { execSync } = require("child_process");

try {
  const raw = execSync("npx expo config --json", { stdio: "pipe" }).toString();
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (parseError) {
    console.error("Expo config output was not valid JSON. Output was:");
    console.error(raw);
    process.exit(1);
  }

  const projectId = cfg?.extra?.eas?.projectId ?? "";
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
