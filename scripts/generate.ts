import * as path from "path";
import * as fs from "fs";
import findMarkdownFiles from "./findMarkdownFiles";
import compileMarkdown from "./markdownToHtml";
import type { Data } from "../types/types";

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

/**
 * 전체 마크다운 파일을 감지하는 로직 분리
 * html 파일을 디스크에 저장하는 로직 분리
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
    const { meta: meta, content } = await compileMarkdown(markdown);

    switch (ctx) {
      case "production":
        if (!meta.title || meta.draft) continue;
        break;
      case "development":
        if (!meta.title) continue;
        break;
      default:
        break;
    }

    const outPath = mdFile
      .replace(/\.md$/, ".html")
      .replace("content", "public/blog");

    const relativePath = path.relative(__dirname, outPath);

    meta.htmlPath = relativePath.slice(9);
    data.blog.push(meta);

    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const contentWrapper = wrapContentToHtml(meta.title, content);

    fs.writeFileSync(outPath, contentWrapper, "utf8");
  }

  const outPublicDir = path.resolve(dir, "public");

  const saveData = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outPublicDir), { recursive: true });
  fs.writeFileSync(`${outPublicDir}/data.json`, saveData, "utf8");
};

export default generate;
