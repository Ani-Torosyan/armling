import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // Enables dark mode using the "class" strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Include files in the "pages" directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Include files in the "components" directory
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Include files in the "app" directory
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
        customDark: "#261f1b",
        custom: "#fffdf8",
        customShade: "#74665c",
        customMid: "#f8eee5",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)", // Large border radius
        md: "calc(var(--radius) - 2px)", // Medium border radius
        sm: "calc(var(--radius) - 4px)", // Small border radius
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Plugin for animation utilities
  ],
};

export default config;
