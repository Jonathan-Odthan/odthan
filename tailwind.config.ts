import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "odthan-black": "#000000",
        "odthan-red": "#FF1F2D",
        "odthan-white": "#FFFFFF",
        "odthan-gray": "#F5F5F5",
        "odthan-dark": "#111111",
        "odthan-dark-2": "#181818",
        "odthan-accent": "#D6249F",
      },
      borderRadius: {
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
