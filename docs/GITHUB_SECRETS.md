# GitHub Secrets Setup for iOS TestFlight Deployment

To enable automatic TestFlight deployment via GitHub Actions, you need to configure the following secrets in your GitHub repository.

## Required Secrets

Go to your repository's Settings → Secrets and variables → Actions, and add these secrets:

### 1. `DEVELOPMENT_TEAM`
- **Value**: Your Apple Developer Team ID (e.g., `2858MX5336`)
- **Where to find**: Apple Developer Portal → Membership → Team ID

### 2. `APP_STORE_CONNECT_API_KEY_ID`
- **Value**: Your API Key ID (e.g., `ABC123DEF4`)
- **Where to find**: App Store Connect → Users and Access → Keys → Key ID

### 3. `APP_STORE_CONNECT_ISSUER_ID`
- **Value**: Your Issuer ID (e.g., `12345678-1234-1234-1234-123456789012`)
- **Where to find**: App Store Connect → Users and Access → Keys → Issuer ID

### 4. `APP_STORE_CONNECT_API_KEY_BASE64`
- **Value**: Base64 encoded content of your .p8 API key file
- **How to create**:
  1. Download your API Key (.p8 file) from App Store Connect
  2. Encode it to base64:
     ```bash
     base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
     ```
  3. Paste the copied value as the secret

## Creating an App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to Users and Access → Keys
3. Click the + button to create a new key
4. Give it a name (e.g., "GitHub Actions")
5. Select the role: "App Manager" or higher
6. Download the .p8 file (you can only download it once!)

## Testing the Workflow

Once all secrets are configured:

1. Push to the main branch, or
2. Manually trigger the workflow from Actions tab → iOS TestFlight Build → Run workflow

The workflow will:
- Build your app
- Archive it
- Export the IPA
- Upload to TestFlight

## Troubleshooting

- Ensure your bundle identifier matches what's configured in App Store Connect
- Verify all secrets are set correctly (no extra spaces or newlines)
- Check that your API key has the necessary permissions
- The workflow uses automatic signing, so ensure your project is configured for it