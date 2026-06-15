import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styleRegister from "../../css/ProductRegister.module.css";
import { CommonButton } from "../../components/CommonButton";
import PageInfo from "../../components/PageInfo";
import {
  useErrors,
  useFormData,
  useProductCd,
  useResetFormData,
  useSetProductCd,
} from "../../store/product";
import ProductBasicInfoField from "../../components/ProductBasicInfoField";
import ProductStockInfoField from "../../components/ProductStockInfoField";
import ProductCodeField from "../../components/ProductCodeField";
import { useOpenAlert } from "../../store/alert";
import { useRegisterProduct } from "../../hooks/mutations/useRegisterProduct";

function ProductRegister() {
  const navigate = useNavigate();

  const formData = useFormData();
  const errors = useErrors();
  const productCd = useProductCd();
  const setProductCd = useSetProductCd();
  const resetFormData = useResetFormData();
  const openAlert = useOpenAlert();

  const { mutate: registerProduct } = useRegisterProduct();


  // 인풋 값 변경 시 상품 코드 초기화
  useEffect(() => {
    setProductCd("");
  }, [
    formData.brandCd,
    formData.seasonCd,
    formData.category,
    formData.sizeCd,
    formData.styleNo,
  ]);

  // 상품 등록 처리
  function handleSubmit(e) {
    e.preventDefault();

    if (!productCd) {
      openAlert({
        title: "Again",
        message: "상품코드를 생성해야 등록이 가능합니다.",
      });
      return;
    }

    const hasError = Object.values(errors).some((val) => val === true);
    if (hasError) {
      openAlert({
        title: "Again",
        message: "입력값을 확인하세요",
      });
      return;
    }

    registerProduct(
      {
        productCd: productCd,
        styleNo: formData.styleNo,
        productNm: formData.productNm,
        brandSn: Number(formData.brandCd),
        sizeCd: formData.sizeCd,
        catCd: formData.category,
        seasonCd: formData.seasonCd,
        inboxQty: Number(formData.inboxQty),
        price: Number(formData.price),
        threshold: Number(formData.threshold),
      },
      {
        onSuccess: () => {
          openAlert({
            title: "Success",
            message: "상품 등록이 완료되었습니다.",
            onConfirm: () => {
              resetFormData();
              navigate("/product/list");
            },
          });

        },
        onError: () => {
          openAlert({
            title: "Again",
            message: "입력한 정보를 확인하세요.",
          });
        },
      },
    );
  }

  useEffect(() => {
    return () => resetFormData();
  }, []);

  return (
    <div className={`${styleRegister.register} container`}>
      <PageInfo title={"Register"} description={"상품을 등록하세요."} />
      <div className={`${styleRegister.content} contentBox`}>
        <form onSubmit={handleSubmit} className={styleRegister.registerForm}>
          <ProductBasicInfoField />
          <ProductStockInfoField />
          <ProductCodeField />
          <div className={styleRegister.formBtnWrap}>
            <CommonButton variant="primary" type="submit">
              등록
            </CommonButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductRegister;
