import styleProdModal from "../css/ProductModal.module.css";
import styleCommonModal from "../css/Modal.module.css";

function RegistModalFrame({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className={styleCommonModal.modalOverlay} onClick={onClose}>
      {/* stopPropagation -> 클릭 시 모달이 닫힘을 방지 */}
      <div
        className={styleProdModal.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styleCommonModal.modalHeader}>
          <h3 className={styleProdModal.modalTitle}>{title}</h3>
          <button
            className={styleProdModal.closeBtn}
            onClick={onClose}
          ></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default RegistModalFrame;
