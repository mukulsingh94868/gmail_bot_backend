// ============================================
// FILE: INTEGRATION_GUIDE.md
// HOW TO INTEGRATE FOLLOW-UP BACKEND INTO YOUR PROJECT
// ============================================

# Follow-Up Backend Integration Guide

## Files Created

1. **models/FollowUp.js** - MongoDB schema for follow-ups
2. **controllers/followUpController.js** - All controller functions
3. **routes/followUpRoutes.js** - Route definitions

## Step 1: Copy Files to Your Backend

```
Your Backend Project/
├── models/
│   └── FollowUp.js (copy this)
├── controllers/
│   └── followUpController.js (copy this)
├── routes/
│   └── followUpRoutes.js (copy this)
└── server.js (or index.js or app.js)
```

## Step 2: Update Your Main App/Server File

In your **app.js** or **server.js**, add the import and use the routes:

```javascript
import followUpRoutes from "./routes/followUpRoutes.js";

// ... other imports and middleware ...

// Add this line with your other route imports
app.use("/api/followups", followUpRoutes);
```

## Step 3: Verify Middleware

Check that your **auth middleware** (protect/authMiddleware) is correctly named:

- If your middleware is called `protect`, you're good ✅
- If it's called something else (e.g., `authMiddleware`, `requireAuth`), update this line in `followUpRoutes.js`:

  ```javascript
  import { protect } from "../middleware/auth.js"; // change 'protect' if needed
  ```

## Step 4: Database Setup

The schema automatically creates:

- Unique index on `{ userId, emailApplied }`
- Index on `{ userId, status }`
- Index on `{ createdAt }`

MongoDB will create these automatically when you first save a FollowUp document.

## Step 5: Test the Endpoints

Use Postman or curl to test:

### Test 1: Send First Follow-up

```bash
curl -X POST http://localhost:5000/api/followups/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailApplied": "hr@company.com",
    "positionApplied": "React Developer",
    "followUpTemplate": "Hi [Name], following up on my earlier application for the React Developer role..."
  }'
```

**Expected Response (201):**

```json
{
  "statusCode": 201,
  "message": "Follow-up sent successfully",
  "data": {
    "followUpId": "...",
    "followUpCount": 1,
    "canFollowUp": true,
    "lastFollowUpDate": "2025-11-13T...",
    "nextFollowUpAllowed": true
  }
}
```

### Test 2: Check Follow-up Status

```bash
curl -X GET "http://localhost:5000/api/followups/check?emailApplied=hr@company.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "emailApplied": "hr@company.com",
    "followUpCount": 1,
    "canFollowUp": true,
    "lastFollowUpDate": "2025-11-13T...",
    "followUpDates": ["2025-11-13T..."]
  }
}
```

### Test 3: List All Follow-ups

```bash
curl -X GET "http://localhost:5000/api/followups/list?status=sent" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Send 2nd and 3rd Follow-ups

Repeat Test 1 two more times. On the 4th attempt, you should get a 400 error:

```json
{
  "statusCode": 400,
  "message": "Maximum follow-ups (3) reached for this email"
}
```

## Important Notes

1. **Authentication**: Replace `protect` middleware if your app uses a different name.

2. **User ID Field**: The controller uses `req.user?.id` or `req.user?._id`. Make sure your auth middleware sets this correctly:

   ```javascript
   // In your auth middleware
   req.user = { id: userId }; // or _id, depending on your setup
   ```

3. **Unique Constraint**: The unique index on `{ userId, emailApplied }` means:

   - User A can follow up with hr@company.com 3 times (same position or different positions)
   - User B can also follow up with hr@company.com 3 times independently
   - Cannot have duplicate (userId, emailApplied) pairs

4. **Error Handling**: All endpoints return proper HTTP status codes:
   - `201` - Follow-up sent successfully
   - `200` - Data fetched successfully
   - `400` - Invalid request or max follow-ups reached
   - `401` - Not authenticated
   - `403` - Unauthorized (not your record)
   - `404` - Record not found
   - `500` - Server error

## Optional Enhancements

### Add Email Validation

In `followUpController.js`, add email validation:

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailApplied)) {
  return res.status(400).json({ message: "Invalid email address" });
}
```

### Add Rate Limiting

Prevent spam by adding rate limiting middleware to routes:

```javascript
import rateLimit from "express-rate-limit";

const followUpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 follow-ups per minute
});

router.post("/send", protect, followUpLimiter, sendFollowUp);
```

### Auto Mark as Responded

When receiving a reply email, automatically call:

```
PUT /api/followups/:id/mark-responded
```

## Troubleshooting

**Issue**: "protect is not defined" error

- **Solution**: Update the import in `followUpRoutes.js` to match your actual middleware name

**Issue**: "Cannot find module '../models/FollowUp.js'"

- **Solution**: Make sure you placed FollowUp.js in the correct models folder

**Issue**: "Unique index error" when sending follow-up

- **Solution**: This means you already have 3 follow-ups for this user + email combo. Test with a different email.

**Issue**: userId is undefined in controller

- **Solution**: Check that your auth middleware properly sets `req.user.id` or `req.user._id`

## API Reference

### POST /api/followups/send

Send a follow-up email (max 3 per user per email)

**Request:**

```json
{
  "emailApplied": "hr@company.com",
  "positionApplied": "Senior React Developer",
  "originalMailId": "507f1f77bcf86cd799439011",
  "followUpTemplate": "Hi [Name], ..."
}
```

**Response:** 201

```json
{
  "statusCode": 201,
  "message": "Follow-up sent successfully",
  "data": {
    "followUpId": "...",
    "followUpCount": 1,
    "canFollowUp": true
  }
}
```

### GET /api/followups/check?emailApplied=...&positionApplied=...

Get follow-up status for an email

**Response:** 200

```json
{
  "statusCode": 200,
  "data": {
    "emailApplied": "hr@company.com",
    "followUpCount": 1,
    "canFollowUp": true,
    "lastFollowUpDate": "2025-11-13T10:30:00Z"
  }
}
```

### GET /api/followups/list?status=pending&limit=10&skip=0

List all follow-ups for current user

**Response:** 200

```json
{
  "statusCode": 200,
  "data": {
    "followUps": [...],
    "total": 25,
    "hasMore": true
  }
}
```

### GET /api/followups/:id

Get detailed follow-up record

### PUT /api/followups/:id/mark-responded

Mark follow-up as responded

### DELETE /api/followups/:id

Delete a follow-up record

---

**Now you're ready to integrate the frontend!** The frontend will call these endpoints to send follow-ups and check limits.
