import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const BOXES_BASE = `${SERVER_URL}/ttik/storage/boxes`;

// 박스 이동
export async function updateBoxLocation({ boxQr, oldRack, newRack }) {
  const url = `${BOXES_BASE}/location`;
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