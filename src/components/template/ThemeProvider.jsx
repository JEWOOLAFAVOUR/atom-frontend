import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
    theme: "light",
    setTheme: (theme) => null,
})

export const ThemeProvider = ({ children }) => {
    // Initialize with undefined to avoid hydration mismatch
    const [theme, setTheme] = useState(undefined)

    // Load theme from localStorage only after component mounts (client-side)
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light"
        setTheme(storedTheme)
    }, [])

    // Apply theme to document and save to localStorage
    useEffect(() => {
        // Skip if theme is undefined (initial server render)
        if (theme === undefined) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    // Provide a default theme for server-side rendering
    const value = {
        theme: theme || "light",
        setTheme: (newTheme) => setTheme(newTheme),
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
