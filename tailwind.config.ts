import type { Config } from "tailwindcss";

// Semantic colors only — the values live as CSS variables in src/app/globals.css.
// Screens never hardcode hex values; they use these names.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        surface: "var(--color-surface)",
        ink: {
          DEFAULT: "var(--color-ink)",
          secondary: "var(--color-ink-secondary)",
          muted: "var(--color-ink-muted)",
        },
        edge: {
          DEFAULT: "var(--color-edge)",
          strong: "var(--color-edge-strong)",
        },
        leaf: {
          DEFAULT: "var(--color-leaf)",
          strong: "var(--color-leaf-strong)",
          soft: "var(--color-leaf-soft)",
          deep: "var(--color-leaf-deep)",
        },
        coral: {
          DEFAULT: "var(--color-coral)",
          strong: "var(--color-coral-strong)",
          soft: "var(--color-coral-soft)",
          deep: "var(--color-coral-deep)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-soft)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          soft: "var(--color-info-soft)",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Annotation Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
        handwritten: ["Annotation Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      borderRadius: {
        control: "1rem",
        cozy: "1.5rem",
      },
      boxShadow: {
        soft: "0 12px 36px -24px rgb(75 58 38 / 45%), 0 3px 12px -8px rgb(75 58 38 / 22%)",
      },
      animation: {
        rise: "rise 240ms ease-out both",
        "card-reveal": "card-reveal 200ms ease-out both",
        "soft-pulse": "soft-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
