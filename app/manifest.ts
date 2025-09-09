import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "GCR PRO",
        short_name: "GCR",
        description: "Enhance your Google Classroom experience. Sign in with your student email for smarter, easier access.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        screenshots: [
            {
                src: "/screenshot-mobile.png",
                sizes: "390x844",
                type: "image/png",
                form_factor: "narrow"
            },
            {
                src: "/screenshot-desktop.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide"
            }
        ],
        icons: [
            // Small sizes - for taskbar, search, favicon (hat only)
            {
                src: '/icon-hat-16.png',
                sizes: '16x16',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-hat-48.png',
                sizes: '48x48',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-hat-32.png',
                sizes: '32x32',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-hat-96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
            },
            // Large sizes - for app launcher, desktop shortcuts (hat only)
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
        ],
    }
}