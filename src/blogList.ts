const blogList = () => {
  const ul = document.createElement("ul");

  const modules = import.meta.glob(`../content/**/**.md`, { eager: true });

  for (const path in modules) {
    const li = document.createElement("li");

    const blogLink = document.createElement("a");
    blogLink.innerText = path.slice(3);
    blogLink.href = path.slice(3);

    blogLink.addEventListener("click", (event) => {
      event.preventDefault(); // 기본 동작 차단 (페이지 이동 방지)

      const url = (event.target as HTMLAnchorElement).href;
      console.log(url);

      // URL 변경 (History API 사용)
      window.history.pushState({}, "", url);

      // URL 상태 접근
      console.log("New pathname:", window.location.pathname);
    });

    li.appendChild(blogLink);

    ul.appendChild(li);
  }

  return ul;
};

export default blogList;
