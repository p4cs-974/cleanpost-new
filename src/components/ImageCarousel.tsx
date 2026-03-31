import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { X, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";
import type { ImageFile } from "@/lib/types";

interface ImageCarouselProps {
  images: ImageFile[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onRemoveImage: (id: string) => void;
}

export default function ImageCarousel({
  images,
  activeIndex,
  onChangeIndex,
  onRemoveImage,
}: ImageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const haptic = useWebHaptics();
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showShine, setShowShine] = useState(false);
  const prevCleanedRef = useRef<boolean | undefined>(undefined);

  const activeImage = images[activeIndex];

  // Track cleaned state changes for shine effect
  useEffect(() => {
    const wasCleaned = prevCleanedRef.current;
    const isCleaned = activeImage?.cleaned;

    if (isCleaned && !wasCleaned) {
      setShowShine(true);
      const timer = setTimeout(() => setShowShine(false), 600);
      return () => clearTimeout(timer);
    }

    prevCleanedRef.current = isCleaned;
  }, [activeImage?.cleaned]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    if (info.offset.x > threshold && activeIndex > 0) {
      setDirection(-1);
      void haptic.trigger("light");
      onChangeIndex(activeIndex - 1);
    } else if (info.offset.x < -threshold && activeIndex < images.length - 1) {
      setDirection(1);
      void haptic.trigger("light");
      onChangeIndex(activeIndex + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      void haptic.trigger("light");
      onChangeIndex(index);
    }
  };

  const handleRemove = (id: string) => {
    void haptic.trigger("error");
    onRemoveImage(id);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeImage?.id || "empty"}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 800, damping: 35, mass: 0.5 },
              opacity: { duration: 0.08 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onAnimationComplete={() => {
              void haptic.trigger("light");
            }}
            className={cn("absolute inset-0 cursor-grab", isDragging ? "cursor-grabbing" : "")}
          >
            {activeImage?.isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeImage?.preview ? (
              <img
                src={activeImage.preview}
                alt={activeImage.file.name}
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No preview
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Shine Sweep Effect */}
        <AnimatePresence>
          {showShine && activeImage?.cleaned && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                mixBlendMode: "overlay",
              }}
            />
          )}
        </AnimatePresence>

        {/* Navigation Arrows (desktop only) */}
        {images.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: activeIndex > 0 ? 1.05 : 1 }}
              whileTap={{ scale: activeIndex > 0 ? 0.96 : 1 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              onClick={() => {
                if (activeIndex > 0) {
                  void haptic.trigger("light");
                  setDirection(-1);
                  onChangeIndex(activeIndex - 1);
                }
              }}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all hover:bg-background disabled:opacity-0 disabled:pointer-events-none hidden md:flex cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: activeIndex < images.length - 1 ? 1.05 : 1 }}
              whileTap={{ scale: activeIndex < images.length - 1 ? 0.96 : 1 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              onClick={() => {
                if (activeIndex < images.length - 1) {
                  void haptic.trigger("light");
                  setDirection(1);
                  onChangeIndex(activeIndex + 1);
                }
              }}
              disabled={activeIndex === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all hover:bg-background disabled:opacity-0 disabled:pointer-events-none hidden md:flex cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Cleaned Badge - Celebratory Pop */}
        <AnimatePresence mode="popLayout">
          {activeImage?.cleaned && (
            <motion.div
              initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="absolute top-4 left-4"
            >
              {/* Glow effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1.2, 1],
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute inset-0 rounded-full bg-green-400"
                style={{
                  boxShadow: "0 0 30px 10px rgba(34, 197, 94, 0.6)",
                }}
              />
              <div className="relative px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium flex items-center gap-1 shadow-lg">
                <Check className="w-4 h-4" />
                Cleaned
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide px-1">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all",
                index === activeIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100",
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              {image.preview ? (
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(image.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                style={{ opacity: 0.8 }}
              >
                <X className="w-3 h-3" />
              </button>

              {/* Cleaned Indicator on Thumbnail */}
              {image.cleaned && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Dots Indicator (mobile only) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
