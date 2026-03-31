import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, ImagePlus } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const haptic = useWebHaptics();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0) {
        void haptic.trigger("medium");
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles, haptic],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        void haptic.trigger("medium");
        onFiles(e.target.files);
        e.target.value = "";
      }
    },
    [onFiles, haptic],
  );

  const handleClick = useCallback(() => {
    void haptic.trigger("light");
    inputRef.current?.click();
  }, [haptic]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300",
        "hover:border-primary/50 hover:bg-muted/50",
        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-background",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {isDragging ? (
            <ImagePlus className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </motion.div>

        <motion.h3
          animate={isDragging ? { opacity: 0 } : { opacity: 1 }}
          className="text-lg font-semibold mb-1"
        >
          Drop your photos here
        </motion.h3>

        <motion.p
          animate={isDragging ? { opacity: 0 } : { opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          or click to browse
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-muted-foreground/60 mt-3"
        >
          JPEG, PNG, WebP, HEIC supported
        </motion.p>
      </div>

      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-2xl pointer-events-none"
        >
          <span className="text-lg font-medium text-primary">Release to add photos</span>
        </motion.div>
      )}
    </motion.div>
  );
}
