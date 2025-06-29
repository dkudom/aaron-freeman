import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== Comments API Debug Info ===')
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl)
console.log('NEXT_PUBLIC_SUPABASE_URL value:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined')
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey)
console.log('SUPABASE_SERVICE_ROLE_KEY value:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'undefined')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Missing URL:', !supabaseUrl)
  console.error('Missing Service Key:', !supabaseServiceKey)
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

console.log('Supabase client created:', !!supabase)
console.log('=== End Debug Info ===')

// GET - Fetch comments for a blog post
export async function GET(request: NextRequest) {
  console.log('=== GET /api/comments Debug ===')
  
  try {
    if (!supabase) {
      console.error('Supabase client is null - environment variables missing')
      return NextResponse.json(
        { error: 'Database connection not available. Please check environment variables.' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const blogPostId = searchParams.get('blogPostId')
    console.log('Requested blogPostId:', blogPostId)

    if (!blogPostId) {
      console.error('No blogPostId provided in request')
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    console.log('Attempting to fetch comments from database...')
    
    // First, let's check if the comments table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('comments')
      .select('id')
      .limit(1)
    
    console.log('Comments table check result:', { tableCheck, tableError })
    
    if (tableError) {
      console.error('Comments table check failed:', tableError)
      
      // Check if it's a table not found error
      if (tableError.code === 'PGRST116' || tableError.message?.includes('relation') || tableError.message?.includes('does not exist')) {
        console.error('Comments table does not exist in database')
        return NextResponse.json(
          { error: 'Comments table not found. Database schema needs to be updated.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Database error: ${tableError.message}` },
        { status: 500 }
      )
    }

    // Fetch comments with nested structure
    console.log('Fetching comments for blogPostId:', blogPostId)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        author_name,
        author_email,
        content,
        created_at,
        parent_id,
        blog_post_id
      `)
      .eq('blog_post_id', blogPostId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    console.log('Comments fetch result:', { 
      commentsCount: comments?.length || 0, 
      error: error,
      hasComments: !!comments 
    })

    if (error) {
      console.error('Error fetching comments:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: error.message },
        { status: 500 }
      )
    }

    // Organize comments into nested structure
    const commentMap = new Map()
    const topLevelComments: any[] = []

    // First pass: create all comment objects
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: organize into hierarchy
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id))
        }
      } else {
        topLevelComments.push(commentMap.get(comment.id))
      }
    })

    return NextResponse.json({ comments: topLevelComments })
  } catch (error) {
    console.error('Error in GET /api/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check environment variables.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { blogPostId, authorName, authorEmail, content, parentId } = body

    // Validation
    if (!blogPostId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: blogPostId, authorName, authorEmail, content' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Content length validation
    if (content.trim().length < 1 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 1000 characters' },
        { status: 400 }
      )
    }

    // Skip blog post validation for portfolio site
    // Comments can be added to any page/section identified by blogPostId

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .eq('blog_post_id', blogPostId)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Insert new comment
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        blog_post_id: blogPostId,
        author_name: authorName.trim(),
        author_email: authorEmail.toLowerCase().trim(),
        content: content.trim(),
        parent_id: parentId || null,
        is_approved: true // Auto-approve for now
      })
      .select(`
        id,
        author_name,
        author_email,
        content,
        created_at,
        parent_id,
        blog_post_id
      `)
      .single()

    if (insertError) {
      console.error('Error creating comment:', insertError)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      comment: { ...newComment, replies: [] },
      message: 'Comment created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Admin delete comment
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check environment variables.' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const adminKey = searchParams.get('adminKey')

    // Basic admin auth check (you can replace this with more sophisticated auth)
    const ADMIN_KEY = process.env.ADMIN_DELETE_KEY || 'admin123'
    
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin key' },
        { status: 401 }
      )
    }

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // First check if comment exists
    const { data: existingComment, error: checkError } = await supabase
      .from('comments')
      .select('id, author_name, content')
      .eq('id', commentId)
      .single()

    if (checkError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Delete the comment (this will also delete replies due to CASCADE)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Comment deleted successfully',
      deletedComment: {
        id: commentId,
        author: existingComment.author_name,
        preview: existingComment.content.substring(0, 50) + '...'
      }
    })

  } catch (error) {
    console.error('Error in DELETE /api/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}