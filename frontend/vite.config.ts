import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 3000,
    // Il frontend chiama sempre /api/* relativo: in sviluppo viene inoltrato al backend FastAPI.
    proxy: {
      "/api": { target: "http://localhost:8001", changeOrigin: true },
    },
  },
});
