"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { ViewCounter, ViewBadge } from "@/components/view-counter"

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

export default function ReflectionsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: blogPostsData, error: blogError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false })

        if (blogError) {
          console.error('❌ Reflections: Error loading from Supabase:', blogError)
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
        console.log('✅ Reflections: Blog posts loaded from Supabase:', transformedPosts.length)
      } catch (error) {
        console.error('❌ Reflections: Error loading blog posts:', error)
      }
    }

    loadPosts()

    // Listen for post updates from admin
    const handlePostsUpdate = () => {
      console.log('📢 Reflections: Received postsUpdated event, reloading from Supabase')
      loadPosts()
    }

    window.addEventListener('postsUpdated', handlePostsUpdate)

    return () => {
      window.removeEventListener('postsUpdated', handlePostsUpdate)
    }
  }, [])

  return (
    <section id="reflections" className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
            Reflections & Insights
          </h2>
          <p className="text-xl text-foreground/70 dark:text-foreground/60 max-w-3xl mx-auto mb-4">
            Thoughts and perspectives on urban planning, sustainability, and creating better cities for tomorrow
          </p>
          <ViewCounter 
            pageType="reflections_section" 
            pageId="main" 
            showUniqueViews={true}
            className="justify-center"
          />
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reflections Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Blog posts and insights will appear here once they are published through the admin dashboard.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group h-full hover:shadow-lg transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm">
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
                  <div className="flex items-center justify-between text-sm text-foreground/60 mb-2">
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
                  
                  <Link href={`/reflections?id=${post.id}`}>
                    <Button variant="ghost" className="group-hover:text-primary p-0 h-auto">
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
} 