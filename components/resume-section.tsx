"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Calendar, FileCheck } from "lucide-react"

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

export default function ResumeSection() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        
        // Load resume from Supabase
        const { data: resumeData, error: resumeError } = await supabase
          .from('resume')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(1)

        if (resumeError) {
          console.error('❌ Error loading resume from Supabase:', resumeError)
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
        console.error('❌ Error loading data from Supabase:', error)
      }
    }

    loadData()

    // Listen for updates from admin
    const handleResumeUpdate = () => {
      console.log('📢 Resume: Received resumeUpdated event, reloading from Supabase')
      loadData()
    }
    const handleCertificatesUpdate = () => {
      console.log('📢 Certificates: Received certificatesUpdated event, reloading from Supabase')
      loadData()
    }

    window.addEventListener('resumeUpdated', handleResumeUpdate)
    window.addEventListener('certificatesUpdated', handleCertificatesUpdate)
    
    return () => {
      window.removeEventListener('resumeUpdated', handleResumeUpdate)
      window.removeEventListener('certificatesUpdated', handleCertificatesUpdate)
    }
  }, [])

  const handleResumeDownload = () => {
    if (resume) {
      try {
        const downloadUrl = resume.fileUrl || resume.fileData || ''
        if (downloadUrl) {
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = resume.fileName
          link.target = '_blank' // Open in new tab as fallback
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          console.log(`📄 Downloaded resume: ${resume.fileName}`)
        } else {
          console.warn('⚠️ No resume file URL available')
        }
      } catch (error) {
        console.error('❌ Error downloading resume:', error)
        // Fallback: try opening in new window if URL exists
        const downloadUrl = resume.fileUrl || resume.fileData || ''
        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
        }
      }
    }
  }

  const handleCertificateDownload = (certificate: Certificate) => {
    try {
      const downloadUrl = certificate.fileUrl || certificate.fileData || ''
      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = certificate.fileName
        link.target = '_blank' // Open in new tab as fallback
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log(`🏆 Downloaded certificate: ${certificate.fileName}`)
      } else {
        console.warn('⚠️ No certificate file URL available for:', certificate.title)
      }
    } catch (error) {
      console.error('❌ Error downloading certificate:', error)
      // Fallback: try opening in new window if URL exists
      const downloadUrl = certificate.fileUrl || certificate.fileData || ''
      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Don't show section if no resume and no certificates
  if (!resume && certificates.length === 0) {
    return null
  }

  return (
    <section id="credentials" className="py-20 bg-gradient-to-b from-background/50 to-background">
      <div className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
            Credentials & Qualifications
          </h2>
          <p className="text-xl text-foreground/70 dark:text-foreground/60 max-w-3xl mx-auto">
            Professional resume and certified achievements showcasing expertise and qualifications in environmental planning and urban development.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume Section */}
            {resume && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
                  <CardHeader className="text-center pb-8">
                    <motion.div
                      className="mx-auto mb-6 relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Large PDF Icon */}
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FileText className="w-16 h-16 text-white relative z-10" />
                      </div>
                      {/* Adobe PDF Label */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        PDF
                      </div>
                    </motion.div>
                    
                    <CardTitle className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      Professional Resume
                    </CardTitle>
                    <CardDescription className="text-lg text-foreground/70">
                      Complete professional background and qualifications
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pt-0">
                    {/* File Details */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-primary" />
                          <span className="font-medium">{resume.fileName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatFileSize(resume.fileSize)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Last updated: {new Date(resume.uploadDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button 
                        onClick={handleResumeDownload}
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-white font-semibold py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-6 h-6 mr-3" />
                        Download Resume
                        <motion.div
                          className="ml-3"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </Button>
                    </motion.div>

                    <p className="text-center text-sm text-muted-foreground">
                      Opens in your default PDF viewer • Safe and secure download
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-center">
                    Professional Certificates
                  </h3>
                  <p className="text-center text-muted-foreground">
                    Industry-recognized certifications and achievements
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate, index) => (
                    <motion.div
                      key={certificate.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="group hover:shadow-xl transition-all duration-300 border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 backdrop-blur-sm">
                        <CardHeader className="text-center pb-4">
                          <motion.div
                            className="mx-auto mb-4 relative"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {/* PDF Certificate Icon */}
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <FileText className="w-10 h-10 text-white relative z-10" />
                            </div>
                            {/* PDF Label */}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                              PDF
                            </div>
                          </motion.div>
                          
                          <CardTitle className="text-sm font-bold mb-1 group-hover:text-amber-600 transition-colors duration-300 line-clamp-2">
                            {certificate.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            {certificate.issuer}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 pt-0">
                          {/* Certificate Details */}
                          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Issued:</span>
                              <span className="font-medium">{certificate.dateIssued}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Size:</span>
                              <span className="font-medium">{formatFileSize(certificate.fileSize)}</span>
                            </div>
                          </div>

                          {/* Download Button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full"
                          >
                            <Button 
                              onClick={() => handleCertificateDownload(certificate)}
                              size="sm"
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium text-xs transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              <Download className="w-3 h-3 mr-2" />
                              Download
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 