export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        night: "#07111f",
        panel: "rgba(15, 23, 42, 0.72)",
        cyanGlow: "#22d3ee",
        mint: "#2dd4bf",
        amberSoft: "#fbbf24"
      },
      boxShadow: {
        glow: "0 0 36px rgba(34, 211, 238, 0.18)"
      }
    }
  },
  plugins: []
};
