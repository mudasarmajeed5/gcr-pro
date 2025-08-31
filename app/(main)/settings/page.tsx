"use client"
import { FormEvent, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ExternalLink, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { saveSettings } from '@/actions/save-settings'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { getSettings } from '@/actions/get-settings'
import { userStore } from '@/store/user-store'
import Link from 'next/link'
import UILoading from '@/components/UILoading'

const Preferences = () => {
  const { data: session, status } = useSession()
  const {
    showGradeCard,
    setShowGradeCard,
    smtpPassword,
    setSmtpPassword
  } = userStore()

  const [loading, setLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)

  // Fetch settings only if store is empty
  const initializeSettings = async () => {
    if (!session?.user) return

    if (!smtpPassword) {
      const result = await getSettings()
      if (result.success) {
        setSmtpPassword(result.message.smtpPassword)
        setShowGradeCard(result.message.showGradeCard)
      } else {
        setError(result.message)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    if (status === "authenticated") initializeSettings()
  }, [status])

  const handleSaveSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await saveSettings(formData)
    if (res.success) {
      toast.success(res.message)
      // update store with saved values
      setSmtpPassword(formData.get("smtpPassword") as string)
      setShowGradeCard(formData.get("showGradeCard") === "true")
    } else {
      toast.error(res.message)
    }
  }

  if (loading) return <UILoading/>

  return (
    <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground mt-2">Manage your application settings</p>
      </div>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Display Settings</CardTitle>
          <CardDescription>Customize what information is visible in your interface</CardDescription>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="showGradeCard" className="flex items-start flex-col gap-1">
              <span>Show Grade Card</span>
              <span className="text-sm text-muted-foreground">Display grade information on your dashboard</span>
            </Label>
            <Switch id="showGradeCard" name="showGradeCard" checked={showGradeCard} onCheckedChange={setShowGradeCard} />
            <input type="hidden" name="showGradeCard" value={showGradeCard ? "true" : "false"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>Set up your SMTP app password for sending emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtpPassword">SMTP App Password</Label>
            <div className="relative">
              <Input
                required
                id="smtpPassword"
                name="smtpPassword"
                placeholder="Enter your app password"
                value={smtpPassword || ""}
                onChange={(e) => setSmtpPassword(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Need help setting up an app password?</p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/get-started">
                <ExternalLink className="h-4 w-4" />
                View Tutorial
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}

export default Preferences
