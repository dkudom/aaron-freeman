# Vercel Blob Storage Setup Guide

## Overview
This portfolio uses Vercel Blob for cloud file storage, allowing users to upload:
- **PDFs**: Up to 20MB (projects, resume, certificates)
- **Images**: Up to 10MB (blog post images)

## Setup Instructions

### 1. Enable Vercel Blob in Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** and select **Blob**
4. Follow the setup wizard

### 2. Get Your Blob Token
1. In the Vercel dashboard, go to **Storage > Blob**
2. Click on your blob store
3. Go to **Settings** tab
4. Copy the **Read/Write Token**

### 3. Set Environment Variable
```bash
vercel env add BLOB_READ_WRITE_TOKEN
```
Paste your token when prompted and select all environments (Production, Preview, Development).

### 4. Local Development
For local development, create a `.env.local` file:
```env
BLOB_READ_WRITE_TOKEN=your_actual_token_here
```

## File Upload Limits

| File Type | Maximum Size | Storage Location |
|-----------|-------------|------------------|
| PDF Files | 20MB | Vercel Blob |
| Images | 10MB | Vercel Blob |
| Metadata | N/A | localStorage |

## Features Enabled

✅ **Unlimited Uploads**: No more localStorage quota issues  
✅ **Large Files**: Support for 20MB PDFs and 10MB images  
✅ **Fast Downloads**: Direct cloud CDN delivery  
✅ **Backward Compatibility**: Existing localStorage files still work  
✅ **Admin Dashboard**: Real-time uploads with progress feedback  

## API Endpoints

- `POST /api/upload` - Upload files to Vercel Blob
  - Validates file size and type
  - Returns public URL for downloads
  - Supports concurrent uploads

## Troubleshooting

### Upload Fails
1. Check that `BLOB_READ_WRITE_TOKEN` is set correctly
2. Verify file size limits (20MB PDF, 10MB images)
3. Ensure file type is supported (PDF, JPG, PNG, GIF, WebP)

### Files Not Downloading
1. Check browser console for errors
2. Verify the blob URL is accessible
3. Ensure proper CORS configuration

## Cost Considerations

Vercel Blob pricing (as of 2024):
- **Free tier**: 100GB storage, 1TB bandwidth
- **Pro tier**: $0.15/GB storage, $0.30/GB bandwidth

For most portfolios, the free tier is sufficient. 