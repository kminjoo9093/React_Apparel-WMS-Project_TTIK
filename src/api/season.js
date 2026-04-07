import serverUrl from "../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const SEASON_BASE = `${SERVER_URL}/ttik/product/season`;

export async function registerSeasonData(payload) {
  const url = `${SEASON_BASE}/register`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if(!res.ok) {
    const error = new Error();
    error.status = res.status;
    throw error;
  };

  const data = await res.json();
  return data;
}
