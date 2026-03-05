'use client'

import { CourseWorkMaterial } from '@/types/all-data'
import {
  FileText,
  Link as LinkIcon,
  Play,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Download
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePreviewStore } from '@/store/preview-store'
import { formatDate } from '@/utils/formatDate'

interface MaterialListProps {
  materials: CourseWorkMaterial[]
  authId: number | null
}

const MaterialList = ({ materials, authId }: MaterialListProps) => {

  const { openPreview } = usePreviewStore()

  const downloadFile = (fileId: string) => {
    if (!authId) {
      alert("User not authenticated. Please sign in again.")
      return
    }

    const url = `https://drive.google.com/uc?export=download&id=${fileId}&authuser=${authId}`

    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = url

    document.body.appendChild(iframe)

    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 5000)
  }

  const getIcon = (m: any) => {
    if (m.driveFile) return <FileText className="w-5 h-5" />
    if (m.youtubeVideo) return <Play className="w-5 h-5 text-red-500" />
    if (m.form) return <FileSpreadsheet className="w-5 h-5 text-blue-600" />
    if (m.link) return <LinkIcon className="w-5 h-5 text-green-600" />
    return <FileText className="w-5 h-5" />
  }

  const getTitle = (m: any) => {
    return (
      m.driveFile?.driveFile?.title ||
      m.youtubeVideo?.title ||
      m.link?.title ||
      m.form?.title ||
      "Attachment"
    )
  }

  const getExternalUrl = (m: any) => {
    if (m.driveFile) return m.driveFile.driveFile.alternateLink
    if (m.youtubeVideo) return m.youtubeVideo.alternateLink
    if (m.link) return m.link.url
    if (m.form) return m.form.formUrl
    return ''
  }

  const openPreviewForMaterial = (m: any, title: string) => {

    if (m.driveFile) {
      const file = m.driveFile.driveFile

      openPreview({
        title,
        type: 'driveFile',
        url: `https://drive.google.com/file/d/${file.id}/preview`,
        driveFileId: file.id
      })
    }

    else if (m.youtubeVideo) {
      openPreview({
        title,
        type: 'youtubeVideo',
        url: m.youtubeVideo.alternateLink
      })
    }

    else if (m.form) {
      openPreview({
        title,
        type: 'form',
        url: m.form.formUrl
      })
    }

    else if (m.link) {
      openPreview({
        title,
        type: 'link',
        url: m.link.url
      })
    }
  }

  return (
    <div className="space-y-2 p-4">

      {materials.map((material) => (

        <div
          key={material.id}
          className="p-4 border rounded-md hover:bg-gray-50/10"
        >

          {/* Header */}
          <div className="flex items-center justify-between mb-3">

            <div className="flex flex-col">
              <span className="font-medium">{material.title}</span>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                {formatDate(material.creationTime)}
              </div>
            </div>

            <Badge variant="outline">
              {material.materials?.length || 0} items
            </Badge>

          </div>

          {/* Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">

            {material.materials?.map((m, index) => {

              const externalUrl = getExternalUrl(m)
              const file = m.driveFile?.driveFile

              return (

                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50/10"
                >

                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => openPreviewForMaterial(m, material.title)}
                  >

                    <div className="p-1 rounded bg-muted">
                      {getIcon(m)}
                    </div>

                    <span className="text-sm">
                      {getTitle(m)}
                    </span>

                  </div>

                  <div className="flex gap-1">

                    <Button
                      className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (externalUrl) window.open(externalUrl, "_blank")
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>

                    {file && (
                      <Button
                        className='hover:bg-blue-300/70 cursor-pointer dark:hover:bg-green-500/80'
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadFile(file.id)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}

                  </div>

                </div>

              )

            })}

          </div>

        </div>

      ))}

    </div>
  )
}

export default MaterialList