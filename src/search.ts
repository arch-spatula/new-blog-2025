/**
 * @fileoverview ctrl + k로 볼 수 있는 창을 다룸
 *
 * @todo 날짜 범위 표시도 가능해야 함.
 * @todo 키보드 입력은 SPA로 data.json을 활용
 * @todo enter 하면 목록 첫번째로 자동 이동
 * @todo url에 입력 내용 보존
 */

import type { Data } from "../types/types";
import PopupBus from "./search-popup-bus";

let popupType: "none" | "search" = "none";
let searchData: Data | null = null;
const tagMap = new Map<string, number>();
const SEARCH_BLOG_LIST = `search-blog-list`;
const SEARCH_TAG_LIST = `search-tag-list`;

/**
 * 상태 갱신을 여기서 처리하고
 * 다른 곳에서 반영해야 함.
 * @todo 성능 이슈가 생기면 trailing edge debounc 걸어두기
 */
const handleUpdateSearchInput = (e: Event) => {
  const input = e.target as HTMLInputElement;

  const inputValue = input.value;

  const searchList = document.querySelector<HTMLDivElement>(
    `#${SEARCH_BLOG_LIST}`,
  );

  if (!searchList || !searchData) return;
  if (inputValue === "") {
    searchList.replaceChildren();
    return;
  }

  searchList.replaceChildren();

  searchData.blog
    .filter((elem) =>
      elem.title.toLowerCase().includes(input.value.toLowerCase()),
    )
    .forEach((elem) => {
      const searchItem = document.createElement("li");
      searchItem.innerText = elem.title;
      searchItem.classList.add("search-item");
      searchList.appendChild(searchItem);
    });
};

/**
 * @todo form 제출 이벤트처리
 * @todo 아이콘 추가
 */
const createSearchInput = () => {
  const searchForm = document.createElement("form");
  searchForm.id = "search-form";

  const searchIcon = document.createElement("img");
  searchIcon.id = "search-icon";
  searchIcon.src = "/search.svg";
  searchIcon.alt = "search";

  searchForm.appendChild(searchIcon);

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "search";
  searchInput.name = "search";
  searchInput.placeholder = "Search";

  searchInput.addEventListener("input", handleUpdateSearchInput);

  searchForm.appendChild(searchInput);

  const searchAction = document.createElement("div");

  searchForm.appendChild(searchAction);

  return searchForm;
};

const focusSearchInput = () => {
  const searchInput = document.querySelector<HTMLInputElement>("#search-input");
  if (!searchInput) return;

  searchInput.focus();
};

const deleteSearchInput = () => {
  const searchInput = document.querySelector<HTMLDivElement>(`#search-input`);
  if (!searchInput) return;

  searchInput.removeEventListener("input", handleUpdateSearchInput);
};

const SEARCH_POPUP = "search-popup" as const;
const createPopup = () => {
  const popupWrapper = document.createElement("div");
  popupWrapper.id = SEARCH_POPUP;

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";

  popupContainer.appendChild(createSearchInput());

  const url = new URL(window.location.href);
  url.searchParams.set("search", "open");

  const tagList = document.createElement("ul");
  tagList.id = SEARCH_TAG_LIST;
  tagMap.forEach((tagCount, tag) => {
    const tagItem = document.createElement("li");
    tagItem.classList.add("search-tag-item");

    const link = document.createElement("a");
    link.classList.add("tag-link");
    link.innerText = `#${tag} - ${tagCount}`;

    const url = new URL(window.location.href);
    const values = url.searchParams.getAll("tags");
    url.searchParams.set("search", "open");

    if (values.includes(tag)) {
      url.searchParams.delete("tags", tag);
      link.classList.add("selected");
      if (url.search) {
        link.href = url.search;
      } else {
        link.href = `/`;
      }
    } else {
      url.searchParams.append("tags", tag);
      link.href = url.search;
    }

    tagItem.appendChild(link);

    tagList.appendChild(tagItem);
  });
  popupContainer.appendChild(tagList);

  const searchList = document.createElement("ul");
  searchList.id = SEARCH_BLOG_LIST;

  popupContainer.appendChild(searchList);

  popupWrapper.appendChild(popupContainer);

  return popupWrapper;
};

