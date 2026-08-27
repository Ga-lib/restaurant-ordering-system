import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle light/dark theme"
      className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
      )}
    </button>
  );
}

export default ThemeToggle;