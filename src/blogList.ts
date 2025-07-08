import type { MetaObject } from "../types/types";

/**
 * @todo link 생성은 content를 의존해서 만들지 말기
 *   - 빌드 스텝에 마크다운 파일들에 대한 정보를 json으로 만들기
 */
const blogList = (metaObjects: MetaObject[]) => {
  const ul = document.createElement("ul");

  for (const metaObject of metaObjects) {
    const li = document.createElement("li");

    const blogLink = document.createElement("a");

    if (!metaObject.htmlPath) continue;
    const newPath = metaObject.htmlPath;

    blogLink.innerText = newPath;
    blogLink.href = newPath;

    li.appendChild(blogLink);

    ul.appendChild(li);
  }

  return ul;
};

export default blogList;
