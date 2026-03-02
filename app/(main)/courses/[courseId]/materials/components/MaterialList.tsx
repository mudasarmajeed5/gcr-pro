'use client'

import { CourseWorkMaterial, Material } from '@/types/all-data';
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

    const getAttachmentIcon = (attachment: Material) => {
        if (attachment.driveFile) return <FileText className="w-5 h-5" />;
        if (attachment.youtubeVideo) return <Play className="w-5 h-5 text-red-500" />;
        if (attachment.form) return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
        if (attachment.link) return <Link className="w-5 h-5 text-green-600" />;
        return <FileText className="w-5 h-5" />;
    };

    const getAttachmentType = (attachment: Material) => {
        if (attachment.driveFile) return 'Drive File';
        if (attachment.youtubeVideo) return 'Video';
        if (attachment.form) return 'Form';
        if (attachment.link) return 'Link';
        return 'Document';
    };

    const getAttachmentTitle = (attachment: Material) => {
        if (attachment.driveFile) return attachment.driveFile.driveFile.title;
        if (attachment.youtubeVideo) return attachment.youtubeVideo.title;
        if (attachment.form) return attachment.form.title;
        if (attachment.link) return attachment.link.title;
        return '';
    };

    const openAttachmentInNewWindow = (attachment: Material) => {
        let url = '';
        if (attachment.driveFile) url = attachment.driveFile.driveFile.alternateLink;
        else if (attachment.link) url = attachment.link.url;
        else if (attachment.youtubeVideo) url = attachment.youtubeVideo.alternateLink;
        else if (attachment.form) url = attachment.form.formUrl;
        if (url) window.open(url, '_blank');
    };

    const handleAttachmentClick = (materialTitle: string, attachment: Material) => {
        if (attachment.driveFile) {
            openPreview({
                title: attachment.driveFile.driveFile.title || materialTitle,
                type: 'driveFile' as const,
                url: `https://drive.google.com/file/d/${attachment.driveFile.driveFile.id}/preview`,
                driveFileId: attachment.driveFile.driveFile.id,
            });
        } else if (attachment.youtubeVideo) {
            openPreview({
                title: attachment.youtubeVideo.title || materialTitle,
                type: 'youtubeVideo' as const,
                url: attachment.youtubeVideo.alternateLink,
            });
        } else if (attachment.form) {
            openPreview({
                title: attachment.form.title || materialTitle,
                type: 'form' as const,
                url: attachment.form.formUrl,
            });
        } else if (attachment.link) {
            openPreview({
                title: attachment.link.title || materialTitle,
                type: 'link' as const,
                url: attachment.link.url,
            });
        } else {
            openAttachmentInNewWindow(attachment);
        }
    };

    return (
        <div className="space-y-3 p-4">
            {materials.map((material) => (
                <div key={material.id} className="border rounded-md overflow-hidden">
                    {/* Material header */}
                    <div className="flex items-center gap-3 p-4 bg-muted/40">
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">{material.title}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(material.creationTime)}
                                {material.materials && material.materials.length > 1 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {material.materials.length} files
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Attachments list */}
                    {material.materials && material.materials.length > 0 ? (
                        <div className="divide-y">
                            {material.materials.map((attachment, index) => {
                                const attachmentKey = `${material.id}-${
                                    attachment.driveFile?.driveFile.id ??
                                    attachment.youtubeVideo?.id ??
                                    attachment.link?.url ??
                                    attachment.form?.formUrl ??
                                    index
                                }`;
                                return (
                                <div
                                    key={attachmentKey}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/10 cursor-pointer"
                                    onClick={() => handleAttachmentClick(material.title, attachment)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-1 rounded bg-muted shrink-0">
                                            {getAttachmentIcon(attachment)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {getAttachmentTitle(attachment) || material.title}
                                            </span>
                                            <Badge variant="outline" className="w-fit text-xs mt-0.5">
                                                {getAttachmentType(attachment)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAttachmentInNewWindow(attachment);
                                            }}
                                        >
                                            <span className='hidden md:inline-block'>Preview</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                        {attachment.driveFile && (
                                            <Button
                                                className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadFile(attachment.driveFile.driveFile.id);
                                                }}
                                            >
                                                <span className='hidden md:inline-block'>Download</span>
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No attachments</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MaterialList;