import React from 'react'
interface GlobalPreviewMaterialProps{
    title: string,
    onClose: () =>void;
    link: string
}
const GlobalPreviewMaterial = ({title,onClose,link}:GlobalPreviewMaterialProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
                {/* Header with title and close button */}
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 z-10 flex justify-between items-center">
                    <h3 className="text-lg font-medium truncate max-w-md">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
                    >
                        &times;
                    </button>
                </div>

                {/* Iframe for file preview */}
                <iframe
                    src={link}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="File Preview"
                />
            </div>
        </div>
    )
}

export default GlobalPreviewMaterial