"use client"

import { Button } from "@/components/ui/button"
import { Star, Zap, Brain } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 gradient-shift" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-secondary/10 rounded-lg blur-xl rotate-45"
          animate={{ y: [0, 15, 0], rotate: [45, 60, 45] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-accent/10 rounded-full blur-xl"
          animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Enchanced GCR, AI Assignment Solver & <span className="text-primary font-bold">Academic Assistant</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Better than Google Classroom. AI Assignment solver and Academic assistant that automatically solves,
            formats, and manages your entire academic workflow.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 glow-animation px-8 py-6 text-lg font-semibold text-white"
            >
              <Zap className="w-5 h-5 mr-2" />
              Solve My Assignments
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold hover:bg-primary/5 transition-all duration-300 bg-transparent border-primary text-primary hover:text-primary"
            >
              <Star className="size-5 mr-2" /> Star on GitHub
            </Button>
          </motion.div>

          {/* Hero visual placeholder */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="glass rounded-2xl p-8 border-2 border-primary/20">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">3D Assignment Solving Mockup</h3>
                  <p className="text-muted-foreground">
                    Interactive demo showing AI automatically solving and formatting assignments
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
