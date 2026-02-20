import { Check } from 'lucide-react'
import React, { useRef, useEffect } from 'react'
import { useMobileVideoPlayback } from '../hooks/useMobileVideoPlayback'

interface VideoContentSectionProps {
  title1: React.ReactNode
  subtitle1: React.ReactNode
  video1: string
  title2?: string
  subtitle2?: string
  video2?: string
  listItems?: string[] // Optional array of list items
  sectionId?: string
  backgroundClassName?: string;
  className?: string
  isLooped?: boolean

  // Custom classes
  media1ClassName?: string
  media2ClassName?: string
  media1WrapperClassName?: string
  bottomFade?: boolean // optional bottom fade overlay
}

const VideoContentSection: React.FC<VideoContentSectionProps> = ({
  title1,
  subtitle1,
  video1,
  title2,
  subtitle2,
  video2,
  listItems = [],
  isLooped = true,
  sectionId = 'video-content-section',
  className = '',
  backgroundClassName = 'bg-white', //default background
  media1ClassName = 'w-full max-w-[430px] max-h-[520px] object-contain',
  media2ClassName = 'w-full max-h-[520px] object-contain',
  media1WrapperClassName = '',
  bottomFade = false,
}) => {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  // Handle mobile video playback
  useMobileVideoPlayback(video1Ref)
  useMobileVideoPlayback(video2Ref)

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -100px 0px',
      threshold: 0.1,
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)
    if (video1Ref.current) observer.observe(video1Ref.current)
    if (video2Ref.current) observer.observe(video2Ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* First Section */}
      <section
        id={`${sectionId}-1`}
        className={`pt-28 px-4 sm:px-6 lg:px-8 min-h-min mb-6 ${backgroundClassName} ${className}`}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-left">
            <h2 className="text-6xl text-primary font-semibold mb-4 tracking-tight max-w-sm">
              {title1}
            </h2>
            <p className="text-xl text-primary/60 max-w-lg">{subtitle1}</p>

            {listItems.length > 0 && (
              <ul className="mt-6 space-y-1">
                {listItems.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-primary font-semibold mr-2">
                      <Check strokeWidth={3.3} size={18} />
                    </span>
                    <span className="text-base font-medium text-primary/80">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: Media */}
          <div className={`relative overflow-hidden flex justify-center items-start ${media1WrapperClassName}`}>
            {video1.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                ref={video1Ref}
                className={media1ClassName}
                muted
                loop={isLooped}
                autoPlay
                playsInline
                preload="metadata"
              >
                <source
                  src={video1}
                  type={
                    video1.endsWith('.webm')
                      ? 'video/webm'
                      : video1.endsWith('.ogg')
                      ? 'video/ogg'
                      : 'video/mp4'
                  }
                />
                Your browser does not support the video tag.
              </video>
            ) : video1.match(/\.(png|jpg|jpeg)$/i) ? (
              <img src={video1} className={media1ClassName} />
            ) : null}

            {/* Optional bottom fade overlay */}
            {bottomFade && (
              <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}
          </div>
        </div>
      </section>

      {/* Second Section (Optional) */}
      {video2 && (
        <section
          id={`${sectionId}-2`}
          className={`pt-12 md:pt-24 px-4 sm:px-6 lg:px-12 ${backgroundClassName} ${className}`}
        >
          <div className="max-w-3xl mx-auto text-center mb-5">
            <h3 className="text-3xl font-semibold text-primary mb-3">{title2}</h3>
            <p className="text-base text-primary/60 max-w-sm mx-auto">{subtitle2}</p>
          </div>

          <div className="flex justify-center">
            <div className="relative overflow-hidden">
              {video2.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  ref={video2Ref}
                  className={media2ClassName}
                  muted
                  loop={isLooped}
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <source
                    src={video2}
                    type={
                      video2.endsWith('.webm')
                        ? 'video/webm'
                        : video2.endsWith('.ogg')
                        ? 'video/ogg'
                        : 'video/mp4'
                    }
                  />
                  Your browser does not support the video tag.
                </video>
              ) : video2.match(/\.(png|jpg|jpeg)$/i) ? (
                <img src={video2} alt={title2} className={media2ClassName} />
              ) : null}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default VideoContentSection
