import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Poppins } from "next/font/google"
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GCR PRO",
  description:
    "GCR PRO is crafted by developer [Your Name], delivering a robust, modern web experience for professionals. Built with Next.js, TypeScript, and best practices for performance, accessibility, and PWA support.",
  icons: {
    icon: [{ url: "/favicon-196.png", sizes: "196x196", type: "image/png" }],
    apple: [{ url: "/apple-icon-180.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GCR Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <Toaster />
            <div className="h-full">
              {children}
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}