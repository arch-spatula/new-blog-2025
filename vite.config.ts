import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig(async ({}) => {
  return {
    server: {
      fs: {
        allow: [path.resolve(__dirname), path.resolve(__dirname, "content")],
      },
    },
    assetsInclude: ["**/*.md"],
  };
});
