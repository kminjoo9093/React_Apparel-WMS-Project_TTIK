export const QUERY_KEYS = {
  size: {
    all: ["size"],
    list: (target, category) => ["size", "list", target, category],
  },
  brand: {
    all: ["brand"],
    list: ["brand", "list"],
  },
  category: {
    all: ["category"],
    list: ["category", "list"],
  },
  season: {
    all: ["season"],
    list: ["season", "list"],
  },
  storage: {
    all: ["storage"],
    list: ["storage", "list"],
    zones: (storageSn) => ["storage", "zones", storageSn],
    racks: (zoneSn) => ["storage", "racks", zoneSn],
  },
  rack: {
    all: ["rack"],
    list: (params) => ["rack", "list", params],
    detail: (rackSn) => ["rack", "detail", rackSn],
  },
  product: {
    all: ["product"],
    list: ["product", "list"],
  },
};
