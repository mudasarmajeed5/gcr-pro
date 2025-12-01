import {
    BookOpenIcon,
    Home,
    GraduationCap,
    MailIcon,
    SettingsIcon,
    Sparkle,
    BrainCircuit
} from 'lucide-react'
export const sidebarItems = [   
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
        href: '/send-email',
        icon: MailIcon,
        label: 'Send Email'
    },
    {
        href: '/gcr-ai',
        icon: BrainCircuit,
        label: 'GCR AI'
    },
    {
        href: '/settings',
        icon: SettingsIcon,
        label: 'Preferences'
    },
    {
        href: "/get-started",
        icon: Sparkle,
        label: "Get started"
    }
]