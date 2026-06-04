import serverUrl from "../../db/server.json";
import { getData } from "../client";

const SERVER_URL = serverUrl.SERVER_URL;
const PRODUCT_BASE = `${SERVER_URL}/ttik/product`;
const PRODUCT_CODE_BASE = `${SERVER_URL}/ttik/productCode`;
const jsonHeaders = { "Content-type": "application/json" };

//상품 코드 생성
export async function createProductCd(productInfo) {
  const res = await fetch(PRODUCT_CODE_BASE, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(productInfo),
  });
  if (!res.ok) throw new Error(`Error : ${res.status}`);
  const data = await res.text();
  if (data.length === 0) return null;
  return data;
}

//상품 코드 중복 체크
export async function checkProductCdExists(productCd) {
  const url = `${PRODUCT_BASE}/exist/${productCd}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);

  const data = await res.json();
  return data;
}

//상품 등록
export async function registerProduct(payload) {
  const res = await fetch(PRODUCT_BASE, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error : ${res.status}`);
  const data = await res.json();
  if (data.length === 0) return null;
  return data;
}
