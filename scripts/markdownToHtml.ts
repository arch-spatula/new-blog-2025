import { unified } from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import type { MetaObject } from "../types/types";

class EmptyMeta implements MetaObject {
  title: string = "";
  fileName: string = "";
  constructor() {}
}

/**
 * @todo 메타정보 파싱하기
 *   - `---\n`으로 시작하고 `---\n`으로 끝나는 텍스트내의 자료 활용하기
 *     - 문서 전체에서 첫 `---\n`으로 시작하고 `---\n` 끝나는 경우만 해당해야 함.
 *     - 1번줄 부터 있거나 없으면 메타정보를 확인하는 로직은 실행되면 안됨.
 *   - html header 정보로 넣기
 *   - 통합 json으로 만들어서 검색 색인에 적용되게 만들기
 *   - 설계상 함수 1개에 2가지 기능을 갖고 있음.
 *     - 마크다운을 처리하는 함수들을 관리하는 함수로서 역할을 해야함.
 *     1. 하나는 메타 정보를 처리
 *     2. 마크다운을 html로 변환처리
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

/**
 * - meta
 */

type MarkdownResult = {
  /**
   * 마크다운을 html 표시할 문자열로 변환 문자열
   */
  content: string;
  meta: MetaObject;
};

class EmptyMarkdownResult implements MarkdownResult {
  content: string = "";
  meta: MetaObject = new EmptyMeta();
  constructor() {}
}

const checkParse = async (key: string, value: string) => {
  try {
    const parsed = await JSON.parse(`{"${key.trim()}": ${value.trim()}}`);

    return parsed[key];
  } catch (err) {
    /**
     * 빌드 에러가 발생한 이유를 더 쉽게 파악할 수 있게 만듬
     */
    throw new Error(
      `${key}의 ${value.trim()}은 JSON으로 변환 가능한 형식이 아닙니다.`,
    );
  }
};

const markdownToMeta = async (
  markdownSource: string,
): Promise<MarkdownResult> => {
  /**
   * ---
   * title: "My Blog Post"
   * date: "2025-07-05"
   * tags: ["vite", "markdown"]
   * ---
   *
   * # foo
   *
   * - hello foo
   *
   *   위에서 `---\n` 부터 `---\n`까지 사이 텍스트를 선택할 때 활용함.
   */
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n?/;

  const match = markdownSource.match(frontMatterRegex);

  const result = new EmptyMeta();
  /**
   * `---\n`, `---\n` 사이에 메타 정보를 작성할 것을 준수함.
   */
  if (match) {
    const metaDataString = match[1]; // YAML 부분 (string)

    const content = markdownSource.slice(match[0].length); // 나머지 markdown content
    try {
      for (const metaData of metaDataString.split("\n")) {
        const [key, value] = metaData.split(":");

        switch (key.trim()) {
          case "title": {
            result["title"] = await checkParse("title", value);
            break;
          }
          case "date": {
            result["date"] = await checkParse("date", value);
            break;
          }
          case "tags": {
            result["tags"] = await checkParse("tags", value);
            break;
          }
          case "draft": {
            result["draft"] = await checkParse("draft", value);
            break;
          }
          case "description": {
            result["description"] = await checkParse("description", value);
            break;
          }
          default:
            console.warn("허용한 하지 않은 키입니다.");
            throw new Error("허용한 하지 않은 키입니다.");
        }
      }
    } catch (err) {
      console.error(`유효하지 않은 형식입니다.\n${err}`);
      return new EmptyMarkdownResult();
    }

    if (result.title) return { meta: result, content: content };
  }

  /**
   * - `---\n`, `---\n` 사이에 메타 정보 작성 안해도 제목은 작성함.
   * - ``# 이런저런 제목\n` 같은 형식을 찾아보고 title로 간주함.
   */
  const fromMarkdownTitle = /^# (.+)$/m;

  const title = markdownSource.match(fromMarkdownTitle);
  if (title) {
    return {
      meta: {
        // title만 빠진 경우에도 meta정보 제공
        ...result,
        title: title[0].slice(2),
      },
      content: markdownSource,
    };
  }

  /**
   * 제목도 작성 안 하는 막장은 굳이 보여주지 않음.
   * 콘솔에 경고 보여주고 다음 파일로 넘어가도록 함.
   */
  return new EmptyMarkdownResult();
};

/**
 * - 의사결정 트리 표현이 상당히 엉성한 상태
 *   - lexing, scanning 결정이 필요함.
 *   - token을 만들고 ast 흉내를 내야함.
 */
const compileMarkdown = async (
  markdownSource: string,
): Promise<MarkdownResult> => {
  const { meta, content } = await markdownToMeta(markdownSource);

  if (!meta.title) {
    return new EmptyMarkdownResult();
  }

  return {
    content: markdownToHtml(content),
    meta: meta,
  };
};

export default compileMarkdown;
