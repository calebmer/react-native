/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

/**
 * This script publishes a new version of react-native to NPM.
 * It is supposed to run in CI environment, not on a developer's machine.
 *
 * To make it easier for developers it uses some logic to identify with which
 * version to publish the package.
 *
 * To cut a branch (and release RC):
 * - Developer: `git checkout -b 0.XY-stable`
 * - Developer: `./scripts/bump-oss-version.js v0.XY.0-rc.0`
 * - CI: test and deploy to npm (run this script) with version `0.XY.0-rc.0`
 *   with tag "next"
 *
 * To update RC release:
 * - Developer: `git checkout 0.XY-stable`
 * - Developer: cherry-pick whatever changes needed
 * - Developer: `./scripts/bump-oss-version.js v0.XY.0-rc.1`
 * - CI: test and deploy to npm (run this script) with version `0.XY.0-rc.1`
 *   with tag "next"
 *
 * To publish a release:
 * - Developer: `git checkout 0.XY-stable`
 * - Developer: cherry-pick whatever changes needed
 * - Developer: `./scripts/bump-oss-version.js v0.XY.0`
 * - CI: test and deploy to npm (run this script) with version `0.XY.0`
 *   and no tag ("latest" is implied by npm)
 *
 * To patch old release:
 * - Developer: `git checkout 0.XY-stable`
 * - Developer: cherry-pick whatever changes needed
 * - Developer: `git tag v0.XY.Z`
 * - Developer: `git push` to git@github.com:facebook/react-native.git (or merge as pull request)
 * - CI: test and deploy to npm (run this script) with version 0.XY.Z with no tag, npm will not mark it as latest if
 * there is a version higher than XY
 *
 * Important tags:
 * If tag v0.XY.0-rc.Z is present on the commit then publish to npm with version 0.XY.0-rc.Z and tag next
 * If tag v0.XY.Z is present on the commit then publish to npm with version 0.XY.Z and no tag (npm will consider it latest)
 */

/*eslint-disable no-undef */
require('shelljs/global');

const releaseVersion = require('../package.json').version;

// -------- Generating Android Artifacts with JavaDoc
if (exec('./gradlew :ReactAndroid:installArchives').code) {
  echo('Could not generate artifacts');
  exit(1);
}

// undo uncommenting javadoc setting
exec('git checkout ReactAndroid/gradle.properties');

echo('Generated artifacts for Maven');

let artifacts = ['-javadoc.jar', '-sources.jar', '.aar', '.pom'].map(suffix => {
  return `react-native-${releaseVersion}${suffix}`;
});

artifacts.forEach(name => {
  if (
    !test(
      '-e',
      `./android/com/facebook/react/react-native/${releaseVersion}/${name}`,
    )
  ) {
    echo(`file ${name} was not generated`);
    exit(1);
  }
});

if (exec('npm publish --access public').code) {
  echo('Failed to publish package to npm');
  exit(1);
} else {
  echo(`Published to npm ${releaseVersion}`);
  exit(0);
}

/*eslint-enable no-undef */
