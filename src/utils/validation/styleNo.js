/* 품번 첫 글자 (성별/구분) */
const STYLE_PREFIXES = ["W", "M", "U", "K"];

/**
 * 품번 입력값 검사 (영문 1자 + 숫자 3자리)
 */
export function checkStyleNo(styleNo) {
  const value = String(styleNo).trim().toUpperCase();

  if (!value) {
    return { ok: false, empty: true };
  }

  const isValidPrefix = STYLE_PREFIXES.some((alpha) => value.startsWith(alpha));
  const num = Number(value.substring(1));
  const isNumber = Number.isInteger(num) && num >= 0 && num < 1000;

  if (value.length === 4 && isValidPrefix && isNumber) {
    return {
      ok: true,
      styleNo: value,
      target: value.substring(0, 1),
    };
  }

  return { ok: false, empty: false };
}
