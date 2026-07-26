/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
          dark: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        card: "#F4F4F5",
        foreground: "#1E293B",
      },
    },
  },
  plugins: [],
};
