import path from "path"
import tailwindcss from "@tailwindcss/vite" // Import from the new package
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()], // Use the plugin
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})