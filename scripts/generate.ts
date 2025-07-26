import * as path from "path";
import * as fs from "fs";
import findMarkdownFiles from "./findMarkdownFiles";
import compileMarkdown from "./markdownToHtml";
import type { MetaObject } from "../types/types";

function findImgFiles(dir: string): string[] {
  const results: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findImgFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".png")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * @todo content에 h1에 해당하는 태그가 없으면 임의로 h1 태그 생성
 * @todo 의존하는 파일이 너무 많아지면 삼항 연산자 제거하고 string builder 패턴으로 바꾸기
 */
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
    <div id="app">
      <nav class="nav">
        <ul>
          <li class="blog-logo-container">
            <a href="/" class="blog-logo">
              <img class="logo-img" src="/vite.svg" alt="blog logo" />
              <p>home</p>
            </a>
          </li>
          <li><a href="https://github.com" target="_blank">GitHub</a></li>
        </ul>
      </nav>
      <div id="content" class="markdown-body">${content}</div>
      <footer class="footer"></footer>
      <script type="module" src="${process.env.NODE_ENV === "development" ? "/src/clipboard.ts" : "/clipboard.js"}"></script>
    </div>
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

  /**
   * 날짜가 마크다운 문서 내 YAML에 없으면 파일 제목에서 찾아보고 date를 임의로 할당함.
   */
  if (!meta.date) {
    const regex = /\b\d{4}\-\d{2}\-\d{2}\b/g;

    const matches = fullPathFileName.match(regex);
    if (matches?.length) meta.date = matches?.pop();
  }
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
      case "production": {
        if (!meta.title || meta.draft) continue;
        break;
      }

      case "development": {
        if (!meta.title) continue;
        break;
      }

      default: {
        break;
      }
    }

    const { outPath } = await writeHtml(mdFile, meta.title, content);
    meta.htmlPath = removePublicPrefix(outPath);
    metaObjects.push(meta);
  }

  const imgFiles = findImgFiles(srcDir);

  for (const srcFile of imgFiles) {
    const oupPath = srcFile.replace("content", "public/blog");

    fs.copyFileSync(srcFile, oupPath);
  }
  return metaObjects;
};

export default generate;
