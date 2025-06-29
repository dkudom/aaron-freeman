import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ProjectsSection from "@/components/projects-section"
import ReflectionsSection from "@/components/reflections-section"
import ResumeSection from "@/components/resume-section"
import ContactSection from "@/components/contact-section"
import AdminDashboard from "@/components/admin-dashboard"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ReflectionsSection />
      <ResumeSection />
      <ContactSection />
      <AdminDashboard />
    </div>
  )
}
