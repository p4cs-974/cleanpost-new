import { motion } from "framer-motion";
import { MapPin, Camera, Calendar, Settings, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import {
  formatDate,
  formatGpsCoord,
  formatIso,
  formatAperture,
  formatExposureTime,
  formatFocalLength,
} from "@/lib/utils";
import type { ImageFile } from "@/lib/types";
import MapView from "./MapView";

interface ImageCardProps {
  image: ImageFile;
}

export default function ImageCard({ image }: ImageCardProps) {
  const exif = image.exif;
  const hasMetadata = exif && Object.keys(exif).length > 0;

  if (image.isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (image.error) {
    return <div className="p-8 text-center text-destructive">{image.error}</div>;
  }

  if (!hasMetadata && !image.cleaned) {
    return (
      <div className="p-8 text-center text-muted-foreground">No metadata found in this image</div>
    );
  }

  // Show clean state when image is cleaned
  if (image.cleaned) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="p-8 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: "easeOut",
            }}
          >
            <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </motion.div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Metadata Removed</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            All EXIF data has been cleaned from this image
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            No GPS
          </span>
          <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            No Camera Info
          </span>
          <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            No Timestamps
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="p-4 space-y-4"
    >
      {exif?.latitude !== undefined && exif?.longitude !== undefined && (
        <motion.div
          initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
          transition={{ duration: 0.3, delay: 0, ease: [0.25, 1, 0.5, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="w-4 h-4" />
            Location
          </div>
          <MapView latitude={exif.latitude} longitude={exif.longitude} />
          <p className="text-sm text-muted-foreground">
            {formatGpsCoord(exif.latitude, exif.longitude)}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(exif?.Make || exif?.Model) && (
          <motion.div
            initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Camera className="w-4 h-4" />
              Camera
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {exif.Make && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Make:</span> {exif.Make}
                </p>
              )}
              {exif.Model && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Model:</span> {exif.Model}
                </p>
              )}
              {exif.LensModel && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Lens:</span> {exif.LensModel}
                </p>
              )}
              {exif.Software && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Software:</span> {exif.Software}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {(exif?.DateTimeOriginal || exif?.CreateDate) && (
          <motion.div
            initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.16, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Date & Time
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {exif.DateTimeOriginal && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Taken:</span>{" "}
                  {formatDate(exif.DateTimeOriginal)}
                </p>
              )}
              {exif.CreateDate && !exif.DateTimeOriginal && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {formatDate(exif.CreateDate)}
                </p>
              )}
              {exif.ModifyDate && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Modified:</span>{" "}
                  {formatDate(exif.ModifyDate)}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {(exif?.ISO || exif?.FNumber || exif?.ExposureTime || exif?.FocalLength) && (
          <motion.div
            initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.24, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Settings className="w-4 h-4" />
              Settings
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex flex-wrap gap-3 text-sm">
                {exif.ISO && <span>{formatIso(exif.ISO)}</span>}
                {exif.FNumber && <span>{formatAperture(exif.FNumber)}</span>}
                {exif.ExposureTime && <span>{formatExposureTime(exif.ExposureTime)}</span>}
                {exif.FocalLength && <span>{formatFocalLength(exif.FocalLength)}</span>}
              </div>
            </div>
          </motion.div>
        )}

        {(exif?.ImageWidth || exif?.ImageHeight) && (
          <motion.div
            initial={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 100, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.32, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Camera className="w-4 h-4" />
              Dimensions
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                {exif.ImageWidth} × {exif.ImageHeight} px
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
