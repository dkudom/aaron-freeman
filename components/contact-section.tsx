"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Mail, Phone, MapPin as MapPinIcon, Send, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

const contactSectionBg = "py-20 relative overflow-hidden"

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Form data submitted:", values)
      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. I'll get back to you soon!",
        variant: "default",
      })
    form.reset()
    } catch (error) {
      console.error("Submission error:", error)
    toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
    })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section 
      id="contact" 
      className={`${contactSectionBg} bg-gradient-to-b from-background/70 to-background dark:from-gray-900/80 dark:to-black`}
    >
      {/* Themed Grid Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 cyber-grid"></div>
      </div>

      <div className="section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Themed Section Title */}
          <motion.h2
            className="section-title mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Get In Touch
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Contact Info & Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="custom-card p-8 space-y-6"
            >
              <p className="text-lg text-foreground/80 dark:text-foreground/70 leading-relaxed">
                  Have a project in mind or just want to say hello? Feel free to reach out! I'm always open to
                  discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>

              <div className="space-y-4">
                {[{
                  icon: <Mail className="h-5 w-5 lucide-icon" />,
                  title: "Email",
                  value: "aaronfreeman1957@gmail.com",
                  href: "mailto:aaronfreeman1957@gmail.com",
                }, {
                  icon: <Phone className="h-5 w-5 lucide-icon" />,
                  title: "Phone (Enquiries)",
                  value: "+61422317496",
                  href: "tel:+61422317496",
                }, {
                  icon: <MapPinIcon className="h-5 w-5 lucide-icon" />,
                  title: "Location",
                  value: "Brisbane, QLD, Australia",
                }].map((item, idx) => (
                  <motion.div
                    key={idx} 
                    className="flex items-center gap-4 group"
                    whileHover={{ scale: 1.02, x: 5 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground/90 dark:text-foreground/80">{item.title}</h3>
                      {item.href ? (
                      <a
                          href={item.href} 
                          className="text-foreground/70 dark:text-foreground/60 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                          {item.value}
                      </a>
                      ) : (
                        <p className="text-foreground/70 dark:text-foreground/60">{item.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                    </div>

              <div className="mt-6 h-48 bg-muted/50 dark:bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground">
                <p>Map Area / Image Placeholder</p>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="custom-card p-8"
            >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel className="block text-sm font-medium text-foreground/80 dark:text-foreground/70 mb-1">Full Name</FormLabel>
                          <FormControl>
                          <Input {...field} required className="w-full bg-background/50 dark:bg-background/20 border-border focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel className="block text-sm font-medium text-foreground/80 dark:text-foreground/70 mb-1">Email Address</FormLabel>
                          <FormControl>
                          <Input type="email" {...field} required className="w-full bg-background/50 dark:bg-background/20 border-border focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel className="block text-sm font-medium text-foreground/80 dark:text-foreground/70 mb-1">Subject</FormLabel>
                          <FormControl>
                          <Input {...field} required className="w-full bg-background/50 dark:bg-background/20 border-border focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel className="block text-sm font-medium text-foreground/80 dark:text-foreground/70 mb-1">Message</FormLabel>
                          <FormControl>
                          <Textarea {...field} rows={4} required className="w-full bg-background/50 dark:bg-background/20 border-border focus:ring-primary focus:border-primary min-h-[120px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div>
                    <Button type="submit" className="w-full btn-primary flex items-center justify-center gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="mr-2 h-4 w-4" /> Send Message</>
                      )}
                    </Button>
                  </div>
                  </form>
                </Form>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Toaster />
    </section>
  )
}
