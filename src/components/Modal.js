import React from 'react';
import style from '../css/Modal.module.css';

const Modal = ({ isOpen, title, message, type, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={style.modalOverlay}>
      <div className={`${style.modalContent} ${style[type]}`}>
        <div className={style.modalHeader}>
          <h3>{title}</h3>
        </div>
        <div className={style.modalBody}>
          <p>{message}</p>
        </div>
        <div className={style.modalFooter}>
          <button className={style.confirmBtn} onClick={onConfirm}>확인</button>
          {onCancel && (
            <button className={style.confirmBtn} onClick={onCancel}>취소</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;