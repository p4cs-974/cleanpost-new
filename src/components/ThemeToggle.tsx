import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const haptic = useWebHaptics();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />;
  }

  const themes = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  const handleThemeChange = (key: string) => {
    void haptic.trigger("selection");
    setTheme(key);
  };

  return (
    <div className="hidden md:flex items-center gap-1 p-1 bg-muted rounded-lg">
      {themes.map(({ key, icon: Icon, label }) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          onClick={() => handleThemeChange(key)}
          className={cn(
            "relative w-10 h-10 flex items-center justify-center rounded-md transition-colors",
            theme === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </motion.button>
      ))}
    </div>
  );
}
