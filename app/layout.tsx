import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { cookies } from 'next/headers'
import { THEMES, ThemeId } from '@/constants/themes'
import { Poppins } from "next/font/google"
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GCR PRO, AI Assignment Solver & Quiz Generator",
  description:
    "GCR PRO, specially built for Air University students, helps students solve assignments instantly and generate quizzes with AI. Study smarter and save time.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "GCR PRO, Smarter Learning with AI",
    description:
      "GCR PRO, specially built for Air University students, is an AI-powered assignment solver and quiz generator that works with Google Classroom.",
    url: "https://gcrpro.app",
    siteName: "GCR PRO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GCR PRO, AI Assignment Solver & Quiz Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GCR PRO, AI Assignment Solver & Quiz Generator",
    description:
      "GCR PRO, specially built for Air University students, lets you save time, solve assignments, and generate quizzes with AI.",
    images: ["/og-image.png"],
  },
};



export const viewport: Viewport = { 
  maximumScale: 1,
  userScalable: false
}


const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Determine themeId from cookie on the server so we can inline variables into the initial HTML
  const cookieStore = await cookies()
  const cookieTheme = cookieStore.get('themeId')?.value || 'neutral'
  const id = (cookieTheme in THEMES ? (cookieTheme as ThemeId) : ('neutral' as ThemeId))
  const theme = THEMES[id]
  const lightVars = theme.variables || {}
  const darkVars = theme.darkVariables || {}

  const inlineScript = `(() => {
    try {
      const light = ${JSON.stringify(lightVars)};
      const dark = ${JSON.stringify(darkVars)};
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const vars = prefersDark ? dark : light;
      const root = document.documentElement;
      for (const k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          root.style.setProperty(k, vars[k]);
        }
      }
    } catch (e) { /* no-op */ }
  })();`

  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GCR Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Inline script to apply saved theme variables immediately (prevents flash) */}
        <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
        <link rel="canonical" href="https://gcrpro.app" />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <div className="h-full">
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}