/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b", // Zinc 950
                foreground: "#fafafa", // Zinc 50
                primary: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#10b981", // Emerald 500
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#f59e0b", // Amber 500
                    foreground: "#ffffff",
                },
                card: {
                    DEFAULT: "#18181b", // Zinc 900
                    foreground: "#fafafa",
                },
                muted: {
                    DEFAULT: "#27272a", // Zinc 800
                    foreground: "#a1a1aa", // Zinc 400
                },
                border: "#27272a", // Zinc 800
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
}
