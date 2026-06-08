import styleProdModal from "../css/ProductModal.module.css";
import styleCommonModal from "../css/Modal.module.css";
import { useCloseModal, useModalConfig } from "../store/productModal";
import BrandSearchModal from "../pages/product/BrandSearchModal";
import ProductSeasonModal from "../pages/product/ProductSeasonModal";
import ProductCodeModal from "../pages/product/ProductCodeModal";

function RegisterModalFrame() {
  const modalConfig = useModalConfig();
  const closeModal = useCloseModal();

  if (!modalConfig.isOpen) return null;

  // 모달
  const titles = {
    brand: "브랜드 검색",
    season: "시즌 등록",
    productCode: "상품 코드 생성",
  };

  const contents = {
    brand: <BrandSearchModal />,
    season: <ProductSeasonModal />,
    productCode: <ProductCodeModal />,
  };

  return (
    <div className={styleCommonModal.modalOverlay} onClick={closeModal}>
      {/* stopPropagation -> 클릭 시 모달이 닫힘을 방지 */}
      <div
        className={styleProdModal.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styleCommonModal.modalHeader}>
          <h3 className={styleProdModal.modalTitle}>{titles[modalConfig.type]}</h3>
          <button
            className={styleProdModal.closeBtn}
            onClick={closeModal}
          ></button>
        </div>
        {contents[modalConfig.type]}
      </div>
    </div>
  );
}

export default RegisterModalFrame;
