# 🔧 Comments API 500 Error - Quick Fix Guide

## Problem
Comments API returns 500 Internal Server Error: `GET /api/comments?blogPostId=... 500`

## Root Cause
❌ **Missing Supabase environment variables**

## ✅ Solution (3 steps)

### Step 1: Configure Environment Variables
1. Open `.env.local` (already created)
2. Replace placeholder values with your actual Supabase credentials:

```bash
# Get these from https://supabase.com/dashboard > Your Project > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Ensure Comments Table Exists
In your Supabase SQL Editor, run:
```sql
-- Check if comments table exists
SELECT * FROM comments LIMIT 1;
```

If error "relation does not exist", run the schema:
```bash
# Copy and paste content of supabase/comments_schema.sql into Supabase SQL Editor
```

### Step 3: Test the Fix
```bash
# Start development server
npm run dev

# Test API (in another terminal)
node scripts/test-comments-api.js

# Or test manually
curl "http://localhost:3000/api/comments?blogPostId=test"
```

## ✅ Expected Result
- Status 200 (instead of 500)
- Response: `{"comments": []}`
- Console logs show environment variables loaded

## Debug Added
Enhanced error logging in `/app/api/comments/route.ts` shows:
- Environment variable status
- Database connection status  
- Specific error details

## Files Created/Modified
- ✅ `.env.local` - Environment template
- ✅ `app/api/comments/route.ts` - Added debug logging
- ✅ `scripts/test-comments-api.js` - Validation script
- ✅ `COMMENTS_DEBUGGING_REPORT.md` - Detailed analysis

---

**The 500 error is fixed once Step 1 is completed with real Supabase credentials.** 