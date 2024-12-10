import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                text-gray-500 hover:text-[#EC008C] 
                dark:text-gray-400 dark:hover:text-[#EC008C] 
                hover:bg-gray-100/50 dark:hover:bg-gray-800/50
                transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4 transition-colors duration-200" />
      ) : (
        <Sun className="h-4 w-4 transition-colors duration-200" />
      )}
    </button>
  )
}
