import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import DropZone from "./components/DropZone";
import ImageCard from "./components/ImageCard";
import ImageCarousel from "./components/ImageCarousel";
import ActionBar from "./components/ActionBar";
import ThemeToggle from "./components/ThemeToggle";
import { generateId, isFileSupported } from "./lib/utils";
import { processImage, removeExif } from "./lib/exif";
import type { ImageFile } from "./lib/types";

// Toast notification component
interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
        toast.type === "success"
          ? "bg-green-500 text-white"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{toast.message}</span>
      <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show toast notification
  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Handle file drops - treat as array
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(isFileSupported);

    if (validFiles.length === 0) return;

    const newImages: ImageFile[] = validFiles.map((file) => ({
      id: generateId(),
      file,
      preview: "",
      isLoading: true,
      hasGps: false,
    }));

    setImages((prev) => {
      const updated = [...prev, ...newImages];
      // If first images, set active index to first new image
      if (prev.length === 0) {
        setActiveIndex(0);
      }
      return updated;
    });

    // Process each image in parallel
    await Promise.all(
      newImages.map(async (img) => {
        const processed = await processImage(img.file);
        setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, ...processed } : p)));
      }),
    );
  }, []);

  // Remove single image
  const handleRemoveImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const index = prev.findIndex((img) => img.id === id);
        const filtered = prev.filter((img) => img.id !== id);

        // Adjust active index if needed
        if (filtered.length === 0) {
          setActiveIndex(0);
        } else if (index <= activeIndex && activeIndex > 0) {
          setActiveIndex((idx) => Math.min(idx, filtered.length - 1));
        }

        return filtered;
      });
    },
    [activeIndex],
  );

  // Clean ALL images at once
  const handleCleanAll = useCallback(async () => {
    if (images.length === 0) return;

    setIsCleaning(true);
    const uncleanedImages = images.filter((img) => !img.cleaned);

    if (uncleanedImages.length === 0) {
      showToast("All images are already cleaned!", "success");
      setIsCleaning(false);
      return;
    }

    try {
      // Clean all uncleaned images
      await Promise.all(
        uncleanedImages.map(async (img) => {
          const cleanedFile = await removeExif(img.file, {
            removeGps: true,
            removeCamera: true,
            removeDateTime: true,
            removeAll: true,
          });

          setImages((prev) =>
            prev.map((p) => (p.id === img.id ? { ...p, cleaned: true, cleanedFile } : p)),
          );
        }),
      );

      showToast(
        `${uncleanedImages.length} image${
          uncleanedImages.length > 1 ? "s" : ""
        } cleaned successfully!`,
        "success",
      );
    } catch (error) {
      console.error("Error cleaning images:", error);
      showToast("Failed to clean some images", "error");
    } finally {
      setIsCleaning(false);
    }
  }, [images, showToast]);

  // Share ALL cleaned images (or original if not cleaned)
  const handleShareAll = useCallback(async () => {
    if (images.length === 0) return;

    setIsSharing(true);

    try {
      const filesToShare = images.map((img) => img.cleanedFile || img.file);

      // Try native share first (mobile)
      if (navigator.share && navigator.canShare?.({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
          title: "Cleaned Photos",
        });
        showToast("Images shared successfully!", "success");
      } else {
        // Fallback: download all files
        filesToShare.forEach((file, index) => {
          setTimeout(() => {
            const url = URL.createObjectURL(file);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, index * 200);
        });
        showToast(
          `${filesToShare.length} image${filesToShare.length > 1 ? "s" : ""} downloaded`,
          "success",
        );
      }
    } catch (error) {
      // User cancelled share
      if ((error as Error).name === "AbortError") {
        // Silent - user cancelled
      } else {
        console.error("Error sharing:", error);
        showToast("Failed to share images", "error");
      }
    } finally {
      setIsSharing(false);
    }
  }, [images, showToast]);

  // Computed values
  const activeImage = images[activeIndex];
  const canClean = images.some((img) => !img.cleaned);
  const cleanedCount = images.filter((img) => img.cleaned).length;

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-4xl pb-32">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-12"
          >
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">CleanPost</h1>
            <p className="text-muted-foreground">View and remove EXIF metadata from your photos</p>
          </motion.header>

          <DropZone onFiles={handleFiles} />

          <AnimatePresence mode="popLayout">
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 space-y-4"
              >
                {/* Image Carousel */}
                <ImageCarousel
                  images={images}
                  activeIndex={activeIndex}
                  onChangeIndex={setActiveIndex}
                  onRemoveImage={handleRemoveImage}
                />

                {/* Metadata Card */}
                {activeImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                  >
                    <ImageCard image={activeImage} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center text-sm text-muted-foreground"
          >
            <p>100% client-side processing. Your photos never leave your device.</p>
          </motion.footer>
        </div>

        {/* Floating Action Bar */}
        <AnimatePresence>
          {images.length > 0 && (
            <ActionBar
              onClean={handleCleanAll}
              onShare={handleShareAll}
              isCleaning={isCleaning}
              isSharing={isSharing}
              canClean={canClean}
              cleanedCount={cleanedCount}
              totalCount={images.length}
            />
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast
                  toast={toast}
                  onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
