import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: the client dev server (5173) forwards API/upload requests to the
// Express server (4000) so cookies work same-site in development without CORS
// gymnastics — mirrors how the single Docker container serves both in
// production (docs/phase6-design.md §1).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
