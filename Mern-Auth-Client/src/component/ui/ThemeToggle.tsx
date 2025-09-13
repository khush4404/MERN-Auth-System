import { useState, useRef, useEffect } from "react";
import { useThemeStore } from "../../store/themeStore";
import Icon from "../../utils/Icon";

const themeOptions = [
    {
        value: "light",
        label: "Light",
        icon: (
            <Icon icon="light" className="h-5 w-5 flex items-center justify-center" fill="currentColor" />
        ),
    },
    {
        value: "dark",
        label: "Dark",
        icon: (
            <Icon icon="dark" className="h-5 w-5 flex items-center justify-center" fill="currentColor" />
        ),
    },
    {
        value: "system",
        label: "System",
        icon: (
            <Icon icon="system" className="h-5 w-5 flex items-center justify-center" fill="currentColor" />
        ),
    },
];

const ThemeToggle = () => {
    const mode = useThemeStore((s) => s.mode);
    const setMode = useThemeStore((s) => s.setMode);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const current =
        themeOptions.find((opt) => opt.value === mode) || themeOptions[2];

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                className="flex items-center justify-center w-10 h-10 rounded-[6px] border border-btnGrFromLight dark:border-darkBorder text-yellow-500 dark:text-blue-200 shadow-md focus:ring-2 dark:focus:ring-blue-400 focus:ring-textGrayMedium transition-colors duration-200 bg-gradient-to-r from-btnGrFromLight to-btnGrToLight hover:from-btnGrFromLightHover hover:to-btnGrToLight dark:from-btnGrFrom dark:to-btnGrTo dark:hover:from-btnGrFromHover dark:hover:to-primary"
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle theme"
                type="button"
            >
                {current.icon}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-40 dark:bg-darkBorder bg-bgLight border dark:border-darkBorder border-btnGrToLight rounded-lg shadow-lg z-50">
                    {themeOptions.map((opt) => (
                        <button
                            key={opt.value}
                            className={`flex items-center w-full px-4 py-2 gap-2 dark:text-blue-200 hover:bg-btnGrFromLight dark:hover:bg-primaryBg transition-colors duration-150 ${mode === opt.value ? "font-bold" : ""
                                }`}
                            onClick={() => {
                                setMode(opt.value as "light" | "dark" | "system");
                                setOpen(false);
                            }}
                            type="button"
                        >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
