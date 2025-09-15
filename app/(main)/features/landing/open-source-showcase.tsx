"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Star, GitFork, Users, Code } from "lucide-react"
import { motion } from "framer-motion"
import useGetRepository from "./hooks/use-get-repository"

// Language color mapping (GitHub's official colors)
const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#fa7343',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#800080',
    'Vue': '#41b883',
    'React': '#61dafb',
    'Shell': '#89e051',
    'Dockerfile': '#384d54'
  };
  
  return colors[language] || '#8cc8c8';
}

interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  lines: number;
}

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

        <div className="grid lg:grid-cols-2 gap-8 items-start">
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
                {repoLoading && <div className="text-center py-4">Loading repository stats...</div>}
                
                {/* Basic Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{repoData?.stars ? repoData.stars : "..."}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <GitFork className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-lg">{repoData?.forks ? repoData.forks : "..."}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Forks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-lg">{repoData?.contributors ? repoData.contributors : "..."}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                </div>

                {/* Language Stats */}
                {repoData?.languages && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Stats for nerds: {repoData.languages.totalLines.toLocaleString()} lines (approx.), {repoData.languages.totalBytes.toLocaleString()} bytes
                    </h4>
                    <div className="space-y-3">
                      {repoData.languages.languages.slice(0, 5).map((lang: LanguageStat) => (
                        <div key={lang.language} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{lang.language}</span>
                            <span className="text-muted-foreground">
                              {lang.percentage}% • {lang.lines.toLocaleString()} lines
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: getLanguageColor(lang.language) }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${lang.percentage}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              viewport={{ once: true }}
                            />
                          </div>
                        </div>
                      ))}
                      {repoData.languages.languages.length > 5 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{repoData.languages.languages.length - 5} more languages
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                  <div className="text-green-600 mb-2">// AI Assignment Solver Core</div>
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