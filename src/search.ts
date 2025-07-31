let popupType: "none" | "search" = "none";

const SEARCH_POPUP = "search-popup" as const;
const createPopup = () => {
  const popupWrapper = document.createElement("div");
  popupWrapper.id = SEARCH_POPUP;

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";
  popupContainer.innerText = "popup-container";

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
 * popup을 제어함
 * @todo 이미 popup이 활성화 되어 있으면 popup을 닫음
 * @todo 백드롭 오버레이 추가
 */
const handlePopup = (e: KeyboardEvent) => {
  e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    const search = document.querySelector<HTMLDivElement>("#search");

    if (!search) return;

    switch (popupType) {
      case "none": {
        search.appendChild(createPopup());
        search.appendChild(createOverlay());

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

const main = async () => {
  window.addEventListener("keydown", handlePopup);
  // window.addEventListener("beforeunload", () => {
  //   window.removeEventListener("keydown", handlePopup);
  // });
};

main();
