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

  sycnTags(tags: string[]) {
    this.activeTags.clear();
    this.activeTags = new Set([...tags]);
    this.sycnFileNameFromTag();

    if (!this.activeTags.size) {
      this.filterOff();
    }
  }
  sycnFileNameFromTag() {
    this.showFileName.clear();
    this.activeTags.forEach((activeTag) => {
      const fileNameSet = this.tagMap.get(activeTag);
      if (!fileNameSet) return;
      fileNameSet.forEach((fileName) => {
        this.showFileName.add(fileName);
      });
    });
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
const EventBus = new EventTarget();

class URLBinding {
  tags: Set<string>;
  constructor() {
    const url = new URL(window.location.href);
    const values = url.searchParams.getAll("tags");
    this.tags = new Set([...values]);

    // popstate는 뒤로/앞으로 가기 버튼을 눌렀을 때 호출됨
    window.addEventListener("popstate", this.handleUrlChange);
  }

  readTags = () => {
    const url = new URL(window.location.href);
    const values = url.searchParams.getAll("tags");
    return values;
  };

  /**
   * URL 변경 시 실행할 로직
   * this binding이 window로 변경될 것을 방지하기 위해 화살표 함수로 정의함
   * @todo 뒤로가기를 눌렀을 때 모든 상태 동기화
   */
  handleUrlChange = (e?: Event) => {
    EventBus.dispatchEvent(
      new CustomEvent("url:change", {
        detail: {
          tags: this.readTags(),
          isBackBtn: e instanceof PopStateEvent,
        },
      }),
    );
  };

  // pushState/replaceState 후에도 직접 호출해서 동기화
  changeUrl(url: string) {
    window.history.pushState({}, "", url);
    this.handleUrlChange();
  }

  addTag(tag: string) {
    const url = new URL(window.location.href);
    const values = url.searchParams.getAll("tags");
    if (!values.includes(tag) && !this.tags.has(tag)) {
      url.searchParams.append("tags", tag);
      this.changeUrl(url.toString());
      this.tags.add(tag);
    }
  }
  removeTag(tag: string) {
    const url = new URL(window.location.href);
    const values = url.searchParams.getAll("tags");

    if (values.includes(tag) && this.tags.has(tag)) {
      url.searchParams.delete("tags", tag);
      this.changeUrl(url.toString());
      this.tags.delete(tag);
    }
  }
  toggleTag(tag: string) {
    if (!this.tags.has(tag)) {
      this.addTag(tag);
    } else {
      this.removeTag(tag);
    }
  }
}

const updateBlogListUI = async (tag: string) => {
  const selectedTags = document.querySelectorAll(`[data-id="${tag}"]`);
  if (lookup.activeTags.has(tag)) {
    selectedTags.forEach((selectedTagElem) => {
      selectedTagElem.classList.add("selected-tag-item");
    });
  } else {
    selectedTags.forEach((selectedTagElem) => {
      selectedTagElem.classList.remove("selected-tag-item");
    });
  }

  const blogItems = document.querySelectorAll(".blog-item");
  blogItems.forEach((blogItemElem) => {
    if (blogItemElem instanceof HTMLLIElement) {
      const id = blogItemElem.dataset.id;
      if (!id) return;
      if (lookup.showFileName.has(id)) {
        blogItemElem.classList.remove("hide");
      } else {
        blogItemElem.classList.add("hide");
      }
    }
  });
};

const updateBlogListUIOnece = async () => {
  // 1번만 처리할 것을 알아서 추가된 클래스들 제거
  lookup.tagMap.forEach((_, tag) => {
    const selectedTags = document.querySelectorAll(`[data-id="${tag}"]`);
    selectedTags.forEach((selectedTag) => {
      selectedTag.classList.remove("selected-tag-item");
    });
  });

  const blogItems = document.querySelectorAll(".blog-item.hide");
  blogItems.forEach((blogItem) => {
    blogItem.classList.remove("hide");
  });

  lookup.activeTags.forEach((tag) => {
    const selectedTags = document.querySelectorAll(`[data-id="${tag}"]`);
    selectedTags.forEach((selectedTag) => {
      selectedTag.classList.add("selected-tag-item");
    });
  });

  // 모든 파일이름을 접근
  lookup.fileNameMap.forEach((_, fileName) => {
    // 보여줘야 할 파일 목록을 확인해서 없으면
    if (lookup.showFileName.has(fileName) || !lookup.showFileName.size) return;
    // DOM 요소를 선택해서
    const blogItems = document.querySelector(`[data-id="${fileName}"]`);
    if (!blogItems) return;
    // 숨김처리
    blogItems.classList.add("hide");
  });
};

const urlBinding = new URLBinding();

/**
 * Lookup의 activeTags와 URLBinding의 tags 동기화를 중재함
 * 브라우저 url을 메모리에 가져옴
 * 무슨 태그가 올바른지 판단을 먼저 해야 함
 */
class TagMediator {
  urlBinding: URLBinding;
  lookup: Lookup;
  constructor(urlBinding: URLBinding, lookup: Lookup) {
    this.urlBinding = urlBinding;
    this.lookup = lookup;
    EventBus.addEventListener("url:change", (e) => {
      const customEvent = e as CustomEvent<{
        tags: string[];
        isBackBtn: boolean;
      }>;
      if (!customEvent.detail) return;
      /**
       * 여기 값이 절대 진리 값
       * 순회하고
       * 동기화하고
       * ui에 내용 반영
       */
      const tags = customEvent.detail.tags;
      this.urlBinding.tags = new Set([...tags]);
      this.lookup.sycnTags(tags);

      const isBack = customEvent.detail.isBackBtn;
      if (isBack) {
        updateBlogListUIOnece();
      }
    });
  }
  init(metaObjects: MetaObject[]) {
    /**
     * main 함수 실행 이후 callback queue에 등록하고 실행하는 것으로 main 호출 이후 실행시킴
     * setTimeout을 동기적으로 실행하면 UI에 DOM 없는 시점에 실행해서 tag의 활성화 상태가 반영 안 됨.
     */
    setTimeout(() => {
      this.lookup.init(metaObjects);
      this.urlBinding.tags.forEach((tag) => {
        this.lookup.toggleTag(tag);
        updateBlogListUI(tag);
      });
    }, 0);
  }
  toggleTag(tag: string) {
    this.lookup.toggleTag(tag);
    this.urlBinding.toggleTag(tag);
    updateBlogListUI(tag);
  }
}

const tagMediator = new TagMediator(urlBinding, lookup);

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
          tagMediator.toggleTag(tag);
        });

        tagItem.classList.add("tag-item");
        p.classList.add("tag-text");
        p.innerText = `#${tag}`;
        tagItem.appendChild(p);
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

  tagMediator.init(metaObjects);

  return ul;
};

export default blogList;
