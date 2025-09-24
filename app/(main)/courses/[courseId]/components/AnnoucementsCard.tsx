
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Link, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useClassroomStore } from '@/store/classroom-store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Material } from '@/types/all-data';

const AnnouncementsCard = ({ courseId }: { courseId: string }) => {
    const { getAnnouncementsByCourseId } = useClassroomStore();
    const announcements = getAnnouncementsByCourseId(courseId)
    const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedAnnouncements);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedAnnouncements(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMaterialIcon = (material: Material) => {
        if (material.driveFile) return <FileText className="w-3 h-3" />;
        if (material.youtubeVideo) return <Play className="w-3 h-3 text-red-500" />;
        if (material.link) return <Link className="w-3 h-3 text-blue-500" />;
        return <FileText className="w-3 h-3" />;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {announcements.length === 0 && <div>Nothing new, You can scroll!</div>}
                {announcements.map((announcement) => {
                    const isExpanded = expandedAnnouncements.has(announcement.id);
                    const shouldTruncate = announcement.text.length > 150;
                    const displayText = isExpanded
                        ? announcement.text
                        : announcement.text.slice(0, 150) + (shouldTruncate ? '...' : '');

                    return (
                        <Card key={announcement.id} className="bg-muted/30">
                            <CardContent className="p-3">
                                <p className="text-sm mb-2">
                                    {displayText}
                                    {shouldTruncate && (
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs ml-1"
                                            onClick={() => toggleExpand(announcement.id)}
                                        >
                                            {isExpanded ? 'Show less' : 'Read more'}
                                        </Button>
                                    )}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(announcement.creationTime)}
                                    </div>

                                    {announcement.materials && announcement.materials.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {announcement.materials.length} attachment{announcement.materials.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>

                                {isExpanded && announcement.materials && announcement.materials.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.materials.map((material, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-1 px-2 py-1 bg-background rounded-md text-xs"
                                                >
                                                    {getMaterialIcon(material)}
                                                    <span className="max-w-[100px] truncate">
                                                        {material.driveFile?.driveFile.title ||
                                                            material.youtubeVideo?.title ||
                                                            material.link?.title ||
                                                            `File ${index + 1}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default AnnouncementsCard;