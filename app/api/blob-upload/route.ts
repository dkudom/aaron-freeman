import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('=== BLOB UPLOAD TOKEN EXCHANGE CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('📄 Parsing request body...');
    const body = (await request.json()) as HandleUploadBody;
    console.log('📦 Request body parsed:', JSON.stringify(body, null, 2));

    console.log('🔐 Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('🔐 Environment check - BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Generate a client token for the browser to upload the file
        console.log(`🎫 Generating token for upload: ${pathname}`);
        
        // For now, allow all uploads - in production you'd add authentication here
        const tokenConfig = {
          allowedContentTypes: [
            'application/pdf',
            'image/jpeg', 
            'image/jpg',
            'image/png', 
            'image/gif', 
            'image/webp'
          ],
          tokenPayload: JSON.stringify({
            uploadTime: new Date().toISOString(),
          }),
        };
        
        console.log('🎫 Token config:', JSON.stringify(tokenConfig, null, 2));
        return tokenConfig;
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log('✅ Blob upload completed:', blob.url, tokenPayload);
        
        try {
          // You could add database logging here if needed
          console.log(`🎉 File uploaded successfully: ${blob.url}`);
        } catch (error) {
          console.error('❌ Error in upload completion handler:', error);
          // Don't throw here as it would mark the upload as failed
        }
      },
    });

    console.log('✅ Token exchange successful, response:', JSON.stringify(jsonResponse, null, 2));
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('❌ Blob upload token exchange error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: (error as Error).message,
        debug: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 400 }
    );
  }
} 