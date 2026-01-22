import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import style from '../../css/ProductModify.module.css'; 

const ProductModify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempCode, setTempCode] = useState("");

  useEffect(() => {
    if (location.state && location.state.product) {
      const p = location.state.product;
      setProduct(p); 
      setTempCode(p.gds_cd || "");
    }
  }, [location.state]);

  const handleChange = (e, field) => {
    const value = (field === 'untprc' || field === 'threshold' || field === 'inbox_qty') 
      ? Number(e.target.value) 
      : e.target.value;
    setProduct({ ...product, [field]: value });
  };
  
  // 💡 여기서 'saveData' 중복 선언된 걸 'finalData' 하나로 완전히 풀었어!
const handleSave = async () => {
  if (!window.confirm("변경 내용을 DB에 최종 저장하시겠습니까?")) return;

  const fromArchive = location.state?.fromArchive;

  // 변수 선언은 딱 한 번만!
  const finalData = {
    ...product,
// 1. 상태값 처리: 보관함에서 왔으면 'Y'로 확실히 변경
      gds_enabled: fromArchive ? 'Y' : (product.gds_enabled || 'Y'),
      
      // 2. 필수 코드 데이터 (Oracle DB 규격 매핑)
      gds_cd: product.gds_cd,
      gds_nm: product.gds_nm,
      season_cd: product.season_cd,
      brand_sn: product.brand_sn,
      gds_cat_cd: product.gds_cat_cd,
      size_cd: product.size_cd,

      // 3. 숫자 타입 데이터 보정
      untprc: Number(product.untprc) || 0,
      threshold: Number(product.threshold) || 0,
      inbox_qty: Number(product.inbox_qty) || 0
    };

    try {
      // 💡 이제 변수 에러(ts2451)가 없으니까 서버로 데이터가 제대로 날아가.
      const response = await axios.post('https://localhost:3001/ttik/product/update', finalData);
      
      if (response.status === 200) {
        alert(fromArchive ? "복구 및 수정 완료!" : "수정 완료!");
        // 연동 성공 후 상세 페이지로 이동
        navigate('/product/productDetail', { state: { product: finalData } });
      }
    } catch (error) {
      console.error("연동 실패 원인:", error);
      alert("서버 연동 실패! 백엔드가 켜져 있는지 확인 부탁드립니다.");
    }
  };
  return (
    <div style={{ padding: '60px', width: '1100px', margin: '0 auto', background: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      {/* UI 디자인은 100% 네가 만든 그대로야 */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '18px' }}>CODE: {product.gds_cd}</span>
          <button 
            onClick={() => { setTempCode(product.gds_cd); setIsPopupOpen(true); }}
            style={{ padding: '4px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
          >
            코드 변경
          </button>
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

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ flex: 1, height: '50px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '15px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}>취 소</button>
        <button onClick={handleSave} style={{ flex: 1, height: '50px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '15px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>수 정 완 료</button>
      </div>

      {isPopupOpen && (
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
    </div>
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