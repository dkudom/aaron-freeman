"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Building, Leaf, Zap, MapPin, TreePine, Users, FileText, Download, Award, Shield, Sparkles, Cpu, Database, Globe, Terminal } from "lucide-react"
import { toast } from 'sonner'
import { upload } from '@vercel/blob/client'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
  image?: string
  imageDownloadUrl?: string
}

interface Project {
  id: string
  title: string
  description: string
  pdfFile: string
  pdfUrl: string
  pdfDownloadUrl?: string
  category: string
  location?: string
  year?: string
  status: string
}

interface Resume {
  fileName: string
  fileData?: string // Keep for backward compatibility
  fileUrl?: string // New cloud storage URL
  uploadDate: string
  fileSize: number
}

interface Certificate {
  id: string
  fileName: string
  fileData?: string // Keep for backward compatibility
  fileUrl?: string // New cloud storage URL
  uploadDate: string
  fileSize: number
  title: string
  issuer: string
  dateIssued: string
}

const projectCategories = ["Urban & Environmental Projects", "Environmental & Compliance Experience", "Community & Volunteer Leadership"]
const projectStatuses = ["Completed", "In Progress", "Planning", "Concept"]

const categoryIcons: Record<string, React.ReactNode> = {
  "Urban & Environmental Projects": <MapPin className="w-4 h-4 text-primary" />,
  "Environmental & Compliance Experience": <TreePine className="w-4 h-4 text-primary" />,
  "Community & Volunteer Leadership": <Users className="w-4 h-4 text-primary" />
}

