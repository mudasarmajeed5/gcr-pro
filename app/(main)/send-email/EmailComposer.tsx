'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Paperclip, X } from 'lucide-react'
import Hint from '@/components/Hint'

interface Professor {
    id: string
    name: string
    email: string
}

interface EmailComposerProps {
    selectedProfessor: Professor | null
}

export default function EmailComposer({ selectedProfessor }: EmailComposerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAddAttachmentClick = () => {
        fileInputRef.current?.click()
    }
    const [emailData, setEmailData] = useState({
        to: selectedProfessor?.email || '',
        subject: '',
        body: '',
        attachments: [] as File[]
    })

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
        if (!emailData.to) return alert('Please enter an email address')
        const { to, subject, body } = emailData

        if (method === 'client') {
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            window.location.href = mailtoLink
        } else {
            alert('SMTP sending under development')
        }
    }


    useEffect(() => {
        if (selectedProfessor) {
            setEmailData(prev => ({
                ...prev,
                to: selectedProfessor.email,
                subject: '',
                body: '',
                attachments: []
            }))
        }
    }, [selectedProfessor])


    if (!selectedProfessor) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
                <p className="text-muted-foreground">Select a professor to compose an email</p>
            </div>
        </div>
    )


    return (
        <div className="h-full flex flex-col p-4">
            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-4">
                    {/* Input area */}
                    <div className="flex-1 flex flex-col">
                        <Label htmlFor="to">To</Label>
                        <Input
                            className="mt-1"
                            id="to"
                            placeholder="Professor's email"
                            value={emailData.to}
                            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                        />
                    </div>

                    {/* Buttons area */}
                    <div className="flex gap-2 mt-4">
                        <Hint label="Open in your default email app with this message ready to send">
                            <Button className="text-xs px-2">Open App</Button>
                        </Hint>

                        <Hint label="Send this message directly from here">
                            <Button className="text-xs px-2">Send</Button>
                        </Hint>
                    </div>
                </div>





                {/* Scrollable container for subject, body, attachments */}
                <div className="flex-1 flex flex-col overflow-y-auto pt-2 space-y-2">
                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="Email subject"
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        />
                    </div>

                    <div className="flex-1 flex flex-col">
                        <Label htmlFor="body">Message</Label>
                        <Textarea
                            id="body"
                            placeholder="Write your message here..."
                            className="flex-1 min-h-[200px]"
                            value={emailData.body}
                            onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                        />
                    </div>

                    {/* Attachments */}
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
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
                            )}
                            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                            <Button variant="outline" onClick={handleAddAttachmentClick} size="sm" className="w-full mt-2">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Add Attachment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
