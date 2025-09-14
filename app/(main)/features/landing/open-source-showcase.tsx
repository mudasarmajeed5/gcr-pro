"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Star, GitFork, Users, Code } from "lucide-react"
import { motion } from "framer-motion"
import useGetRepository from "./hooks/get-repository"

export function OpenSourceShowcase() {
  const { data: repoData, loading: repoLoading } = useGetRepository()
  return (
    <section id="github" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Open Source
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Built by Students, for Students</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            GCR PRO is completely open source. Join our community and help shape the future of education technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* GitHub Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">GCR PRO Repository</CardTitle>
                    <CardDescription>Open source academic companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {repoLoading && <div>Loading</div>}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{repoData?.stars ? repoData.stars : "Unavailable"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <GitFork className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-lg">{repoData?.forks ? repoData.forks : "Unavailable"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Forks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-lg">{repoData?.contributors ? repoData.contributors : "Unavailable"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                </div>
                <a href="https://github.com/mudasarmajeed5/gcr-pro">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>

          {/* Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">AI Algorithm Preview</CardTitle>
                    <CardDescription>See how the magic happens</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-600 mb-2">AI Assignment Solver Core</div>
                  <div className="text-blue-600">async function solveAssignment(</div>
                  <div className="ml-4 text-gray-600">assignment: AssignmentData</div>
                  <div className="text-blue-600">) {`{`}</div>
                  <div className="ml-4 text-gray-600">const solution = await aiEngine.analyze(assignment);</div>
                  <div className="ml-4 text-blue-600">return formatDocument(solution);</div>
                  <div className="text-blue-600">{`}`}</div>
                </div>

                <div className="mt-4 pt-4 border-t">

                  <a href="https://github.com/mudasarmajeed5/gcr-pro">
                    <Button variant="outline" className="w-full bg-transparent hover:text-accent">
                      <Code className="w-4 h-4 mr-2" />
                      Explore Full Codebase
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-6 text-center"
            >
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Any bugs? Create an Issue
              </h3>

              <a href="https://github.com/mudasarmajeed5/gcr-pro/issues/new" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="hover:bg-primary/5 bg-transparent hover:text-accent">
                  <Github className="w-5 h-5 mr-2" />
                  Create Issue
                </Button>
              </a>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
