"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Reply, Send, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
  parent_id: string | null
  blog_post_id: string
  replies: Comment[]
}

interface CommentsSectionProps {
  blogPostId: string
  className?: string
}

interface CommentFormProps {
  parentId?: string | null
  onCancel?: () => void
  newComment: {
    authorName: string
    authorEmail: string
    content: string
  }
  setNewComment: React.Dispatch<React.SetStateAction<{
    authorName: string
    authorEmail: string
    content: string
  }>>
  submitComment: (parentId?: string | null) => Promise<void>
  submitting: boolean
}

const CommentForm = React.memo(({ parentId = null, onCancel, newComment, setNewComment, submitComment, submitting }: CommentFormProps) => {
  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(prev => ({ ...prev, authorName: e.target.value }))
  }, [setNewComment])

  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(prev => ({ ...prev, authorEmail: e.target.value }))
  }, [setNewComment])

  const handleContentChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(prev => ({ ...prev, content: e.target.value }))
  }, [setNewComment])

  const handleSubmit = React.useCallback(() => {
    submitComment(parentId)
  }, [parentId, submitComment])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/40"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Your name"
            value={newComment.authorName}
            onChange={handleNameChange}
            disabled={submitting}
          />
          <Input
            type="email"
            placeholder="Your email (won't be published)"
            value={newComment.authorEmail}
            onChange={handleEmailChange}
            disabled={submitting}
          />
        </div>
        <Textarea
          placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
          value={newComment.content}
          onChange={handleContentChange}
          disabled={submitting}
          rows={4}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {newComment.content.length}/1000 characters
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={submitting || !newComment.authorName.trim() || !newComment.authorEmail.trim() || !newComment.content.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : (parentId ? 'Reply' : 'Post Comment')}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

export default function CommentsSection({ blogPostId, className = "" }: CommentsSectionProps) {
  // State management for comments functionality
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState({
    authorName: "",
    authorEmail: "",
    content: ""
  })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [configError, setConfigError] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    if (blogPostId) {
      loadComments()
    }
  }, [blogPostId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?blogPostId=${blogPostId}`)
      const data = await response.json()

      if (response.ok) {
        setComments(data.comments || [])
        setConfigError(false)
      } else {
        console.error('Error loading comments:', data.error)
        
        // Check if it's a configuration error
        const isConfigError = data.error?.includes('Database connection not available')
        setConfigError(isConfigError)
        
        if (!isConfigError) {
          toast({
            title: "Error",
            description: "Failed to load comments",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      toast({
        title: "Error", 
        description: "Failed to load comments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (parentId: string | null = null) => {
    if (!newComment.authorName.trim() || !newComment.authorEmail.trim() || !newComment.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newComment.authorEmail)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (newComment.content.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Comment must be less than 1000 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogPostId,
          authorName: newComment.authorName,
          authorEmail: newComment.authorEmail,
          content: newComment.content,
          parentId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: parentId ? 'Reply posted successfully!' : 'Comment posted successfully!',
        })
        setNewComment({ authorName: "", authorEmail: "", content: "" })
        setReplyingTo(null)
        setShowForm(false)
        await loadComments()
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to post comment',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const CommentItem = React.memo(({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => {
    const isExpanded = expandedComments.has(comment.id)
    const hasReplies = comment.replies && comment.replies.length > 0

    const handleReplyToggle = React.useCallback(() => {
      setReplyingTo(replyingTo === comment.id ? null : comment.id)
    }, [comment.id, replyingTo])

    const handleExpandToggle = React.useCallback(() => {
      toggleCommentExpansion(comment.id)
    }, [comment.id])

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-8 border-l-2 border-primary/20 pl-4' : ''}`}
      >
        <Card className="bg-card/30 backdrop-blur-sm border-border/40">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(comment.author_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplyToggle}
                    className="text-xs gap-1 h-7"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </Button>
                  
                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandToggle}
                      className="text-xs gap-1 h-7"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-8"
            >
              <CommentForm 
                parentId={comment.id} 
                onCancel={() => setReplyingTo(null)}
                newComment={newComment}
                setNewComment={setNewComment}
                submitComment={submitComment}
                submitting={submitting}
              />
            </motion.div>
          )}

          {hasReplies && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  })

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0)
  }, 0)

  return (
    <section className={`${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">
              Comments ({totalComments})
            </h3>
          </div>
          
          {!showForm && !configError && (
            <Button 
              onClick={() => setShowForm(true)}
              className="gap-2"
              variant="outline"
            >
              <MessageCircle className="w-4 h-4" />
              Add Comment
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showForm && !configError && (
            <CommentForm 
              onCancel={() => setShowForm(false)}
              newComment={newComment}
              setNewComment={setNewComment}
              submitComment={submitComment}
              submitting={submitting}
            />
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {configError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Comments System Initializing</h4>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                The comments feature is being configured for this site. Please check back soon to join the conversation!
              </p>
              <div className="text-xs text-muted-foreground">
                {process.env.NODE_ENV === 'development' ? 
                  'Development: Check COMMENTS_SETUP.md for local setup instructions' : 
                  'Site admin: Configure environment variables in deployment settings'
                }
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No comments yet</h4>
              <p className="text-muted-foreground mb-4">
                Be the first to share your thoughts on this post!
              </p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Write a Comment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 