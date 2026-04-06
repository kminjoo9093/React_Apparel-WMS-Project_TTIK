import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styleRegister from "../../css/ProductRegister.module.css";
import RegistModalFrame from "../../components/RegistModalFrame";
import ProductSeason from "./ProductSeason";
import ProductCode from "./ProductCode";
import ModalBrandSearch from "./ModalBrandSearch";
import Alert from "../../components/Alert";
import { CommonButton } from "../../components/CommonButton";
import { registerProduct } from "../../api/product";
import PageInfo from "../../components/PageInfo";
import {
  useErrors,
  useFormData,
  useProductCd,
  useSetFormData,
  useSetProductCd,
} from "../../store/product";
import { useCloseModal, useModalConfig } from "../../store/productModal";
import ProductBasicInfo from "../../components/ProductBasicInfo";
import ProductStockInfo from "../../components/ProductStockInfo";
import ProductCodeField from "../../components/ProductCodeField";

function ProductRegister() {
  const navigate = useNavigate();

  const formData = useFormData();
  const setFormData = useSetFormData();
  const errors = useErrors();
  const productCd = useProductCd();
  const setProductCd = useSetProductCd();
  const modalConfig = useModalConfig();
  const closeModal = useCloseModal();

  //alert
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  const closeAlert = () => setAlert({ ...alert, isOpen: false });

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
        return (
          <ModalBrandSearch
            onClose={closeModal}
            setBrandCd={(value) => setFormData({ brandCd: value })}
          />
        );
      case "season":
        return <ProductSeason onClose={closeModal} />;
      case "productCode":
        return (
          <ProductCode
            onClose={closeModal}
            productCd={modalConfig.props.productCd}
            setProductCd={setProductCd}
          />
        );
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
  async function handleSubmit(e) {
    e.preventDefault();

    if (!productCd) {
      setAlert({
        isOpen: true,
        title: "Again",
        message: "상품코드를 생성해야 등록이 가능합니다.",
        onConfirm: closeAlert,
      });
      return;
    }

    const hasError = Object.values(errors).some((val) => val === true);
    if (hasError)
      setAlert({
        isOpen: true,
        title: "Again",
        message: "입력값을 확인하세요",
        onConfirm: closeAlert,
      });

    try {
      const res = await registerProduct({
        productCd: productCd,
        styleNo: formData.styleNo,
        productNm: formData.productNm,
        brandSn: Number(formData.brandCd),
        sizeCd: formData.sizeCd,
        catCd: formData.brandCd,
        seasonCd: formData.seasonCd,
        inboxQty: Number(formData.inboxQty), //입수량
        price: Number(formData.price), //단가
        threshold: Number(formData.threshold), //임계치
      });

      setAlert({
        isOpen: true,
        title: "Success",
        message: "상품 등록이 완료되었습니다.",
        onConfirm: () => {
          closeAlert(); // 모달 닫기
          navigate("/product/list"); // 확인 후 이동
        },
      });
      setFormData({
        brandCd: "",
        productNm: "",
        category: "",
        seasonCd: "",
        sizeCd: "",
        inboxQty: "",
        price: "",
        threshold: "",
        styleNo: "",
      });

      setProductCd("");
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Again",
        message: "입력한 정보를 확인하세요.",
        onConfirm: closeAlert,
      });
    }
  }

  return (
    <div className={`${styleRegister.register} container`}>
      <PageInfo title={"Register"} description={"상품을 등록하세요."} />
      <div className={`${styleRegister.content} contentBox`}>
        <form onSubmit={handleSubmit} className={styleRegister.registerForm}>
          <ProductBasicInfo />
          <ProductStockInfo />
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

      <Alert {...alert} />
    </div>
  );
}

export default ProductRegister;
