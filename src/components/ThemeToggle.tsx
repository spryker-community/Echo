import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-5 h-5">
          <Sun 
            className="absolute inset-0 transform transition-all duration-200"
            style={{
              opacity: theme === 'dark' ? 0 : 1,
              visibility: theme === 'dark' ? 'hidden' : 'visible'
            }}
          />
          <Moon 
            className="absolute inset-0 transform transition-all duration-200"
            style={{
              opacity: theme === 'dark' ? 1 : 0,
              visibility: theme === 'dark' ? 'visible' : 'hidden'
            }}
          />
        </div>
      </div>
    </button>
  )
}
