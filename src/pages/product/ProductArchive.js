import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../../css/ProductArchive.module.css';

const ProductArchive = () => {
  const navigate = useNavigate();
  
  // 가상 데이터 (나중에 DB와 연동)
  const [archiveList, setArchiveList] = useState([
    { id: 1, productCode: "SKU-B001", productName: "비스포크 냉장고", category: "가전 > 주방", archiveDate: "2026-01-08", lastQty: 0 },
    { id: 2, productCode: "SKU-C011", productName: "AI 전용 세탁기", category: "가전 > 생활", archiveDate: "2026-01-07", lastQty: 0 }
  ]);

  // 버튼 스타일 정의 (상세 페이지의 톤과 일치)
  const restoreBtnStyle = {
    marginRight: '8px',
    padding: '10px 20px',
    background: '#2563eb', 
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '15px'
  };

  const deleteBtnStyle = {
    padding: '10px 20px',
    background: '#fff',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '15px'
  };

  // 수정 후 복구 (Modify 페이지로 데이터 전달)
  const handleEditAndRestore = (product) => {
    if (window.confirm(`[${product.productName}] 상품 정보를 수정하며 복구하시겠습니까?`)) {
      navigate('/product/productModify', { state: { product, fromArchive: true } });
    }
  };

  // 영구 삭제
  const handlePermanentDelete = (id) => {
    if (window.confirm("정말로 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setArchiveList(archiveList.filter(item => item.id !== id));
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        📦 관리 제외 품목 (Archive)
      </h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>상품코드</th>
            <th>제품명</th>
            <th>보관 처리일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {archiveList.map(product => (
            <tr key={product.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
              <td style={{ padding: '15px' }}>{product.productCode}</td>
              <td style={{ fontWeight: '600' }}>{product.productName}</td>
              <td style={{ color: '#888' }}>{product.archiveDate}</td>
              <td>
                <span style={{ color: '#d32f2f', fontWeight: 'bold', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                  비활성
                </span>
              </td>
              <td>
                {/* 정의된 스타일 변수 적용 */}
                <button 
                  onClick={() => handleEditAndRestore(product)} 
                  style={restoreBtnStyle}
                >
                  수정 후 복구
                </button>
                <button 
                  onClick={() => handlePermanentDelete(product.id)} 
                  style={deleteBtnStyle}
                >
                  영구 삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductArchive;
