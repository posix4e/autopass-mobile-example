#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const iosDir = path.join(__dirname, '..', 'ios');
const buildDir = path.join(iosDir, 'build');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function uploadToTestFlight() {
  // Check if IPA exists
  const ipaPath = path.join(buildDir, 'autopassmobileexample.ipa');
  if (!fs.existsSync(ipaPath)) {
    console.error('❌ IPA file not found. Run "npm run ios:build:testflight" first.');
    process.exit(1);
  }

  console.log('📤 Uploading to TestFlight...\n');
  console.log('Choose upload method:\n');
  console.log('1. Xcode (Recommended - automatic signing)');
  console.log('2. Transporter app');
  console.log('3. xcrun altool (requires API key setup)\n');

  const choice = await question('Enter your choice (1-3): ');
  rl.close();

  switch (choice) {
    case '1':
      console.log('\n📱 Using Xcode:');
      console.log('1. Open Xcode');
      console.log('2. Go to Window > Organizer');
      console.log('3. Find your archive in the list');
      console.log('4. Click "Distribute App"');
      console.log('5. Choose "App Store Connect"');
      console.log('6. Follow the upload wizard');
      break;

    case '2':
      console.log('\n📱 Using Transporter:');
      console.log('1. Download Transporter from the Mac App Store');
      console.log('2. Open Transporter and sign in with your Apple ID');
      console.log('3. Drag the IPA file to Transporter:');
      console.log(`   ${ipaPath}`);
      console.log('4. Click "Deliver"');
      break;

    case '3':
      console.log('\n📱 Using xcrun altool:');
      console.log('Make sure you have set up these environment variables:');
      console.log('- APP_STORE_CONNECT_API_KEY_ID');
      console.log('- APP_STORE_CONNECT_ISSUER_ID');
      console.log('- APP_STORE_CONNECT_API_KEY (path to .p8 file)\n');
      
      const apiKeyId = process.env.APP_STORE_CONNECT_API_KEY_ID;
      const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
      const apiKeyPath = process.env.APP_STORE_CONNECT_API_KEY;

      if (!apiKeyId || !issuerId || !apiKeyPath) {
        console.error('❌ Missing required environment variables');
        process.exit(1);
      }

      try {
        execSync(`xcrun altool --upload-app \
          -f "${ipaPath}" \
          -t ios \
          --apiKey ${apiKeyId} \
          --apiIssuer ${issuerId} \
          --apiPrivateKey ${apiKeyPath}`, {
          stdio: 'inherit'
        });
        console.log('\n✅ Upload complete!');
      } catch (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
      }
      break;

    default:
      console.log('Invalid choice');
      process.exit(1);
  }
}

uploadToTestFlight();