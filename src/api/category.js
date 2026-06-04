import { getData } from "./client";

//카테고리
export async function fetchCategoryList(){
  return await getData("/ttik/product/category");
}