import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Files that must sit at the very top of the finished site (icons, security headers, address rules).
const topLevelFiles = [
  "_headers",
  "_redirects",
  "favicon.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "og-image.jpg",
  "site.webmanifest",
  "_worker.js",
  "_routes.json",
];

function copyTopLevelFiles() {
  return {
    name: "copy-top-level-files",
    closeBundle() {
      fs.mkdirSync("dist", { recursive: true });
      topLevelFiles.forEach((file) => {
        if (fs.existsSync(file)) fs.copyFileSync(file, `dist/${file}`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyTopLevelFiles()],
  build: {
    target: "es2019",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
