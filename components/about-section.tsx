"use client"

import { motion } from "framer-motion"
import Globe3D from "@/components/globe-3d"
import { MapPin, Target, Lightbulb } from "lucide-react"

export default function AboutSection() {


  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Modern subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)
          `,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="section-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About Me
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Passionate about creating sustainable, livable communities through innovative urban planning and environmental stewardship
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left - Professional Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">My Mission</h3>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                As an Urban and Environmental Planner with over 3 years of experience, I'm dedicated to creating 
                sustainable, livable communities that balance human needs with environmental stewardship.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                I specialize in climate-adaptive planning and smart city technologies, believing in harnessing 
                innovation to solve complex urban challenges. From transit-oriented developments to green 
                infrastructure networks, I create comprehensive solutions that enhance quality of life.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <MapPin className="w-5 h-5" />
                <span>Based in Brisbane, QLD, Australia</span>
              </div>
            </div>

            {/* Professional Philosophy */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">My Approach</h3>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                I work collaboratively with communities, governments, and organizations across Australia to 
                transform urban landscapes into thriving, sustainable ecosystems for future generations. 
                Every project is an opportunity to create positive, lasting impact.
              </p>
            </div>
          </motion.div>

          {/* Right - 3D Globe */}
          <motion.div
            className="flex justify-center lg:justify-end items-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-full max-w-lg relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-green-500/20 to-green-600/20 rounded-full blur-xl opacity-70"></div>
              <Globe3D />
            </div>
          </motion.div>
        </div>




      </div>
    </section>
  )
}
