"use client"
import { usePathname } from 'next/navigation'
import { GraduationCap, Home } from 'lucide-react'
import { useSession } from 'next-auth/react'
import SidebarItem from './SidebarItem'
import {
    BookOpenIcon,
    MessageSquareIcon,
    MailIcon,
    SettingsIcon,
} from 'lucide-react'

const sidebarItems = [
    {
        href: "/",
        icon: Home,
        label: "Dashboard"
    },
    {
        href: "/courses",
        icon: GraduationCap,
        label: "Courses"
    },
    {
        href: '/assignments',
        icon: BookOpenIcon,
        label: 'Assignments'
    },
    {
        href: '/messages',
        icon: MessageSquareIcon,
        label: 'Messages'
    },
    {
        href: '/send-email',
        icon: MailIcon,
        label: 'Send Email'
    },
    {
        href: '/settings',
        icon: SettingsIcon,
        label: 'Preferences'
    }
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const getCurrentSession = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        if (month >= 2 || month <= 9) {
            return `Spring ${year}`
        } else {
            return `Fall ${year}`
        }
    }

    const currentSession = getCurrentSession()

    return (
        <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t flex items-center gap-2 border-gray-200 mt-3">
                {/* Follow Creator Button */}
                <GraduationCap className='size-9' />
                {session?.user && (
                    <div className="text-sm space-y-1">
                        <div className="font-medium">
                            {session.user.name || 'Student'}
                            <div className="text-xs text-muted-foreground">
                                <span>Session: {currentSession}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}