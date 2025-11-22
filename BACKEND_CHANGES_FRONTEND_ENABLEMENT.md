# Cineranda Platform - Backend Changes: Frontend Enablement Addendum

**Document Version:** 1.0
**Date:** November 18, 2025
**Purpose:** Deep documentation of additional backend changes and endpoints required for robust frontend development, with request/response examples.

---

## 1. Admin Refresh Token Endpoint

### POST `/admin/auth/refresh-token`
**Authentication:** ✅ Required (`{{adminToken}}`)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid or expired refresh token"
}
```

---

## 2. User Library/Favorites Endpoints

### POST `/library` - Add to User Library/Favorites
**Request Body:**
```json
{
  "contentId": "68c9f123a45b67c8d90e1234"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Content added to library"
}
```

### DELETE `/library/{contentId}` - Remove from User Library/Favorites
**Success Response:**
```json
{
  "status": "success",
  "message": "Content removed from library"
}
```

### GET `/library` - Get User Library/Favorites
**Success Response:**
```json
{
  "status": "success",
  "data": {
    "library": [
      {
        "contentId": "68c9f123a45b67c8d90e1234",
        "title": "The Last Kingdom",
        "type": "Movie",
        "posterImageUrl": "https://s3.amazonaws.com/posters/last-kingdom.jpg"
      }
    ]
  }
}
```

---

## 3. Watch Progress Sync Endpoints

### POST `/watch-progress` - Save Watch Progress
**Request Body:**
```json
{
  "contentId": "68c9f123a45b67c8d90e1234",
  "progress": 85
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Progress saved"
}
```

### GET `/watch-progress/{contentId}` - Get Watch Progress
**Success Response:**
```json
{
  "status": "success",
  "data": {
    "contentId": "68c9f123a45b67c8d90e1234",
    "progress": 85
  }
}
```

---

## 4. Real-Time Notifications

### GET `/notifications/stream` - Real-Time Notifications (WebSocket/SSE)
**Success Event Example:**
```json
{
  "event": "notification",
  "data": {
    "title": "New Movie Released!",
    "message": "Check out 'The Last Kingdom' now available on Cineranda",
    "actionUrl": "/content/movies/68c9f123a45b67c8d90e1234"
  }
}
```

---

## 5. Additional Recommendations for Frontend Enablement

- Ensure all endpoints return clear, consistent error/status responses
- All list endpoints should support pagination, filtering, and sorting
- Add CRUD endpoints for user library/favorites
- Add endpoints for saving and retrieving watch progress (sync/resume)
- Add real-time notification support (WebSocket/SSE)

---

**End of Addendum**
