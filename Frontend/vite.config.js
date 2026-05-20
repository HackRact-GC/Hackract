import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.message.includes("is dynamically imported by") ||
          warning.message.includes("Some chunks are larger than")
        ) {
          return;
        }

        warn(warning);
      },
    },
  },
});
