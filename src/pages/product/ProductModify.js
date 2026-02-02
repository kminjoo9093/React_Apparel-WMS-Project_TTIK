import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import style from '../../css/ProductModify.module.css'; 
import serverUrl from "../../db/server.json" 
import Modal from '../../components/Modal';

const ProductModify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = serverUrl.SERVER_URL;

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const [product, setProduct] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempCode, setTempCode] = useState("");

useEffect(() => {
  if (location.state && location.state.product) {
    const p = location.state.product;
    // 📍 백엔드에서 대문자로 줄 경우를 대비해 소문자로 표준화해서 state에 저장
    const normalizedProduct = {
      ...p,
      gds_cd: p.GDS_CD || p.gds_cd || "",
      gds_nm: p.GDS_NM || p.gds_nm || "",
      untprc: p.UNTPRC || p.untprc || 0,
      threshold: p.THRESHOLD || p.threshold || 0,
      inbox_qty: p.INBOX_QTY || p.inbox_qty || 0,
      season_cd: p.SEASON_CD || p.season_cd || "",
      brand_sn: p.BRAND_SN || p.brand_sn || "",
      gds_cat_cd: p.GDS_CAT_CD || p.gds_cat_cd || "",
      size_cd: p.SIZE_CD || p.size_cd || ""
    };
    setProduct(normalizedProduct); 
    setTempCode(normalizedProduct.gds_cd);
  }
}, [location.state]);

  const handleChange = (e, field) => {
    const value = (field === 'untprc' || field === 'threshold' || field === 'inbox_qty') 
      ? Number(e.target.value) 
      : e.target.value;
    setProduct({ ...product, [field]: value });
  };
  
  const handleSave = async () => {
    setModal({
      isOpen: true,
      title: 'Save',
      message: "변경 내용을 DB에 최종 저장하시겠습니까?",
      onCancel: closeModal,
      onConfirm: async () => {
        const fromArchive = location.state?.fromArchive;

        const finalData = {
          ...product,
          gds_enabled: fromArchive ? 'Y' : (product.gds_enabled || 'Y'),
          gds_cd: product.gds_cd,
          gds_nm: product.gds_nm,
          season_cd: product.season_cd,
          brand_sn: product.brand_sn,
          gds_cat_cd: product.gds_cat_cd,
          size_cd: product.size_cd,
          untprc: Number(product.untprc) || 0,
          threshold: Number(product.threshold) || 0,
          inbox_qty: Number(product.inbox_qty) || 0
        };

        try {
          const response = await axios.post(
            `${SERVER_URL}/ttik/product/update`,
            finalData,
            { withCredentials: true }
          );

          if (response.status === 200) {
            setModal({
              isOpen: true,
              title: 'Again',
              message: fromArchive ? "복구 및 수정 완료!" : "수정 완료!",
              onConfirm: () => {
                closeModal();
                navigate(`/product/productDetail/${finalData.gds_cd}`);
              }
            });
          }
        } catch (error) {
          console.error("저장 에러:", error);
          setModal({
            isOpen: true,
            title: 'Again',
            message: "서버 연동 실패!",
            onConfirm: closeModal
          });
        }
      }
    });
  };

  return (
    <>
    <Modal
        {...modal} 
    />
    {/* 📍 기존의 넓은 패딩과 중앙 정렬 디자인 그대로 유지 */ }
    <div style={{ padding: '5% 40px', width: '90%', maxWidth: '1100px', margin: '0 auto', background: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '18px' }}>CODE: {product.gds_cd}</span>
          
          {/* 📍 코드 변경 버튼 - 삭제 안 하고 주석 처리만 함 */}
          {/* <button 
            onClick={() => { setTempCode(product.gds_cd); setIsPopupOpen(true); }}
            style={{ padding: '4px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
          >
            코드 변경
          </button> 
          */}
        </div>

        <input 
          type="text"
          value={product.gds_nm || ""}
          onChange={(e) => handleChange(e, 'gds_nm')}
          style={{ fontSize: '3rem', fontWeight: '900', border: 'none', borderBottom: '3px solid #2563eb', width: '100%', outline: 'none', color: '#2563eb', paddingBottom: '10px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '100px', marginBottom: '50px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content', marginBottom: '25px' }}>기본 정보</h3>
          <EditField label="시즌" value={product.season_nm} disabled />
          <EditField label="브랜드" value={product.brand_nm || "정보 없음"} disabled /> 
          <EditField label="단가" value={product.untprc} onChange={(e) => handleChange(e, 'untprc')} isNumber suffix="원" />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content', marginBottom: '25px' }}>상세 정보</h3>
          <EditField label="카테고리" value={product.gds_cat_nm} disabled /> 
          <EditField label="사이즈" value={product.size_nm} disabled /> 
          <EditField label="임계치" value={product.threshold} onChange={(e) => handleChange(e, 'threshold')} isNumber suffix="EA" />
          <EditField label="입수 수량" value={product.inbox_qty} onChange={(e) => handleChange(e, 'inbox_qty')} isNumber suffix="EA" />
        </div>
      </div>

      {/* 📍 하단 꽉 차는 큰 버튼들 그대로 보존 */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ flex: 1, height: '50px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '15px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}>취 소</button>
        <button onClick={handleSave} style={{ flex: 1, height: '50px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '15px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>수 정 완 료</button>
      </div>

      {/* 📍 팝업 영역 - 주석 처리만 함 */}
      {/* {isPopupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', width: '450px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '24px', marginBottom: '15px' }}>상품 코드 변경</h4>
            <input 
              style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '25px', textAlign: 'center' }}
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setIsPopupOpen(false)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>취소</button>
              <button 
                onClick={() => { setProduct({...product, gds_cd: tempCode}); setIsPopupOpen(false); }}
                style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: '#000', color: '#fff' }}
              >
                변경 적용
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
    </>
  );
};

const EditField = ({ label, value, onChange, disabled, isNumber, suffix }) => (
  <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <label style={{ color: '#64748b', fontWeight: 'bold', fontSize: '16px' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '60%' }}>
      <input 
        type={isNumber ? "number" : "text"}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        style={{ 
          width: '100%', padding: '10px 0', border: 'none', 
          borderBottom: disabled ? '1px dashed #cbd5e1' : '1px solid #2563eb',
          fontSize: '18px', textAlign: 'right', outline: 'none', background: 'transparent'
        }}
      />
      {suffix && <span style={{ color: '#64748b', fontSize: '16px', minWidth: '40px' }}>{suffix}</span>}
    </div>
  </div>
);

export default ProductModify;