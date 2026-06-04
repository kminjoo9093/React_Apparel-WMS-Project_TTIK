import { getData } from "./client";

//사이즈 옵션 받아오기
export async function fetchSizeMap(target, category) {
  const url = `/ttik/product/size?target=${target}&category=${category}`;
  const data = await getData(url);
  return data.length === 0 ? null : data;
}