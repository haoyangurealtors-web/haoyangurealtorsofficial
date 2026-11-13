import fs from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { devChatApi } from "./dev-chat-bridge.js";

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
  "theme-init.js",
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

export default defineConfig(({ mode }) => {
  // Every name in .env (not only the VITE_ ones) is read here, for the dev-only chat bridge. Only VITE_ names ever reach the website itself.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), copyTopLevelFiles(), devChatApi(env)],
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
  };
});
