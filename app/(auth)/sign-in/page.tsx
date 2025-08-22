"use client"

import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { ShieldCheck, LogIn } from "lucide-react"

export default function SignIn() {
    const handleLogin = async () => {
        await signIn("google", {
            redirectTo: "/"
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md rounded-3xl border border-border/20 shadow-lg">
                {/* Header */}
                <CardHeader className="text-center space-y-3 px-6 pt-8">
                    <CardTitle className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <LogIn className="w-7 h-7 text-primary" />
                        Welcome to <span className="text-primary">AU GCR</span>
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        A smarter, more accessible Google Classroom experience
                    </CardDescription>
                </CardHeader>

                {/* Content */}
                <CardContent className="flex flex-col items-center gap-6 px-6 pb-10">
                    {/* Modern Google Sign-In Button */}
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 text-lg font-semibold rounded-lg border border-gray-300 hover:border-primary hover:shadow-lg transition-all active:scale-95"
                    >
                        <FcGoogle className="w-6 h-6" aria-hidden />
                        Continue with Google
                    </button>


                    {/* Divider */}
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Secure Login</span>
                        </div>
                    </div>

                    {/* Security note */}
                    <p className="text-sm text-center flex flex-col gap-y-2 items-center text-muted-foreground leading-relaxed min-w-sm">
                        <span>
                            We use <span className="font-semibold">OAuth 2.0</span> for authentication.
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <ShieldCheck className="w-4 h-4 text-green-600" aria-hidden />
                            Your data stays safe.
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
