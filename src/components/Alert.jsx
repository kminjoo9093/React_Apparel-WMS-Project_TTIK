import style from "../css/Modal.module.css";
import { useAlertState, useCloseAlert } from "../store/alert";

const Alert = () => {
  const { isOpen, title, message, type, onConfirm, onCancel } = useAlertState();
  const closeAlert = useCloseAlert();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onCancel) onCancel();
      else if (onConfirm) onConfirm();
      else closeAlert();
    }
  };

  return (
    <div className={style.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${style.modalContent} ${type ? style[type] : ""}`}>
        <div className={style.modalHeader}>
          <h3>{title}</h3>
        </div>
        <div className={style.modalBody}>
          <p>{message}</p>
        </div>
        <div className={style.modalFooter}>
          <button className={style.confirmBtn} onClick={onConfirm}>
            확인
          </button>
          {onCancel && (
            <button className={style.confirmBtn} onClick={onCancel}>
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
