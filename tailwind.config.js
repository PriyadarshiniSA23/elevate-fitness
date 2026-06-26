/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#131313",
        surface: "#131313",
        primary: "#F5F1EA", // Premium eggshell white
        secondary: "#c9c6c0",
        tertiary: "#e9c349", // Luxury gold
        "tertiary-gold": "#D4AF37", // Muted gold for dashboard
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1b1c1c",
        "surface-container": "#1f2020",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353535",
        "on-surface": "#e4e2e1",
        "on-surface-variant": "#c4c7c7",
        "on-primary-container": "#949393",
        "on-primary": "#303030",
        "outline-variant": "#444748",
        "outline": "#8e9192",
        "error": "#ffb4ab",
        "error-container": "#93000a"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "margin-desktop": "64px",
        "gutter": "24px",
        "stack-md": "24px",
        "container-max": "1280px",
        "stack-lg": "48px",
        "stack-sm": "12px",
        "unit": "8px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        "body-lg": ["Inter"],
        "label-caps": ["Inter"],
        "display-lg": ["Playfair Display"],
        "display-lg-mobile": ["Playfair Display"],
        "headline-md": ["Playfair Display"],
        "headline-sm": ["Playfair Display"],
        "body-md": ["Inter"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
