# 🚨 URGENT: Comments API Fix Guide

## 🎯 **Current Status Analysis**

### ✅ **Progress Made**
- ✅ Vendor chunks error: **FIXED** (server running)
- ✅ Environment file: **EXISTS** (.env.local detected)
- ✅ API structure: **WORKING** (other APIs like views work fine)

### ⚠️ **Two Issues Remaining**

## **Issue 1: Invalid API Key**
**Error**: `"Database error: Invalid API key"`  
**Cause**: Wrong service role key in `.env.local`

## **Issue 2: Testing Wrong URL**
**Error**: `POST https://www.freemanaaron.com/api/comments 404`  
**Cause**: Testing production site instead of localhost

---

## 🔧 **IMMEDIATE FIXES**

### **Fix 1: Get Correct Service Role Key**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ducospkzlvyo...` 
3. **Go to Settings > API**
4. **Copy the `service_role` key** (NOT the anon key)
5. **Update .env.local**:

```bash
# Replace this line in .env.local:
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# With your actual service role key:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.actual_key_here...
```

### **Fix 2: Test on Localhost (Not Production)**

❌ **WRONG URL**: `https://www.freemanaaron.com/api/comments`  
✅ **CORRECT URL**: `http://localhost:3000/api/comments`

**Test the fix:**
```bash
# Open browser to:
http://localhost:3000

# NOT:
https://www.freemanaaron.com
```

---

## 🧪 **Validation Steps**

### **Step 1: Verify Environment**
```bash
node scripts/test-comments-api.js
```

**Expected output:**
```
🔑 SUPABASE_SERVICE_ROLE_KEY configured: ✅
```

### **Step 2: Test API Directly**
```bash
curl "http://localhost:3000/api/comments?blogPostId=test"
```

**Expected result:**
```json
{"comments": []}
```

### **Step 3: Test in Browser**
- Open: `http://localhost:3000` 
- Navigate to a blog post
- Comments section should show "No comments yet" instead of error

---

## 📊 **Service Role Key Format**

**Valid service role key looks like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM5NTEyMDAwLCJleHAiOjE5NTUwODgwMDB9.signature
```

**Characteristics:**
- Length: ~150-200 characters  
- Format: `header.payload.signature`
- Contains: `"role":"service_role"`

---

## 🎉 **After Both Fixes**

1. **Comments API**: Returns `200` status with `{"comments": []}`
2. **Error messages**: Gone from browser console  
3. **Comments section**: Shows proper UI instead of error state

**Status**: Ready for production deployment! 