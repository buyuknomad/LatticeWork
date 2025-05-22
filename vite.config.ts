import path from "path"
import tailwindcss from "@tailwindcss/vite" // Ensure this line is present
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()], // Ensure tailwindcss() is included here
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})