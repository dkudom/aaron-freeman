# Comments System Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### How to get these values:

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the "URL" for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "service_role" secret key for `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

Run the SQL commands from `supabase/comments_schema.sql` in your Supabase SQL Editor:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/comments_schema.sql`
4. Click "Run"

## Features

- ✅ Add comments to blog posts
- ✅ Reply to existing comments (threaded discussions)
- ✅ Real-time comment count
- ✅ Character limit validation
- ✅ Email validation
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

## Usage

Once set up, comments will automatically appear below each blog post in the "Reflections & Insights" section.

## Troubleshooting

### API Errors (500/404)
- Check that your `.env.local` file exists with correct values
- Verify your Supabase credentials are valid
- Ensure the comments table was created successfully

### Input Form Issues
- The form has been optimized to prevent cursor jumping
- If you still experience issues, try refreshing the page

### Database Connection
- Make sure your Supabase project is active
- Check that RLS policies are properly configured
- Verify the comments table exists with the correct schema 