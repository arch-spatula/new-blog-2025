import "./style.css";
import readme from "../README.md?raw";
import test from "./test.md?raw";

import { unified } from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

const main = async () => {
  const html_text = unified()
    .use(markdown)
    .use(remark2rehype)
    .use(html)
    .processSync(readme);

  const app = document.querySelector<HTMLDivElement>("#app");

  if (app) {
    const button = document.createElement("button");
    button.textContent = "hello old school";

    const markdownContainer = document.createElement("div");
    markdownContainer.classList.add("markdown-body");
    if (typeof html_text.value === "string") {
      markdownContainer.insertAdjacentHTML("beforeend", html_text.value);
    }

    app.appendChild(button);
    app.appendChild(markdownContainer);
  }
};

main();
