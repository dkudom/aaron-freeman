# Vercel Environment Variables Setup for Comments System

## 🚨 **Required for Production Deployment**

The comments system requires Supabase environment variables to be configured in Vercel. Here's how to set them up:

## 📋 **Step-by-Step Setup**

### 1. **Get Your Supabase Credentials**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **Service Role Key** (for `SUPABASE_SERVICE_ROLE_KEY`)

### 2. **Configure Vercel Environment Variables**

#### Method A: Using Vercel Dashboard (Recommended)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`aaron-freeman-portfolio`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Production, Preview, Development |

**Important**: 
- ✅ Select **All environments** (Production, Preview, Development)
- ✅ Make sure `NEXT_PUBLIC_SUPABASE_URL` starts with `NEXT_PUBLIC_`
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (don't share it)

#### Method B: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your Service Role Key when prompted
```

### 3. **Redeploy Your Application**
After setting environment variables:
```bash
# Option 1: Trigger redeploy via Git
git commit --allow-empty -m "Trigger redeploy with env vars"
git push

# Option 2: Redeploy via Vercel CLI
vercel --prod
```

### 4. **Verify Setup**
1. Visit your production site
2. Go to a blog post in "Reflections & Insights"
3. Scroll down to see the comments section
4. The error should be gone and you should see "No comments yet" or existing comments

## 🔧 **Troubleshooting**

### Still Getting 500 Errors?
1. **Check Variable Names**: Ensure exact spelling
   - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_KEY`)

2. **Check Values**: 
   - URL should start with `https://`
   - Service key should be a long string starting with `eyJ`

3. **Check Environment Selection**: Both variables should be enabled for "Production"

4. **Check Supabase Database**: 
   - Run the SQL from `supabase/comments_schema.sql`
   - Verify the `comments` table exists

### Testing Environment Variables
You can check if they're working by visiting:
```
https://your-site.vercel.app/api/comments?blogPostId=test
```

- ✅ Should return `{"error":"Blog post not found"}` (means env vars work)
- ❌ Should NOT return `{"error":"Database connection not available..."}` (means env vars missing)

## 🎯 **Quick Fix Command**

If you already have a `.env.local` file locally, you can copy those values to Vercel:

```bash
# View your local environment variables
cat .env.local

# Then manually add them to Vercel dashboard
```

## 📱 **Mobile Vercel App**
You can also set environment variables using the Vercel mobile app:
1. Open project → Settings → Environment Variables
2. Add the two required variables
3. Redeploy the project

## ✅ **Verification Checklist**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel  
- [ ] Both variables enabled for "Production"
- [ ] Application redeployed after adding variables
- [ ] Comments schema SQL executed in Supabase
- [ ] No more 500 errors on production site 