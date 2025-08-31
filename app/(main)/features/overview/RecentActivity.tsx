"use client";

import { useClassroomStore } from "@/store/classroom-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isAfter, subDays, differenceInDays } from "date-fns";
import { CourseWorkMaterial } from "@/types/all-data";
import { FolderOpen, Calendar } from "lucide-react";
import { usePreviewStore } from "@/store/preview-store";

export default function RecentActivity() {
    const { materials } = useClassroomStore();
    const { openPreview } = usePreviewStore();
    
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

    return (
        <>
            <Card className="col-span-3 lg:col-span-2 bg-transparent border-none ">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>

                <CardContent className="overflow-auto max-h-[600px]">
                    {recentMaterials.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No recent materials found (7)-days</p>
                            <p className="text-sm mt-1">Check back later for new resources</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recentMaterials.map((material) => (
                                <Card
                                    key={material.id}
                                    className="p-2 hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden"
                                    onClick={() => handlePreview(material)}>

                                    <CardHeader className="p-3 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <CardTitle className="text-sm font-medium truncate">{material.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs text-muted-foreground truncate">
                                            {formatRelativeTime(material.creationTime)}
                                        </p>
                                        {material.materials && material.materials.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {material.materials.length} resource{material.materials.length !== 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card >

        </>
    );
}