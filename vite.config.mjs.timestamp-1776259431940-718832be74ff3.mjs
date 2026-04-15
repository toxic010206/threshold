// vite.config.mjs
import { defineConfig } from "file:///E:/astniq/eyeseye/threshold/node_modules/vite/dist/node/index.js";
import { resolve, join } from "path";
import { existsSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import dotenv from "file:///E:/astniq/eyeseye/threshold/node_modules/dotenv/lib/main.js";
import wasm from "file:///E:/astniq/eyeseye/threshold/node_modules/vite-plugin-wasm/exports/import.mjs";
import topLevelAwait from "file:///E:/astniq/eyeseye/threshold/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import { sentryVitePlugin } from "file:///E:/astniq/eyeseye/threshold/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_import_meta_url = "file:///E:/astniq/eyeseye/threshold/vite.config.mjs";
var __dirname = fileURLToPath(new URL(".", __vite_injected_original_import_meta_url));
dotenv.config({ path: resolve(__dirname, "../.env") });
var vite_config_default = defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const exampleName = process.env.VITE_EXAMPLE_NAME;
  if (exampleName) {
    console.log(
      `Vite: Serving example '${exampleName}' with HMR from project root`
    );
  }
  return {
    root: ".",
    publicDir: false,
    css: {
      devSourcemap: isDev
    },
    build: {
      outDir: "js",
      sourcemap: true,
      target: "esnext",
      minify: !isDev ? "terser" : false,
      // Inline all assets for offline capability (experiments must work without internet)
      assetsInlineLimit: Infinity,
      rollupOptions: {
        input: {
          first: resolve(__dirname, "first.js"),
          threshold: resolve(__dirname, "threshold.js")
        },
        // Suppress warnings from dependencies we can't control
        onwarn(warning, warn) {
          if (warning.code === "INVALID_ANNOTATION" && warning.id?.includes("mathjs")) {
            return;
          }
          if (warning.code === "EVAL" && (warning.id?.includes("node_modules/") || warning.id?.includes("jsQUEST"))) {
            return;
          }
          if (warning.message?.includes('Module "fs"') || warning.message?.includes('Module "path"')) {
            return;
          }
          warn(warning);
        },
        output: {
          entryFileNames: "[name].min.js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
          sourcemapFileNames: "[name].min.js.map",
          // Prevent automatic code splitting - each entry bundles its own dependencies
          // This ensures offline capability (all assets load before experiment starts)
          manualChunks: () => null
        }
      },
      chunkSizeWarningLimit: 1e4
    },
    server: isDev ? {
      port: 5500,
      open: false
    } : {
      port: 5500,
      open: true
    },
    resolve: {
      extensions: [".ts", ".js"]
    },
    define: {
      "process.env.debug": JSON.stringify(isDev),
      "process.env.FIREBASE_API_KEY": JSON.stringify(
        process.env.FIREBASE_API_KEY || ""
      ),
      "process.env.FIREBASE_API_KEY_SOUND": JSON.stringify(
        process.env.FIREBASE_API_KEY_SOUND || ""
      ),
      "process.env.SENTRY_ENVIRONMENT": JSON.stringify(
        process.env.SENTRY_ENVIRONMENT || (isDev ? "development" : "production")
      )
    },
    optimizeDeps: {
      exclude: ["@rust/pkg/easyeyes_wasm"]
    },
    plugins: [
      // Redirect root to example when VITE_EXAMPLE_NAME set
      exampleName && {
        name: "example-redirect",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/" || req.url === "/index.html") {
              res.writeHead(302, {
                Location: `/examples/generated/${exampleName}/index.html`
              });
              res.end();
              return;
            }
            next();
          });
        }
      },
      // Clean up i18n built file source map references (dev only)
      isDev && {
        name: "cleanup-i18n-sourcemap-dev",
        configureServer() {
          const i18nJsPath = join(__dirname, "js", "i18n.js");
          const i18nMapPath = join(__dirname, "js", "i18n.min.js.map");
          if (existsSync(i18nJsPath)) {
            let content = readFileSync(i18nJsPath, "utf-8");
            const original = content;
            content = content.replace(/\/\/# sourceMappingURL=.*$/gm, "");
            if (content !== original) {
              writeFileSync(i18nJsPath, content, "utf-8");
            }
          }
          if (existsSync(i18nMapPath)) {
            unlinkSync(i18nMapPath);
          }
        }
      },
      // Strip sourceMappingURL comments from source code in dev
      isDev && {
        name: "strip-sourcemap-url-dev",
        transform(code) {
          return code.replace(/\/\/# sourceMappingURL=.*$/gm, "");
        }
      },
      wasm(),
      topLevelAwait(),
      // Delete i18n source map file and strip sourceMappingURL comment (production only)
      !isDev && {
        name: "remove-i18n-sourcemap",
        apply: "build",
        async closeBundle() {
          const mapFile = join(__dirname, "js", "i18n.min.js.map");
          const i18nJsFile = join(__dirname, "js", "i18n.js");
          if (existsSync(mapFile)) {
            unlinkSync(mapFile);
          }
          if (existsSync(i18nJsFile)) {
            let content = readFileSync(i18nJsFile, "utf-8");
            const original = content;
            content = content.replace(/\/\/# sourceMappingURL=.*$/gm, "");
            if (content !== original) {
              writeFileSync(i18nJsFile, content, "utf-8");
            }
          }
        }
      },
      // Sentry source map upload (production only, when auth token available)
      !isDev && process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "easyeyes",
        project: "easyeyes-experiment",
        telemetry: false
      })
    ].filter(Boolean)
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcYXN0bmlxXFxcXGV5ZXNleWVcXFxcdGhyZXNob2xkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxhc3RuaXFcXFxcZXllc2V5ZVxcXFx0aHJlc2hvbGRcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9hc3RuaXEvZXllc2V5ZS90aHJlc2hvbGQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZSwgam9pbiB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHVubGlua1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcInVybFwiO1xyXG5pbXBvcnQgZG90ZW52IGZyb20gXCJkb3RlbnZcIjtcclxuaW1wb3J0IHdhc20gZnJvbSBcInZpdGUtcGx1Z2luLXdhc21cIjtcclxuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSBcInZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdFwiO1xyXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcclxuXHJcbmNvbnN0IF9fZGlybmFtZSA9IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi5cIiwgaW1wb3J0Lm1ldGEudXJsKSk7XHJcbmRvdGVudi5jb25maWcoeyBwYXRoOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uZW52XCIpIH0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGlzRGV2ID0gbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiO1xyXG4gIGNvbnN0IGV4YW1wbGVOYW1lID0gcHJvY2Vzcy5lbnYuVklURV9FWEFNUExFX05BTUU7XHJcblxyXG4gIC8vIExvZyBleGFtcGxlIG5hbWUgaWYgcHJvdmlkZWQgKGRldiBzZXJ2ZXIgd2lsbCBvcGVuIHRoZSBleGFtcGxlJ3MgaW5kZXguaHRtbClcclxuICBpZiAoZXhhbXBsZU5hbWUpIHtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICBgVml0ZTogU2VydmluZyBleGFtcGxlICcke2V4YW1wbGVOYW1lfScgd2l0aCBITVIgZnJvbSBwcm9qZWN0IHJvb3RgLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNpbmdsZSBjb25maWd1cmF0aW9uIC0gYWx3YXlzIHNlcnZlIGZyb20gcHJvamVjdCByb290IGZvciBITVIgc3VwcG9ydFxyXG4gIHJldHVybiB7XHJcbiAgICByb290OiBcIi5cIixcclxuICAgIHB1YmxpY0RpcjogZmFsc2UsXHJcbiAgICBjc3M6IHtcclxuICAgICAgZGV2U291cmNlbWFwOiBpc0RldixcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBvdXREaXI6IFwianNcIixcclxuICAgICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXHJcbiAgICAgIG1pbmlmeTogIWlzRGV2ID8gXCJ0ZXJzZXJcIiA6IGZhbHNlLFxyXG4gICAgICAvLyBJbmxpbmUgYWxsIGFzc2V0cyBmb3Igb2ZmbGluZSBjYXBhYmlsaXR5IChleHBlcmltZW50cyBtdXN0IHdvcmsgd2l0aG91dCBpbnRlcm5ldClcclxuICAgICAgYXNzZXRzSW5saW5lTGltaXQ6IEluZmluaXR5LFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgIGZpcnN0OiByZXNvbHZlKF9fZGlybmFtZSwgXCJmaXJzdC5qc1wiKSxcclxuICAgICAgICAgIHRocmVzaG9sZDogcmVzb2x2ZShfX2Rpcm5hbWUsIFwidGhyZXNob2xkLmpzXCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gU3VwcHJlc3Mgd2FybmluZ3MgZnJvbSBkZXBlbmRlbmNpZXMgd2UgY2FuJ3QgY29udHJvbFxyXG4gICAgICAgIG9ud2Fybih3YXJuaW5nLCB3YXJuKSB7XHJcbiAgICAgICAgICAvLyBTdXBwcmVzcyBtYXRoanMgUFVSRSBhbm5vdGF0aW9uIHdhcm5pbmdzIChkZXBlbmRlbmN5IGlzc3VlKVxyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB3YXJuaW5nLmNvZGUgPT09IFwiSU5WQUxJRF9BTk5PVEFUSU9OXCIgJiZcclxuICAgICAgICAgICAgd2FybmluZy5pZD8uaW5jbHVkZXMoXCJtYXRoanNcIilcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBTdXBwcmVzcyBldmFsIHdhcm5pbmdzIGZyb20gZGVwZW5kZW5jaWVzIChsb2c0amF2YXNjcmlwdCwganNRVUVTVCwgZmlsZS10eXBlKVxyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB3YXJuaW5nLmNvZGUgPT09IFwiRVZBTFwiICYmXHJcbiAgICAgICAgICAgICh3YXJuaW5nLmlkPy5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9cIikgfHxcclxuICAgICAgICAgICAgICB3YXJuaW5nLmlkPy5pbmNsdWRlcyhcImpzUVVFU1RcIikpXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gU3VwcHJlc3MgZnMvcGF0aCBleHRlcm5hbGl6YXRpb24gd2FybmluZ3MgZm9yIG5vZGVMb2NhbC5qcyAoTm9kZS1vbmx5IGNvZGUpXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ01vZHVsZSBcImZzXCInKSB8fFxyXG4gICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdNb2R1bGUgXCJwYXRoXCInKVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdhcm4od2FybmluZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcIltuYW1lXS5taW4uanNcIixcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBcIltuYW1lXS5qc1wiLFxyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiW25hbWVdW2V4dG5hbWVdXCIsXHJcbiAgICAgICAgICBzb3VyY2VtYXBGaWxlTmFtZXM6IFwiW25hbWVdLm1pbi5qcy5tYXBcIixcclxuICAgICAgICAgIC8vIFByZXZlbnQgYXV0b21hdGljIGNvZGUgc3BsaXR0aW5nIC0gZWFjaCBlbnRyeSBidW5kbGVzIGl0cyBvd24gZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICAvLyBUaGlzIGVuc3VyZXMgb2ZmbGluZSBjYXBhYmlsaXR5IChhbGwgYXNzZXRzIGxvYWQgYmVmb3JlIGV4cGVyaW1lbnQgc3RhcnRzKVxyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoKSA9PiBudWxsLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMDAsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiBpc0RldlxyXG4gICAgICA/IHtcclxuICAgICAgICAgIHBvcnQ6IDU1MDAsXHJcbiAgICAgICAgICBvcGVuOiBmYWxzZSxcclxuICAgICAgICB9XHJcbiAgICAgIDoge1xyXG4gICAgICAgICAgcG9ydDogNTUwMCxcclxuICAgICAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgZXh0ZW5zaW9uczogW1wiLnRzXCIsIFwiLmpzXCJdLFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICBcInByb2Nlc3MuZW52LmRlYnVnXCI6IEpTT04uc3RyaW5naWZ5KGlzRGV2KSxcclxuICAgICAgXCJwcm9jZXNzLmVudi5GSVJFQkFTRV9BUElfS0VZXCI6IEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgIHByb2Nlc3MuZW52LkZJUkVCQVNFX0FQSV9LRVkgfHwgXCJcIixcclxuICAgICAgKSxcclxuICAgICAgXCJwcm9jZXNzLmVudi5GSVJFQkFTRV9BUElfS0VZX1NPVU5EXCI6IEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgIHByb2Nlc3MuZW52LkZJUkVCQVNFX0FQSV9LRVlfU09VTkQgfHwgXCJcIixcclxuICAgICAgKSxcclxuICAgICAgXCJwcm9jZXNzLmVudi5TRU5UUllfRU5WSVJPTk1FTlRcIjogSlNPTi5zdHJpbmdpZnkoXHJcbiAgICAgICAgcHJvY2Vzcy5lbnYuU0VOVFJZX0VOVklST05NRU5UIHx8XHJcbiAgICAgICAgICAoaXNEZXYgPyBcImRldmVsb3BtZW50XCIgOiBcInByb2R1Y3Rpb25cIiksXHJcbiAgICAgICksXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGV4Y2x1ZGU6IFtcIkBydXN0L3BrZy9lYXN5ZXllc193YXNtXCJdLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgLy8gUmVkaXJlY3Qgcm9vdCB0byBleGFtcGxlIHdoZW4gVklURV9FWEFNUExFX05BTUUgc2V0XHJcbiAgICAgIGV4YW1wbGVOYW1lICYmIHtcclxuICAgICAgICBuYW1lOiBcImV4YW1wbGUtcmVkaXJlY3RcIixcclxuICAgICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVxLnVybCA9PT0gXCIvXCIgfHwgcmVxLnVybCA9PT0gXCIvaW5kZXguaHRtbFwiKSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgzMDIsIHtcclxuICAgICAgICAgICAgICAgIExvY2F0aW9uOiBgL2V4YW1wbGVzL2dlbmVyYXRlZC8ke2V4YW1wbGVOYW1lfS9pbmRleC5odG1sYCxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIENsZWFuIHVwIGkxOG4gYnVpbHQgZmlsZSBzb3VyY2UgbWFwIHJlZmVyZW5jZXMgKGRldiBvbmx5KVxyXG4gICAgICBpc0RldiAmJiB7XHJcbiAgICAgICAgbmFtZTogXCJjbGVhbnVwLWkxOG4tc291cmNlbWFwLWRldlwiLFxyXG4gICAgICAgIGNvbmZpZ3VyZVNlcnZlcigpIHtcclxuICAgICAgICAgIGNvbnN0IGkxOG5Kc1BhdGggPSBqb2luKF9fZGlybmFtZSwgXCJqc1wiLCBcImkxOG4uanNcIik7XHJcbiAgICAgICAgICBjb25zdCBpMThuTWFwUGF0aCA9IGpvaW4oX19kaXJuYW1lLCBcImpzXCIsIFwiaTE4bi5taW4uanMubWFwXCIpO1xyXG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMoaTE4bkpzUGF0aCkpIHtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoaTE4bkpzUGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSBjb250ZW50O1xyXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXC9cXC8jIHNvdXJjZU1hcHBpbmdVUkw9LiokL2dtLCBcIlwiKTtcclxuICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09IG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhpMThuSnNQYXRoLCBjb250ZW50LCBcInV0Zi04XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhpMThuTWFwUGF0aCkpIHtcclxuICAgICAgICAgICAgdW5saW5rU3luYyhpMThuTWFwUGF0aCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFN0cmlwIHNvdXJjZU1hcHBpbmdVUkwgY29tbWVudHMgZnJvbSBzb3VyY2UgY29kZSBpbiBkZXZcclxuICAgICAgaXNEZXYgJiYge1xyXG4gICAgICAgIG5hbWU6IFwic3RyaXAtc291cmNlbWFwLXVybC1kZXZcIixcclxuICAgICAgICB0cmFuc2Zvcm0oY29kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGNvZGUucmVwbGFjZSgvXFwvXFwvIyBzb3VyY2VNYXBwaW5nVVJMPS4qJC9nbSwgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgd2FzbSgpLFxyXG4gICAgICB0b3BMZXZlbEF3YWl0KCksXHJcblxyXG4gICAgICAvLyBEZWxldGUgaTE4biBzb3VyY2UgbWFwIGZpbGUgYW5kIHN0cmlwIHNvdXJjZU1hcHBpbmdVUkwgY29tbWVudCAocHJvZHVjdGlvbiBvbmx5KVxyXG4gICAgICAhaXNEZXYgJiYge1xyXG4gICAgICAgIG5hbWU6IFwicmVtb3ZlLWkxOG4tc291cmNlbWFwXCIsXHJcbiAgICAgICAgYXBwbHk6IFwiYnVpbGRcIixcclxuICAgICAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcclxuICAgICAgICAgIGNvbnN0IG1hcEZpbGUgPSBqb2luKF9fZGlybmFtZSwgXCJqc1wiLCBcImkxOG4ubWluLmpzLm1hcFwiKTtcclxuICAgICAgICAgIGNvbnN0IGkxOG5Kc0ZpbGUgPSBqb2luKF9fZGlybmFtZSwgXCJqc1wiLCBcImkxOG4uanNcIik7XHJcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhtYXBGaWxlKSkge1xyXG4gICAgICAgICAgICB1bmxpbmtTeW5jKG1hcEZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMoaTE4bkpzRmlsZSkpIHtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoaTE4bkpzRmlsZSwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSBjb250ZW50O1xyXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXC9cXC8jIHNvdXJjZU1hcHBpbmdVUkw9LiokL2dtLCBcIlwiKTtcclxuICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09IG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhpMThuSnNGaWxlLCBjb250ZW50LCBcInV0Zi04XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgLy8gU2VudHJ5IHNvdXJjZSBtYXAgdXBsb2FkIChwcm9kdWN0aW9uIG9ubHksIHdoZW4gYXV0aCB0b2tlbiBhdmFpbGFibGUpXHJcbiAgICAgICFpc0RldiAmJlxyXG4gICAgICAgIHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOICYmXHJcbiAgICAgICAgc2VudHJ5Vml0ZVBsdWdpbih7XHJcbiAgICAgICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxyXG4gICAgICAgICAgb3JnOiBcImVhc3lleWVzXCIsXHJcbiAgICAgICAgICBwcm9qZWN0OiBcImVhc3lleWVzLWV4cGVyaW1lbnRcIixcclxuICAgICAgICAgIHRlbGVtZXRyeTogZmFsc2UsXHJcbiAgICAgICAg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
