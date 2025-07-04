import { unified } from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

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
