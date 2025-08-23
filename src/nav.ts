import PopupBus from "./search-popup-bus";

/**
 * nav를 동적으로 만들어서 다른 페이지 이동할 때 쿼리파라미터를 유지함.
 *
 * <nav id="nav">
 *   <ul>
 *     <li class="blog-logo-container">
 *       <a href="/" class="blog-logo">
 *         <img class="logo-img" src="/vite.svg" alt="blog logo" />
 *         <p>home</p>
 *       </a>
 *     </li>
 *     <li></li>
 *     <li><a href="https://github.com" target="_blank">GitHub</a></li>
 *   </ul>
 * </nav>
 */
const nav = () => {
  const popupBus = PopupBus.getInstance();
  const nav = document.querySelector("#nav");
  if (!nav) return;

  const ul = document.createElement("ul");

  const logo = document.createElement("li");
  logo.classList.add("blog-logo-container");
  const homeLink = document.createElement("a");
  homeLink.classList.add("blog-logo");

  const url = new URL(window.location.href);
  url.searchParams.delete("search");
  homeLink.href = `/${url.search}`;

  const logoImg = document.createElement("img");
  logoImg.classList.add("logo-img");
  logoImg.src = "/vite.svg";
  logoImg.alt = "blog logo";
  homeLink.appendChild(logoImg);

  const homeText = document.createElement("p");
  homeText.innerText = "home";
  homeLink.appendChild(homeText);

  logo.appendChild(homeLink);

  ul.appendChild(logo);

  const popupBtnWrapper = document.createElement("li");
  const popupBtn = document.createElement("button");

  const searchIcon = document.createElement("img");
  searchIcon.classList.add("icon");
  searchIcon.src = "/search.svg";
  searchIcon.alt = "search";
  popupBtn.appendChild(searchIcon);

  const popupText = document.createElement("p");
  popupText.innerText = "Ctrl + k";
  popupText.classList.add("popup-text");
  popupBtn.appendChild(popupText);
  popupBtn.id = "popup-btn";
  popupBtn.addEventListener("click", () => {
    popupBus.emit("click", () => {});
  });

  popupBtnWrapper.appendChild(popupBtn);
  ul.appendChild(popupBtnWrapper);

  const github = document.createElement("li");
  github.classList.add("github-link");
  const githubNewTabLink = document.createElement("a");
  githubNewTabLink.href = "https://github.com";
  githubNewTabLink.target = "_blank";
  githubNewTabLink.innerText = "GitHub";

  github.appendChild(githubNewTabLink);

  ul.appendChild(github);

  nav.appendChild(ul);
};

export default nav;
