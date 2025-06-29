"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Building, Leaf, Zap, MapPin, TreePine, Users, FileText, Download } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  pdfFile: string
  pdfUrl?: string // New cloud storage URL
  category: string
  location?: string
  year?: string
  status: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Urban & Environmental Projects": <MapPin className="w-4 h-4 text-primary" />,
  "Environmental & Compliance Experience": <TreePine className="w-4 h-4 text-primary" />,
  "Community & Volunteer Leadership": <Users className="w-4 h-4 text-primary" />
}

const categories = ["All", "Urban & Environmental Projects", "Environmental & Compliance Experience", "Community & Volunteer Leadership"]

// Overlapping positions for 5 cards (desktop, right-aligned vertical cascade with spacing and horizontal offset)
const overlapStyles = [
  "z-50 right-0 top-0 w-80 h-64",
  "z-40 right-8 top-32 w-80 h-64",
  "z-30 right-16 top-64 w-80 h-64",
  "z-20 right-24 top-[18rem] w-80 h-64",
  "z-10 right-32 top-[25rem] w-80 h-64",
]

function ProjectCard({ project, style, index }: { project: Project; style: string; index: number }) {
  const handlePdfDownload = () => {
    // Use new cloud URL if available, fallback to old base64 data
    const pdfUrl = project.pdfUrl || project.pdfFile
    if (pdfUrl) {
      try {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        link.target = '_blank' // Open in new tab as fallback
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log(`📄 Downloaded project: ${project.title}`)
      } catch (error) {
        console.error('❌ Error downloading project:', error)
        // Fallback: try opening in new window
        window.open(pdfUrl, '_blank')
      }
    } else {
      console.warn('⚠️ No PDF file available for project:', project.title)
    }
  }

  return (
    <motion.div
      className={`absolute ${style} rounded-2xl shadow-xl bg-card border border-border overflow-hidden group transition-all duration-500 cursor-pointer`}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.7, type: "spring" }}
      title={project.title}
      onClick={handlePdfDownload}
    >
      <div className="relative w-full h-full">
        {(project.pdfUrl || project.pdfFile) ? (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <FileText className="w-20 h-20 text-white mb-4" />
            <div className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              PDF
            </div>
            <Download className="w-6 h-6 text-white/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            {categoryIcons[project.category]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Project info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{project.title}</h3>
          {project.location && (
            <p className="text-white/80 text-xs">{project.location}</p>
          )}
        </div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 dark:bg-card/60 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30 shadow">
          {categoryIcons[project.category]}
          <span className="text-xs font-medium text-foreground/90 dark:text-foreground/80">{project.category}</span>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium text-primary-foreground">{project.status}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeFilter, setActiveFilter] = useState("All")

  // Load projects from Supabase only
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })

        if (projectsError) {
          console.error('❌ Projects: Error loading from Supabase:', projectsError)
          return
        }

        const transformedProjects = projectsData.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          pdfFile: project.pdf_url,
          pdfUrl: project.pdf_url,
          category: project.category,
          location: project.location || '',
          year: project.year || '',
          status: project.status
        }))
        setProjects(transformedProjects)
        console.log('✅ Projects: Projects loaded from Supabase:', transformedProjects.length)
      } catch (error) {
        console.error('❌ Projects: Error loading projects:', error)
      }
    }

    loadProjects()

    // Listen for project updates from admin
    const handleProjectsUpdate = () => {
      console.log('📢 Projects: Received projectsUpdated event, reloading from Supabase')
      loadProjects()
    }

    window.addEventListener('projectsUpdated', handleProjectsUpdate)

    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate)
    }
  }, [])

  const filteredProjects =
    activeFilter === "All" ? projects : projects.filter((project: Project) => project.category === activeFilter)

  // Group projects by category for better organization
  const projectsByCategory = {
    "Urban & Environmental Projects": projects.filter(p => p.category === "Urban & Environmental Projects"),
    "Environmental & Compliance Experience": projects.filter(p => p.category === "Environmental & Compliance Experience"),
    "Community & Volunteer Leadership": projects.filter(p => p.category === "Community & Volunteer Leadership")
  }

  return (
    <section className="projects-section-bg" id="projects">
      <div className="section-padding relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="section-title mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Featured Projects
          </motion.h2>
          <motion.p
            className="text-lg text-foreground/70 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore my comprehensive portfolio of urban and environmental planning projects, organized by specialization areas. Each PDF document contains detailed project analysis, methodologies, and outcomes.
          </motion.p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                onClick={() => setActiveFilter(category)}
                className={
                  activeFilter === category
                    ? "btn-primary"
                    : "btn-secondary"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Display */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Projects will appear here once they are added through the admin dashboard.
            </p>
          </div>
        ) : activeFilter === "All" ? (
          // Show all categories organized
          <div className="space-y-16">
            {Object.entries(projectsByCategory).map(([categoryName, categoryProjects]) => (
              categoryProjects.length > 0 && (
                <motion.div
                  key={categoryName}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    {categoryIcons[categoryName]}
                    <h3 className="text-2xl font-bold text-foreground">{categoryName}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => {
                          if (project.pdfFile) {
                            const link = document.createElement('a')
                            link.href = project.pdfFile
                            link.download = `${project.title}.pdf`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }
                        }}
                      >
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <FileText className="w-16 h-16 text-white mb-3" />
                            <div className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                              PDF
                            </div>
                            <Download className="w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{project.location}</span>
                              <span>{project.year}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects in This Category</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No projects found for the selected category. Try selecting a different category or add new projects through the admin dashboard.
            </p>
          </div>
        ) : (
          // Show filtered projects
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  if (project.pdfFile) {
                    const link = document.createElement('a')
                    link.href = project.pdfFile
                    link.download = `${project.title}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
              >
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <FileText className="w-16 h-16 text-white mb-3" />
                    <div className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                      PDF
                    </div>
                    <Download className="w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{project.location}</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
