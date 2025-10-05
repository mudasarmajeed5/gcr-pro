"use client";

import { useState } from "react";
import { useClassroomStore } from "@/store/classroom-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isAfter, subDays, differenceInDays } from "date-fns";
import { CourseWorkMaterial } from "@/types/all-data";
import { FolderOpen, Calendar, FileText, Link, Play, FileSpreadsheet, Filter } from "lucide-react";
import { usePreviewStore } from "@/store/preview-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RecentActivity() {
    const { materials, courses } = useClassroomStore();
    const { openPreview } = usePreviewStore();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const handlePreview = (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) return;

        // Only handle drive files for preview
        if (first.driveFile) {
            openPreview({
                title: material.title,
                type: 'driveFile' as const,
                url: `https://drive.google.com/file/d/${first.driveFile.driveFile.id}/preview`,
                driveFileId: first.driveFile.driveFile.id
            });
        }
    };

    // Filter materials by recent date first
    const recentMaterials = materials?.filter((material: CourseWorkMaterial) => {
        if (!material.creationTime) return false;
        try {
            const materialDate = new Date(material.creationTime);
            if (isNaN(materialDate.getTime())) return false;
            return isAfter(materialDate, subDays(new Date(), 7));
        } catch {
            return false;
        }
    }) || [];

    // Further filter by selected course if any
    const filteredMaterials = selectedCourseId
        ? recentMaterials.filter(material => material.courseId === selectedCourseId)
        : recentMaterials;

    const formatRelativeTime = (date: string) => {
        try {
            const materialDate = new Date(date);
            if (isNaN(materialDate.getTime())) return "Posted recently";
            const diff = differenceInDays(new Date(), materialDate);
            if (diff === 0) return "Posted today";
            if (diff === 1) return "Posted yesterday";
            return `Posted ${diff} days ago`;
        } catch {
            return "Posted recently";
        }
    };

    const getIcon = (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) return <FileText className="w-4 h-4" />;
        if (first.driveFile) return <FileText className="w-4 h-4" />;
        if (first.youtubeVideo) return <Play className="w-4 h-4 text-red-500" />;
        if (first.form) return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
        if (first.link) return <Link className="w-4 h-4 text-green-600" />;
        return <FileText className="w-4 h-4" />;
    };

    const getType = (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) return 'Document';
        if (first.driveFile) return 'Drive File';
        if (first.youtubeVideo) return 'Video';
        if (first.form) return 'Form';
        if (first.link) return 'Link';
        return 'Document';
    };

    const getCourseById = (courseId: string) => {
        return courses?.find(course => course.id === courseId);
    };

    const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;

    return (
        <>
            <Card className="col-span-3 lg:col-span-2 bg-transparent border-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    {selectedCourse ? selectedCourse.name : "All Courses"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                    onClick={() => setSelectedCourseId(null)}
                                    className={selectedCourseId === null ? "bg-muted" : ""}
                                >
                                    All Courses
                                </DropdownMenuItem>
                                {courses?.map((course) => (
                                    <DropdownMenuItem
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id)}
                                        className={selectedCourseId === course.id ? "bg-muted" : ""}
                                    >
                                        {course.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="overflow-auto max-h-[600px] overflow-x-hidden">
                    {filteredMaterials.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>
                                {selectedCourse
                                    ? `No recent materials found for ${selectedCourse.name} (7 days)`
                                    : "No recent materials found (7 days)"
                                }
                            </p>
                            <p className="text-sm mt-1">Check back later for new resources</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMaterials.map((material) => {
                                const course = getCourseById(material.courseId);
                                return (
                                    <div
                                        key={material.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border w-full min-w-0"
                                        onClick={() => handlePreview(material)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 rounded bg-muted/30 flex-shrink-0">
                                                {getIcon(material)}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span
                                                    className="font-medium break-words"
                                                 
                                                >
                                                    {material.title}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                                                    {course && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {course.name}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                        {getType(material)}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-xs">
                                                            {formatRelativeTime(material.creationTime)}
                                                        </span>
                                                    </div>
                                                    {material.materials && material.materials.length > 0 && (
                                                        <span className="text-xs">
                                                            {material.materials.length} resource{material.materials.length !== 1 ? "s" : ""}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}