import "./style.css";

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

const blogList = () => {
  const ul = document.createElement("ul");

  const modules = import.meta.glob(`../content/**/**.md`, { eager: true });

  for (const path in modules) {
    const li = document.createElement("li");

    const blogLink = document.createElement("a");
    blogLink.innerText = path;
    blogLink.href = path;
    li.appendChild(blogLink);

    ul.appendChild(li);
  }

  return ul;
};

const main = async () => {
  const readme = await import("../content/2025-07-02/2025-07-02-page.md?raw");

  const app = document.querySelector<HTMLDivElement>("#app");

  if (app) {
    const markdownContainer = document.createElement("div");
    markdownContainer.classList.add("markdown-body");
    markdownContainer.insertAdjacentHTML(
      "beforeend",
      markdownToHtml(readme.default),
    );

    app.appendChild(markdownContainer);
    app.appendChild(blogList());
  }
};

main();
