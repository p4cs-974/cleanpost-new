import { motion } from "framer-motion";
import { Share2, Loader2 } from "lucide-react";

// Custom Broom icon since lucide-react doesn't have one
const BroomIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l-2 9h4l-2-9z" />
    <path d="M6 11h12l-1 3H7l-1-3z" />
    <path d="M8 14l-2 8h12l-2-8" />
  </svg>
);
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  onClean: () => void;
  onShare: () => void;
  isCleaning: boolean;
  isSharing: boolean;
  canClean: boolean;
  cleanedCount: number;
  totalCount: number;
}

export default function ActionBar({
  onClean,
  onShare,
  isCleaning,
  isSharing,
  canClean,
  cleanedCount,
  totalCount,
}: ActionBarProps) {
  const haptic = useWebHaptics();

  const handleClean = () => {
    void haptic.trigger("warning");
    onClean();
  };

  const handleShare = () => {
    void haptic.trigger("success");
    onShare();
  };

  const allCleaned = cleanedCount === totalCount;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 p-4 z-50"
    >
      <div className="max-w-sm mx-auto">
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 p-2 flex items-center gap-2">
          {/* Clean Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onClick={handleClean}
            disabled={isCleaning || !canClean || allCleaned}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
              allCleaned
                ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                : isCleaning || !canClean
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isCleaning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cleaning...</span>
              </>
            ) : allCleaned ? (
              <>
                <BroomIcon className="w-4 h-4" />
                <span>All Clean</span>
              </>
            ) : (
              <>
                <BroomIcon className="w-4 h-4" />
                <span>Clean</span>
              </>
            )}
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onClick={handleShare}
            disabled={isSharing || isCleaning}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
              isSharing || isCleaning
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Post</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Progress indicator */}
        {cleanedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center text-xs text-muted-foreground"
          >
            {cleanedCount} of {totalCount} images cleaned
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
