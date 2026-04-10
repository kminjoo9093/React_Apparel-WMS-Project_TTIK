import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const RACK_BASE = `${SERVER_URL}/ttik/storage/rack`;

// 선반 조회
export async function getRackListData({ page, size, filter }) {
  const params = new URLSearchParams({
    page,
    size,
    ...(filter && { filter }),
  });
  const url = `${RACK_BASE}/list?${params}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Error: fetch rack list failed`);

  const data = await res.json();
  return data;
}

// 선반 상세정보 조회
export async function getRackDetailInfo(rackSn) {
  const url = `${RACK_BASE}/detail?rackSn=${rackSn}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error: fetch rack detail info failed");

  const data = await res.json();
  return data;
}
