import * as path from "path";
import * as fs from "fs";
import findMarkdownFiles from "./findMarkdownFiles";
import markdownToHtml from "./markdownToHtml";

/**
 * @todo html을 생성하는 로직에 index.json을 접근할 수 있는 로직도 만들기
 * @todo html용 header 및 markdown-body로 감싸기
 */
const generate = (dir: string) => {
  const srcDir = path.resolve(dir, "content"); // *.md 모아둔 곳
  const outDir = path.resolve(dir, "public/blog");

  // 1) public/blog 디렉터리 초기화
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 2) 모든 markdown 찾기
  const mdFiles = findMarkdownFiles(srcDir);
 
  // 3) 변환 & 저장
  for (const mdFile of mdFiles) {
    const markdown = fs.readFileSync(mdFile, "utf8");
    const htmlfileStr = markdownToHtml(markdown);

    const outPath = mdFile
      .replace(/\.md$/, ".html")
      .replace("content", "public/blog");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, htmlfileStr, "utf8");
  }
};

export default generate;
