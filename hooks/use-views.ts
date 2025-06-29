import { useState, useEffect, useRef } from 'react'

interface ViewCount {
  id: string
  page_type: string
  page_id: string
  total_views: number
  unique_views: number
  last_updated: string
}

export function useViews(pageType: string, pageId?: string) {
  const [viewCount, setViewCount] = useState<ViewCount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasTrackedView = useRef(false)

  // Track view once when component mounts
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackView(pageType, pageId)
      hasTrackedView.current = true
    }
  }, [pageType, pageId])

  // Fetch view count
  useEffect(() => {
    fetchViewCount()
  }, [pageType, pageId])

  const trackView = async (pageType: string, pageId?: string) => {
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageType,
          pageId: pageId || 'main',
        }),
      })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  const fetchViewCount = async () => {
    try {
      const params = new URLSearchParams({
        pageType,
        ...(pageId && { pageId }),
      })

      const response = await fetch(`/api/views?${params}`)
      const { data } = await response.json()
      
      if (data && data.length > 0) {
        setViewCount(data[0])
      }
    } catch (error) {
      console.error('Error fetching view count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshViewCount = () => {
    fetchViewCount()
  }

  return {
    viewCount,
    isLoading,
    refreshViewCount,
  }
}

export function useAllViews() {
  const [viewCounts, setViewCounts] = useState<ViewCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllViewCounts()
  }, [])

  const fetchAllViewCounts = async () => {
    try {
      const response = await fetch('/api/views')
      const { data } = await response.json()
      setViewCounts(data || [])
    } catch (error) {
      console.error('Error fetching all view counts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshViewCounts = () => {
    fetchAllViewCounts()
  }

  return {
    viewCounts,
    isLoading,
    refreshViewCounts,
  }
} 