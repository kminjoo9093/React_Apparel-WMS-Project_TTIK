import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const BASE_URL = `${SERVER_URL}/ttik/product/list`;
const postsPerPagePC = 10;
const visibleCountMobile = 5;

const generateProductListQuery = (filters) => {
  const { brandCd, categoryCd, seasonCd, stkStatus, keyword } = filters;
  const query = `&brandCd=${brandCd}&catCd=${categoryCd}&seasonCd=${seasonCd}&stkStatus=${stkStatus}&keyword=${encodeURIComponent(keyword)}`;
  return query;
};

export async function getProductList(searchFilters, currentPage, isMobile) {
  const filterQuery = generateProductListQuery(searchFilters);
  let url = "";

  if (isMobile) {
    url = `${BASE_URL}/mobile?size=${visibleCountMobile}${filterQuery}`;
  } else {
    url = `${BASE_URL}/pc?page=${currentPage - 1}&size=${postsPerPagePC}${filterQuery}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("네트워크 응답 실패");
  const data = await res.json();
  return data;
}

export async function getNextProductList(lastItemDate, lastItemProCd, searchFilters) {
  const encodedDate = encodeURIComponent(lastItemDate);
  const query = generateProductListQuery(searchFilters);
  const filterQuery = `&lastDate=${encodedDate}&lastProCd=${lastItemProCd}&${query}`;
  let url = `${BASE_URL}/scroll?size=${visibleCountMobile}${filterQuery}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if(!res.ok) throw new Error(`Error: ${res.status}`);

  const data = await res.json();
  return data;
}
