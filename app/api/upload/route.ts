import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// Configure the route for larger uploads
export const runtime = 'nodejs'; // Use Node.js runtime for larger file handling
export const maxDuration = 30; // 30 second timeout for uploads

// Vercel serverless function body size limit (approximately 4.5MB)
const MAX_SERVERLESS_BODY_SIZE = 4.5 * 1024 * 1024; // 4.5MB

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD API ROUTE CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('Runtime info:', { 
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
  
  try {
    // Check environment variables first
    console.log('Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('Environment check - BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);
    console.log('Environment check - NODE_ENV:', process.env.NODE_ENV);
    console.log('Environment check - VERCEL:', process.env.VERCEL);
    console.log('Environment check - VERCEL_ENV:', process.env.VERCEL_ENV);
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
      return NextResponse.json({ 
        error: 'Server configuration error. BLOB_READ_WRITE_TOKEN missing.',
        debug: 'Environment variable not configured',
        suggestion: 'Contact administrator to configure storage credentials'
      }, { status: 500 });
    }

    // Check request size before processing to prevent overload
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const bodySize = parseInt(contentLength, 10);
      console.log('Request body size:', bodySize, 'bytes (', (bodySize / (1024 * 1024)).toFixed(2), 'MB)');
      
      if (bodySize > MAX_SERVERLESS_BODY_SIZE) {
        console.warn('⚠️ Request too large for serverless function, suggesting direct upload');
        return NextResponse.json({ 
          error: 'File too large for API route. Use direct upload instead.',
          debug: `Body size ${(bodySize / (1024 * 1024)).toFixed(2)}MB exceeds ${(MAX_SERVERLESS_BODY_SIZE / (1024 * 1024)).toFixed(1)}MB limit`,
          suggestion: 'The system should automatically switch to direct upload for files over 4MB',
          shouldUseDirectUpload: true
        }, { status: 413 });
      }
    }

    console.log('📄 Parsing request body...');
    console.log('Request content-length:', request.headers.get('content-length'));
    console.log('Request content-type:', request.headers.get('content-type'));
    
    // Add timeout protection for body parsing
    const parseTimeout = setTimeout(() => {
      console.error('❌ Request body parsing timeout (15s)');
    }, 15000);
    
    const body = await request.formData();
    clearTimeout(parseTimeout);
    
    console.log('✅ FormData parsed successfully');
    console.log('FormData entries:', Array.from(body.entries()).map(([key, value]) => ({
      key,
      type: typeof value,
      isFile: value instanceof File,
      size: value instanceof File ? value.size : 'N/A'
    })));
    
    const file = body.get('file') as File;
    
    if (!file) {
      console.error('❌ No file in request body');
      console.error('Available form data keys:', Array.from(body.keys()));
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`📁 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    console.log('File size in MB:', (file.size / (1024 * 1024)).toFixed(2));

    // Double-check file size against our limits
    if (file.size > MAX_SERVERLESS_BODY_SIZE) {
      console.warn('⚠️ File size exceeds serverless function limit');
      return NextResponse.json({ 
        error: 'File too large for API route. Please use direct upload.',
        debug: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds ${(MAX_SERVERLESS_BODY_SIZE / (1024 * 1024)).toFixed(1)}MB limit`,
        shouldUseDirectUpload: true
      }, { status: 413 });
    }

    // Validate file size based on type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (isImage && file.size > 10 * 1024 * 1024) { // 10MB for images
      console.error(`❌ Image file too large: ${file.size} bytes`);
      return NextResponse.json({ 
        error: 'Image files must be under 10MB' 
      }, { status: 413 });
    }
    
    if (isPDF && file.size > 20 * 1024 * 1024) { // 20MB for PDFs
      console.error(`❌ PDF file too large: ${file.size} bytes`);
      return NextResponse.json({ 
        error: 'PDF files must be under 20MB' 
      }, { status: 413 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        error: 'File type not supported. Please upload PDF, JPG, PNG, GIF, or WebP files.' 
      }, { status: 400 });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${cleanName}`;
    
    console.log(`🚀 Attempting to upload to Vercel Blob: ${filename}`);

    // Upload to Vercel Blob with proper error handling
    try {
      console.log('🔧 Blob upload config:', {
        filename,
        fileSize: file.size,
        fileType: file.type,
        access: 'public',
        tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
      });
      
      const uploadStart = Date.now();
      const blob = await put(filename, file, {
        access: 'public',
      });
      const uploadTime = Date.now() - uploadStart;

      console.log(`✅ Successfully uploaded: ${blob.url}`);
      console.log(`⏱️ Upload took: ${uploadTime}ms`);
      console.log('📊 Blob details:', {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname
      });

      return NextResponse.json({ 
        url: blob.url,
        downloadUrl: blob.downloadUrl || blob.url,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        success: true,
        uploadTime: uploadTime
      });
    } catch (blobError) {
      console.error('❌ Vercel Blob upload error:', blobError);
      console.error('Error stack:', blobError instanceof Error ? blobError.stack : 'No stack trace');
      console.error('Error name:', blobError instanceof Error ? blobError.name : 'Unknown');
      console.error('Error message:', blobError instanceof Error ? blobError.message : 'Unknown');
      
      // Check if it's a token issue
      if (blobError instanceof Error && (blobError.message.includes('token') || blobError.message.includes('unauthorized') || blobError.message.includes('authentication'))) {
        return NextResponse.json({ 
          error: 'Storage authentication failed. Please check BLOB_READ_WRITE_TOKEN configuration.',
          debug: blobError.message,
          suggestion: 'Contact administrator to verify Vercel Blob setup'
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'File upload failed. Please try again or use a smaller file.',
        debug: blobError instanceof Error ? blobError.message : 'Unknown blob error',
        suggestion: 'Try using a smaller file or contact support if the issue persists'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Upload API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error cause:', error instanceof Error ? error.cause : 'No cause');
    console.error('Memory usage at error:', process.memoryUsage());
    
    // Handle specific error types
    if (error instanceof Error) {
      // Vercel-specific errors
      if (error.message.includes('Function execution timed out')) {
        return NextResponse.json({ 
          error: 'Upload timeout. The file is too large or upload took too long.',
          debug: error.message,
          suggestion: 'Try using a smaller file or contact support'
        }, { status: 408 });
      }
      
      if (error.message.includes('Request entity too large') || error.message.includes('body size limit')) {
        return NextResponse.json({ 
          error: 'File too large for serverless function. Please use a file under 4.5MB.',
          debug: error.message,
          suggestion: 'The system will automatically use direct upload for larger files',
          shouldUseDirectUpload: true
        }, { status: 413 });
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Upload timeout. Please try again with a smaller file.',
          debug: error.message
        }, { status: 408 });
      }
      
      if (error.message.includes('BLOB_READ_WRITE_TOKEN') || error.message.includes('token')) {
        return NextResponse.json({ 
          error: 'Storage authentication failed. Environment configuration issue.',
          debug: error.message
        }, { status: 401 });
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'Network error during upload. Please try again.',
          debug: error.message
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Upload failed. Please try again.',
      debug: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 