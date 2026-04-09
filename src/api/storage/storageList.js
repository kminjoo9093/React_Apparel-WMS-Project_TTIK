import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const STORAGE_BASE = `${SERVER_URL}/ttik/storage`;

export async function fetchStorageData() {
  const url = `${STORAGE_BASE}/allStorages`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Error: fetch storage data failed`);

  const data = await res.json();
  return data;
}
