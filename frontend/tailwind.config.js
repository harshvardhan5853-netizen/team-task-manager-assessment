/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      boxShadow: { glass: "0 20px 60px rgba(0,0,0,.28)" },
      keyframes: {
        shimmer: { "0%": { left: "-100%" }, "100%": { left: "100%" } }
      },
      animation: { shimmer: "shimmer 1.5s infinite" }
    }
  },
  plugins: []
};
