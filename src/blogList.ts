import type { MetaObject } from "../types/types";

/**
 * 순수하게 ui를 만들기 위한 처리들만 함.
 */
const blogList = (metaObjects: MetaObject[]) => {
  const ul = document.createElement("ul");
  ul.classList.add("blog-list");

  metaObjects.forEach((metaObject) => {
    const li = document.createElement("li");
    li.classList.add("blog-item");
    li.dataset.id = metaObject.fileName;

    const constainer = document.createElement("div");

    const blogLink = document.createElement("a");
    blogLink.classList.add("blog-link");

    if (!metaObject.htmlPath) return;
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

        tagItem.addEventListener("click", () => {
          /**
           * 내부 스코프에서 새로 생성해야 가장 최신의 url 상태를 접근할 수 있음
           */
          const url = new URL(window.location.href);

          const values = url.searchParams.getAll("tags");
          if (values.includes(tag)) {
            tagItem.classList.remove("selected-tag-item");

            url.searchParams.delete("tags", tag);
            window.history.pushState({}, "", url.toString());
            // 보여줘야 할지 말지 상태처리
          } else {
            tagItem.classList.add("selected-tag-item");
            url.searchParams.append("tags", tag);
            // 보여줘야 할지 말지 상태처리
            window.history.pushState({}, "", url.toString());
          }

          // ul을 접근하고 li을 모두 순회
          ul.childNodes.forEach((elem) => {
            if (elem instanceof HTMLElement) {
              /**
               * 1개의 DOM요소도 못 찾으면 숨김
               */
              const checkSeletedTag = elem.querySelector(".selected-tag-item");

              const url = new URL(window.location.href);

              const values = url.searchParams.getAll("tags");

              if (values.length === 0) {
                elem.classList.remove("hide");
                return;
              }
              if (!checkSeletedTag) {
                elem.classList.add("hide");
              } else {
                elem.classList.remove("hide");
              }
            }
          });
        });

        /**
         * 새로고침했을 때 tag 확인하고 반영
         * @todo tags가 있으면
         */
        const url = new URL(window.location.href);

        const values = url.searchParams.getAll("tags");
        if (values.includes(tag)) {
          tagItem.classList.add("selected-tag-item");
        }

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
  });

  return ul;
};

export default blogList;
