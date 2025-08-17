"use client"
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-4 mt-12">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
        
        {/* Theme Switch */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Switch Theme</span>
        </div>

        {/* GitHub Follow */}
        <Link
          href="https://github.com/mudasarmajee5"
          target="_blank"
          rel="noopener noreferrer" // ✅ security best practice
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaGithub className="w-4 h-4" />
          Follow Creator on GitHub
        </Link>
      </div>
    </footer>
  )
}
