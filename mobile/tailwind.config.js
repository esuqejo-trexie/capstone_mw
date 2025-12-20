/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fredoka", "sans-serif"],
        "sans-light": ["Fredoka-Light", "sans-serif"],
        "sans-regular": ["Fredoka-Regular", "sans-serif"],
        "sans-medium": ["Fredoka-Medium", "sans-serif"],
        "sans-semibold": ["Fredoka-SemiBold", "sans-serif"],
        "sans-bold": ["Fredoka-Bold", "sans-serif"],
      },
      colors: {
        primary: "#FF6E61",
        secondary: "#FF3D67",
        txt_blue: "#007AFF",
      },
    },
  },
  plugins: [],
};
