import * as path from "path";
import * as fs from "fs";

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

export default findMarkdownFiles;
