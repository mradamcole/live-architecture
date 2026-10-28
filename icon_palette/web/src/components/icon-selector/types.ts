export type IconSetSummary = {
  id: string;
  name: string;
  count: number;
  license: string;
  author: string;
};

export type IconEntry = {
  file: string;
  title: string;
  tags: string[];
};

export type IconSetDetail = {
  id: string;
  name: string;
  icons: IconEntry[];
};

export type IconRef = {
  setId: string;
  file: string;
  title: string;
  publicPath: string;
  svgUrl: string;
};

export type SearchMinEntry = {
  id: string;
  set: string;
  t: string;
  tags: string[];
};

export function iconPublicPath(setId: string, file: string): string {
  return `/icons/${setId}/svg/${file}`;
}

export function toIconRef(setId: string, icon: IconEntry): IconRef {
  const publicPath = iconPublicPath(setId, icon.file);
  return {
    setId,
    file: icon.file,
    title: icon.title,
    publicPath,
    svgUrl:
      typeof window !== "undefined"
        ? new URL(publicPath, window.location.origin).href
        : publicPath,
  };
}
