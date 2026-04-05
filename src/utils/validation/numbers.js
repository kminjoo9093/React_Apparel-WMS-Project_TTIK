export function checkNumber(value) {
  const isInvalid = Number(value) < 0;
  return {
    isInvalid,
    message: isInvalid ? "0 이상의 숫자를 입력하세요." : "",
  };
}
