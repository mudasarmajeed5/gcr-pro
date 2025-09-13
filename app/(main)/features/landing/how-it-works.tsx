"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Brain, FileText, Download, BookOpen, Users } from "lucide-react"
import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Assignment",
      description: "Simply upload your assignment from Google Classroom or paste the requirements",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI Analyzes & Solves",
      description: "Our advanced AI processes the requirements and generates comprehensive solutions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FileText,
      title: "Perfect Formatting",
      description: "Automatic formatting with proper headers, cover pages, and academic standards",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Download,
      title: "Submit & Share",
      description: "Get your perfectly formatted assignment ready for submission and sharing",
      color: "from-green-500 to-emerald-500",
    },
  ]

  const quizSteps = [
    {
      icon: BookOpen,
      title: "Generate Quiz",
      description: "Create quizzes from your course materials with one click",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Brain,
      title: "Solve & Get Marks",
      description: "AI helps you solve quizzes and provides instant feedback with marks",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Share with Others",
      description: "Other students can access and solve your generated quizzes too",
      color: "from-teal-500 to-cyan-500",
    },
  ]

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">How GCR PRO Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From assignment upload to perfect submission, plus quiz generation and sharing
          </p>
        </motion.div>

        {/* Assignment Workflow */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">Assignment Nightmare → GCR PRO Magic</h3>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full transform -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <Card className="mb-4 group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                    <CardContent className="p-6">
                      <motion.div
                        className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className="w-6 h-6 text-white" />
                      </motion.div>

                      <Badge variant="secondary" className="mb-2 text-xs">
                        Step {index + 1}
                      </Badge>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Generation Workflow */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 text-secondary">Quiz Generation & Sharing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
