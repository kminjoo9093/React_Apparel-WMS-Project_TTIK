import styleRegister from "../css/ProductRegister.module.css";
import { useErrorMsg, useErrors, useFormData, useSetErrors } from "../store/product";
import { useSetFormData } from "../store/product";
import { checkNumber } from "../utils/validation/numbers";

export default function ProductStockInfo() {
  const formData = useFormData();
  const setFormData = useSetFormData();
  const setErrors = useSetErrors();
  const errorMsg = useErrorMsg();
  const errors = useErrors();

  // 숫자 입력 유효성 검사
  const validateNumber = (e) => {
    const { value, name } = e.target;
    const { isInvalid, message } = checkNumber(value);

    if (!isInvalid) {
      let updateData = {};

      switch (name) {
        case "qty":
          updateData = { inboxQty: value };
          break;
        case "price":
          updateData = { price: value };
          break;
        case "threshold":
          updateData = { threshold: value };
          break;
        default:
          return;
      }
      setFormData(updateData);
    }

    setErrors(name, isInvalid, message);
  };

  return (
    <fieldset className={`${styleRegister.stockInfo}`}>
      <div className={styleRegister.row}>
        <div className={styleRegister.col}>
          <label className={`${styleRegister.required} ${styleRegister.label}`}>
            박스 입수량
            <span className={styleRegister.unit}>(EA/BOX)</span>{" "}
          </label>
          <div className={styleRegister.numberWrapper}>
            <input
              type="number"
              name="qty"
              min="0"
              required
              placeholder="EA 수량 입력"
              value={formData.inboxQty}
              onChange={validateNumber}
            ></input>
            <p
              className={styleRegister.errorMsg}
              style={{ visibility: errors.qty ? "visible" : "hidden" }}
            >
              {errorMsg.qty}
            </p>
          </div>
        </div>
        <div className={`${styleRegister.col} ${styleRegister.right}`}>
          <label className={`${styleRegister.label} ${styleRegister.required}`}>
            단가 (원)
          </label>
          <div className={styleRegister.numberWrapper}>
            <input
              type="number"
              name="price"
              min="0"
              required
              placeholder="개별 단가를 입력해주세요"
              value={formData.price}
              onChange={validateNumber}
            ></input>
            <p
              className={styleRegister.errorMsg}
              style={{ visibility: errors.price ? "visible" : "hidden" }}
            >
              {errorMsg.price}
            </p>
          </div>
        </div>
      </div>
      <div className={styleRegister.row}>
        <div className={styleRegister.col}>
          <label className={styleRegister.label}>임계치</label>
          <div className={styleRegister.numberWrapper}>
            <input
              type="number"
              name="threshold"
              min="0"
              placeholder="알림을 받을 최소 재고 수량 입력"
              value={formData.threshold}
              onChange={validateNumber}
            ></input>
            <p
              className={styleRegister.errorMsg}
              style={{
                visibility: errors.threshold ? "visible" : "hidden",
              }}
            >
              {errorMsg.threshold}
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
