"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft, User } from "lucide-react"
import { ViewCounter, ViewBadge } from "@/components/view-counter"
import CommentsSection from "@/components/comments-section"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
  image?: string
}

export default function ReflectionsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: blogPostsData, error: blogError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false })

        if (blogError) {
          console.error('❌ Reflections Page: Error loading from Supabase:', blogError)
          return
        }

        const transformedPosts = blogPostsData.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          date: post.date,
          readTime: post.read_time,
          tags: post.tags || [],
          image: post.image_url
        }))
        setPosts(transformedPosts)
        console.log('✅ Reflections Page: Posts loaded from Supabase:', transformedPosts.length)

        // Check if there's a specific post ID in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const postId = urlParams.get('id')
        
        if (postId) {
          const post = transformedPosts.find((p: BlogPost) => p.id === postId)
          if (post) {
            setSelectedPost(post)
          }
        }
      } catch (error) {
        console.error('❌ Reflections Page: Error loading posts:', error)
      }
    }

    loadPosts()

    // Listen for updates from admin
    const handlePostsUpdate = () => {
      console.log('📢 Reflections Page: Received postsUpdated event, reloading from Supabase')
      loadPosts()
    }

    window.addEventListener('postsUpdated', handlePostsUpdate)
    return () => window.removeEventListener('postsUpdated', handlePostsUpdate)
  }, [])

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="section-padding py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back button */}
            <Link href="/#reflections">
              <Button variant="ghost" className="mb-8 gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Reflections
              </Button>
            </Link>

            {/* Article */}
            <article className="max-w-4xl mx-auto">
              {selectedPost.image && (
                <div className="w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Aaron Freeman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedPost.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedPost.readTime}</span>
                    </div>
                  </div>
                  <ViewCounter 
                    pageType="blog_post" 
                    pageId={selectedPost.id} 
                    showUniqueViews={true}
                  />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
                  {selectedPost.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {selectedPost.excerpt}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </header>

              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              <footer className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      AF
                    </div>
                    <div>
                      <p className="font-semibold">Aaron Freeman</p>
                      <p className="text-sm text-muted-foreground">Urban & Environmental Planner</p>
                    </div>
                  </div>
                  
                  <Link href="/#reflections">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      More Posts
                    </Button>
                  </Link>
                </div>
              </footer>

              {/* Comments Section */}
              <div className="mt-16 pt-8 border-t border-border">
                <CommentsSection blogPostId={selectedPost.id} />
              </div>
            </article>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="section-padding py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <Link href="/#reflections">
              <Button variant="ghost" className="mb-8 gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Homepage
              </Button>
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
              Reflections & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Explore all thoughts and perspectives on urban planning, sustainability, and creating better cities for tomorrow
            </p>
            <ViewCounter 
              pageType="reflections_section" 
              pageId="main" 
              showUniqueViews={true}
              className="justify-center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className="group h-full hover:shadow-lg transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.image && (
                    <div className="w-full h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <ViewBadge pageType="blog_post" pageId={post.id} />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-foreground/70">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button variant="ghost" className="group-hover:text-primary p-0 h-auto">
                      Read Full Article →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No reflections available yet.</p>
              <Link href="/#reflections">
                <Button className="mt-4">Go to Homepage</Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 