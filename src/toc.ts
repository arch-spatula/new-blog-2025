import type { Data } from "../types/types";

const toc = async (data: Data) => {
  const url = new URL(window.location.href);
  data.blog.forEach((elem) => {
    if (!elem.htmlPath) return;
    // 메타 정보 읽기
    if (elem.htmlPath === url.pathname.slice(1)) {
      console.log(elem, url.pathname);
    }
  });
};

export default toc;
