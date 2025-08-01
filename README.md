# new blog 2025

- 프레임워크 없이 개발자 블로그를 다시 만드는 도전입니다.

## 설치

```sh
git clone https://github.com/arch-spatula/new-blog-2025.git
```

```sh
pnpm install
```

## 실행

```sh
pnpm run dev
```

```sh
pnpm run build
```

```sh
pnpm run preview
```

## 아키텍쳐

- MPA로 여러 html을 public에 만들어서 제공함.

### 빌드

```mermaid
graph LR
    configureServer --> defineConfig
    buildStart --> defineConfig
    hotUpdate --> defineConfig
    readMarkdown --> hotUpdate
    writeHtml --> hotUpdate
    removePublicPrefix --> hotUpdate
    writeJSON --> hotUpdate
    extractMarkdownFileNameFromPath --> hotUpdate
    generate --> configureServer
    generate --> buildStart
    findMarkdownFiles --> generate
    readMarkdown --> generate
    writeHtml --> generate
    wrapperContentHtml --> generate
    compileMarkdown --> readMarkdown
    markdownToMeta --> compileMarkdown
    markdownToHtml --> compileMarkdown
    extractMarkdownFileNameFromPath --> compileMarkdown
```

### 사이트맵

```mermaid
graph LR
    root --> post
    root --> tags
    root --> search
```
