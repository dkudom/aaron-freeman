"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion, useAnimation, useMotionValue, useSpring } from "framer-motion"
import { ArrowDown, MapPin, Building, Leaf } from "lucide-react"
import Image from "next/image"

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const heroRef = useRef<HTMLElement>(null)
  const controls = useAnimation()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        mouseX.set(x * 15)
        mouseY.set(y * 15)
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects")
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden py-8 pt-16"
    >
      {/* Particle Background - Themed particle color */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p) => (
        <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
          style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
          }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.8, 0] }}
          transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay
          }}
        />
      ))}
      </div>

      <div className="section-padding z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-left"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
                Aaron Freeman
              </span>
            </motion.h1>

            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Building className="h-6 w-6 lucide-icon" />
              <span className="text-xl md:text-2xl text-foreground/80 dark:text-foreground/70 font-medium">
                Urban & Environmental Planner
              </span>
              <Leaf className="h-6 w-6 text-green-500 dark:text-green-400" />
            </motion.div>

            <motion.p
              className="text-lg md:text-xl mb-6 text-foreground/70 dark:text-foreground/60 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Designing sustainable cities of tomorrow through innovative urban planning and environmental solutions
            </motion.p>

            <motion.div
              className="flex items-center gap-2 mb-8 text-foreground/70 dark:text-foreground/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <MapPin className="h-5 w-5 lucide-icon" />
              <span className="text-lg">Brisbane, QLD, Australia</span>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <Button
                onClick={scrollToProjects}
                size="lg"
                className="btn-primary px-8 py-3 group"
              >
                <span className="relative z-10">Explore My Work</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="btn-secondary px-8 py-3"
              >
                <a href="#contact">Get In Touch</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Profile Image */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ x: springX, y: springY }}
          >
            <motion.div
              className="relative w-96 h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem]"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 via-green-600/50 to-green-800/50 dark:from-green-500/70 dark:via-green-600/70 dark:to-green-700/70 p-2 glow-effect">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-background">
                  <Image src="/images/aaron.jpg" alt="Aaron Freeman" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                </div>
              </div>

              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-2 rounded-full pulse-ring"
                  style={{ animationDelay: `${i * 0.7}s` }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="animate-bounce text-primary hover:text-primary/80 lucide-icon"
          >
            <ArrowDown />
            <span className="sr-only">Scroll down</span>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
