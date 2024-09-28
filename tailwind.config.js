/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: {
      "2xs": "300px",
      xs: "350px",
      sm: "400px",
      md: "500px",
      lg: "550px",
    },
    extend: {
      animation: { "inverse-bounce": "hiThere 0.5s infinite" },

      keyframes: {
        hiThere: {
          "0%": { transform: "scale(0.6) rotate(-180deg)" },
          "40%": {
            transform: "translateX(-100%) rotate(-180deg)",
            animationTimingFunction: "linear",
          },

          "70%": {
            transform: "translateX(30%) rotate(54deg)",
            animationTimingFunction: "linear",
          },
          "90%": {
            transform: "translateX(0%) rotate(0deg)",
          },
          "100%": {
            transform: "translateX(0%) rotate(0deg)",
          },
        },
      },
      transitionProperty: {
        height: "height",
        "max-height": "max-height",
      },
      colors: {
        mirage: {
          50: "#f4f5f9",
          100: "#eaedf5",
          200: "#dde1ee",
          300: "#c1c8e0",
          400: "#898fa7",
          500: "#6a708d",
          600: "#555974",
          700: "#464a5e",
          800: "#3d4051",
          900: "#2d3143",
          940: "#24283b",
          950: "#222639",
        },
        stat: {
          light: {
            health: "rgb(212, 110, 111)",
            temp: "rgb(156, 172, 130)",
            armor: "rgb(150, 169, 206)",
          },
          dark: {
            health: "rgba(255, 0, 0, 0.4)",
            temp: "rgba(106, 142, 35, 0.4)",
            armor: "rgba(100, 148, 237, 0.4)",
          },
        },
        default: {
          DEFAULT: "#dde1ee",
          dark: "#1c212e",
        },
        paper: {
          DEFAULT: "#f1f3f9",
          dark: "#3d4051",
        },
        text: {
          primary: {
            DEFAULT: "rgba(0, 0, 0, 0.87)",
            dark: "rgb(255, 255, 255)",
          },
          secondary: {
            DEFAULT: "rgba(0, 0, 0, 0.6)",
            dark: "rgb(255, 255, 255, 0.7)",
          },
          disabled: {
            DEFAULT: "rgba(0, 0, 0, 0.38)",
            dark: "rgb(255, 255, 255, 0.5)",
          },
        },
        primary: {
          DEFAULT: "#9966ff",
          dark: "#bb99ff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
};
