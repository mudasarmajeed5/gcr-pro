"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

export function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(Math.min(progress, 100))

      const sections = ["hero", "problem-solution", "features", "how-it-works", "metrics", "github", "cta"]
      const sectionElements = sections.map((id) => document.getElementById(id)).filter(Boolean)

      let currentSection = 0
      sectionElements.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = index
          }
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const sectionColors = [
    "from-blue-500 to-blue-600", // hero
    "from-red-500 to-orange-500", // problem-solution
    "from-green-500 to-emerald-500", // features
    "from-purple-500 to-violet-500", // how-it-works
    "from-yellow-500 to-amber-500", // metrics
    "from-indigo-500 to-blue-500", // github
    "from-pink-500 to-rose-500", // cta
  ]

  return (
    <>
      <div className="fixed top-0 left-0 w-1 h-full bg-muted/10 z-40">
        <div
          className={`w-full bg-gradient-to-b ${sectionColors[activeSection]} transition-all duration-500 ease-out shadow-lg`}
          style={{
            height: `${scrollProgress}%`,
            boxShadow: `0 0 10px ${activeSection === 0 ? "#3b82f6" : activeSection === 1 ? "#ef4444" : activeSection === 2 ? "#10b981" : activeSection === 3 ? "#8b5cf6" : activeSection === 4 ? "#f59e0b" : activeSection === 5 ? "#6366f1" : "#ec4899"}40`,
          }}
        />
      </div>

      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-full p-2 shadow-lg">
          <div className="space-y-1">
            {sectionColors.map((color, index) => (
              <div
                key={index}
                className={`w-3 h-6 rounded-full transition-all duration-300 border ${activeSection === index
                    ? `bg-gradient-to-b ${color} shadow-lg border-white/20`
                    : "bg-muted/50 border-muted/30 hover:bg-muted/70"
                  }`}
                style={{
                  boxShadow:
                    activeSection === index
                      ? `0 0 12px ${index === 0 ? "#3b82f6" : index === 1 ? "#ef4444" : index === 2 ? "#10b981" : index === 3 ? "#8b5cf6" : index === 4 ? "#f59e0b" : index === 5 ? "#6366f1" : "#ec4899"}80, inset 0 1px 0 rgba(255,255,255,0.2)`
                      : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <header
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 w-11/12 md:w-auto ${isScrolled ? "glass rounded-full px-6 py-3" : "bg-transparent px-6 py-4"
          }`}
      >
        <nav className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center glow-animation">
              <span className="text-white font-bold text-sm">
                <GraduationCap />
              </span>
            </div>
            <span className="font-bold text-xl text-primary">GCR PRO</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#demo" className="text-sm font-medium hover:text-primary transition-colors">
              Demo
            </a>
            <a href="#github" className="text-sm font-medium hover:text-primary transition-colors">
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button
              size="sm"
              onClick={() => router.push("/sign-in")}
              className="bg-gradient-to-r cursor-pointer from-primary to-secondary hover:opacity-90 transition-opacity text-white font-medium"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>
    </>
  )
}
