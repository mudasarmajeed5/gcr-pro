'use client'

import { CourseWorkMaterial } from '@/types/all-data';
import { FileText, Link, Play, FileSpreadsheet, Calendar, ExternalLink, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePreviewStore } from '@/store/preview-store';
import { formatDate } from '@/utils/formatDate';
interface MaterialListProps {
    materials: CourseWorkMaterial[];
    authId: number | null
}

const MaterialList = ({ materials, authId }: MaterialListProps) => {
    const { openPreview } = usePreviewStore();
    const downloadFile = (fileId: string) => {
        if (!authId) {
            alert("User not authenticated. Please sign in again.");
            return;
        }
        const url = `https://drive.google.com/uc?export=download&id=${fileId}&authuser=${authId}`;
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 5000); // 5 seconds
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

        // Prepare preview material data for the modal
        if (first.driveFile) {
            openPreview({
                title: material.title,
                type: 'driveFile' as const,
                url: `https://drive.google.com/file/d/${first.driveFile.driveFile.id}/preview`,
                driveFileId: first.driveFile.driveFile.id
            });
        } else if (first.youtubeVideo) {
            openPreview({
                title: material.title,
                type: 'youtubeVideo' as const,
                url: first.youtubeVideo.alternateLink,
            });
        } else if (first.form) {
            openPreview({
                title: material.title,
                type: 'form' as const,
                url: first.form.formUrl,
            });
        } else if (first.link) {
            openPreview({
                title: material.title,
                type: 'link' as const,
                url: first.link.url,
            });
        } else {
            // Fallback to opening in new window if type is unknown
            openInNewWindow(material);
            return;
        }
    };

    const handleDownloadClick = (e: React.MouseEvent, material: CourseWorkMaterial) => {
        e.stopPropagation();
        material.materials?.forEach((m) => {
            const fileId = m.driveFile?.driveFile.id;
            if (fileId) {
                downloadFile(fileId);
            }
        });
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
                            <span className='hidden md:inline-block'>Preview</span>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                            className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDownloadClick(e, material)}
                        >
                            <span className='hidden md:inline-block'>Download</span>
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MaterialList;