import type { MetaObject } from "../types/types";

/**
 * @todo link 생성은 content를 의존해서 만들지 말기
 *   - 빌드 스텝에 마크다운 파일들에 대한 정보를 json으로 만들기
 */
const blogList = (metaObjects: MetaObject[]) => {
  const ul = document.createElement("ul");
  ul.classList.add("blog-list");

  for (const metaObject of metaObjects) {
    const li = document.createElement("li");
    li.classList.add("blog-item");

    const constainer = document.createElement("div");

    const blogLink = document.createElement("a");
    blogLink.classList.add("blog-link");

    if (!metaObject.htmlPath) continue;
    const newPath = metaObject.htmlPath;

    blogLink.innerText = metaObject.title;
    blogLink.href = newPath;

    constainer.appendChild(blogLink);

    const dateText = document.createElement("p");
    dateText.classList.add("blog-date");

    if (metaObject.date) {
      dateText.innerText = metaObject.date;
      constainer.appendChild(dateText);
    }

    const tagList = document.createElement("ul");
    tagList.classList.add("tag-list");

    if (metaObject.tags?.length) {
      metaObject.tags.forEach((tag) => {
        const tagItem = document.createElement("li");
        const p = document.createElement("span");

        tagItem.classList.add("tag-item");
        p.classList.add("tag-text");
        p.innerText = `#${tag}`;
        tagItem.appendChild(p);

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
