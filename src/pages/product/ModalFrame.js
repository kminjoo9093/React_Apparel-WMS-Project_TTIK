import styleProdModal from "../../css/ProductModal.module.css";
import styleCommonModal from "../../css/Modal.module.css";
// import { children } from "react";

function ModalFrame({isOpen, onClose, title, children}){
    if (!isOpen) return null;
    
    return (
        <div className={styleCommonModal.modalOverlay} onClick={onClose}>
            {/* stopPropagation은 클릭 시 모달이 닫히지 않게 방지 */}
            <div className={styleProdModal.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styleCommonModal.modalHeader}>
                    <h3 className={styleProdModal.modalTitle}>{title}</h3>
                    <button className={styleProdModal.closeBtn} onClick={onClose}></button>
                </div>
                {children} {/* 여기에 각각 다른 컨텐츠가 들어감 */}
            </div>
        </div>
    )
}

export default ModalFrame;