import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import style from '../../css/ProductArchive.module.css';

const ProductArchive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 상태 초기화
  const [archiveList, setArchiveList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 2. 상세 페이지에서 넘어온 상품 추가
  useEffect(() => {
    if (location.state && location.state.product) {
      const newProduct = location.state.product;
      setArchiveList(prevList => {
        const isExist = prevList.some(item => item.gds_cd === newProduct.gds_cd);
        if (isExist) return prevList;
        return [{
          ...newProduct,
          archiveDate: new Date().toISOString().split('T')[0] // 오늘 날짜
        }, ...prevList];
      });
    }
  }, [location.state]);

  // 3. 서버에서 관리 제외 상품 목록 가져오기
  useEffect(() => {
    const fetchArchiveList = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/api/product/archive'); // 서버 API 호출
        if (Array.isArray(res.data)) {
          setArchiveList(prev => {
            // 중복 제거 후 합치기
            const combined = [...res.data];
            prev.forEach(p => {
              if (!combined.some(item => item.gds_cd === p.gds_cd)) {
                combined.unshift(p); // 새로 넘어온 상품은 앞에
              }
            });
            return combined;
          });
        }
      } catch (error) {
        console.error(error);
        setErrorMsg('보관 상품 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArchiveList();
  }, []);

  // 버튼 스타일 (UI 그대로)
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

  // 수정 후 복구
  const handleEditAndRestore = (product) => {
    if (window.confirm(`[${product.gds_nm}] 상품 정보를 수정하며 복구하시겠습니까?`)) {
      navigate('/product/productModify', { state: { product, fromArchive: true } });
    }
  };

  // 영구 삭제 (UI 상에서만 제거, 서버 호출 X)
  const handlePermanentDelete = async (gds_cd) => {
      if (!window.confirm("정말로 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

      try {
        // 서버 API 호출 (DELETE 요청으로 실제 DB 데이터 삭제)
        await axios.delete(`https://localhost:3001/api/product/archive/${gds_cd}`);
        
        // UI 갱신
        setArchiveList(prev => prev.filter(item => item.gds_cd !== gds_cd));
        alert('영구 삭제되었습니다.');

        // 요구사항 반영: 삭제 후 목록 화면(/productList)
        navigate('/productList');
        
      } catch (error) {
        console.error(error);
        alert('삭제 중 오류가 발생했습니다.');
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
          {loading ? (
            <tr><td colSpan="5" style={{ padding: '50px', textAlign: 'center' }}>데이터 불러오는 중...</td></tr>
          ) : errorMsg ? (
            <tr><td colSpan="5" style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg}</td></tr>
          ) : archiveList.length === 0 ? (
            <tr><td colSpan="5" style={{ padding: '50px', color: '#94a3b8', textAlign: 'center' }}>보관된 품목이 없습니다.</td></tr>
          ) : (
            archiveList.map((product, index) => (
              <tr key={product.gds_cd || index} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <td style={{ padding: '15px' }}>{product.gds_cd}</td>
                <td style={{ fontWeight: '600' }}>{product.gds_nm}</td>
                <td style={{ color: '#888' }}>{product.archiveDate || product.frst_reg_dt}</td>
                <td>
                  <span style={{ color: '#d32f2f', fontWeight: 'bold', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                    비활성
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEditAndRestore(product)} style={restoreBtnStyle}>
                    수정 후 복구
                  </button>
                  <button onClick={() => handlePermanentDelete(product.gds_cd)} style={deleteBtnStyle}>
                    영구 삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductArchive;