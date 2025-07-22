import type { MetaObject } from "../types/types";

/**
 * @todo link 생성은 content를 의존해서 만들지 말기
 *   - 빌드 스텝에 마크다운 파일들에 대한 정보를 json으로 만들기
 */
const blogList = (metaObjects: MetaObject[]) => {
  const ul = document.createElement("ul");

  for (const metaObject of metaObjects) {
    const li = document.createElement("li");

    const constainer = document.createElement("div");

    const blogLink = document.createElement("a");

    if (!metaObject.htmlPath) continue;
    const newPath = metaObject.htmlPath;

    blogLink.innerText = metaObject.title;
    blogLink.href = newPath;

    constainer.appendChild(blogLink);

    const dateText = document.createElement("p");

    if (metaObject.date) {
      dateText.innerText = metaObject.date;
      constainer.appendChild(dateText);
    }

    const tagList = document.createElement("ul");

    if (metaObject.tags?.length) {
      const tagItem = document.createElement("li");
      metaObject.tags.forEach((tag) => {
        tagItem.innerText = tag;

        tagList.appendChild(tagItem);
      });
    }

    constainer.appendChild(tagList);

    li.appendChild(constainer);

    ul.appendChild(li);
  }

  return ul;
};

export default blogList;
