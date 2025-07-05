import { defineConfig } from "vite";
import * as path from "path";
import generate from "./scripts/generate";

export default defineConfig(async ({}) => {
  return {
    plugins: [
      {
        name: "complel markdown to html when dev start",
        async configureServer({}) {
          console.log("🚀 configureServer 실행됨!");
          generate();
        },
        // vite build 전에 실행
        async buildStart() {
          if (process.env.NODE_ENV === "production") {
            generate();
          }
        },
      },
    ],
    server: {
      fs: {
        allow: [path.resolve(__dirname), path.resolve(__dirname, "content")],
      },
    },
    assetsInclude: ["**/*.md"],
  };
});
