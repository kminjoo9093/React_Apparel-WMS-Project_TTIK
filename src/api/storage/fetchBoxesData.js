import { putData } from "../client";

// 박스 이동
export async function updateBoxLocation({ boxQr, oldRack, newRack }) {
  return await putData(`/ttik/storage/boxes/location`, {
    boxQr,
    oldRack: Number(oldRack),
    newRack: Number(newRack),
  });
}
