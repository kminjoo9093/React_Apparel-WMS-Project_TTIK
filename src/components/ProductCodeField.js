import styleRegister from "../css/ProductRegister.module.css";
import { useState } from "react";
import { CommonButton } from "./CommonButton";
import { useFormData, useProductCd, useSetProductCd } from "../store/product";
import { useOpenModal } from "../store/productModal";
import { createProductCd } from "../api/product";
import Alert from "./Alert";

export default function ProductCodeField() {
  const formData = useFormData();
  const openModal = useOpenModal();
  const productCd = useProductCd();
  const setProductCd = useSetProductCd();

  //alert
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  const closeAlert = () => setAlert({ ...alert, isOpen: false });

  // 상품 코드 생성 & 모달 오픈
  async function generateProductCd() {
    try {
      const code = await createProductCd({
        styleNo: formData.styleNo,
        brandCd: formData.brandCd,
        sizeCd: formData.sizeCd,
        catCd: formData.category,
        seasonCd: formData.seasonCd,
      });
      setProductCd(code);
      return code;
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: "입력한 정보를 확인하세요.",
        onConfirm: closeAlert,
      });
      return null;
    }
  }

  async function handleProductCd() {
    if (
      !formData.brandCd ||
      !formData.seasonCd ||
      !formData.category ||
      !formData.sizeCd
    ) {
      setAlert({
        isOpen: true,
        title: "Again",
        message: "브랜드, 품번, 시즌, 카테고리, 사이즈를 모두 입력해야 합니다.",
        onConfirm: closeAlert,
      });
      return;
    }

    // 상품 코드 생성
    const newProductCd = await generateProductCd();
    if (!newProductCd) return;

    // 모달 오픈
    openModal("productCode", { productCd: newProductCd });
  }

  return (
    <fieldset className={styleRegister.codeInfo}>
      <div className={styleRegister.row}>
        <div className={styleRegister.col}>
          <label className={`${styleRegister.required} ${styleRegister.label}`}>
            상품 코드
          </label>
          <input
            type="text"
            placeholder="생성 버튼을 누르세요"
            readOnly
            value={productCd}
          ></input>
          <CommonButton
            variant="secondary"
            type="button"
            onClick={handleProductCd}
          >
            생성
          </CommonButton>
        </div>
      </div>
      <Alert {...alert} /> 
    </fieldset>
  );
}
