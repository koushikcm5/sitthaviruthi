# API v1 Migration Guide

## Overview
All API endpoints have been migrated to `/api/v1/` for versioning support.

## Breaking Changes

### Authentication Endpoints
- **Old**: `/api/auth/*`
- **New**: `/api/v1/auth/*`

### Notification Endpoints
- **Old**: `/api/notifications/*`
- **New**: `/api/v1/notifications/*`

## New Features

### 1. Refresh Token System
**Login Response Changed:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "role": "USER",
  "username": "john",
  "name": "John Doe",
  "level": 1
}
```

**New Endpoint - Refresh Token:**
```
POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### 2. Session Management
**Get Active Sessions:**
```
GET /api/v1/auth/sessions/{username}
```

**Logout Single Session:**
```
DELETE /api/v1/auth/sessions/{sessionId}
```

**Logout All Devices:**
```
POST /api/v1/auth/logout-all/{username}
```

### 3. Push Notifications
**Save Device Token:**
```
POST /api/v1/notifications/device-token
Body: {
  "username": "john",
  "token": "fcm-token",
  "deviceType": "ANDROID"
}
```

## Frontend Migration Steps

1. Update all API URLs from `/api/` to `/api/v1/`
2. Update login response handling to use `accessToken` instead of `token`
3. Store `refreshToken` securely
4. Implement token refresh logic when `accessToken` expires
5. Register FCM device token after login

## Redis Setup (Optional)
```bash
# Install Redis
docker run -d -p 6379:6379 redis

# Or use cloud Redis (Railway, AWS ElastiCache, etc.)
```

## FCM Setup (Optional)
1. Create Firebase project
2. Download service account JSON
3. Set `FCM_CREDENTIALS_PATH` and `FCM_ENABLED=true`
