# CyberPanel API Integration Documentation

## Overview
This document outlines the proper CyberPanel API integration for the ElementiX Hosting Platform, implementing the correct authentication method as per the official CyberPanel Cloud API documentation.

## Authentication Method

### Previous Implementation (Incorrect)
- Used API Key with Bearer token authentication
- Used axios library for HTTP requests
- Headers: `Authorization: Bearer <api-key>`

### Current Implementation (Correct)
- Uses Basic Authentication with username/password
- Uses native fetch API for HTTP requests
- Headers: `Authorization: Basic <base64-encoded-credentials>`

## API Configuration

### Environment Variables
```bash
# .env.local
CYBERPANEL_URL="https://cp.socialedge.sbs:8090"
CYBERPANEL_USERNAME="admin"
CYBERPANEL_PASSWORD="your-cyberpanel-admin-password"
```

### Authentication Token Generation
```typescript
function generateCyberPanelToken(username: string, password: string): string {
  const credentials = `${username}:${password}`
  const encoded = Buffer.from(credentials).toString('base64')
  return `Basic ${encoded}`
}
```

## API Request Format

### Request Structure
All requests to CyberPanel follow this pattern:
- **URL**: `{CYBERPANEL_URL}/cloudAPI/`
- **Method**: POST
- **Headers**: 
  - `Authorization: Basic <base64-credentials>`
  - `Content-Type: application/json`
- **Body**: JSON with `serverUserName`, `controller`, and action-specific parameters

### Example Request
```typescript
const requestBody = {
  serverUserName: "admin",
  controller: "submitWebsiteCreation",
  domainName: "example.com",
  ownerEmail: "user@example.com",
  packageName: "Default",
  websiteOwner: "admin"
}

const response = await fetch(`${url}/cloudAPI/`, {
  method: 'POST',
  headers: {
    'Authorization': generateCyberPanelToken(username, password),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
})
```

## Available API Functions

### Core Functions
1. **verifyCyberPanelLogin()** - Verify authentication credentials
2. **createWebsiteCyberPanel()** - Create new websites
3. **deleteWebsiteCyberPanel()** - Delete existing websites
4. **fetchCyberPanelWebsites()** - List all websites
5. **createDatabaseCyberPanel()** - Create databases
6. **createEmailCyberPanel()** - Create email accounts

### Controller Actions
- `verifyLogin` - Test authentication
- `submitWebsiteCreation` - Create websites
- `submitWebsiteDeletion` - Delete websites
- `fetchWebsites` - List websites
- `submitDBCreation` - Create databases
- `submitEmailCreation` - Create email accounts
- `issueSSL` - Install SSL certificates
- `submitBackupCreation` - Create backups

## Integration Points

### Website Management
- **Create**: `/api/admin/websites` (POST)
- **Delete**: `/api/admin/websites/[id]` (DELETE)
- **Update**: `/api/admin/websites/[id]` (PUT)

### Testing
- **Test Endpoint**: `/api/test/cyberpanel` (GET)
- Verifies CyberPanel connectivity and authentication

## Error Handling

### Common Response Patterns
```typescript
interface CyberPanelResponse {
  status?: boolean
  error?: string
  data?: any
  message?: string
}
```

### Error Types
1. **Authentication Errors** - Wrong credentials
2. **Connection Errors** - Network/server issues
3. **API Errors** - Invalid parameters or operations
4. **Configuration Errors** - Missing environment variables

## Security Considerations

1. **Credentials Storage**: Store credentials in environment variables only
2. **HTTPS Only**: Always use HTTPS for CyberPanel connections
3. **Error Logging**: Log errors for debugging but not credentials
4. **Fallback Handling**: Continue database operations even if CyberPanel fails

## Migration Notes

### Changes Made
1. Removed axios dependency
2. Updated authentication method to Basic Auth
3. Changed API endpoint URLs to use `/cloudAPI/`
4. Updated request body format to include `serverUserName` and `controller`
5. Added proper error handling and logging

### Backward Compatibility
The `CyberPanelAPI` class wrapper maintains backward compatibility while using the new authentication method internally.

## Testing

### Test Authentication
```bash
GET /api/test/cyberpanel
```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "CyberPanel authentication successful",
  "data": {
    "status": true
  }
}
```

### Expected Response (Failure)
```json
{
  "success": false,
  "message": "CyberPanel authentication failed",
  "error": "Invalid credentials"
}
```

## Production Deployment

### Prerequisites
1. Valid CyberPanel server with Cloud API enabled
2. Admin credentials for CyberPanel
3. Proper SSL configuration
4. Network connectivity between hosting platform and CyberPanel server

### Configuration Steps
1. Update `CYBERPANEL_URL` with production server URL
2. Set `CYBERPANEL_USERNAME` to actual admin username
3. Set `CYBERPANEL_PASSWORD` to actual admin password
4. Test connectivity using the test endpoint
5. Verify website creation/deletion functionality

## Troubleshooting

### Common Issues
1. **401 Unauthorized** - Check username/password in environment variables
2. **Connection Timeout** - Verify CyberPanel server URL and network connectivity
3. **SSL Errors** - Ensure CyberPanel server has valid SSL certificate
4. **Missing Data** - Check request body format and required parameters

### Debug Mode
Enable debug logging by checking the server console for CyberPanel API request/response logs when making API calls.
