const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('@expo/config-plugins');

function resolveFrameworkPath(projectRoot, frameworkPath) {
  if (!frameworkPath) {
    return null;
  }
  return path.isAbsolute(frameworkPath)
    ? frameworkPath
    : path.resolve(projectRoot, frameworkPath);
}

function resolveFrameworkBinaryPath(frameworkPath, override) {
  if (override) {
    return override;
  }
  if (!frameworkPath) {
    return null;
  }
  const frameworkName = path.basename(frameworkPath, '.framework');
  return path.join(frameworkPath, frameworkName);
}

function computeSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

function resolveExpectedSha256(props) {
  if (props.frameworkSha256) {
    return String(props.frameworkSha256).trim();
  }
  if (props.frameworkSha256Env) {
    const value = process.env[String(props.frameworkSha256Env)];
    return value ? String(value).trim() : null;
  }
  return null;
}

function copyFramework(sourcePath, destDir) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return null;
  }
  fs.mkdirSync(destDir, { recursive: true });
  const frameworkName = path.basename(sourcePath);
  const destPath = path.join(destDir, frameworkName);
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }
  fs.cpSync(sourcePath, destPath, { recursive: true });
  return destPath;
}

function addFrameworkToProject(project, projectRoot, frameworkName, iosFrameworksDir) {
  const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
  const target = IOSConfig.XcodeUtils.getApplicationNativeTarget({
    project,
    projectName,
  });
  const frameworkRef = `${iosFrameworksDir}/${frameworkName}`;
  
  project.addFramework(frameworkRef, {
    customFramework: true,
    embed: true,
    link: true,
    target: target.uuid,
  });
}

const withEnterpriseWebKit = (config, props = {}) => {
  const frameworkPath = props.frameworkPath || 'enterprise/webkit/CustomWebKit.framework';
  const frameworkBinary = props.frameworkBinary || null;
  const iosFrameworksDir = props.iosFrameworksDir || 'Frameworks';
  const required = props.required !== false;
  const checksumRequired = props.checksumRequired !== false;
  const expectedSha256 = resolveExpectedSha256(props);
  
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = config.modRequest.platformProjectRoot;
      const sourcePath = resolveFrameworkPath(projectRoot, frameworkPath);
      const destDir = path.join(iosRoot, iosFrameworksDir);
      if (!sourcePath || !fs.existsSync(sourcePath)) {
        if (required) {
          throw new Error(
            `Enterprise WebKit framework missing at: ${sourcePath || frameworkPath}. ` +
              'Place CustomWebKit.framework under enterprise/webkit or set frameworkPath.'
          );
        }
        return config;
      }
      const binaryPath = resolveFrameworkBinaryPath(sourcePath, frameworkBinary);
      if (binaryPath && fs.existsSync(binaryPath)) {
        if (checksumRequired) {
          if (!expectedSha256) {
            throw new Error(
              'Enterprise WebKit checksum required but no SHA256 provided. ' +
                'Set frameworkSha256 or frameworkSha256Env in the plugin config.'
            );
          }
          const actual = computeSha256(binaryPath);
          if (actual.toLowerCase() !== expectedSha256.toLowerCase()) {
            throw new Error(
              `Enterprise WebKit checksum mismatch for ${binaryPath}. ` +
                `Expected ${expectedSha256}, got ${actual}.`
            );
          }
        }
      } else if (checksumRequired) {
        throw new Error(
          `Enterprise WebKit binary not found for checksum validation: ${binaryPath || '(none)'}. ` +
            'Set frameworkBinary if your framework uses a non-standard binary name.'
        );
      }
      copyFramework(sourcePath, destDir);
      return config;
    },
  ]);
  
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const frameworkName = path.basename(frameworkPath);
    addFrameworkToProject(project, config.modRequest.projectRoot, frameworkName, iosFrameworksDir);
    return config;
  });
  
  return config;
};

module.exports = withEnterpriseWebKit;
