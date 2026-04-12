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

//창고 등록
export async function registerStorage(submitData) {
  const url = `${STORAGE_BASE}/register`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(submitData),
  });
  if (!res.ok) throw new Error("register new storage failed");

  const data = await res.json();
  return data;
}

//창고 정보 수정
export async function updateStorageState(storageModifyReq) {
  const url = `${STORAGE_BASE}/modify`;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(storageModifyReq),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data;
}

// 구역/선반 추가
export async function addStorageStructure(payload) {
  const url = `${STORAGE_BASE}/add`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function deleteStorageStructure(payload) {
  const url = `${STORAGE_BASE}/delete`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.message);
  return data;
}
