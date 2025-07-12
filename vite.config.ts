import { defineConfig } from "vite";
import * as path from "path";
import * as fs from "fs";
import generate from "./scripts/generate";
import compileMarkdown from "./scripts/markdownToHtml";

const wrapContentToHtml = (title: string, content: string) => {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <nav><a href="/">home</a></nav>
    <div class="markdown-body">${content}</div>
  </body>
</html>`;
};

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
              const markdown = fs.readFileSync(file, "utf8");
              const { meta, content } = await compileMarkdown(markdown);

              const contentWrapper = wrapContentToHtml(meta.title, content);

              const outPath = file
                .replace(/\.md$/, ".html")
                .replace("content", "public/blog");

              fs.writeFileSync(outPath, contentWrapper, "utf8");
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
