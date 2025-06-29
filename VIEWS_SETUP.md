# View Counter Setup Instructions

This document explains how to set up the real-time view counter for the "Reflections & Insights" section.

## Database Setup

1. **Run the updated schema**: Execute the SQL commands in `supabase/schema.sql` in your Supabase SQL Editor. This will create:
   - `page_views` table to track individual page views
   - `view_counts` table for aggregated statistics
   - Automatic triggers to update view counts
   - Proper indexing for performance

2. **Verify tables**: After running the schema, you should see these new tables in your Supabase dashboard:
   - `page_views` - stores individual view records with IP, user agent, etc.
   - `view_counts` - stores aggregated view statistics

## Features Implemented

### Real-time View Tracking
- **Reflections Section**: Tracks views when users visit the main reflections section
- **Individual Blog Posts**: Tracks views for each blog post separately
- **Unique Visitor Counting**: Distinguishes between total views and unique visitors based on IP address

### View Counter Display
- **Section View Counter**: Shows total views and unique readers for the entire reflections section
- **Individual Post Badges**: Shows view count for each blog post in a compact badge format
- **Detailed View Counters**: Shows both total views and unique readers with animated loading states

### Components Added
- `ViewCounter` - Main component for displaying detailed view statistics
- `ViewBadge` - Compact badge component for displaying view counts
- `useViews` hook - Custom hook for tracking and fetching view data
- `/api/views` endpoint - API for tracking views and retrieving statistics

## How It Works

1. **View Tracking**: When a user visits a page, the `useViews` hook automatically:
   - Sends a POST request to `/api/views` with page type and ID
   - Records the view with IP address, user agent, and referrer
   - Updates aggregated counts via database triggers

2. **View Display**: Components fetch and display view counts in real-time:
   - Shows loading states while fetching data
   - Updates automatically when new views are recorded
   - Displays both total views and unique visitors

3. **Performance**: 
   - Uses database triggers for efficient count updates
   - Includes proper indexing for fast queries
   - Caches view data in React state to minimize API calls

## Usage Examples

### Section View Counter
```tsx
<ViewCounter 
  pageType="reflections_section" 
  pageId="main" 
  showUniqueViews={true}
  className="justify-center"
/>
```

### Blog Post View Badge
```tsx
<ViewBadge pageType="blog_post" pageId={post.id} />
```

### Individual Post View Counter
```tsx
<ViewCounter 
  pageType="blog_post" 
  pageId={post.id} 
  showUniqueViews={true}
/>
```

## Privacy Considerations

- Only IP addresses are stored for unique visitor counting
- No personal information is collected
- IP addresses are used solely for analytics purposes
- Data complies with standard web analytics practices

## Future Enhancements

Potential improvements for the view counter system:
- Admin dashboard for viewing detailed analytics
- Time-based analytics (daily, weekly, monthly views)
- Geographic analytics based on IP location
- Referrer analytics to track traffic sources
- Export functionality for analytics data 