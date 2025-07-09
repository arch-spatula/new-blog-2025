import * as path from "path";
import * as fs from "fs";
import findMarkdownFiles from "./findMarkdownFiles";
import compileMarkdown from "./markdownToHtml";
import type { Data } from "../types/types";

/**
 * @todo html을 생성하는 로직에 index.json을 접근할 수 있는 로직도 만들기
 * @todo html용 header 및 markdown-body로 감싸기
 */
const generate = async (dir: string, ctx: "development" | "production") => {
  const srcDir = path.resolve(dir, "content"); // *.md 모아둔 곳
  const outBlogDir = path.resolve(dir, "public/blog");

  // 1) public/blog 디렉터리 초기화
  fs.rmSync(outBlogDir, { recursive: true, force: true });
  fs.mkdirSync(outBlogDir, { recursive: true });

  // 2) 모든 markdown 찾기
  const mdFiles = findMarkdownFiles(srcDir);

  const data: Data = { blog: [] };

  // 3) 변환 & 저장
  for (const mdFile of mdFiles) {
    const markdown = fs.readFileSync(mdFile, "utf8");
    const { meta: mete, content } = await compileMarkdown(markdown);

    switch (ctx) {
      case "production":
        if (!mete.title || mete.draft) continue;
        break;
      case "development":
        if (!mete.title) continue;
        break;
      default:
        break;
    }

    const outPath = mdFile
      .replace(/\.md$/, ".html")
      .replace("content", "public/blog");

    const relativePath = path.relative(__dirname, outPath);

    mete.htmlPath = relativePath.slice(9);
    data.blog.push(mete);

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const contentWrapper = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>${mete.title}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="markdown-body">${content}</div>
  </body>
</html>
`;

    fs.writeFileSync(outPath, contentWrapper, "utf8");
  }

  const outPublicDir = path.resolve(dir, "public");

  const saveData = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outPublicDir), { recursive: true });
  fs.writeFileSync(`${outPublicDir}/data.json`, saveData, "utf8");
};

export default generate;
