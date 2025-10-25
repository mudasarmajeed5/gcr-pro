/* eslint-disable */

"use client"
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, FileText, Calendar } from 'lucide-react'
import Fuse from 'fuse.js'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { useClassroomStore } from '@/store/classroom-store'
import GlobalPreviewMaterial from './GlobalPreviewMaterial'

const GlobalSearch = () => {
    const [open, setOpen] = useState(false)
    const [previewFile, setPreviewFile] = useState<{ url: string, title: string } | null>(null)
    const router = useRouter();

    // Get data from the store
    const { courses, assignments, materials } = useClassroomStore()

    // Configure Fuse.js options for each data type
    const fuseOptions = {
        threshold: 0.4, // Lower = more strict matching
        keys: ['title', 'name', 'description', 'courseName'], // Fields to search
        includeScore: true,
        includeMatches: true,
    }

    // Create Fuse instances for each data type
    const fuses = useMemo(() => {
        const courseFuse = new Fuse(
            courses.map(course => ({
                ...course,
                type: 'course',
                displayName: course.name,
                description: course.description || '',
            })),
            { ...fuseOptions, keys: ['name', 'description'] }
        )

        const assignmentFuse = new Fuse(
            assignments.map(assignment => ({
                ...assignment,
                type: 'assignment',
                displayName: assignment.title,
                courseName: courses.find(c => c.id === assignment.courseId)?.name || '',
            })),
            { ...fuseOptions, keys: ['title', 'description', 'courseName'] }
        )

        const materialFuse = new Fuse(
            materials.map(material => ({
                ...material,
                type: 'material',
                displayName: material.title,
                courseName: courses.find(c => c.id === material.courseId)?.name || '',
            })),
            { ...fuseOptions, keys: ['title', 'description', 'courseName'] }
        )

        return { courseFuse, assignmentFuse, materialFuse }
    }, [courses, assignments, materials])

    // Handle search and navigation
    const handleSelect = (item: any) => {
        setOpen(false);

        if (item.type === 'course') {
            router.push(`/courses/${item.id}`);
        } else if (item.type === 'assignment') {
            router.push(`/assignments/${item.id}`);
        } else if (item.type === 'material') {
            // For materials, open the preview modal
            const firstMaterial = item.materials?.[0];

            if (firstMaterial?.driveFile) {
                // Open the file preview modal
                const driveFile = firstMaterial.driveFile;
                const fileUrl = `https://drive.google.com/file/d/${driveFile.driveFile?.id}/preview`;
                setPreviewFile({
                    url: fileUrl,
                    title: item.displayName || 'File Preview'
                });
            } else {
                // For non-drive materials, open in new tab
                let url = '';
                if (firstMaterial?.link) url = firstMaterial.link.url;
                else if (firstMaterial?.youtubeVideo) url = firstMaterial.youtubeVideo.alternateLink;
                else if (firstMaterial?.form) url = firstMaterial.form.formUrl;

                if (url) window.open(url, '_blank');
            }
        }
    }

    // Search function
    const performSearch = (query: string) => {
        if (!query.trim()) return { courses: [], assignments: [], materials: [] }

        const courseResults = fuses.courseFuse.search(query).slice(0, 5)
        const assignmentResults = fuses.assignmentFuse.search(query).slice(0, 5)
        const materialResults = fuses.materialFuse.search(query).slice(0, 5)

        return {
            courses: courseResults.map(result => result.item),
            assignments: assignmentResults.map(result => result.item),
            materials: materialResults.map(result => result.item),
        }
    }
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            const isEditable = !!target && (
                target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
            )
            if (isEditable) return

            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <>
            {/* Trigger Button */}
            {/* Desktop / Tablet */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
                <Button
                    variant="outline"
                    className="relative w-full justify-start text-sm text-muted-foreground"
                    onClick={() => setOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    Search classes, assignments...
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>

            {/* Mobile - Icon only */}
            <div className="md:hidden">
                <Button
                    variant="outline"
                    // size="icon"
                    onClick={() => setOpen(true)}
                    className=""
                >
                    Search...<Search className="h-4 w-4" />
                </Button>
            </div>

            {/* Command Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command
                    filter={(value, search) => {
                        // Custom filter to use Fuse.js results
                        const results = performSearch(search)
                        const allResults = [
                            ...results.courses,
                            ...results.assignments,
                            ...results.materials
                        ]

                        // Return 1 if item exists in search results, 0 otherwise
                        return allResults.some(item => item.id === value) ? 1 : 0
                    }}
                >
                    <CommandInput placeholder="Search classes, assignments, materials..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        <SearchResults
                            performSearch={performSearch}
                            onSelect={handleSelect}
                        />
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* File Preview Modal */}
            {previewFile && (

                <GlobalPreviewMaterial
                    onClose={() => { setPreviewFile(null) }}
                    title={previewFile.title}
                    link={previewFile.url}
                />
            )}
        </>
    )
}
// Separate component to handle search results
const SearchResults = ({
    performSearch,
    onSelect
}: {
    performSearch: (query: string) => any
    onSelect: (item: any) => void
}) => {
    const [query, setQuery] = useState('')

    useEffect(() => {
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement
        if (input) {
            const handleInput = () => setQuery(input.value)
            input.addEventListener('input', handleInput)
            return () => input.removeEventListener('input', handleInput)
        }
    }, [])
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const results = useMemo(() => performSearch(query), [query, performSearch])

    return (
        <>
            {/* Courses Section */}
            {results.courses.length > 0 && (
                <CommandGroup heading="Courses">
                    {results.courses.map((course: any) => (
                        <CommandItem
                            key={course.id}
                            value={course.id}
                            onSelect={() => onSelect(course)}
                            className="flex items-center gap-3 p-3"
                        >
                            <BookOpen className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                                <span className="font-medium">{course.displayName}</span>
                                {course.description && (
                                    <span className="text-sm text-muted-foreground line-clamp-1">
                                        {course.description}
                                    </span>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {/* Assignments Section */}
            {results.assignments.length > 0 && (
                <CommandGroup heading="Assignments">
                    {results.assignments.map((assignment: any) => (
                        <CommandItem
                            key={assignment.id}
                            value={assignment.id}
                            onSelect={() => onSelect(assignment)}
                            className="flex items-center gap-3 p-3"
                        >
                            <Calendar className="h-4 w-4 text-secondary" />
                            <div className="flex flex-col">
                                <span className="font-medium">{assignment.displayName}</span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{assignment.courseName}</span>
                                    {assignment.dueDate && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                Due: {monthNames[assignment.dueDate.month - 1]} {assignment.dueDate.day}, {assignment.dueDate.year}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {/* Materials Section */}
            {results.materials.length > 0 && (
                <CommandGroup heading="Materials">
                    {results.materials.map((material: any) => (
                        <CommandItem
                            key={material.id}
                            value={material.id}
                            onSelect={() => onSelect(material)}
                            className="flex items-center gap-3 p-3"
                        >
                            <FileText className="h-4 w-4 text-accent" />
                            <div className="flex flex-col">
                                <span className="font-medium">{material.displayName}</span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{material.courseName}</span>
                                    {material.description && (
                                        <>
                                            <span>•</span>
                                            <span className="line-clamp-1">{material.description}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}
        </>
    )
}

export default GlobalSearch