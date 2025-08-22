"use client"
import { usePathname } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import SidebarItem from './SidebarItem'
import { sidebarItems } from '@/constants/side-bar-items'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const isDashboardActive = pathname === "/"
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
                {sidebarItems.map((item) => {
                    const isActive = item.href === "/" ? isDashboardActive : pathname.startsWith(item.href)
                    return <SidebarItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive}

                    />
                }
                )}
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