"use client"

import { signIn, useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { ShieldCheck, LogIn, RefreshCw, LayoutDashboard, Home } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        await signIn("google", {
            redirectTo: "/"
        }).finally(() => setLoading(false));
    };

    const handleRedirect = () => {
        if (session) {
            router.push("/dashboard");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[600px]">
                {/* Notice Banner */}
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-t-2xl border border-border/50 border-b-0">
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p className="font-medium">📧 Only <span className="font-semibold">@students.au.edu.pk</span> emails can login</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Please provide necessary permissions to access app functionalities
                        </p>
                    </div>
                </div>

                <Card className="border border-border/50 shadow-2xl rounded-b-2xl rounded-t-none bg-card/95 backdrop-blur-sm">
                    {/* Header */}
                    <CardHeader className="text-center pt-4 pb-2 px-4">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <LogIn className="w-6 h-6 text-primary" />
                            <CardTitle className="text-2xl font-bold">
                                Welcome to <span className="text-primary">GCR PRO</span>
                            </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground text-base">
                            Enhance your Google Classroom experience with smarter, easier access.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-4 pb-4">
                        {/* Google Sign-In Button */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-6 text-base font-medium rounded-lg border border-gray-800 bg-gray-800 text-white hover:bg-gray-900 hover:border-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                        >
                            <FcGoogle className="w-5 h-5" />
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span>Signing in...</span>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                </div>
                            ) : (
                                "Sign in with Google"
                            )}
                        </button>

                        {/* Security Info */}
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-gray-700" />
                                <span>OAuth 2.0 Protected</span>
                            </div>
                            <div className="w-px h-4 bg-border/50"></div>
                            <span>Your data stays secure</span>
                        </div>
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="px-4 pb-4">
                        <button
                            onClick={handleRedirect}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium border rounded-md bg-gray-800/20 hover:bg-gray-800/40"
                        >
                            {session ? (
                                <>
                                    <LayoutDashboard className="w-4 h-4" />
                                    Go to Dashboard
                                </>
                            ) : (
                                <>
                                    <Home className="w-4 h-4" />
                                    Back to Home
                                </>
                            )}
                        </button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
