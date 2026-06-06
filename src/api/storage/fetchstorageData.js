import { deleteData, getData, postData, putData } from "../client";

const STORAGE_BASE = `/ttik/storage`;

// 창고 조회
export async function getStorageData() {
  return await getData(STORAGE_BASE);
}

//창고 등록
export async function registerStorage(storageReq) {
  return await postData(STORAGE_BASE, storageReq);
}

//창고 정보 수정
export async function updateStorageState(storageModifyReq) {
  return await putData(`${STORAGE_BASE}/modify`, storageModifyReq);
}

// 구역/선반 추가
export async function addStorageStructure(storageAddReq) {
  return await postData(`${STORAGE_BASE}/add`, storageAddReq)
}

//창고 삭제
export async function deleteStorageStructure(storageDeleteReq) {
  return await deleteData(STORAGE_BASE, storageDeleteReq);
}
