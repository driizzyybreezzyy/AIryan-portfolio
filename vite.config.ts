import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js is split into its own lazy chunk loaded only when the 3D card
    // mounts, so the large-chunk warning isn't meaningful here.
    chunkSizeWarningLimit: 900,
  },
});
