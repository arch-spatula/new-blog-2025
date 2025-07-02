import "./style.css";
// import readme from "../README.md?raw";
// import test from "./test.md?raw";

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

const main = async () => {
  const readme = await import("../content/2025-07-02/2025-07-02-page.md?raw");

  const app = document.querySelector<HTMLDivElement>("#app");

  if (app) {
    const button = document.createElement("button");
    button.textContent = "hello old school";
    app.appendChild(button);

    const markdownContainer = document.createElement("div");
    markdownContainer.classList.add("markdown-body");
    markdownContainer.insertAdjacentHTML(
      "beforeend",
      markdownToHtml(readme.default),
    );

    app.appendChild(markdownContainer);
  }
};

main();
