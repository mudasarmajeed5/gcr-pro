import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
    href: string
    icon: LucideIcon
    label: string
    isActive: boolean
}

export default function SidebarItem({ href, icon: Icon, label, isActive }: SidebarItemProps) {
    return (
        <Link href={href}>
            <div
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100",
                    isActive 
                        ? "bg-blue-50 text-blue-700 border-blue-700" 
                        : "text-muted-foreground"
                )}
            >
                <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-700" : "text-gray-500"
                )} />
                <span>{label}</span>
            </div>
        </Link>
    )
}