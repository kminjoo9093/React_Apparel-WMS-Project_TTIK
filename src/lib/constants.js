export const QUERY_KEYS = {
  size: {
    list: (target, category) => ["size", "list", target, category],
  },
  brand: {
    list: ["brand", "list"],
  },
  category: {
    list: ["category", "list"],
  },
  season: {
    list: ["season", "list"],
  },
  storage: {
    all: ["storage"],
  },
  rack: {
    all: ["rack"],
    list: (params) => ["rack", "list", params],
    detail: (rackSn) => ["rack", "detail", rackSn],
  },
};
