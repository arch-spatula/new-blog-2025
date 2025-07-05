/**
 * @todo link 생성은 content를 의존해서 만들지 말기
 *   - 빌드 스텝에 마크다운 파일들에 대한 정보를 json으로 만들기
 */
const blogList = () => {
  const ul = document.createElement("ul");

  const modules = import.meta.glob(`../content/**/**.md`, { eager: true });

  for (const path in modules) {
    const li = document.createElement("li");

    const blogLink = document.createElement("a");

    const newPath = path
      .replace("content", "blog")
      .replace(/\.md$/, ".html")
      .replace("../", "");

    blogLink.innerText = newPath;
    blogLink.href = newPath;

    li.appendChild(blogLink);

    ul.appendChild(li);
  }

  return ul;
};

export default blogList;
