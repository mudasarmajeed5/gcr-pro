'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Paperclip, Sparkles, X } from 'lucide-react'
import Hint from '@/components/Hint'
import { useEmailSender } from '@/hooks/use-email-sender'
import { toast } from 'sonner'

interface Professor {
    id: string
    name: string
    email: string
}

interface EmailComposerProps {
    selectedProfessor: Professor | null
}

export default function EmailComposer({ selectedProfessor }: EmailComposerProps) {
    const { handleSendEmail, isLoading } = useEmailSender();
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onSendEmail = async () => {
        await handleSendEmail(
            emailData,
            () => {
                toast.success('Email sent successfully!');
                setEmailData({
                    to: selectedProfessor?.email || '',
                    subject: '',
                    body: '',
                    attachments: []
                });
            },
            (errorMessage) => {
                toast.error(errorMessage);
            }
        );
    };
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
    const generateEmailBody = async (body: string) => {
        try {
            const res = await fetch('/api/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: body, professor: selectedProfessor?.name }),
            });

            const data = await res.json();

            setEmailData((prev) => ({
                ...prev,
                body: data.text,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const sendEmail = (method: 'client' | 'smtp') => {
        if (!emailData.to) return alert('Please enter an email address')
        const { to, subject, body } = emailData

        if (method === 'client') {
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            window.location.href = mailtoLink
        } else {
            onSendEmail();
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
                            className="mt-2"
                            id="to"
                            placeholder="Professor's email"
                            value={emailData.to}
                            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                        />
                    </div>

                    {/* Buttons area */}
                    <div className="flex gap-2 mt-4">
                        <Hint label="Open in your default email app with this message ready to send">
                            <Button onClick={() => sendEmail("client")} className="text-xs px-2">Open App</Button>
                        </Hint>

                        <Hint label="Send this message directly from here">
                            <Button disabled={isLoading} onClick={() => sendEmail("smtp")} className="text-xs px-2">Send</Button>
                        </Hint>
                    </div>
                </div>

                {/* Scrollable container for subject, body, attachments */}
                <div className="flex-1 flex flex-col overflow-y-auto pt-2 space-y-2">
                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            className="mt-2"
                            placeholder="Email subject"
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        />
                    </div>

                    <div className="flex-1 flex relative flex-col">
                        <Label htmlFor="body">Message</Label>
                        <Textarea
                            id="body"
                            placeholder="Write your message here..."
                            className="flex-1 mt-2 min-h-[200px]"
                            value={emailData.body}
                            onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                        />
                        <Hint label='Complete with Gemini!'>
                            <button
                                type="button"
                                className="text-primary border flex items-center gap-2 p-1 cursor-pointer rounded-md text-xs absolute right-2 top-8"
                                onClick={() => generateEmailBody(emailData.body)}
                            >
                                <span>Complete with AI</span>
                                <Sparkles className="size-5" />
                            </button>
                        </Hint>
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
