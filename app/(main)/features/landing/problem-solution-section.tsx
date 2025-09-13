"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  FileText,
  Search,
  Calendar,
  Download,
  FolderOpen,
  Zap,
  CheckCircle,
  Target,
  Sparkles,
  BarChart3,
  Shield,
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  })

  // Transform scroll progress to lightning line height (0 to 100%)
  const lightningHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const problems = [
    { icon: Clock, text: "Spend 3-5 hours manually solving each assignment" },
    { icon: FileText, text: "Struggle with proper formatting, headers, and cover pages" },
    { icon: Search, text: "Research and write content from scratch every time" },
    { icon: Calendar, text: "Miss deadlines due to overwhelming workload" },
    { icon: FolderOpen, text: "Hunt through Google Classroom to find assignment details" },
    { icon: Download, text: "Download and organize materials from multiple courses" },
  ]

  const solutions = [
    { icon: Zap, text: "AI solves assignments automatically in minutes" },
    { icon: CheckCircle, text: "Perfect formatting with roll number, subject, cover page included" },
    { icon: Target, text: "Complete, well-researched content ready for submission" },
    { icon: Sparkles, text: "Never miss a deadline with smart deadline tracking" },
    { icon: BarChart3, text: "Unified dashboard shows all assignments across courses" },
    { icon: Shield, text: "One-click download all materials you need" },
  ]

  return (
    <section ref={sectionRef} id="problem-solution" className="py-24 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
            From Assignment Nightmare to Academic Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how GCR PRO transforms your academic workflow from stress to success
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start relative">
          {/* Problem Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left mb-8">
              <Badge variant="destructive" className="mb-4 px-4 py-2">
                The Assignment Nightmare
              </Badge>
              <h3 className="text-2xl font-bold text-destructive mb-4">The Struggle is Real</h3>
            </div>

            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-4 border-destructive/30 bg-destructive/10 hover:bg-destructive/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/30 flex items-center justify-center">
                        <problem.icon className="w-5 h-5 text-destructive" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{problem.text}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="hidden lg:block absolute left-1/2 top-32 bottom-32 w-1 -translate-x-1/2 z-10">
            {/* Background line */}
            <div className="w-full h-full bg-gradient-to-b from-destructive/20 via-primary/20 to-secondary/20 rounded-full" />

            {/* Animated lightning line that grows with scroll */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-destructive via-primary to-secondary rounded-full origin-top"
              style={{ height: lightningHeight }}
            />

            {/* Zap icon at the bottom that appears when line is fully grown */}
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: scrollYProgress.get() > 0.8 ? 1 : 0,
                opacity: scrollYProgress.get() > 0.8 ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="w-6 h-6 text-secondary-foreground" />
            </motion.div>

            {/* Glowing effect */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-b from-destructive via-primary to-secondary rounded-full blur-sm opacity-60"
              style={{ height: lightningHeight }}
            />
          </div>

          {/* Solution Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left mb-8">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                The GCR PRO Magic
              </Badge>
              <h3 className="text-2xl font-bold text-secondary mb-4">Academic Success Unlocked</h3>
            </div>

            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-4 border-secondary/30 bg-secondary/10 hover:bg-secondary/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center">
                        <solution.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{solution.text}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