// Helper function to format dates for Supabase (cache-bust-v2)
const formatDateForSupabase = (dateString: string): string => {
  // Handle different date formats
  if (!dateString) return new Date().toISOString().split('T')[0]
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle "Month Year" format like "June 2022"
  const monthYearMatch = dateString.match(/^(\w+)\s+(\d{4})$/)
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
    const monthIndex = monthNames.indexOf(month)
    if (monthIndex !== -1) {
      return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`
    }
  }
  
  // Handle other date formats
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch (error) {
    console.warn('Could not parse date:', dateString)
  }
  
  // Fallback to current date
  return new Date().toISOString().split('T')[0]
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [resume, setResume] = useState<Resume | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [activeTab, setActiveTab] = useState("blog")
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [secretKeySequence, setSecretKeySequence] = useState("")
  
  // Blog management state
  const [blogDialogOpen, setBlogDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    image: ""
  })
  const [selectedBlogImage, setSelectedBlogImage] = useState<File | null>(null)
  const blogImageInputRef = useRef<HTMLInputElement>(null)

  // Project management state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    year: "",
    status: "",
    pdfFile: ""
  })
  const [selectedProjectPdf, setSelectedProjectPdf] = useState<File | null>(null)
  const projectPdfInputRef = useRef<HTMLInputElement>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)
  
  // Certificate management state
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [certificateFormData, setCertificateFormData] = useState({
    title: "",
    issuer: "",
    dateIssued: ""
  })
  const [selectedCertificate, setSelectedCertificate] = useState<File | null>(null)
  const certificateFileInputRef = useRef<HTMLInputElement>(null)

  // Loading states for uploads
  const [isUploadingProject, setIsUploadingProject] = useState(false)
  const [isUploadingBlog, setIsUploadingBlog] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false)

  // Load data from Supabase only
  useEffect(() => {
    loadDataFromDatabase()

    // Secret key listener for admin access
    const handleKeyPress = (event: KeyboardEvent) => {
      const newSequence = secretKeySequence + event.key.toLowerCase()
      setSecretKeySequence(newSequence)
      
      // Check if the secret sequence matches "adminaccess"
      if (newSequence.includes("adminaccess")) {
        setIsVisible(true)
        setSecretKeySequence("") // Reset sequence
      } else if (newSequence.length > 20) {
        setSecretKeySequence("") // Reset if sequence gets too long
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [secretKeySequence])

  // Load data from Supabase database only
  const loadDataFromDatabase = async () => {
    try {
      console.log('🔄 Loading data from Supabase...')

      // Load blog posts from Supabase
      const { data: blogPostsData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false })

      if (blogError) {
        console.error('❌ Error loading blog posts from Supabase:', blogError)
        toast.error('Failed to load blog posts from database')
      } else {
        const transformedPosts = blogPostsData.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          date: post.date,
          readTime: post.read_time,
          tags: post.tags || [],
          image: post.image_url,
          imageDownloadUrl: post.image_url
        }))
        setPosts(transformedPosts)
        console.log('✅ Blog posts loaded from Supabase:', transformedPosts.length)
      }

      // Load projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('❌ Error loading projects from Supabase:', projectsError)
        toast.error('Failed to load projects from database')
      } else {
        const transformedProjects = projectsData.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          pdfFile: project.pdf_url,
          pdfUrl: project.pdf_url,
          pdfDownloadUrl: project.pdf_url,
          category: project.category,
          location: project.location || '',
          year: project.year || '',
          status: project.status
        }))
        setProjects(transformedProjects)
        console.log('✅ Projects loaded from Supabase:', transformedProjects.length)
      }

      // Load resume from Supabase
      const { data: resumeData, error: resumeError } = await supabase
        .from('resume')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(1)

      if (resumeError) {
        console.error('❌ Error loading resume from Supabase:', resumeError)
        toast.error('Failed to load resume from database')
      } else if (resumeData && resumeData.length > 0) {
        const latestResume = resumeData[0]
        const transformedResume = {
          fileName: latestResume.file_name,
          fileUrl: latestResume.file_url,
          uploadDate: latestResume.uploaded_at,
          fileSize: latestResume.file_size
        }
        setResume(transformedResume)
        console.log('✅ Resume loaded from Supabase')
      } else {
        console.log('📋 No resume found in Supabase')
        setResume(null)
      }

      // Load certificates from Supabase
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .order('date_issued', { ascending: false })

      if (certificatesError) {
        console.error('❌ Error loading certificates from Supabase:', certificatesError)
        toast.error('Failed to load certificates from database')
      } else {
        const transformedCertificates = certificatesData.map(cert => ({
          id: cert.id,
          fileName: cert.file_name,
          fileUrl: cert.file_url,
          uploadDate: cert.created_at,
          fileSize: cert.file_size,
          title: cert.title,
          issuer: cert.issuer,
          dateIssued: cert.date_issued
        }))
        setCertificates(transformedCertificates)
        console.log('✅ Certificates loaded from Supabase:', transformedCertificates.length)
      }

    } catch (error) {
      console.error('❌ Error loading data from database:', error)
      toast.error('Failed to load data from database')
    }
  }

  // Save blog posts to Supabase
  const savePosts = async (newPosts: BlogPost[]) => {
    console.log('💾 Saving blog posts to Supabase:', newPosts.length)
    try {
      // Clear existing posts and insert new ones
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('❌ Error clearing existing blog posts:', deleteError)
        throw deleteError
      }

      if (newPosts.length > 0) {
        const supabasePosts = newPosts.map(post => ({
          id: crypto.randomUUID(),
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          date: post.date,
          read_time: post.readTime,
          tags: post.tags,
          image_url: post.image
        }))

        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(supabasePosts)

        if (insertError) {
          console.error('❌ Error saving blog posts to Supabase:', insertError)
          throw insertError
        }
      }

      setPosts(newPosts)
      console.log('✅ Blog posts saved to Supabase successfully')
      toast.success('Blog posts saved successfully')
      
      // Trigger refresh in other components
      window.dispatchEvent(new CustomEvent('postsUpdated'))
    } catch (error) {
      console.error('❌ Failed to save blog posts to Supabase:', error)
      toast.error('Failed to save blog posts to database')
    }
  }

  // Save projects to Supabase
  const saveProjects = async (newProjects: Project[]) => {
    console.log('💾 Saving projects to Supabase:', newProjects.length)
    try {
      // Clear existing projects and insert new ones
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('❌ Error clearing existing projects:', deleteError)
        throw deleteError
      }

      if (newProjects.length > 0) {
        const supabaseProjects = newProjects.map(project => ({
          id: crypto.randomUUID(),
          title: project.title,
          description: project.description,
          pdf_url: project.pdfUrl,
          category: project.category,
          location: project.location || null,
          year: project.year || null,
          status: project.status
        }))

        const { error: insertError } = await supabase
          .from('projects')
          .insert(supabaseProjects)

        if (insertError) {
          console.error('❌ Error saving projects to Supabase:', insertError)
          throw insertError
        }
      }

      setProjects(newProjects)
      console.log('✅ Projects saved to Supabase successfully')
      toast.success('Projects saved successfully')
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('projectsUpdated'))
      console.log('📢 Dispatched projectsUpdated event')
    } catch (error) {
      console.error('❌ Failed to save projects to Supabase:', error)
      toast.error('Failed to save projects to database')
    }
  }

  // Save certificates to Supabase
  const saveCertificates = async (newCertificates: Certificate[]) => {
    console.log('💾 Saving certificates to Supabase:', newCertificates.length)
    try {
      // Clear existing certificates and insert new ones
      const { error: deleteError } = await supabase
        .from('certificates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('❌ Error clearing existing certificates:', deleteError)
        throw deleteError
      }

      if (newCertificates.length > 0) {
        const supabaseCertificates = newCertificates.map(cert => ({
          id: crypto.randomUUID(),
          title: cert.title,
          issuer: cert.issuer,
          date_issued: formatDateForSupabase(cert.dateIssued),
          file_name: cert.fileName,
          file_url: cert.fileUrl || '',
          file_size: cert.fileSize
        }))

        const { error: insertError } = await supabase
          .from('certificates')
          .insert(supabaseCertificates)

        if (insertError) {
          console.error('❌ Error saving certificates to Supabase:', insertError)
          throw insertError
        }
      }

      setCertificates(newCertificates)
      console.log('✅ Certificates saved to Supabase successfully')
      toast.success('Certificates saved successfully')
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('certificatesUpdated'))
      console.log('📢 Dispatched certificatesUpdated event')
    } catch (error) {
      console.error('❌ Failed to save certificates to Supabase:', error)
      toast.error('Failed to save certificates to database')
    }
  }



  // Upload file directly to Vercel Blob (bypasses API route size limits)
  const uploadToVercelBlobDirect = async (file: File): Promise<{ url: string; downloadUrl: string }> => {
    console.log(`🔗 Starting direct upload: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      
    try {
      // Validate file size
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      
      if (isImage && file.size > 10 * 1024 * 1024) {
        throw new Error('Image files must be under 10MB')
      }
      
      if (isPDF && file.size > 20 * 1024 * 1024) {
        throw new Error('PDF files must be under 20MB')
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ]

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, JPG, PNG, GIF, or WebP files.')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}-${cleanName}`
      
      console.log(`🚀 Uploading directly to Vercel Blob: ${filename}`)
      console.log('📋 Upload config:', {
        filename,
        fileSize: file.size,
        fileType: file.type,
        access: 'public',
        handleUploadUrl: '/api/blob-upload'
      })
      
      // Upload directly to Vercel Blob (bypasses 4.5MB API limit)
      const uploadStart = Date.now()
      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      })
      const uploadTime = Date.now() - uploadStart

      console.log(`✅ Direct upload successful in ${uploadTime}ms:`, blob.url)
      console.log('📊 Blob details:', {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname
      })

      return {
        url: blob.url,
        downloadUrl: blob.downloadUrl || blob.url
      }
    } catch (error) {
      console.error('❌ Direct Vercel Blob upload error:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack'
      })
      
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('authentication') || error.message.includes('unauthorized')) {
          throw new Error('Upload authentication failed. Please contact administrator to verify BLOB_READ_WRITE_TOKEN configuration.')
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.')
        }
        if (error.message.includes('timeout')) {
          throw new Error('Upload timeout. Please try again with a smaller file.')
        }
        if (error.message.includes('handleUploadUrl')) {
          throw new Error('Upload endpoint error. Please contact administrator.')
        }
      }
      
      throw error
    }
  }

  // Fallback to API route for smaller files
  const uploadToVercelBlob = async (file: File): Promise<{ url: string; downloadUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log(`📤 Attempting API upload for file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        let shouldUseDirectUpload = false
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          shouldUseDirectUpload = errorData.shouldUseDirectUpload || false
          
          console.log('📋 API upload error details:', {
            status: response.status,
            error: errorData.error,
            debug: errorData.debug,
            suggestion: errorData.suggestion,
            shouldUseDirectUpload
          })
          
          // If the API suggests direct upload, throw a special error to trigger fallback
          if (shouldUseDirectUpload) {
            const fallbackError = new Error('API_SIZE_LIMIT_FALLBACK')
            ;(fallbackError as any).shouldUseDirectUpload = true
            throw fallbackError
          }
          
        } catch (parseError) {
          // If it's our special fallback error, re-throw it
          if (parseError instanceof Error && parseError.message === 'API_SIZE_LIMIT_FALLBACK') {
            throw parseError
          }
          
          // If JSON parsing fails, use status-based messages
          switch (response.status) {
            case 413:
              console.log('📦 File too large for API route, falling back to direct upload')
              const sizeError = new Error('API_SIZE_LIMIT_FALLBACK')
              ;(sizeError as any).shouldUseDirectUpload = true
              throw sizeError
            case 415:
              errorMessage = 'Unsupported file type. Please upload PDF, JPG, PNG, GIF, or WebP files.'
              break
            case 401:
              errorMessage = 'Upload authentication failed. Please contact administrator.'
              break
            case 500:
              errorMessage = 'Server error. Please try again or use a smaller file.'
              break
            default:
              errorMessage = `Upload failed (${response.status}). Please try again.`
          }
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log(`✅ API upload successful: ${result.url}`)
      return result
      
    } catch (networkError) {
      if (networkError instanceof Error) {
        if (networkError.message === 'API_SIZE_LIMIT_FALLBACK') {
          throw networkError // Re-throw to trigger direct upload fallback
        }
        if (networkError.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.')
        }
      }
      throw networkError
    }
  }

  // Smart upload function that chooses the best method
  const smartUpload = async (file: File): Promise<{ url: string; downloadUrl: string }> => {
    console.log(`🧠 Smart upload analyzing file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
    
    // For files larger than 4MB, use direct upload immediately
    if (file.size > 4 * 1024 * 1024) {
      console.log('📦 File larger than 4MB, using direct upload to bypass API limits')
      return await uploadToVercelBlobDirect(file)
    }
    
    // For smaller files, try API route first, fallback to direct upload
    try {
      console.log('🚀 Attempting API route for smaller file')
      return await uploadToVercelBlob(file)
    } catch (error) {
      if (error instanceof Error) {
        // Check for our special fallback signal
        if (error.message === 'API_SIZE_LIMIT_FALLBACK' || (error as any).shouldUseDirectUpload) {
          console.log('📦 API route suggested direct upload, switching methods')
        return await uploadToVercelBlobDirect(file)
      }
        
        // Legacy fallback for 413 responses
        if (error.message.includes('413') || error.message.includes('too large')) {
          console.log('📦 API route returned size error, falling back to direct upload')
          return await uploadToVercelBlobDirect(file)
        }
        
        // For authentication or server errors, don't fallback - these need to be fixed
        if (error.message.includes('authentication') || error.message.includes('BLOB_READ_WRITE_TOKEN')) {
          console.error('🔐 Authentication error - direct upload will also fail')
          throw error
        }
      }
      
      throw error
    }
  }

  // Blog management functions
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploadingBlog(true)
    
    try {
      let imageUrl = ''
      let imageDownloadUrl = ''
      
      if (selectedBlogImage) {
        const uploadResult = await smartUpload(selectedBlogImage)
        imageUrl = uploadResult.url
        imageDownloadUrl = uploadResult.downloadUrl
      }

      const newPost: BlogPost = {
        id: editingPost ? editingPost.id : crypto.randomUUID(),
        title: blogFormData.title,
        excerpt: blogFormData.excerpt,
        content: blogFormData.content,
        date: new Date().toISOString().split('T')[0],
        readTime: `${Math.ceil(blogFormData.content.split(' ').length / 200)} min read`,
        tags: blogFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        image: imageUrl,
        imageDownloadUrl
      }

      let updatedPosts
      if (editingPost) {
        updatedPosts = posts.map(post => post.id === editingPost.id ? newPost : post)
      } else {
        updatedPosts = [newPost, ...posts]
      }

      await savePosts(updatedPosts)
      setBlogFormData({ title: "", excerpt: "", content: "", tags: "", image: "" })
      setSelectedBlogImage(null)
      setEditingPost(null)
      setBlogDialogOpen(false)
    } catch (error) {
      console.error('Error saving blog post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post')
    } finally {
      setIsUploadingBlog(false)
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setBlogFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(', '),
      image: post.image || ""
    })
    setSelectedBlogImage(null)
    setBlogDialogOpen(true)
  }

  const handleDeletePost = async (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId)
    await savePosts(updatedPosts)
  }

  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 10MB for images with cloud storage)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert(`Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 10MB limit. Please use a smaller image file.`)
        e.target.value = '' // Clear the input
        return
      }
      setSelectedBlogImage(file)
    }
  }

  const handleProjectPdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (limit to 20MB for cloud storage)
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (file.size > maxSize) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 20MB limit. Please use a smaller PDF file.`)
        event.target.value = '' // Clear the input
        return
      }
      setSelectedProjectPdf(file)
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploadingProject(true)
    
    try {
      let pdfUrl = ''
      let pdfDownloadUrl = ''
      
      if (selectedProjectPdf) {
        const uploadResult = await smartUpload(selectedProjectPdf)
        pdfUrl = uploadResult.url
        pdfDownloadUrl = uploadResult.downloadUrl
      }

      const newProject: Project = {
        id: editingProject ? editingProject.id : crypto.randomUUID(),
        title: projectFormData.title,
        description: projectFormData.description,
        pdfFile: projectFormData.pdfFile,
        pdfUrl,
        pdfDownloadUrl,
        category: projectFormData.category,
        location: projectFormData.location,
        year: projectFormData.year,
        status: projectFormData.status
      }

      let updatedProjects
      if (editingProject) {
        updatedProjects = projects.map(project => project.id === editingProject.id ? newProject : project)
      } else {
        updatedProjects = [newProject, ...projects]
      }

      await saveProjects(updatedProjects)
      setProjectFormData({ title: "", description: "", category: "", location: "", year: "", status: "", pdfFile: "" })
      setSelectedProjectPdf(null)
      setEditingProject(null)
      setProjectDialogOpen(false)
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save project')
    } finally {
      setIsUploadingProject(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      location: project.location || "",
      year: project.year || "",
      status: project.status,
      pdfFile: project.pdfFile
    })
    setSelectedProjectPdf(null)
    setProjectDialogOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId)
    await saveProjects(updatedProjects)
  }

  const handleNewPost = () => {
    setEditingPost(null)
    setBlogFormData({ title: "", excerpt: "", content: "", tags: "", image: "" })
    setSelectedBlogImage(null)
    setBlogDialogOpen(true)
  }

  const handleNewProject = () => {
    setEditingProject(null)
    setProjectFormData({ title: "", description: "", category: "", location: "", year: "", status: "", pdfFile: "" })
    setSelectedProjectPdf(null)
    setProjectDialogOpen(true)
  }

  const handleProjectPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 20MB for cloud storage)
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (file.size > maxSize) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 20MB limit. Please use a smaller PDF file.`)
        e.target.value = '' // Clear the input
        return
      }
      setSelectedProjectPdf(file)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 20MB for cloud storage)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 20MB limit. Please use a smaller PDF file.`)
      e.target.value = '' // Clear the input
      return
    }

    setIsUploadingResume(true)
    try {
      const uploadResult = await smartUpload(file)
      const newResume: Resume = {
        fileName: file.name,
        fileUrl: uploadResult.url,
        uploadDate: new Date().toISOString(),
        fileSize: file.size
      }
      
      // Save to Supabase
      try {
        // Delete existing resume entries
        const { error: deleteError } = await supabase
          .from('resume')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (deleteError) {
          console.error('❌ Error clearing existing resume:', deleteError)
          throw deleteError
        }

        // Insert new resume
        const { error: insertError } = await supabase
          .from('resume')
          .insert({
            file_name: file.name,
            file_url: uploadResult.url,
            file_size: file.size
          })

        if (insertError) {
          console.error('❌ Error saving resume to Supabase:', insertError)
          throw insertError
        }

        setResume(newResume)
        console.log('✅ Resume saved to Supabase successfully')
        toast.success('Resume uploaded successfully')
        
        // Dispatch custom event for resume update
        window.dispatchEvent(new Event('resumeUpdated'))
      } catch (dbError) {
        console.error('❌ Failed to save resume to Supabase:', dbError)
        toast.error('Failed to save resume to database')
      }

    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload resume')
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleResumeDownload = () => {
    if (resume) {
      const link = document.createElement('a')
      // Use new cloud URL if available, fallback to old base64 data
      link.href = resume.fileUrl || resume.fileData || ''
      link.download = resume.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleResumeDelete = async () => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('resume')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        console.error('❌ Error deleting resume from Supabase:', error)
        throw error
      }

      setResume(null)
      console.log('✅ Resume deleted from Supabase successfully')
      toast.success('Resume deleted successfully')
      
      // Dispatch custom event for resume update
      window.dispatchEvent(new Event('resumeUpdated'))
    } catch (error) {
      console.error('❌ Failed to delete resume from Supabase:', error)
      toast.error('Failed to delete resume from database')
    }
  }

  // Certificate management functions
  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploadingCertificate(true)
    
    try {
      let fileUrl = ''
      let fileDownloadUrl = ''
      
      if (selectedCertificate) {
        const uploadResult = await smartUpload(selectedCertificate)
        fileUrl = uploadResult.url
        fileDownloadUrl = uploadResult.downloadUrl
      }

      const newCertificate: Certificate = {
        id: editingCertificate ? editingCertificate.id : crypto.randomUUID(),
        fileName: selectedCertificate?.name || '',
        fileUrl,
        uploadDate: new Date().toISOString(),
        fileSize: selectedCertificate?.size || 0,
        title: certificateFormData.title,
        issuer: certificateFormData.issuer,
        dateIssued: formatDateForSupabase(certificateFormData.dateIssued)
      }

      let updatedCertificates
      if (editingCertificate) {
        updatedCertificates = certificates.map(cert => cert.id === editingCertificate.id ? newCertificate : cert)
      } else {
        updatedCertificates = [newCertificate, ...certificates]
      }

      await saveCertificates(updatedCertificates)
      setCertificateFormData({ title: "", issuer: "", dateIssued: "" })
      setSelectedCertificate(null)
      setEditingCertificate(null)
      setCertificateDialogOpen(false)
    } catch (error) {
      console.error('Error saving certificate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save certificate')
    } finally {
      setIsUploadingCertificate(false)
    }
  }

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate)
    setCertificateFormData({
      title: certificate.title,
      issuer: certificate.issuer,
      dateIssued: certificate.dateIssued
    })
    setSelectedCertificate(null)
    setCertificateDialogOpen(true)
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    const updatedCertificates = certificates.filter(cert => cert.id !== certificateId)
    await saveCertificates(updatedCertificates)
  }

  const handleNewCertificate = () => {
    setEditingCertificate(null)
    setCertificateFormData({ title: "", issuer: "", dateIssued: "" })
    setSelectedCertificate(null)
    setCertificateDialogOpen(true)
  }

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 20MB for cloud storage)
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (file.size > maxSize) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 20MB limit. Please use a smaller PDF file.`)
        e.target.value = '' // Clear the input
        return
      }
      setSelectedCertificate(file)
    }
  }

  const handleCertificateDownload = (certificate: Certificate) => {
    const link = document.createElement('a')
    // Use new cloud URL if available, fallback to old base64 data
    link.href = certificate.fileUrl || certificate.fileData || ''
    link.download = certificate.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isVisible) {
    return null // No visible button - access via secret key sequence "adminaccess"
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm">
      <div className="absolute inset-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Modern subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
          <div className="w-full h-full" style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)
            `,
            backgroundSize: '24px 24px'
          }} />
        </div>
        

        <div className="relative z-10 p-6 h-full overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-primary rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h2>
                <p className="text-muted-foreground text-sm">Manage your portfolio content</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                  className="gap-2"
                >
                  <EyeOff className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="blog" 
                className="text-sm font-medium rounded-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Blog Posts
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="text-sm font-medium rounded-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Projects
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="resume" 
                className="text-sm font-medium rounded-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="credentials" 
                className="text-sm font-medium rounded-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certificates
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blog" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Blog Posts</h3>
                <Button onClick={handleNewPost} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {post.date} • {post.readTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 mb-3 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Projects</h3>
                <Button onClick={handleNewProject} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="h-fit">
                    <CardHeader>
                      {project.pdfFile && (
                        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-white" />
                          <div className="absolute bottom-2 right-2 bg-red-700 text-white text-xs font-bold px-2 py-1 rounded">
                            PDF
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {categoryIcons[project.category]}
                        <Badge variant="secondary" className="text-xs">
                          {project.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {project.location && `${project.location} • `}
                        {project.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resume" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Resume/CV Management</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Current Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resume ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{resume.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(resume.fileSize)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleResumeDownload}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          <Button
                            onClick={handleResumeDelete}
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">No resume uploaded yet</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={() => resumeFileInputRef.current?.click()}
                      className="w-full flex items-center gap-2"
                      variant={resume ? "outline" : "default"}
                    >
                      <Upload className="w-4 h-4" />
                      {resume ? "Replace Resume" : "Upload Resume"}
                    </Button>
                    <input
                      type="file"
                      ref={resumeFileInputRef}
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      PDF files only. Max file size: 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Public Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    When a resume is uploaded, visitors will see a download link in the contact section.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Current Status:</p>
                    <Badge variant={resume ? "default" : "secondary"}>
                      {resume ? "Resume Available" : "No Resume Uploaded"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Certificates</h3>
                <Button onClick={handleNewCertificate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Certificate
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((certificate) => (
                  <Card key={certificate.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{certificate.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Issued by: {certificate.issuer}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 mb-3 line-clamp-3">
                        {certificate.dateIssued}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCertificate(certificate)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCertificate(certificate.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Blog Post Dialog */}
          <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                <DialogDescription>
                  {editingPost ? 'Edit your reflection post' : 'Share your thoughts and insights'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="blog-title">Title</Label>
                  <Input
                    id="blog-title"
                    value={blogFormData.title}
                    onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                    placeholder="Enter post title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    value={blogFormData.excerpt}
                    onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                    placeholder="Brief description of your post"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    value={blogFormData.content}
                    onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                    placeholder="Write your full post content here"
                    rows={8}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                  <Input
                    id="blog-tags"
                    value={blogFormData.tags}
                    onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                    placeholder="Urban Planning, Sustainability, etc."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="blog-image">Post Image (Optional)</Label>
                  <div className="flex gap-2">
                    <input
                      ref={blogImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => blogImageInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedBlogImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {(selectedBlogImage || editingPost?.image) && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <ImageIcon className="h-4 w-4" />
                        {selectedBlogImage ? selectedBlogImage.name : 'Current image'}
                      </div>
                    )}
                  </div>
                  {selectedBlogImage && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(selectedBlogImage)}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                  {!selectedBlogImage && editingPost?.image && (
                    <div className="mt-2">
                      <img
                        src={editingPost.image}
                        alt="Current"
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBlogSubmit}>
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Project Dialog */}
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogDescription>
                  {editingProject ? 'Edit your project details' : 'Add a new project to your portfolio'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    value={projectFormData.title}
                    onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                    placeholder="Enter project title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-category">Category</Label>
                    <Select
                      value={projectFormData.category}
                      onValueChange={(value) => setProjectFormData({ ...projectFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project-status">Status</Label>
                    <Select
                      value={projectFormData.status}
                      onValueChange={(value) => setProjectFormData({ ...projectFormData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-location">Location (Optional)</Label>
                    <Input
                      id="project-location"
                      value={projectFormData.location}
                      onChange={(e) => setProjectFormData({ ...projectFormData, location: e.target.value })}
                      placeholder="Project location"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project-year">Year (Optional)</Label>
                    <Input
                      id="project-year"
                      value={projectFormData.year}
                      onChange={(e) => setProjectFormData({ ...projectFormData, year: e.target.value })}
                      placeholder="2024"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="project-pdf">Project PDF Document</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={projectPdfInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleProjectPdfUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => projectPdfInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedProjectPdf ? 'Change PDF' : 'Upload PDF'}
                    </Button>
                    {(selectedProjectPdf || editingProject?.pdfFile) && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <FileText className="h-4 w-4" />
                        {selectedProjectPdf ? selectedProjectPdf.name : 'Current PDF'}
                      </div>
                    )}
                  </div>
                  {selectedProjectPdf && (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded border">
                      <FileText className="w-8 h-8 text-red-600" />
                      <span className="text-sm font-medium">{selectedProjectPdf.name}</span>
                    </div>
                  )}
                  {!selectedProjectPdf && editingProject?.pdfFile && (
                    <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded border">
                      <FileText className="w-8 h-8 text-red-600" />
                      <span className="text-sm font-medium">Current Project PDF</span>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProjectSubmit}>
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Certificate Dialog */}
          <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? 'Edit Certificate' : 'Create New Certificate'}</DialogTitle>
                <DialogDescription>
                  {editingCertificate ? 'Edit your certificate details' : 'Add a new certificate to your portfolio'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="certificate-title">Certificate Title</Label>
                  <Input
                    id="certificate-title"
                    value={certificateFormData.title}
                    onChange={(e) => setCertificateFormData({ ...certificateFormData, title: e.target.value })}
                    placeholder="Enter certificate title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="certificate-issuer">Issuer</Label>
                  <Input
                    id="certificate-issuer"
                    value={certificateFormData.issuer}
                    onChange={(e) => setCertificateFormData({ ...certificateFormData, issuer: e.target.value })}
                    placeholder="Enter certificate issuer"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="certificate-dateIssued">Date Issued</Label>
                  <Input
                    id="certificate-dateIssued"
                    value={certificateFormData.dateIssued}
                    onChange={(e) => setCertificateFormData({ ...certificateFormData, dateIssued: e.target.value })}
                    placeholder="Enter date issued"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="certificate-image">Certificate Image</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={certificateFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => certificateFileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedCertificate ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {(selectedCertificate || editingCertificate?.fileData) && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <ImageIcon className="h-4 w-4" />
                        {selectedCertificate ? selectedCertificate.name : 'Current image'}
                      </div>
                    )}
                  </div>
                  {selectedCertificate && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(selectedCertificate)}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                  {!selectedCertificate && editingCertificate?.fileData && (
                    <div className="mt-2">
                      <img
                        src={editingCertificate.fileData}
                        alt="Current"
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCertificateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCertificateSubmit}>
                  {editingCertificate ? 'Update' : 'Create'} Certificate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 