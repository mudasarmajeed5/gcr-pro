"use client"

import { useEffect, useState, useCallback } from 'react'
import { useClassroomStore } from '@/store/classroom-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Upload, FileText, X, Sparkles, HelpCircle, Loader2 } from 'lucide-react'
import UILoading from '@/components/UILoading'
import { toast } from 'sonner'

interface UploadedFile {
    id: string
    name: string
    file: File
    summary?: string
    isGeneratingSummary?: boolean
}

interface CourseFiles {
    [courseId: string]: UploadedFile[]
}

export default function GcrAiPage() {
    const { courses, isLoading, fetchClassroomData } = useClassroomStore()
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
    const [courseFiles, setCourseFiles] = useState<CourseFiles>({})
    const [isDragOver, setIsDragOver] = useState(false)
    const [activeSummary, setActiveSummary] = useState<string | null>(null)

    useEffect(() => {
        fetchClassroomData()
    }, [fetchClassroomData])

    const selectedCourse = courses.find(c => c.id === selectedCourseId)
    const currentFiles = selectedCourseId ? (courseFiles[selectedCourseId] || []) : []

    const handleFileChange = useCallback((files: FileList | null) => {
        if (!files || !selectedCourseId) return

        const existingFiles = courseFiles[selectedCourseId] || []
        const remainingSlots = 3 - existingFiles.length

        if (remainingSlots <= 0) {
            return
        }

        const newFiles: UploadedFile[] = Array.from(files)
            .slice(0, remainingSlots)
            .map(file => ({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                name: file.name,
                file
            }))

        setCourseFiles(prev => ({
            ...prev,
            [selectedCourseId]: [...existingFiles, ...newFiles]
        }))
    }, [selectedCourseId, courseFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        handleFileChange(e.dataTransfer.files)
    }, [handleFileChange])

    const removeFile = useCallback((fileId: string) => {
        if (!selectedCourseId) return

        setCourseFiles(prev => ({
            ...prev,
            [selectedCourseId]: prev[selectedCourseId].filter(f => f.id !== fileId)
        }))

        // Clear summary if the removed file had an active summary
        if (activeSummary) {
            const file = courseFiles[selectedCourseId]?.find(f => f.id === fileId)
            if (file?.summary === activeSummary) {
                setActiveSummary(null)
            }
        }
    }, [selectedCourseId, activeSummary, courseFiles])

    const generateSummary = useCallback(async (fileId: string) => {
        if (!selectedCourseId) return

        const file = courseFiles[selectedCourseId]?.find(f => f.id === fileId)
        if (!file) return

        // Set loading state
        setCourseFiles(prev => ({
            ...prev,
            [selectedCourseId]: prev[selectedCourseId].map(f =>
                f.id === fileId ? { ...f, isGeneratingSummary: true } : f
            )
        }))

        try {
            const formData = new FormData()
            formData.append('file', file.file)

            const response = await fetch('/api/gcr-ai/summary', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to generate summary')
            }

            const data = await response.json()

            setCourseFiles(prev => ({
                ...prev,
                [selectedCourseId]: prev[selectedCourseId].map(f =>
                    f.id === fileId ? { ...f, summary: data.summary, isGeneratingSummary: false } : f
                )
            }))

            setActiveSummary(data.summary)
        } catch (error) {
            console.error('Error generating summary:', error)
            setCourseFiles(prev => ({
                ...prev,
                [selectedCourseId]: prev[selectedCourseId].map(f =>
                    f.id === fileId ? { ...f, isGeneratingSummary: false } : f
                )
            }))
        }
    }, [selectedCourseId, courseFiles])

    const generateQuiz = useCallback(() => {
        toast.info('Quiz generation coming soon!')
    }, [])

    if (isLoading) return <UILoading />

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">GCR AI</h1>
                <p className="text-muted-foreground mt-2">
                    Upload materials and generate AI-powered summaries and quizzes
                </p>
            </div>

            {/* Upload Materials Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Materials</CardTitle>
                    <CardDescription>
                        Select a course and upload up to 3 files for AI analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Course Dropdown */}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedCourse ? selectedCourse.name : 'Select a course'}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full min-w-[300px]">
                                {courses.map(course => (
                                    <DropdownMenuItem
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id)}
                                    >
                                        {course.name}
                                    </DropdownMenuItem>
                                ))}
                                {courses.length === 0 && (
                                    <DropdownMenuItem disabled>
                                        No courses available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Drag and Drop Area */}
                    {selectedCourseId && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                                ${currentFiles.length >= 3 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                            `}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
                                onChange={(e) => handleFileChange(e.target.files)}
                                disabled={currentFiles.length >= 3}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">
                                    Upload materials for {selectedCourse?.name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Drag and drop files here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Supported: .txt, .md, .csv • {currentFiles.length}/3 files uploaded
                                </p>
                            </label>
                        </div>
                    )}

                    {/* Uploaded Files List */}
                    {currentFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Uploaded Files</p>
                            {currentFiles.map(file => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm truncate max-w-[200px]">
                                            {file.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => generateSummary(file.id)}
                                            disabled={file.isGeneratingSummary}
                                        >
                                            {file.isGeneratingSummary ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <Sparkles className="h-4 w-4 mr-1" />
                                            )}
                                            Summary
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generateQuiz}
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            Quiz
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(file.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Section */}
            {activeSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>AI-generated summary of your material</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {activeSummary}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
