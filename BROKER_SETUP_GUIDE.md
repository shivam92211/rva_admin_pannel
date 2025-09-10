# KuCoin Broker API Setup Guide

## Quick Start

1. **Get your KuCoin Broker API credentials**:
   - Log into [KuCoin Broker Dashboard](https://www.kucoin.com/broker)
   - Create an API key with required permissions
   - Note down: API Key, API Secret, API Passphrase

2. **Option A - Environment Variables (Production)**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Option B - UI Configuration (Development)**:
   - Start the app: `npm run dev`
   - Go to Dashboard → Click "Configure API"
   - Enter credentials and save

4. **Test Connection**:
   - Click "Test Connection" on Dashboard
   - Verify broker information appears

## API Permissions Required

When creating your KuCoin Broker API key, ensure these permissions:

- ✅ **General** (required)
- ✅ **Sub-Account** (for sub-account management) 
- ✅ **Transfer** (for fund transfers)
- ✅ **Trade** (optional, for trading features)

## Troubleshooting

### "Authentication failed" error
- Double-check API credentials are correct
- Ensure API key has required permissions
- Check if IP whitelist is configured correctly

### "Broker not configured" message
- Verify environment variables start with `VITE_`
- Restart dev server after changing `.env`
- Use UI configuration as alternative

### API connection issues
- Check internet connection
- Verify KuCoin API is operational
- Ensure no firewall blocking API requests

## Environment Variables Reference

```env
# Required
VITE_KUCOIN_BROKER_API_KEY=your_api_key
VITE_KUCOIN_BROKER_API_SECRET=your_api_secret  
VITE_KUCOIN_BROKER_API_PASSPHRASE=your_passphrase

# Optional but recommended for broker features
VITE_KUCOIN_BROKER_PARTNER_KEY=your_partner_key
VITE_KUCOIN_BROKER_NAME=your_broker_name

# Settings
VITE_DEMO_MODE=false
VITE_ENVIRONMENT=development
```

## Security Best Practices

- Never commit real credentials to git
- Use environment variables in production
- Enable IP whitelisting on KuCoin API keys
- Regularly rotate API keys
- Monitor API usage and logs