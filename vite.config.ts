import { defineConfig } from "vite";
import * as path from "path";
import * as fs from "fs";
import generate, { readMarkdown, writeHtml } from "./scripts/generate";
import compileMarkdown from "./scripts/markdownToHtml";

export default defineConfig(async ({}) => {
  return {
    plugins: [
      {
        name: "complel markdown to html when dev start",
        async configureServer({}) {
          console.log("🚀 configureServer 실행됨!");

          if (process.env.NODE_ENV === "development") {
            try {
              generate(__dirname, process.env.NODE_ENV);
            } catch (err) {
              console.error(err);
              console.log("vite generate 실패");
            }
          }
        },

        // vite build 전에 실행
        async buildStart() {
          if (process.env.NODE_ENV === "production") {
            try {
              generate(__dirname, process.env.NODE_ENV);
            } catch (err) {
              console.error(err);
              console.log("vite generate 실패");
            }
          }
        },
        async hotUpdate({ type, file }) {
          if (!file.endsWith(".md") || !file.startsWith(`${__dirname}/content`))
            return;

          switch (type) {
            case "create":
              break;
            case "update":
              const { meta, content } = await readMarkdown(file);
              await writeHtml(file, meta.title, content);
              
              break;
            case "delete":
              break;
            default:
              break;
          }
        },
      },
    ],
    server: {
      fs: {
        allow: [path.resolve(__dirname), path.resolve(__dirname, "content")],
      },
    },
    assetsInclude: ["**/*.md"],
  };
});
