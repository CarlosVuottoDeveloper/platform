'use strict';

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentVersion = appJson.expo.version;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(currentVersion);
if (!match) {
  throw new Error(
    `expo.version "${currentVersion}" is not a plain "major.minor.patch" string — bump it by hand.`,
  );
}

const [, major, minor, patch] = match;
const nextVersion = `${major}.${minor}.${Number(patch) + 1}`;
appJson.expo.version = nextVersion;

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
console.log(`Bumped expo.version: ${currentVersion} -> ${nextVersion}`);
