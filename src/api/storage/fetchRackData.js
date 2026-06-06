import { getData } from "../client";

const RACK_BASE = `/ttik/storage/rack`;

// 선반 조회
export async function getRackListData({ page, size, filter }) {
  const params = new URLSearchParams({
    page,
    size,
    ...(filter && { filter }),
  });
  return await getData(`${RACK_BASE}/list?${params.toString()}`);
}

// 선반 상세정보 조회
export async function getRackDetailInfo(rackSn) {
  return await getData(`${RACK_BASE}/detail?rackSn=${rackSn}`);
}
