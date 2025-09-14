"use client"
import { useState } from 'react';
import { Play, Mail, Download, Video } from 'lucide-react';

const GetStarted = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const setupVideos = [
    {
      id: 1,
      title: "Setup App Password",
      description: "Learn how to generate and configure an app password to send emails from the application.",
      icon: <Mail className="w-6 h-6" />,
      feature: "Email Functionality",
      videoSrc: "/videos/configure-smtp.mp4",
      thumbnail: "/videos/configure-smtp.png"
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4">
            <Video className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            App Setup Guide
          </h1>
          <p className="max-w-2xl mx-auto">
            Watch these tutorials to configure your app for email sending and classroom material downloads.
          </p>
        </div>

        {/* Video Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {setupVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {/* Video Thumbnail */}
              <div
                className="relative aspect-video rounded-t-xl flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => setSelectedVideo(video.videoSrc)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-8 h-8 text-white" />
                </div>
                {/* Feature Tag */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-thin dark:bg-black bg-white invert">
                  {video.feature}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
                    {video.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                <button
                  className="w-full mt-4 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 border"
                  onClick={() => setSelectedVideo(video.videoSrc)}
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Tutorial</span>
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm">
            <div className="w-2 h-2 rounded-full"></div>
            <span>Complete both setups to unlock full app features</span>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="relative w-full max-w-3xl p-4">
            <button
              className="absolute top-2 right-2 text-white text-lg"
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GetStarted;
