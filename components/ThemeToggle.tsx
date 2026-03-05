"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // Load system/localStorage preference on mount
    useEffect(() => {
        const stored = localStorage.getItem("skillhire-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = stored === "dark" || (!stored && prefersDark);
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("skillhire-theme", next ? "dark" : "light");
    };

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all outline-none focus:outline-none focus-visible:outline-none"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
