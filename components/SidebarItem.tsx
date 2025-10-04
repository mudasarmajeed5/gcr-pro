import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  label: string
  isActive: boolean
}

export default function SidebarItem({
  href,
  icon: Icon,
  label,
  isActive,
}: SidebarItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 my-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        />
        <span>{label}</span>
      </div>
    </Link>
  )
}
    