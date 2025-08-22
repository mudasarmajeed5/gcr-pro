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
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>GCR <span className="text-secondary-foreground/70">Pro</span></span>
        </Link>

        {/* Center: Search */}
        <GlobalSearch />
        {/* Right: Profile */}
        <div className="flex items-center gap-2">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-200/50 dark:bg-gray-200/10 border border-gray-500 px-4 py-1.5 rounded-full hover:text-foreground transition-colors"
            href="https://github.com/mudasarmajeed5/au-gcr"
          >
            <FaGithub className="size-5" />
            {stars !== null && (
              <div className="flex items-center gap-1 text-sm">
                <FaStar className="size-3" />
                <span>{stars}</span>
              </div>
            )}
          </Link>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full p-0">
                <Avatar className="size-9">
                  <AvatarImage src={session?.user?.image ?? ""} alt="Profile" />
                  <AvatarFallback>
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                {session?.user?.name ?? "Guest"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Logout */}
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
    </header>
  )
}
