import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const STORAGE_BASE = `${SERVER_URL}/ttik/storage`;

// 창고 조회
export async function getStorageData() {
  const url = `${STORAGE_BASE}/allStorages`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Error: fetch storage data failed`);

  const data = await res.json();
  return data;
}

// 선반 조회
export async function getRackListData({ page, size, filter }) {
  const params = new URLSearchParams({
    page,
    size,
    ...(filter && { filter }),
  });
  const url = `${STORAGE_BASE}/rack/list?${params}`;

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
  const url = `${STORAGE_BASE}/rack/detail?rackSn=${rackSn}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error: fetch rack detail info failed");

  const data = await res.json();
  return data;
}

// 박스 이동
export async function updateBoxLocation({ boxQr, oldRack, newRack }) {
  const url = `${STORAGE_BASE}/boxes/location`;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      boxQr,
      oldRack,
      newRack,
    }),
  });
  if (!res.ok) throw new Error("Error: update box location failed");

  const data = await res.json();
  return data;
}