/**
 * 추가하고 삭제하는 함수의 메모리 주소를 갖게 만들기 위해 이렇게 분류함
 */
const handleClickOverlay = (e: MouseEvent) => {
  e.preventDefault();
  switch (popupType) {
    case "search": {
      const url = new URL(window.location.href);
      url.searchParams.set("search", "close");
      window.history.pushState({}, "", url);

      deleteOverlay();
      deletePopup();
      popupType = "none";

      break;
    }
    case "none": {
      break;
    }
    default: {
      break;
    }
  }
};
const createOverlay = () => {
  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.addEventListener("click", handleClickOverlay);
  return overlay;
};

const deleteOverlay = () => {
  const overlay = document.querySelector<HTMLDivElement>(`#overlay`);
  if (!overlay) return;

  overlay.removeEventListener("click", handleClickOverlay);
  overlay.remove();
};

const deletePopup = () => {
  deleteSearchInput();
  const popupWrapper = document.querySelector<HTMLDivElement>(
    `#${SEARCH_POPUP}`,
  );
  if (!popupWrapper) {
    return;
  }

  popupWrapper.remove();
};
/**
 * - e.preventDefault는 조건에 해당할 때만 호출하는 것으로 브라우저에 내장된 단축키를 차단하는 일이 없어야 함.
 * - popup을 제어함
 *
 * @todo 이미 popup이 활성화 되어 있으면 popup을 닫음
 * @todo 백드롭 오버레이 추가
 */
const handlePopup = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const search = document.querySelector<HTMLDivElement>("#search");

    if (!search) return;

    switch (popupType) {
      case "none": {
        search.appendChild(createPopup());
        search.appendChild(createOverlay());
        focusSearchInput();
        // url에 search open 추가
        const url = new URL(window.location.href);
        url.searchParams.set("search", "open");
        window.history.pushState({}, "", url);

        popupType = "search";
        break;
      }
      case "search": {
        break;
      }
      default: {
        break;
      }
    }
  }

  switch (e.key) {
    case "Escape": {
      e.preventDefault();
      deleteOverlay();
      deletePopup();

      const url = new URL(window.location.href);
      url.searchParams.set("search", "close");
      window.history.pushState({}, "", url);

      popupType = "none";
      break;
    }
    case "Enter": {
      console.log("Enter");
      break;
    }
    case "ArrowUp": {
      console.log("Up arrow pressed");
      break;
    }
    case "ArrowDown": {
      console.log("Down arrow pressed");
      break;
    }
  }
};

/**
 * @todo `data.json`은 여기서 접근하기
 * - 나중에 `data.json`을 접근하는 파일을 단 한 곳에서만 관리하기
 * 페이지에 1번 실행되고 페이지종료까지 남아 있어야 해서 removeEventListener 호출 안 함
 * - 새로고침 등 새롭게 html 리소스를 가져올 때(full page reload) 자동으로 해제됨.
 */
const search = async (data: Data) => {
  data.blog.forEach((metaObject) => {
    if (!metaObject.tags) return;
    metaObject.tags.forEach((tag) => {
      const tagCount = tagMap.get(tag);
      if (tagCount) {
        tagMap.set(tag, tagCount + 1);
      } else {
        tagMap.set(tag, 1);
      }
    });
  });

  window.addEventListener("keydown", handlePopup);

  const searchElem = document.querySelector<HTMLDivElement>("#search");

  if (!searchElem) return;
  const url = new URL(window.location.href);
  const search = url.searchParams.get("search");
  switch (search) {
    case "open":
      searchElem.appendChild(createPopup());
      searchElem.appendChild(createOverlay());
      focusSearchInput();

      popupType = "search";
      break;
    case "close":
      break;
    case null:
      break;
    default:
      break;
  }

  const popupBus = PopupBus.getInstance();
  popupBus.on("click", () => {
    searchElem.appendChild(createPopup());
    searchElem.appendChild(createOverlay());
    focusSearchInput();
    // url에 search open 추가
    const url = new URL(window.location.href);
    url.searchParams.set("search", "open");
    window.history.pushState({}, "", url);

    popupType = "search";
  });

  searchData = data;
};

export default search;
