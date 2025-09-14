"use client"

import { Button } from "@/components/ui/button"
import { Star, Zap, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();
  
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32">
      {/* Enhanced animated background with gradient shifts */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-blue-500/5 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/5 via-transparent to-purple-500/5 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Multiple layers of floating geometric shapes - MORE VISIBLE */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1: Large floating circles - Increased opacity and reduced blur */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-violet-400/40 to-purple-600/40 rounded-full blur-xl"
          animate={{ 
            y: [0, -30, 0], 
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-32 w-32 h-32 bg-gradient-to-br from-cyan-400/45 to-blue-600/45 rounded-full blur-lg"
          animate={{ 
            y: [0, 25, 0], 
            x: [0, -15, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-48 h-48 bg-gradient-to-br from-pink-400/35 to-rose-600/35 rounded-full blur-xl"
          animate={{ 
            y: [0, -35, 0], 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Layer 2: Medium geometric shapes - More visible */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400/40 to-green-600/40 rounded-lg blur-lg"
          animate={{ 
            y: [0, 20, 0], 
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-20 w-28 h-28 bg-gradient-to-br from-orange-400/40 to-red-600/40 rounded-xl blur-md"
          animate={{ 
            y: [0, -20, 0], 
            x: [0, 15, 0],
            rotate: [45, 135, 225, 315, 45]
          }}
          transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Layer 3: Small floating elements - More visible */}
        <motion.div
          className="absolute top-60 left-1/2 w-16 h-16 bg-gradient-to-br from-indigo-400/50 to-purple-600/50 rounded-full blur-md"
          animate={{ 
            y: [0, -15, 0], 
            x: [0, -10, 0],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-60 left-20 w-20 h-20 bg-gradient-to-br from-teal-400/45 to-cyan-600/45 rounded-lg blur-md"
          animate={{ 
            y: [0, 18, 0], 
            rotate: [0, 45, 90, 45, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Layer 4: Tiny sparkle-like elements - More visible */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full blur-sm ${
              i % 4 === 0 ? 'bg-yellow-400/60' :
              i % 4 === 1 ? 'bg-pink-400/60' :
              i % 4 === 2 ? 'bg-blue-400/60' : 'bg-purple-400/60'
            }`}
            style={{
              top: `${20 + (i * 10)}%`,
              left: `${15 + (i * 8)}%`
            }}
            animate={{ 
              y: [0, -10, 0], 
              opacity: [0.4, 1, 0.4],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 3 + (i * 0.5), 
              repeat: Number.POSITIVE_INFINITY, 
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}

       
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Main title with better balanced text sizing and line distribution */}
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance leading-tight max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <motion.span>
              Enhanced GCR, AI Assignment
            </motion.span>
            <br />
            <motion.span>
              Solver & Academic Assistant
            </motion.span>
          </motion.h1>

          {/* Subtitle with reduced spacing */}
          <motion.p
            className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Better than Google Classroom. AI Assignment solver and Academic assistant that automatically solves,
            formats, and manages your entire academic workflow.
          </motion.p>

          {/* CTAs with reduced top spacing */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/sign-in")}
              className="bg-gradient-to-r cursor-pointer from-primary to-secondary hover:opacity-90 transition-all duration-300 glow-animation px-8 py-6 text-lg font-semibold text-white"
            >
              <Zap className="w-5 h-5 mr-2" />
              Solve My Assignments
            </Button>
            <a href="https://github.com/mudasarmajeed5/gcr-pro" target="_blank">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold hover:bg-primary/5 transition-all duration-300 bg-transparent border-primary text-primary hover:text-primary"
              >
                <Star className="size-5 mr-2" /> Star on GitHub
              </Button>
            </a>
          </motion.div>

          {/* Hero visual placeholder with reduced spacing */}
          <motion.div
            className="mt-12 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="glass rounded-2xl p-6 border-2 border-primary/20">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">3D Assignment Solving Mockup</h3>
                  <p className="text-muted-foreground text-sm">
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