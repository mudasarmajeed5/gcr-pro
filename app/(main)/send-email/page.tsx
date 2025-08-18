'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Mail,
  Send,
  Paperclip,
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react'
import { getAllProfessors } from './actions/get-professor-details'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Professor {
  id: string
  name: string
  email: string
  avatar?: string
  courseId: string
  courseName: string
}

export default function SendEmail() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    attachments: [] as File[]
  })

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const data = await getAllProfessors()
        if (Array.isArray(data)) {
          setProfessors(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfessors()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEmailData({
        ...emailData,
        attachments: [...emailData.attachments, ...Array.from(e.target.files)]
      })
    }
  }

  const removeAttachment = (index: number) => {
    const newAttachments = [...emailData.attachments]
    newAttachments.splice(index, 1)
    setEmailData({ ...emailData, attachments: newAttachments })
  }

  const sendEmail = (method: 'client' | 'smtp') => {
    if (!selectedProfessor) return

    if (method === 'client') {
      const mailtoLink = `mailto:${selectedProfessor.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
      window.location.href = mailtoLink
    } else {
      alert(`Feature under development`)
    }
  }

  if (loading) return <p className="text-center h-full py-4 flex justify-center items-center">
    <span className='animate-spin'><RefreshCw /></span>
  </p>

  if (!professors.length) return <p className="text-center py-4">No professors found.</p>

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">

      <ResizablePanel defaultSize={70}>
        <div className="h-full flex flex-col p-4">
          {selectedProfessor ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Compose Email</h2>
                <p className="text-sm text-muted-foreground">
                  To: {selectedProfessor.name} &lt;{selectedProfessor.email}&gt;
                </p>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  />
                </div>

                <div className="flex-1 space-y-2 flex flex-col">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your message here..."
                    className="flex-1 min-h-[200px]"
                    value={emailData.body}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailData({ ...emailData, body: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Attachments</Label>
                  <div className="border rounded-lg p-2">
                    {emailData.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {emailData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
                    )}
                    <label className="mt-2">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button variant="outline" size="sm" className="w-full">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Attachment
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => sendEmail('client')}>
                        Send with Gmail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sendEmail('smtp')}>
                        Send via SMTP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Select a professor to compose an email</p>
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={30} minSize={25}>
        <ScrollArea className="h-full">
          <div className="space-y-4 m-2">
            <h2 className="text-lg sticky z-2  px-4 py-2 top-1 dark:bg-black bg-gray-100 rounded-full font-semibold">Professors</h2>
            {professors.map((prof, idx) => (
              <Card
                key={`${prof.id}-index${idx}`}
                className={`shadow-sm cursor-pointer p-0 transition-colors ${selectedProfessor?.id === prof.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedProfessor(prof)}
              >
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                  <Avatar className="h-7 flex justify-center items-center w-7">
                    <span className='rounded-full bg-gray-300 dark:text-black px-4 py-2'>{prof.name[0]}</span>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">{prof.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{prof.courseName}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}