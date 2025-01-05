/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/theme");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(alert|button|ripple|spinner|scroll-shadow).js",
  ],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      //background: "#FAFBFD",
      background: "#222222",
    }),
    extend: {
      colors: {
        primary: "#4919FF",
        primaryLight: "#9981FF",
        alert: "#FF493E",
        progress: "#F9CB28",
        "customGray-50": "#EEEEEE",
        "customGray-100": "#8E8E8E",
        "customGray-150": "#827F7F",
        "customGray-200": "#5D5D5D",
        "customGray-300": "#414141",
        "customGray-400": "#333333",
        "customGray-500": "#2C2C2C",
        "customGray-600": "#2A2A2A",
        "customGray-700": "#262626",
        "customGray-800": "#222222",
        "customGray-900": "#202020",
      },
      fontFamily: {
        sans: ['"Matter", sans-serif'],
      },
      borderWidth: {
        0.5: "0.5px",
      },
      height: {
        84: "21rem",
      },
      animation: {
        "pulse-strong": "pulse-strong 1s infinite",
      },
      keyframes: {
        "pulse-strong": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
