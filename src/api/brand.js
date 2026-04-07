import serverUrl from "../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const BRAND_BASE = `${SERVER_URL}/ttik/brand`;

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
