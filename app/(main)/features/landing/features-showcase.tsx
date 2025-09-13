"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, BarChart3, Mail, TrendingUp, Palette, Bell, Zap, Search, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

export function FeaturesShowcase() {
  const largeFeatures = [
    {
      icon: Brain,
      title: "AI Assignment Solver",
      description: "Advanced AI automatically analyzes and solves complex assignments with perfect accuracy",
      content: "Upload → AI Analyzes → Perfect Formatting → Submit",
      gradient: "from-primary to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Smart Dashboard",
      description: "Unified view of all assignments, grades, and deadlines across multiple courses",
      content: "Interactive Dashboard Preview",
      gradient: "from-secondary to-green-600",
    },
    {
      icon: BookOpen,
      title: "Quiz Generator & Solver",
      description: "Generate quizzes from course materials, solve them, get marks, and share with other students",
      content: "Generate → Solve → Share → Learn",
      gradient: "from-purple-500 to-pink-600",
    },
  ]

  const mediumFeatures = [
    {
      icon: Search,
      title: "Global Search Engine",
      description: "Search across all your courses, assignments, and materials instantly",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: Mail,
      title: "Professor Contact Hub",
      description: "Quick access to all instructor emails and communication tools",
      gradient: "from-teal-500 to-cyan-600",
    },
    {
      icon: TrendingUp,
      title: "Progress & Grade Tracker",
      description: "Visual charts showing your academic performance and improvement",
      gradient: "from-indigo-500 to-purple-600",
    },
  ]

  const smallFeatures = [
    {
      icon: Zap,
      title: "AI Email Writer",
      description: "Professional emails to professors",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: Bell,
      title: "Deadline Alerts",
      description: "Smart notification system",
      gradient: "from-red-500 to-pink-600",
    },
    {
      icon: Palette,
      title: "Beautiful Themes",
      description: "Dark/light mode switching",
      gradient: "from-gray-500 to-slate-600",
    },
  ]

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Everything You Need for Academic Success</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive tools designed to transform your academic workflow and boost your productivity
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Large Feature Cards */}
          {largeFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="h-full min-h-[320px] group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{feature.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Medium Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mediumFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full min-h-[180px] group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Small Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {smallFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
