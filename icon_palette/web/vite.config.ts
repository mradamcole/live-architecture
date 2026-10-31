import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsRoot = path.resolve(__dirname, "../../assets/icons");

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".xml": "application/xml",
  ".md": "text/markdown; charset=utf-8",
};

function serveIconsMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const url = req.url?.split("?")[0] ?? "";
  if (!url || url.includes("..")) {
    next();
    return;
  }
  const filePath = path.join(iconsRoot, decodeURIComponent(url));
  if (!filePath.startsWith(iconsRoot)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      next();
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");
    fs.createReadStream(filePath).pipe(res);
  });
}

function serveIconsPlugin(): Plugin {
  return {
    name: "serve-icons",
    configureServer(server) {
      server.middlewares.use("/icons", serveIconsMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/icons", serveIconsMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), serveIconsPlugin()],
  resolve: {
    // Prevent nested copies under shared/motion from breaking React context.
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@icon-selector",
        replacement: path.resolve(__dirname, "src/components/icon-selector"),
      },
      {
        find: /^@live-architecture\/motion$/,
        replacement: path.resolve(
          __dirname,
          "../../shared/motion/src/index.ts",
        ),
      },
      {
        find: /^@live-architecture\/motion\/tokens\.css$/,
        replacement: path.resolve(
          __dirname,
          "../../shared/motion/src/css/tokens.css",
        ),
      },
      {
        find: /^react$/,
        replacement: path.resolve(__dirname, "node_modules/react"),
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(__dirname, "node_modules/react-dom"),
      },
      {
        find: /^react\/jsx-runtime$/,
        replacement: path.resolve(
          __dirname,
          "node_modules/react/jsx-runtime.js",
        ),
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: path.resolve(
          __dirname,
          "node_modules/react/jsx-dev-runtime.js",
        ),
      },
    ],
  },
  optimizeDeps: {
    // Local TS source package — do not prebundle; let Vite transform JSX.
    exclude: ["@live-architecture/motion"],
    include: ["motion/react"],
  },
  server: {
    host: "127.0.0.1",
    // Avoid Windows Hyper-V excluded ranges (e.g. 5160–5259).
    port: 5500,
    strictPort: false,
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 5501,
  },
});
