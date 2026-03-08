const rootPath = (path: string): string => process.env.NEXT_PUBLIC_API_URL + path;

const tableId = (page: number, fetch: number, index: number): number => (page - 1) * fetch + index + 1;

const slugString = (slug: string | string[] | undefined): string => {
  if (Array.isArray(slug)) return "";
  return slug ?? "";
};

export const get = {
  rootPath,
  tableId,
  slugString,
};
