import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const tests = []
  
  try {
    // Test 1: Basic Supabase connection
    tests.push('🔍 Testing Supabase connection...')
    const { data: blogTest, error: blogError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1)
    
    if (blogError) {
      tests.push(`❌ Supabase connection failed: ${blogError.message}`)
      return NextResponse.json({ tests, success: false })
    }
    tests.push('✅ Supabase connection successful')

    // Test 2: Check if page_views table exists
    tests.push('🔍 Checking if page_views table exists...')
    const { data: pageViewsTest, error: pageViewsError } = await supabase
      .from('page_views')
      .select('id')
      .limit(1)
    
    if (pageViewsError) {
      tests.push(`❌ page_views table error: ${pageViewsError.message}`)
      tests.push('💡 Please run the migration script: supabase/add_views_migration.sql')
      return NextResponse.json({ tests, success: false })
    }
    tests.push('✅ page_views table accessible')

    // Test 3: Check if view_counts table exists
    tests.push('🔍 Checking if view_counts table exists...')
    const { data: viewCountsTest, error: viewCountsError } = await supabase
      .from('view_counts')
      .select('id')
      .limit(1)
    
    if (viewCountsError) {
      tests.push(`❌ view_counts table error: ${viewCountsError.message}`)
      tests.push('💡 Please run the migration script: supabase/add_views_migration.sql')
      return NextResponse.json({ tests, success: false })
    }
    tests.push('✅ view_counts table accessible')

    // Test 4: Try a simple insert
    tests.push('🔍 Testing insert operation...')
    const testData = {
      page_type: 'blog_post',
      page_id: 'test-' + Date.now(),
      ip_address: '127.0.0.1',
      user_agent: 'test-agent',
      referrer: 'test-referrer'
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('page_views')
      .insert(testData)
      .select()

    if (insertError) {
      tests.push(`❌ Insert operation failed: ${insertError.message}`)
      tests.push(`💡 Error code: ${insertError.code}`)
      return NextResponse.json({ tests, success: false })
    }
    tests.push('✅ Insert operation successful')

    // Test 5: Check if trigger worked (view_counts should be updated)
    tests.push('🔍 Checking if trigger updated view_counts...')
    const { data: triggerTest, error: triggerError } = await supabase
      .from('view_counts')
      .select('*')
      .eq('page_type', 'blog_post')
      .eq('page_id', testData.page_id)

    if (triggerError) {
      tests.push(`❌ Trigger test failed: ${triggerError.message}`)
      return NextResponse.json({ tests, success: false })
    }

    if (!triggerTest || triggerTest.length === 0) {
      tests.push('⚠️ Trigger may not be working - no view_counts record created')
    } else {
      tests.push('✅ Trigger is working - view_counts updated')
    }

    // Cleanup: Delete test record
    await supabase
      .from('page_views')
      .delete()
      .eq('page_id', testData.page_id)

    await supabase
      .from('view_counts')
      .delete()
      .eq('page_id', testData.page_id)

    tests.push('✅ All tests completed successfully!')
    return NextResponse.json({ tests, success: true })

  } catch (error) {
    tests.push(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json({ tests, success: false })
  }
} 