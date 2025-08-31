"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, LogOut } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import GlobalSearch from "./GlobalSearch"
import { FaGithub, FaStar } from "react-icons/fa"
import { useEffect, useState } from "react"

// ✅ import the shadcn theme switcher

export default function Header() {
  const { data: session } = useSession()
  const [stars, setStars] = useState(null);
  const repoUrl = "mudasarmajeed5/au-gcr";

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repoUrl}`)
      .then(res => res.json())
      .then(data => setStars(data.stargazers_count))
      .catch(err => console.error('Failed to fetch stars:', err));
  }, []);
  return (
    <header className="w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex relative items-center gap-2 text-sm sm:text-base md:text-lg font-bold tracking-tight"
        >
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span>
            GCR{" "}
            <span className="relative text-secondary-foreground/70">Pro</span>
            <span className="text-[9px] sm:text-[10px] font-medium absolute -right-7 bottom-0">
              v1.0.0
            </span>
          </span>
        </Link>

        {/* Center: Search (hide on very small screens) */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <GlobalSearch />
        </div>

        {/* Right: Profile & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-2 bg-gray-200/50 dark:bg-gray-200/10 border border-gray-500 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full hover:text-foreground transition-colors text-xs sm:text-sm"
            href="https://github.com/mudasarmajeed5/au-gcr"
          >
            <FaGithub className="size-4 sm:size-5" />
            {stars !== null && (
              <div className="flex items-center gap-1">
                <FaStar className="size-3" />
                <span>{stars}</span>
              </div>
            )}
          </Link>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full p-0">
                <Avatar className="size-8 sm:size-9">
                  <AvatarImage src={session?.user?.image ?? ""} alt="Profile" />
                  <AvatarFallback>
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 sm:w-48">
              <DropdownMenuItem disabled>
                {session?.user?.name ?? "Guest"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="flex items-center gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile-only Search below header */}
      <div className="px-4 py-2 md:hidden">
        <GlobalSearch />
      </div>
    </header>

  )
}
