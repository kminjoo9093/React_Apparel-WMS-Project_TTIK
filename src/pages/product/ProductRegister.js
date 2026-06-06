import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styleRegister from "../../css/ProductRegister.module.css";
import RegistModalFrame from "../../components/RegistModalFrame";
import ProductSeasonModal from "./ProductSeasonModal";
import ProductCodeModal from "./ProductCodeModal";
import BrandSearchModal from "./BrandSearchModal";
import { CommonButton } from "../../components/CommonButton";
import { registerProduct } from "../../api/product/fetchProductRegisterData";
import PageInfo from "../../components/PageInfo";
import {
  useErrors,
  useFormData,
  useProductCd,
  useResetFormData,
  useSetProductCd,
} from "../../store/product";
import { useCloseModal, useModalConfig } from "../../store/productModal";
import ProductBasicInfoField from "../../components/ProductBasicInfoField";
import ProductStockInfoField from "../../components/ProductStockInfoField";
import ProductCodeField from "../../components/ProductCodeField";
import { useOpenAlert } from "../../store/alert";
import { useRegisterProduct } from "../../hooks/mutations/useRegisterProduct";
import { useQueryClient } from "@tanstack/react-query";

function ProductRegister() {
  const navigate = useNavigate();

  const formData = useFormData();
  const errors = useErrors();
  const productCd = useProductCd();
  const setProductCd = useSetProductCd();
  const resetFormData = useResetFormData();
  const modalConfig = useModalConfig();
  const closeModal = useCloseModal();
  const openAlert = useOpenAlert();

  const { mutate: registerProduct } = useRegisterProduct();
  const queryClient = useQueryClient();

  // 모달
  const getModalTitle = (type) => {
    switch (type) {
      case "brand":
        return "브랜드 검색";
      case "season":
        return "시즌 등록";
      case "productCode":
        return "상품 코드 생성";
      default:
        return "";
    }
  };

  const renderModalContent = () => {
    switch (modalConfig.type) {
      case "brand":
        return <BrandSearchModal />;
      case "season":
        return <ProductSeasonModal />;
      case "productCode":
        return <ProductCodeModal />;
      default:
        return null;
    }
  };

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
              //queryClient로 invaidateQueries 상품목록
              navigate("/product/list");
            },
          });

          resetFormData();
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

      <RegistModalFrame
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={getModalTitle(modalConfig.type)}
      >
        {renderModalContent()}
      </RegistModalFrame>
    </div>
  );
}

export default ProductRegister;
