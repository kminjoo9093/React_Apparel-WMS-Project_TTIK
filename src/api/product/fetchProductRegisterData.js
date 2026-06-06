import { getData, postData } from "../client";

const PRODUCT_BASE = `/ttik/product`;

//상품 코드 생성
export async function createProductCd(productInfo) {
  const data = await postData(`${PRODUCT_BASE}/code`, productInfo);
  return data.productCd;
}

//상품 코드 중복 체크
export async function checkProductCdExists(productCd) {
  return await getData(`${PRODUCT_BASE}/${productCd}`);
}

//상품 등록
export async function registerProduct(payload) {
  return await postData(PRODUCT_BASE, payload);
}
