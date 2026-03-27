import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // WICHTIG: Erlaubt das Laden von überall
  build: {
    rollupOptions: {
      output: {
        // Feste Namen statt kryptischer Codes
        entryFileNames: `assets/prozess-grafik.js`,
        chunkFileNames: `assets/prozess-grafik.js`,
        assetFileNames: `assets/prozess-grafik.[ext]`,
      },
    },
  },
});
