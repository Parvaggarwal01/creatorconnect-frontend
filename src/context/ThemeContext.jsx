import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext(null);

// Function to get initial theme
const getInitialTheme = () => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    return storedTheme;
  }

  // Check system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setLightTheme = () => {
    setTheme("light");
    localStorage.setItem("theme", "light");
  };

  const setDarkTheme = () => {
    setTheme("dark");
    localStorage.setItem("theme", "dark");
  };

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
