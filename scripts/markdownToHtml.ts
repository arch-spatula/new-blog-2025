import { unified } from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

/**
 * @todo 메타정보 파싱하기
 *   - `---\n`으로 시작하고 `---\n`으로 끝나는 텍스트내의 자료 활용하기
 *     - 문서 전체에서 첫 `---\n`으로 시작하고 `---\n` 끝나는 경우만 해당해야 함.
 *     - 1번줄 부터 있거나 없으면 메타정보를 확인하는 로직은 실행되면 안됨.
 *   - html header 정보로 넣기
 *   - 통합 json으로 만들어서 검색 색인에 적용되게 만들기
 */
const markdownToHtml = (markdownSource: string) => {
  const html_text = unified()
    .use(markdown)
    .use(remark2rehype)
    .use(html)
    .processSync(markdownSource);

  if (typeof html_text.value === "string") {
    return html_text.value;
  }

  return "";
};

export default markdownToHtml;
