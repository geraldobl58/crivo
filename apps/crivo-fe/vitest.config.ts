import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        inline: ["react", "react-dom", "@testing-library/react"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/components/**"],
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "react/jsx-dev-runtime": path.resolve(
        __dirname,
        "../../node_modules/react/jsx-dev-runtime.js",
      ),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "../../node_modules/react/jsx-runtime.js",
      ),
      "react-dom/client": path.resolve(
        __dirname,
        "../../node_modules/react-dom/client.js",
      ),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
      react: path.resolve(__dirname, "../../node_modules/react"),
      "@": path.resolve(__dirname, "./src"),
      "next/link": path.resolve(
        __dirname,
        "./src/test/__mocks__/next-link.tsx",
      ),
      "next/navigation": path.resolve(
        __dirname,
        "./src/test/__mocks__/next-navigation.ts",
      ),
    },
  },
});
