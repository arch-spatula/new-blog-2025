export type MetaObject = {
  /**
   * 상단에 없으면 # 제목으로 작성한 것을 제목으로 간주할 것임.
   */
  title: string;
  date?: string;
  tags?: string[];
  /**
   * pnpm run dev로는 접근 가능하지만 pnpm run build할 때는 해당 html 파일들이 사라질 것.
   */
  draft?: boolean;
  htmlPath?: string;

  fileName: string;
  description?: string;
};

export type Data = {
  blog: MetaObject[];
};
