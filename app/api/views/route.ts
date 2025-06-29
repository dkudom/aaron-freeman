import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Track a page view
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Views API: POST request received')
    
    const { pageType, pageId } = await request.json()
    console.log('📊 Views API: Request data:', { pageType, pageId })
    
    if (!pageType) {
      console.log('❌ Views API: Missing pageType')
      return NextResponse.json({ error: 'pageType is required' }, { status: 400 })
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 
      '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    console.log('📊 Views API: Tracking view for:', { 
      pageType, 
      pageId: pageId || 'main', 
      ip: ip.substring(0, 8) + '...' // Only log partial IP for privacy
    })

    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Views API: Supabase connection test failed:', testError)
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message 
      }, { status: 500 })
    }
    console.log('✅ Views API: Supabase connection test passed')

    // Check if page_views table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('page_views')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Views API: page_views table check failed:', tableError)
      return NextResponse.json({ 
        error: 'Views table not found - please run the migration script', 
        details: tableError.message 
      }, { status: 500 })
    }
    console.log('✅ Views API: page_views table accessible')

    // Insert view record
    const insertData = {
      page_type: pageType,
      page_id: pageId || 'main',
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer
    }
    
    console.log('📊 Views API: Inserting data:', { 
      ...insertData, 
      ip_address: ip.substring(0, 8) + '...' 
    })

    const { data: insertResult, error } = await supabase
      .from('page_views')
      .insert(insertData)
      .select()

    if (error) {
      console.error('❌ Views API: Error inserting page view:', error)
      return NextResponse.json({ 
        error: 'Failed to track view', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('✅ Views API: View tracked successfully:', insertResult)
    return NextResponse.json({ success: true, data: insertResult })
  } catch (error) {
    console.error('❌ Views API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Get view counts for a page or all pages
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Views API: GET request received')
    
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const pageId = searchParams.get('pageId')

    console.log('📊 Views API: Query params:', { pageType, pageId })

    let query = supabase.from('view_counts').select('*')

    if (pageType) {
      query = query.eq('page_type', pageType)
    }

    if (pageId) {
      query = query.eq('page_id', pageId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Views API: Error fetching view counts:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch view counts', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Views API: View counts fetched:', data?.length || 0, 'records')
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ Views API: Unexpected error in GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 