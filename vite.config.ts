import { defineConfig, type ViteDevServer } from "vite";
import * as path from "path";
import * as fs from "fs";
import generate, { readMarkdown, writeHtml } from "./scripts/generate";
import type { Data } from "./types/types";

const writeJSON = async (dir: string, data: Data) => {
  const outPublicDir = path.resolve(dir, "public");

  const saveData = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outPublicDir), { recursive: true });
  fs.writeFileSync(`${outPublicDir}/data.json`, saveData, "utf8");
};

export default defineConfig(async ({}) => {
  const data: Data = { blog: [] };

  return {
    plugins: [
      {
        name: "complel markdown to html when dev start",
        async configureServer({}: ViteDevServer) {
          console.log("🚀 configureServer 실행됨!");

          if (process.env.NODE_ENV === "development") {
            try {
              const metaObjects = await generate(
                __dirname,
                process.env.NODE_ENV,
              );

              data.blog.push(...metaObjects);
            } catch (err) {
              console.error(err);
              console.log("vite generate 실패");
              return;
            }
          }

          await writeJSON(__dirname, data);
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

        async hotUpdate({
          type,
          file,
        }: {
          type: "create" | "update" | "delete";
          file: string;
        }) {
          if (!file.endsWith(".md") || !file.startsWith(`${__dirname}/content`))
            return;

          switch (type) {
            case "create": {
              break;
            }
            case "update": {
              const { meta, content } = await readMarkdown(file);

              if (
                !meta.title ||
                !data.blog.map((elem) => elem.fileName).includes(meta.fileName)
              ) {
                const { outPath } = await writeHtml(file, meta.title, content);
                const relativePath = path.relative(__dirname, outPath);

                meta.htmlPath = relativePath.slice(7);

                data.blog.push(meta);

                await writeJSON(__dirname, data);
                break;
              }

              const { outPath } = await writeHtml(file, meta.title, content);
              const relativePath = path.relative(__dirname, outPath);

              meta.htmlPath = relativePath.slice(7);
              const idx = data.blog.findIndex(
                (elem) => elem.title === meta.title,
              );
              if (idx > 0) {
                data.blog[idx] = meta;
                await writeJSON(__dirname, data);
              }

              break;
            }

            case "delete": {
              const fileName = file.match(/([^/\\]+\.md)$/);
              if (fileName && fileName[1]) {
                data.blog = data.blog.filter(
                  (elem) => elem.fileName !== fileName[1],
                );

                await writeJSON(__dirname, data);
              }

              break;
            }

            default: {
              break;
            }
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
