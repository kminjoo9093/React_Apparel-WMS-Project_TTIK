import serverUrl from "../db/server.json";
import { getData } from "./client";

const SERVER_URL = serverUrl.SERVER_URL;
const BRAND_BASE = `${SERVER_URL}/ttik/brand`;

//브랜드 리스트 조회
export async function fetchBrandList(){
  return await getData("/ttik/product/brands");
}

export async function searchBrandData(inputVal) {
  const url = `${BRAND_BASE}/search?keyword=${inputVal}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if(!res.ok) throw new Error(`Error: ${res.status}`);

  const data = await res.json();
  return data;
}
