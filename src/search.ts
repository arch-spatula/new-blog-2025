let popupType: "none" | "search" = "none";

const SEARCH_POPUP = "search-popup" as const;
const createPopup = () => {
  const popupWrapper = document.createElement("div");
  popupWrapper.id = SEARCH_POPUP;

  const overlay = document.createElement("div");
  overlay.id = "overlay";
  // overlay.addEventListener("click", () => {
  //   console.log("overlay");
  // });

  popupWrapper.appendChild(overlay);

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";
  popupContainer.innerText = "popup-container";

  popupWrapper.appendChild(popupContainer);

  return popupWrapper;
};

const deletePopup = () => {
  const overlay = document.querySelector<HTMLDivElement>(`#overlay`);
  if (overlay) {
    // overlay.removeEventListener('click',)
    // overlay.remove();
  }

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
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();

    const search = document.querySelector<HTMLDivElement>("#search");

    if (!search) return;

    switch (popupType) {
      case "none": {
        search.appendChild(createPopup());

        popupType = "search";
        break;
      }
      case "search": {
        deletePopup();

        popupType = "none";
        break;
      }
      default: {
        break;
      }
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
