import { getData } from "./client";
import { postData } from "./client";

const SEASON_BASE = `/ttik/product/season`;

//시즌 리스트 조회
export async function fetchSeasonList(){
  return await getData(SEASON_BASE);
}

//시즌 등록
export async function registerSeason(data){
  return await postData(`${SEASON_BASE}/register`, data);
}
