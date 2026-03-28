import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Die Zeile "import path..." wurde gelöscht

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // Der Pfad funktioniert auch ohne das 'path' Modul wunderbar als String
    outDir: "../scripts",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `prozess-grafik.js`,
        chunkFileNames: `prozess-grafik.js`,
        assetFileNames: `prozess-grafik.[ext]`,
      },
    },
  },
});
