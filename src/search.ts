import type { Data } from "../types/types";

let popupType: "none" | "search" = "none";
let data: Data | null = null;

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

  if (!searchList || !data) return;
  if (inputValue === "") {
    searchList.replaceChildren();
    return;
  }

  searchList.replaceChildren();

  data.blog
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
 */
const search = async (_data: Data) => {
  window.addEventListener("keydown", handlePopup);

  data = _data;
};

export default search;
