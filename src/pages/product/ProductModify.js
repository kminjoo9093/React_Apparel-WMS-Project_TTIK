import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../../css/ProductDetail.module.css'; 

const ProductEdit = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 상세 조회 페이지의 항목 데이터 유지
  const [product, setProduct] = useState({
    productCode: "SKU-B001",
    productName: "비스포크 냉장고",
    category: "가전 > 주방",
    basicPrice: "2500000",
    inboundUnit: "1ea (낱개)",
    brand: "Samsung",
    locateInfo: "P-13C",
    inventoryThreshold: "5",
    currentQuantity: "12"
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempCode, setTempCode] = useState(product.productCode);

  const handleChange = (e, field) => {
    setProduct({ ...product, [field]: e.target.value });
  };

  // 1. 수정 완료 버튼 클릭 시 실행되는 함수
  const handleSave = () => {
    // 여기에 Oracle DB Update를 위한 API 호출 코드가 들어갑니다.
    console.log("DB 저장 데이터:", product);
    
    alert("상품 정보 수정이 완료되었습니다.");
    
    // 2. 수정 완료 후 상세 페이지로 이동
    // 주소는 실제 프로젝트의 Route 경로에 맞춰 수정하세요.
    navigate('/product/productDetail'); 
  };

  return (
    <div style={{ padding: '60px', width: '1100px', margin: '0 auto', background: '#fff', borderRadius: '30px' }}>
      
      {/* 상단 상품코드 및 대형 제품명 */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '18px' }}>{product.productCode}</span>
          <button 
            onClick={() => { setTempCode(product.productCode); setIsPopupOpen(true); }}
            style={{ padding: '4px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
          >
            코드 변경
          </button>
        </div>
        <input 
          type="text"
          value={product.productName}
          onChange={(e) => handleChange(e, 'productName')}
          style={{ fontSize: '3rem', fontWeight: '900', border: 'none', borderBottom: '3px solid #ffffffff', width: '100%', outline: 'none', color: '#2563eb' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '100px' }}>
        {/* 왼쪽: 기본 정보 (블루 라벨) */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content', marginBottom: '25px' }}>기본 정보</h3>
          <EditField label="상품코드(SKU)" value={product.productCode} disabled />
          <EditField label="제품명" value={product.productName} onChange={(e) => handleChange(e, 'productName')} />
          <EditField label="카테고리" value={product.category} onChange={(e) => handleChange(e, 'category')} />
          <EditField label="기본 단가" value={product.basicPrice} onChange={(e) => handleChange(e, 'basicPrice')} isNumber suffix="원" />
          <EditField label="입수량" value={product.inboundUnit} onChange={(e) => handleChange(e, 'inboundUnit')} />
        </div>

        {/* 오른쪽: 상세 정보 (그린 라벨) */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content', marginBottom: '25px' }}>상세 정보</h3>
          <EditField label="브랜드" value={product.brand} onChange={(e) => handleChange(e, 'brand')} />
          <EditField label="위치정보" value={product.locateInfo} onChange={(e) => handleChange(e, 'locateInfo')} />
          <EditField label="현재재고" value={product.currentQuantity} disabled suffix="EA" />
          <EditField label="재고 임계치" value={product.inventoryThreshold} onChange={(e) => handleChange(e, 'inventoryThreshold')} isNumber suffix="개 미만 알림" />
        </div>
      </div>

      {/* 하단 버튼 그룹 (가로 100% 채움) */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '80px' }}>
        <button 
          onClick={() => navigate(-1)} // 취소 시 이전 페이지(상세)로 이동
          style={{ flex: 1, height: '50px', fontSize: '22px', fontWeight: '600', borderRadius: '40px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}
        >
          취 소
        </button>
        <button 
          onClick={handleSave} // 수정 완료 버튼
          style={{ flex: 1, height: '50px', fontSize: '22px', fontWeight: '600', borderRadius: '40px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          수 정 완 료
        </button>
      </div>

      {/* 상품 코드 수정 선택 팝업 */}
      {isPopupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', width: '450px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '24px', marginBottom: '15px' }}>상품 코드 변경</h4>
            <p style={{ color: '#ef4444', marginBottom: '25px' }}>코드를 변경하면 모든 데이터에 영향을 줄 수 있습니다.</p>
            <input 
              style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '25px', textAlign: 'center' }}
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setIsPopupOpen(false)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>취소</button>
              <button 
                onClick={() => { setProduct({...product, productCode: tempCode}); setIsPopupOpen(false); }}
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

// 입력 필드 컴포넌트
const EditField = ({ label, value, onChange, disabled, isNumber, suffix }) => (
  <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <label style={{ color: '#64748b', fontWeight: 'bold', fontSize: '16px' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '60%' }}>
      <input 
        type={isNumber ? "number" : "text"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ 
          width: '100%', padding: '10px 0', border: 'none', 
          borderBottom: disabled ? '1px dashed #cbd5e1' : '1px solid #cbd5e1',
          fontSize: '18px', textAlign: 'right', outline: 'none', background: 'transparent',
          color: disabled ? '#94a3b8' : '#1e293b'
        }}
      />
      {suffix && <span style={{ color: '#64748b', fontSize: '16px', minWidth: '40px' }}>{suffix}</span>}
    </div>
  </div>
);

export default ProductEdit;