#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const iosDir = path.join(__dirname, '..', 'ios');
const buildDir = path.join(iosDir, 'build');

function run(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: iosDir,
      ...options
    });
  } catch (error) {
    console.error(`Failed to run: ${command}`);
    process.exit(1);
  }
}

function buildForTestFlight() {
  console.log('🚀 Building for TestFlight...\n');

  // 1. Clean build folder
  console.log('🧹 Cleaning build folder...');
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  run('xcodebuild clean -workspace autopassmobileexample.xcworkspace -scheme autopassmobileexample');

  // 2. Archive the app
  console.log('\n📦 Creating archive...');
  run(`xcodebuild archive \
    -workspace autopassmobileexample.xcworkspace \
    -scheme autopassmobileexample \
    -configuration Release \
    -derivedDataPath build \
    -archivePath build/autopassmobileexample.xcarchive \
    -destination 'generic/platform=iOS' \
    -allowProvisioningUpdates \
    CODE_SIGN_IDENTITY="Apple Development" \
    DEVELOPMENT_TEAM="${DEVELOPMENT_TEAM}"`);

  // 3. Export IPA
  console.log('\n📱 Exporting IPA...');
  run(`xcodebuild -exportArchive \
    -archivePath build/autopassmobileexample.xcarchive \
    -exportPath build \
    -exportOptionsPlist ExportOptions.plist \
    -allowProvisioningUpdates`);

  console.log('\n✅ Build complete! IPA is at: ios/build/autopassmobileexample.ipa');
  console.log('\n📤 To upload to TestFlight:');
  console.log('1. Open Xcode');
  console.log('2. Go to Window > Organizer');
  console.log('3. Select your archive');
  console.log('4. Click "Distribute App"');
  console.log('5. Follow the upload wizard');
  console.log('\nOr use: npm run ios:upload');
}

// Check if we're in the right directory
if (!fs.existsSync(path.join(iosDir, 'autopassmobileexample.xcworkspace'))) {
  console.error('Error: iOS workspace not found. Make sure to run from project root.');
  process.exit(1);
}

// Check if ExportOptions.plist exists
if (!fs.existsSync(path.join(iosDir, 'ExportOptions.plist'))) {
  console.error('Error: ExportOptions.plist not found in ios directory.');
  console.error('Please update the teamID in ios/ExportOptions.plist first.');
  process.exit(1);
}

// Check for DEVELOPMENT_TEAM environment variable
const developmentTeam = process.env.DEVELOPMENT_TEAM;
if (!developmentTeam) {
  console.error('Error: DEVELOPMENT_TEAM environment variable not set.');
  console.error('Set it with: export DEVELOPMENT_TEAM=YOUR_TEAM_ID');
  process.exit(1);
}

// Update ExportOptions.plist with the team ID
const exportOptionsPath = path.join(iosDir, 'ExportOptions.plist');
const exportOptions = fs.readFileSync(exportOptionsPath, 'utf8');
fs.writeFileSync(exportOptionsPath, exportOptions.replace(/TEAM_ID_PLACEHOLDER/g, developmentTeam));

// Run the build
buildForTestFlight();