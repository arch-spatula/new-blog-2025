import type { MetaObject } from "../types/types";

/**
 * fileName이 무슨 tag를 갖고 있는지 알아낼 수 있음
 * tag가 무슨 fileName에 달려있는지 알아낼 수 있음
 * 실제 Node의 추가 삭제는 이루어지지 않고 탐색 후 해당 Node의 visable 혹은 active 상태만 제어함
 */
class Lookup {
  isFiltered: boolean;
  /**
   * 목록에 있으면 랜더링 처리
   */
  showFileName: Set<string>;

  /**
   * 활성화 된 태그
   */
  activeTags: Set<string>;

  /**
   * fileName을 저장하고 fileName으로 갖고 있는 tag를 알아 낼 수 있음
   */
  fileNameMap: Map<string, Set<string>>;

  /**
   * tag을 저장하고 현재 tag를 갖고 있는 fileName을 알아 낼 수 있음
   */
  tagMap: Map<string, Set<string>>;

  constructor() {
    this.isFiltered = false;
    this.fileNameMap = new Map();
    this.tagMap = new Map();
    this.showFileName = new Set();
    this.activeTags = new Set();
  }

  filterOn() {
    this.isFiltered = true;
    this.showFileName.clear();
  }

  filterOff() {
    this.isFiltered = false;
    // 필터가 해제 되면 모든 것이 보여야 함.
    this.fileNameMap.forEach((_, key) => {
      this.showFileName.add(key);
    });
  }

  toggleTag(tag: string) {
    if (this.activeTags.has(tag)) {
      this.removeActiveTag(tag);
    } else {
      this.addActiveTag(tag);
    }
  }

  addActiveTag(tag: string) {
    if (!this.activeTags.size) {
      this.filterOn();
    }
    this.activeTags.add(tag);
    this.activeTags.forEach((activeTag) => {
      const fileNameSet = this.tagMap.get(activeTag);
      if (!fileNameSet) return;
      fileNameSet.forEach((fileName) => {
        this.showFileName.add(fileName);
      });
    });
  }

  /**
   * @todo 갱신되어 삭제해야 할 특정 원소만 찾아 삭제하기
   */
  removeActiveTag(tag: string) {
    this.activeTags.delete(tag);

    this.showFileName.clear();
    this.activeTags.forEach((activeTag) => {
      const fileNameSet = this.tagMap.get(activeTag);
      if (!fileNameSet) return;
      fileNameSet.forEach((fileName) => {
        this.showFileName.add(fileName);
      });
    });

    if (!this.activeTags.size) {
      this.filterOff();
    }
  }

  /**
   * 모든 fileName과 tag의 관계를 최초로 만들어내는 시점
   * @todo url에서 필터가 되어 있고 안 되어 있고 상태 반영하기
   */
  init(metaObjects: MetaObject[]) {
    metaObjects.forEach((metaObject) => {
      if (metaObject.tags?.length) {
        metaObject.tags.forEach((tag) => {
          this.addVertex(metaObject.fileName, tag);
        });
      } else {
        this.addVertex(metaObject.fileName);
      }
    });
    this.filterOff();
  }

  /**
   * 양방향 노드
   */
  addVertex(fileNameNode: string, tagNode?: string) {
    if (!tagNode) {
      this.fileNameMap.set(fileNameNode, new Set());
      return;
    }

    const tagSet = this.fileNameMap.get(fileNameNode);
    if (tagSet) {
      tagSet.add(tagNode);
    } else {
      this.fileNameMap.set(fileNameNode, new Set([tagNode]));
    }

    const fileNameSet = this.tagMap.get(tagNode);
    if (fileNameSet) {
      fileNameSet.add(fileNameNode);
    } else {
      this.tagMap.set(tagNode, new Set<string>([fileNameNode]));
    }
  }
}

/**
 * blogList의 실행 종료 된 시점에 해제 되면 안 됨.
 * - 메모리상 상태를 계속 살리기 위해 모듈 스코프에 인스턴스를 만들어둠.
 * 유저의 클릭 이벤트가 있을 때마다 갱신되어야 함.
 */
const lookup = new Lookup();

/**
 * 순수하게 ui를 만들기 위한 처리들만 함.
 */
const blogList = (metaObjects: MetaObject[]) => {
  const ul = document.createElement("ul");
  ul.classList.add("blog-list");

  lookup.init(metaObjects);
  const url = new URL(window.location.href);
  const tags = url.searchParams.getAll("tags");
  tags.forEach((tag) => {
    lookup.toggleTag(tag);
  });

  metaObjects.forEach((metaObject) => {
    const li = document.createElement("li");
    if (!lookup.showFileName.has(metaObject.fileName)) {
      li.classList.add("hide");
    }
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
        const tagLink = document.createElement("a");

        tagItem.classList.add("tag-item");
        if (lookup.activeTags.has(tag)) {
          tagItem.classList.add("selected-tag-item");
        }
        tagLink.classList.add("tag-text");
        tagLink.innerText = `#${tag}`;

        const url = new URL(window.location.href);
        const values = url.searchParams.getAll("tags");

        if (values.includes(tag)) {
          url.searchParams.delete("tags", tag);
          if (url.search) {
            tagLink.href = `${url.search}`;
          } else {
            tagLink.href = `/`;
          }
        } else {
          url.searchParams.append("tags", tag);
          tagLink.href = `${url.search}`;
        }

        tagItem.appendChild(tagLink);
        tagItem.dataset.id = tag;

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
