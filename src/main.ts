import "./style.css";

import blogList from "./blogList";
// import markdownToHtml from "./markdownToHtml";

const main = async () => {
  // const readme = await import("../content/2025-07-02/2025-07-02-page.md?raw");

  const app = document.querySelector<HTMLDivElement>("#app");

  if (app) {
    // const markdownContainer = document.createElement("div");
    // markdownContainer.classList.add("markdown-body");
    // markdownContainer.insertAdjacentHTML(
    //   "beforeend",
    //   markdownToHtml(readme.default),
    // );

    // app.appendChild(markdownContainer);
    app.appendChild(blogList());
  }
};

main();
