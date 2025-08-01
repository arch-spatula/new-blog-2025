import type { Data } from "../types/types";
import blogList from "./blogList";
import clipboard from "./clipboard";
import search from "./search";

const main = async () => {
  const app = document.querySelector<HTMLDivElement>("#app");
  const res = await fetch("/data.json");
  const data: Data = await res.json();

  await search(data);
  clipboard();

  if (app && window.location.pathname === "/") {
    app.appendChild(blogList(data.blog));
  }
  /**
   * @todo 404로직 처리하기
   */
};

main();
