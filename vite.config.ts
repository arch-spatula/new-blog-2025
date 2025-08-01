import { defineConfig, type ViteDevServer } from "vite";
import * as path from "path";
import * as fs from "fs";
import generate, {
  extractMarkdownFileNameFromPath,
  readMarkdown,
  removePublicPrefix,
  writeHtml,
} from "./scripts/generate";
import type { Data } from "./types/types";

/**
 * 날짜 기준 정렬은 런타임 말고 컴파일 타임에 처리하는 것이 합리적
 */
const writeJSON = async (dir: string, data: Data) => {
  const outPublicDir = path.resolve(dir, "public");

  const sortedData = {
    ...data,
    blog: data.blog.sort((prev, post) => {
      if (prev.date && post.date) {
        return prev.date > post.date ? -1 : 1;
      }
      if (prev.date && !post.date) {
        return -1;
      }
      if (!prev.date && post.date) {
        return 1;
      }
      return prev.title > post.title ? -1 : 1;
    }),
  } satisfies Data;

  const saveData = JSON.stringify(sortedData);

  fs.mkdirSync(path.dirname(outPublicDir), { recursive: true });
  fs.writeFileSync(`${outPublicDir}/data.json`, saveData, "utf8");
};

export default defineConfig(async ({}) => {
  const data: Data = { blog: [] };

  return {
    plugins: [
      {
        name: "complel markdown",
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
              const metaObjects = await generate(
                __dirname,
                process.env.NODE_ENV,
              );

              data.blog.push(...metaObjects);
            } catch (err) {
              console.error(err);
              console.log("vite generate 실패");
            }
          }

          await writeJSON(__dirname, data);
        },

        async hotUpdate({
          type,
          file,
        }: {
          type: "create" | "update" | "delete";
          file: string;
        }) {
          if (!file.startsWith(`${__dirname}/content`)) return;

          /**
           * 마크다운일 때 로직처리
           */
          if (file.endsWith(".md")) {
            switch (type) {
              /**
               * - 파일을 생성하는 시점에 실행 됨
               * - 최초 생성 시점에는 파일 내용이 비어있어서 html 생성할 이유가 없음.
               */
              case "create": {
                break;
              }
              /**
               * - 파일 편집 시점에 실행됨.
               * - h1에 해당하는 제목을 작성하고 파일 저장하면 html 저장과 `data.json`에 저장이 처음으로 실행 됨
               * - 내용을 갱신하면 html과 `data.json`을 갱신함.
               */
              case "update": {
                const { meta, content } = await readMarkdown(file);

                if (
                  !meta.title ||
                  !data.blog
                    .map((elem) => elem.fileName)
                    .includes(meta.fileName)
                ) {
                  const { outPath } = await writeHtml(
                    file,
                    meta.title,
                    content,
                  );

                  meta.htmlPath = removePublicPrefix(outPath);

                  data.blog.push(meta);

                  await writeJSON(__dirname, data);
                  break;
                }

                const { outPath } = await writeHtml(file, meta.title, content);

                meta.htmlPath = removePublicPrefix(outPath);

                const idx = data.blog.findIndex(
                  (elem) => elem.htmlPath === meta.htmlPath,
                );
                if (idx > 0) {
                  data.blog[idx] = meta;
                  await writeJSON(__dirname, data);
                }

                break;
              }

              /**
               * - 파일을 삭제하면 `data.json`에서 제거
               */
              case "delete": {
                data.blog = data.blog.filter(
                  (elem) =>
                    elem.fileName !== extractMarkdownFileNameFromPath(file),
                );

                await writeJSON(__dirname, data);

                break;
              }

              default: {
                break;
              }
            }
          }
          /**
           * 이미지 로직처리
           */
          if (
            file.endsWith(".png") ||
            file.endsWith(".gif") ||
            file.endsWith(".jpeg") ||
            file.endsWith(".jpg")
          ) {
            switch (type) {
              case "create": {
                const oupPath = file.replace("content", "public/blog");

                fs.copyFileSync(file, oupPath);
                break;
              }
              case "update": {
                const oupPath = file.replace("content", "public/blog");

                fs.copyFileSync(file, oupPath);
                break;
              }
              case "delete": {
                break;
              }

              default:
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
      rollupOptions: {
        input: {
          index: "index.html",
          clipboard: path.resolve(__dirname, "src/clipboard.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
        },
      },
    },
    assetsInclude: ["**/*.md"],
    build: {
      rollupOptions: {
        input: {
          index: "index.html",
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
        },
      },
    },
  };
});
