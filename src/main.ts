// import "./style.css";
import type { Data } from "../types/types";
import blogList from "./blogList";

const main = async () => {
  const app = document.querySelector<HTMLDivElement>("#app");
  const res = await fetch("/data.json");
  const data: Data = await res.json();

  if (app) {
    // const markdownContainer = document.createElement("div");
    // markdownContainer.classList.add("markdown-body");
    // markdownContainer.insertAdjacentHTML(
    //   "beforeend",
    //   markdownToHtml(readme.default),
    // );

    // app.appendChild(markdownContainer);
    app.appendChild(blogList(data.blog));
  }
};

main();
