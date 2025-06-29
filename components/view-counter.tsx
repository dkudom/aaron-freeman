"use client"

import { motion } from "framer-motion"
import { Eye, Users } from "lucide-react"
import { useViews } from "@/hooks/use-views"

interface ViewCounterProps {
  pageType: string
  pageId?: string
  showIcon?: boolean
  showUniqueViews?: boolean
  className?: string
}

export function ViewCounter({ 
  pageType, 
  pageId, 
  showIcon = true, 
  showUniqueViews = false,
  className = "" 
}: ViewCounterProps) {
  const { viewCount, isLoading } = useViews(pageType, pageId)

  if (isLoading || !viewCount) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground animate-pulse ${className}`}>
        {showIcon && <Eye className="w-4 h-4" />}
        <span>Loading views...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}
    >
      <div className="flex items-center gap-2">
        {showIcon && <Eye className="w-4 h-4" />}
        <span className="font-medium">{viewCount.total_views.toLocaleString()}</span>
        <span>view{viewCount.total_views !== 1 ? 's' : ''}</span>
      </div>
      
      {showUniqueViews && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium">{viewCount.unique_views.toLocaleString()}</span>
          <span>unique reader{viewCount.unique_views !== 1 ? 's' : ''}</span>
        </div>
      )}
    </motion.div>
  )
}

export function ViewBadge({ 
  pageType, 
  pageId, 
  className = "" 
}: Pick<ViewCounterProps, 'pageType' | 'pageId' | 'className'>) {
  const { viewCount, isLoading } = useViews(pageType, pageId)

  if (isLoading || !viewCount) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground ${className}`}>
        <Eye className="w-3 h-3" />
        <span>...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors ${className}`}
    >
      <Eye className="w-3 h-3" />
      <span className="font-medium">{viewCount.total_views.toLocaleString()}</span>
    </motion.div>
  )
} 