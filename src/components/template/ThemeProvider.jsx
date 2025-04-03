"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => null,
})

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light")

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light"
        setTheme(storedTheme)
    }, [])

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const value = {
        theme,
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

