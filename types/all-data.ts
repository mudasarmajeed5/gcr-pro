export interface Announcement {
   id: string;
   text: string;
   creationTime: string;
   materials?: Material[];
   courseId? :string
}

export interface CourseWorkMaterial {
   id: string;
   title: string;
   courseId: string;
   description?: string;
   creationTime: string;
   materials?: Material[];
}

export interface Material {
   driveFile?: {
       driveFile: {
           id: string;
           title: string;
           alternateLink: string;
       };
       shareMode: 'VIEW' | 'EDIT';
   };
   link?: {
       url: string;
       title: string;
       thumbnailUrl?: string;
   };
   youtubeVideo?: {
       id: string;
       title: string;
       alternateLink: string;
       thumbnailUrl?: string;
   };
   form?: {
       formUrl: string;
       responseUrl?: string;
       title: string;
       thumbnailUrl?: string;
   };
}