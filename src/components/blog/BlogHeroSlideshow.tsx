"use client"

import * as React from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react"

interface BlogHeroSlideshowProps {
    images: string[]
    title: string
}

function SafeImage({ src, title, priorities, className }: { src: string, title: string, priorities: boolean, className?: string }) {
    const [error, setError] = React.useState(false)

    if (error) {
        return (
            <div className={cn("flex items-center justify-center w-full h-full bg-zinc-900 border border-white/5", className)}>
                <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <ImageOff className="w-8 h-8" />
                    <span className="text-xs">Image unavailable</span>
                </div>
            </div>
        )
    }

    // Using standard img tag to support URLs from any domain without next.config.js restrictions
    // eslint-disable-next-line @next/next/no-img-element
    return (
        <Image
            src={src}
            alt={title}
            fill
            className={cn("object-contain", className)}
            onError={() => setError(true)}
            priority={priorities}
            sizes="(max-width: 768px) 100vw, 1200px"
        />
    )
}

export function BlogHeroSlideshow({ images, title }: BlogHeroSlideshowProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: true })
    ])
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    React.useEffect(() => {
        if (!emblaApi) return
        onSelect()
        setScrollSnaps(emblaApi.scrollSnapList())
        emblaApi.on("select", onSelect)

        return () => {
            emblaApi.off("select", onSelect)
        }
    }, [emblaApi, onSelect])

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    // If there's only one image, or no images, handle gracefully
    const safeImages = images.length > 0 ? images : []

    if (safeImages.length <= 1) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/10 group">
                {safeImages[0] ? (
                    <SafeImage
                        src={safeImages[0]}
                        title={title}
                        priorities={true}
                        className="object-contain"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-zinc-700 text-4xl">📄</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 group">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {safeImages.map((src, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0" key={index}>
                            <div className="relative aspect-video w-full overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {selectedIndex === index && (
                                        <motion.div
                                            className="w-full h-full relative"
                                        >
                                            <SafeImage
                                                src={src}
                                                title={`${title} - Slide ${index + 1}`}
                                                priorities={index === 0}
                                                className="object-contain"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Static background to prevent flicker during transitions */}
                                <div className="absolute inset-0 -z-10">
                                    <SafeImage
                                        src={src}
                                        title=""
                                        priorities={false}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 flex items-center justify-start p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={scrollPrev}
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={scrollNext}
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Pagination / Indicators */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === selectedIndex
                                ? "w-8 bg-brand"
                                : "w-1.5 bg-white/50 hover:bg-white/70"
                        )}
                        onClick={() => emblaApi?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
