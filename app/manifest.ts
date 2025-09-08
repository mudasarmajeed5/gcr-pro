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
            {
                src: '/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}