import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "550px",
        "sm-plus": "700px",
      },
      fontFamily: {
        "twitter-chirp": ["TwitterChirp", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      minWidth: {
        content: "600px",
      },
      colors: {
        like: "#f91880",
        gray: "#6E767D",
        backdrop: "rgba(91, 112, 131, 0.4)",
        ring: "#8ECDF8",
        primary: {
          DEFAULT: "#1D9BF0",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D9D9D9",
          lighter: "#eff3f4",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#202327",
          foreground: "#6E767D",
        },
        hover: {
          DEFAULT: "#161616",
          tooltip: "#425566",
        },
        border: {
          DEFAULT: "#2F3336",
          circle: "#536471",
        },
      },
      boxShadow: {
        normal: "0 0 15px rgba(255,255,255,0.2)",
        repost:
          "rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
export default config;
