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
                    "flex items-center gap-3 px-3 my-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                        ? "bg-blue-100/70 dark:bg-blue-100/20 text-blue-600 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                )}
            >
                <Icon
                    className={cn(
                        "h-5 w-5",
                        isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-500"
                    )}
                />
                <span>{label}</span>
            </div>


        </Link>
    )
}