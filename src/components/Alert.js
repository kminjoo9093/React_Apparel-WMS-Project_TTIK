import style from "../css/Modal.module.css";

const Alert = ({
  isOpen,
  title,
  message,
  type,
  onConfirm = () => {},
  onCancel = () => {},
  onClose = () => {},
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onCancel) onCancel();
      else if (onClose) onClose();
      else if (onConfirm) onConfirm();
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
