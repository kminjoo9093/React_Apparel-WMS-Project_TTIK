import styleRegister from "../css/ProductRegister.module.css";
import { CommonButton } from "./CommonButton";
import { useFormData, useProductCd, useSetProductCd } from "../store/product";
import { useOpenModal } from "../store/productModal";
import { useOpenAlert } from "../store/alert";
import { useProductCode } from "../hooks/mutations/useProductCode";

export default function ProductCodeField() {
  const formData = useFormData();
  const openModal = useOpenModal();
  const productCd = useProductCd();
  const setProductCd = useSetProductCd();
  const openAlert = useOpenAlert();

  const { mutate: createProductCode } = useProductCode();

  // 상품 코드 생성 & 모달 오픈
  function handleProductCd() {
    if (
      !formData.brandCd ||
      !formData.seasonCd ||
      !formData.category ||
      !formData.sizeCd
    ) {
      openAlert({
        title: "Again",
        message: "브랜드, 품번, 시즌, 카테고리, 사이즈를 모두 입력해야 합니다.",
      });
      return;
    }

    // 상품 코드 생성
    createProductCode(
      {
        styleNo: formData.styleNo,
        brandCd: formData.brandCd,
        sizeCd: formData.sizeCd,
        catCd: formData.category,
        seasonCd: formData.seasonCd,
      },
      {
        onSuccess: (code) => {
          setProductCd(code);
          openModal("productCode", { productCd: code });
        },
        onError: () => {
          openAlert({
            title: "Error",
            message: "입력한 정보를 확인하세요.",
          });
        },
      },
    );
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
    </fieldset>
  );
}
