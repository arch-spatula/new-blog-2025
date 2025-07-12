// import "./style.css";
import type { Data } from "../types/types";
import blogList from "./blogList";

const main = async () => {
  const app = document.querySelector<HTMLDivElement>("#app");
  const res = await fetch("/data.json");
  const data: Data = await res.json();

  if (app) {
    console.log("app????", app);

    app.appendChild(blogList(data.blog));
  }
};

main();
