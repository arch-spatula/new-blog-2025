import * as path from "path";
import * as fs from "fs";
import findMarkdownFiles from "./findMarkdownFiles";
import compileMarkdown from "./markdownToHtml";
import type { MetaObject } from "../types/types";

export const wrapContentToHtml = (title: string, content: string) => {
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
 * /foo/bar/baz.md -> baz.md
 */
export const extractMarkdownFileNameFromPath = (fullPathFileName: string) => {
  const fileName = fullPathFileName.match(/([^/\\]+\.md)$/);

  if (fileName && fileName[1]) {
    return fileName[1];
  }
  return fullPathFileName;
};

/**
 * 디스크 작성된 마크다운 파일을 읽고 메모리에 가져옴
 * 메타정보를 객체 형식으로 추출함
 */
export const readMarkdown = async (fullPathFileName: string) => {
  const markdown = fs.readFileSync(fullPathFileName, "utf8");

  const { meta, content } = await compileMarkdown(markdown);

  meta.fileName = extractMarkdownFileNameFromPath(fullPathFileName);

  return { meta, content };
};

/**
 * 메모리에 들고 있는 html 형식으로 변환된 마크다운을 디스크에 저장
 * @param fileName /foo/bar/baz.md
 * @param title `# 제목`, `title: 제목` 중 있는 값을 활용함.
 * @param content 마크다운 내용에 해당하는 문자열
 */
export const writeHtml = async (
  fileName: string,
  title: string,
  content: string,
) => {
  const outPath = fileName
    .replace(/\.md$/, ".html")
    .replace("content", "public/blog");

  const contentWrapper = wrapContentToHtml(title, content);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contentWrapper, "utf8");

  return {
    /** 저장할 html 경로 */
    outPath,
  };
};

export const removePublicPrefix = (outPath: string) => {
  const relativePath = path.relative(__dirname, outPath);
  const publicPrefix = "../public/";

  if (relativePath.startsWith(publicPrefix))
    return relativePath.slice(publicPrefix.length);

  return relativePath;
};

/**
 * JSON은 여기 말고 다른 위치에서 저장하기
 */
const generate = async (dir: string, ctx: "development" | "production") => {
  const srcDir = path.resolve(dir, "content"); // *.md 모아둔 곳
  const outBlogDir = path.resolve(dir, "public/blog");

  // 1) public/blog 디렉터리 초기화
  fs.rmSync(outBlogDir, { recursive: true, force: true });
  fs.mkdirSync(outBlogDir, { recursive: true });

  // 2) 모든 markdown 찾기
  const mdFiles = findMarkdownFiles(srcDir);

  const metaObjects: MetaObject[] = [];

  // 3) 변환 & 저장
  for (const mdFile of mdFiles) {
    const { meta, content } = await readMarkdown(mdFile);

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

    const { outPath } = await writeHtml(mdFile, meta.title, content);

    meta.htmlPath = removePublicPrefix(outPath);
    metaObjects.push(meta);
  }

  return metaObjects;
};

export default generate;
