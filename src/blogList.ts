import type { MetaObject } from "../types/types";

/**
 * 순수하게 ui를 만들기 위한 처리들만 함.
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

    const description = document.createElement("p");
    description.classList.add("blog-description");

    if (metaObject.description) {
      description.innerText = metaObject.description;
      constainer.appendChild(description);
    }

    const line = document.createElement("hr");
    line.classList.add("blog-divider");

    constainer.appendChild(line);

    li.appendChild(constainer);

    ul.appendChild(li);
  }

  return ul;
};

export default blogList;
