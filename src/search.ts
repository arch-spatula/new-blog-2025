let popupType: "none" | "search" = "none";

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

const SEARCH_POPUP = "search-popup" as const;
const createPopup = () => {
  const popupWrapper = document.createElement("div");
  popupWrapper.id = SEARCH_POPUP;

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";

  popupContainer.appendChild(createSearchInput());

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
 */
const main = async () => {
  window.addEventListener("keydown", handlePopup);
  // window.addEventListener("beforeunload", () => {
  //   window.removeEventListener("keydown", handlePopup);
  // });
};

main();
