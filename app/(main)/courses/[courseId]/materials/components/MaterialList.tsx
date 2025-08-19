'use client'

import { CourseWorkMaterial } from '@/types/all-data';
import { FileText, Link, Play, FileSpreadsheet, Calendar, ExternalLink, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MouseEvent, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
interface MaterialListProps {
    materials: CourseWorkMaterial[];
}

const MaterialList = ({ materials }: MaterialListProps) => {
    const [previewMaterial, setPreviewMaterial] = useState<CourseWorkMaterial | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDriveDownloadUrl = (fileId: string) =>
        `https://drive.google.com/uc?export=download&id=${fileId}`;

    const downloadMaterial = async (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) {
            toast.error('No downloadable content found');
            return;
        }

        let url = '';
        let filename = material.title;

        if (first.driveFile) {
            url = getDriveDownloadUrl(first.driveFile.driveFile.id);
            filename = first.driveFile.driveFile.title || filename;
        } else if (first.link) {
            url = first.link.url;
            filename = first.link.title || filename;
        } else if (first.form) {
            url = first.form.formUrl;
            filename = first.form.title || filename;
        } else if (first.youtubeVideo) {
            // YouTube videos can't be downloaded directly, open in new tab
            window.open(first.youtubeVideo.alternateLink, '_blank');
            return;
        }

        if (!url) {
            toast.error('No downloadable content found');
            return;
        }

        try {
            const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                toast.success(`Downloaded: ${filename}`);
            }, 100);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error(`Failed to download: ${filename}`);
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };
    const openInNewWindow = (material: CourseWorkMaterial) => {

        const first = material.materials?.[0];
        if (!first) return;
        let url = '';
        if (first.driveFile) url = first.driveFile.driveFile.alternateLink;
        else if (first.link) url = first.link.url;
        else if (first.youtubeVideo) url = first.youtubeVideo.alternateLink;
        else if (first.form) url = first.form.formUrl;

        if (url) window.open(url, '_blank');
    };
    const handleMaterialClick = (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) return;

        // For Drive files, open in preview modal instead of new tab
        if (first.driveFile) {
            setPreviewMaterial(material);
        } else {
            let url = '';
            if (first.link) url = first.link.url;
            else if (first.youtubeVideo) url = first.youtubeVideo.alternateLink;
            else if (first.form) url = first.form.formUrl;
            if (url) window.open(url, '_blank');
        }
    };

    const handleDownloadClick = (e: React.MouseEvent, material: CourseWorkMaterial) => {
        e.stopPropagation(); // Prevent triggering the parent click event
        downloadMaterial(material);
    };

    const getIcon = (material: CourseWorkMaterial) => {
        const first = material.materials?.[0];
        if (!first) return <FileText className="w-5 h-5" />;
        if (first.driveFile) return <FileText className="w-5 h-5" />;
        if (first.youtubeVideo) return <Play className="w-5 h-5 text-red-500" />;
        if (first.form) return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
        if (first.link) return <Link className="w-5 h-5 text-green-600" />;
        return <FileText className="w-5 h-5" />;
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

    return (
        <div className="space-y-2 p-4">
            {materials.map((material) => (
                <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50/10 cursor-pointer"
                    onClick={() => handleMaterialClick(material)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1 rounded bg-muted">{getIcon(material)}</div>
                        <div className="flex flex-col">
                            <span className="font-medium">{material.title}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Badge variant="outline">{getType(material)}</Badge>
                                <Calendar className="w-3 h-3" />
                                {formatDate(material.creationTime)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                openInNewWindow(material)
                            }}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                            className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadClick(e, material)}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}

            <Dialog open={!!previewMaterial} onOpenChange={(open) => !open && setPreviewMaterial(null)}>
                <DialogContent className="h-screen w-screen max-w-none sm:max-w-full max-h-none rounded-none p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-lg font-semibold">
                            {previewMaterial?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="h-[calc(100vh-4rem)]">
                        <iframe
                            src={`https://drive.google.com/file/d/${previewMaterial?.materials?.[0]?.driveFile?.driveFile.id}/preview`}
                            className="w-full h-full border-0"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MaterialList;