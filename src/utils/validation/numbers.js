export function checkNumber(value) {
  const num = Number(value);
  const isInvalid = value !== ""  && ( isNaN(num) || num < 0);
  return {
    isInvalid,
    message: isInvalid ? "0 이상의 숫자를 입력하세요." : "",
  };
}
