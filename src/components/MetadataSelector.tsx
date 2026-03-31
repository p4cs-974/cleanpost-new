import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";
import type { MetadataSelection } from "@/lib/types";

interface MetadataSelectorProps {
  selection: MetadataSelection;
  onChange: (selection: MetadataSelection) => void;
  onApply: () => void;
  isProcessing: boolean;
}

const options: { key: keyof MetadataSelection; label: string; description: string }[] = [
  { key: "gps", label: "GPS Location", description: "Remove coordinates and location data" },
  { key: "camera", label: "Camera Info", description: "Remove make, model, lens, and settings" },
  { key: "datetime", label: "Date & Time", description: "Remove timestamps" },
];

export default function MetadataSelector({
  selection,
  onChange,
  onApply,
  isProcessing,
}: MetadataSelectorProps) {
  const haptic = useWebHaptics();

  const handleToggle = (key: keyof MetadataSelection) => {
    void haptic.trigger("selection");
    if (key === "all") {
      onChange({
        gps: !selection.all,
        camera: !selection.all,
        datetime: !selection.all,
        all: !selection.all,
      });
    } else {
      const newSelection = {
        ...selection,
        [key]: !selection[key],
        all: false,
      };
      if (newSelection.gps && newSelection.camera && newSelection.datetime) {
        newSelection.all = true;
      }
      onChange(newSelection);
    }
  };

  const hasSelection = selection.gps || selection.camera || selection.datetime || selection.all;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-border bg-muted/30"
    >
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Select metadata to remove:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((option) => (
            <motion.button
              key={option.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              onClick={() => handleToggle(option.key)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors text-left",
                selection[option.key]
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  selection[option.key]
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {selection[option.key] && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onClick={() => handleToggle("all")}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors text-left sm:col-span-2",
              selection.all
                ? "border-destructive bg-destructive/10"
                : "border-border hover:border-destructive/50",
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                selection.all
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-border",
              )}
            >
              {selection.all && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-destructive">All Metadata</p>
              <p className="text-xs text-muted-foreground">Remove everything</p>
            </div>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: hasSelection && !isProcessing ? 1.02 : 1 }}
          whileTap={{ scale: hasSelection && !isProcessing ? 0.96 : 1 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          onClick={onApply}
          disabled={!hasSelection || isProcessing}
          className={cn(
            "w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
            hasSelection && !isProcessing
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Remove Selected"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
