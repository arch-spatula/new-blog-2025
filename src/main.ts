import type { Data } from "../types/types";
import blogList from "./blogList";
import clipboard from "./clipboard";
import nav from "./nav";
import search from "./search";

const main = async () => {
  const app = document.querySelector<HTMLDivElement>("#app");
  const res = await fetch("/data.json");
  const data: Data = await res.json();

  await search(data);
  clipboard();
  nav();

  if (!app) return;
  if (window.location.pathname === "/") {
    app.appendChild(blogList(data.blog));
    return;
  }

  /**
   * @todo 404로직 처리하기
   */
  if (
    !data.blog
      .map((elem) => `/${elem.htmlPath ?? ""}`)
      .includes(window.location.pathname)
  ) {
    const notFound = document.createElement("div");
    notFound.id = "not-found";

    const statusCode = document.createElement("div");
    statusCode.classList.add("status-code");
    statusCode.innerText = "404";
    notFound.appendChild(statusCode);

    const notFoundText = document.createElement("p");
    notFoundText.classList.add("not-found-text");
    notFoundText.innerText = "Not Found";
    notFound.appendChild(notFoundText);

    // const goBack = document.createElement("button");
    // goBack.classList.add("not-found-btn");
    // goBack.classList.add("go-back");
    // goBack.innerText = "Go Back";
    // notFound.appendChild(goBack);

    const goHome = document.createElement("a");
    goHome.classList.add("not-found-btn");
    goHome.classList.add("go-home");
    goHome.innerText = "Back to Home";
    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    goHome.href = `/${url.search}`;

    notFound.appendChild(goHome);

    app.appendChild(notFound);
  }
};

main();
