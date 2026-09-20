import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

// Key lưu trong localStorage
const THEME_STORAGE_KEY = "app_theme";

// Hàm đọc theme ưu tiên: 1. localStorage của user -> 2. Hệ thống (prefers-color-scheme) -> 3. Mặc định light
const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
        // localStorage không khả dụng
    }

    if (typeof window !== "undefined" && window.matchMedia) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return systemPrefersDark ? "dark" : "light";
    }

    return "light";
};

const ThemeContext = createContext({
    theme: "light",
    isDark: false,
    toggleTheme: () => {},
    setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    // Khi theme thay đổi -> lưu vào localStorage + áp class data-theme lên thẻ <html>
    useEffect(() => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            // bỏ qua nếu localStorage không khả dụng
        }

        const root = document.documentElement;
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === "dark",
            toggleTheme,
            setTheme,
        }),
        [theme, toggleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;

