import { defineConfig } from "vite";
import * as path from "path";
import * as fs from "fs";
import markdownToHtml from "./scripts/markdownToHtml";

/** 주어진 디렉토리에서 .md 파일 경로 리스트를 재귀적으로 수집 */
function findMarkdownFiles(dir: string): string[] {
  let results: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

export default defineConfig(async ({}) => {
  return {
    plugins: [
      {
        name: "complel markdown to html when dev start",
        configureServer({}) {
          console.log("🚀 configureServer 실행됨!");
          const srcDir = path.resolve(__dirname, "content"); // *.md 모아둔 곳
          const outDir = path.resolve(__dirname, "public/blog");

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
            fs.writeFileSync(outPath, htmlfileStr, 'utf8');
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
