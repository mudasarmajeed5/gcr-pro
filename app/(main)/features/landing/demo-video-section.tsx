"use client"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Star, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export function DemoVideoSection() {
  return (
    <section id="demo" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">See GCR PRO in Action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Watch how our AI transforms complex assignments into perfectly formatted submissions in seconds
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Video placeholder */}
          <div className="relative aspect-video rounded-2xl overflow-hidden glass border-2 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300"
                >
                  <Play className="w-12 h-12 text-white ml-1" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Product Demo Video</h3>
                <p className="text-white/80 text-lg">Watch GCR PRO solve a complete assignment in under 30 seconds</p>
              </div>
            </div>
          </div>

          {/* Floating stats */}
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold glass">
              <Users className="w-4 h-4 mr-2" />
              2000+ Assignments Solved
            </Badge>
            <Badge variant="outline" className="px-6 py-3 text-sm font-semibold glass">
              <Star className="w-4 h-4 mr-2" />⭐ 1.2k GitHub Stars
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold glass">
              <TrendingUp className="w-4 h-4 mr-2" />
              95% Success Rate
            </Badge>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
