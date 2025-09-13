"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Clock } from "lucide-react"
import { motion } from "framer-motion"

export function SuccessMetrics() {
  const metrics = [
    {
      icon: BookOpen,
      value: "50+",
      label: "Assignments Solved",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      value: "25+",
      label: "Students Helped",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Assignment Success Rate",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      value: "500+",
      label: "Hours Saved",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section id="metrics" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Real Impact, Real Results</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how GCR PRO is already transforming academic experiences for students
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="text-center group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                <CardContent className="p-6">
                  <motion.div
                    className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${metric.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <motion.h3
                    className="text-3xl font-bold mb-2 text-primary"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    {metric.value}
                  </motion.h3>

                  <p className="text-muted-foreground font-medium text-sm">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
