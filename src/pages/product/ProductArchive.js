import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import style from '../../css/ProductArchive.module.css';
import serverUrl from "../../db/server.json";
import Modal from '../../components/Modal';

const ProductArchive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = serverUrl.SERVER_URL;
  
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const [archiveList, setArchiveList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 데이터 로딩 및 location state 합치기
  useEffect(() => {
    const fetchArchiveList = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${SERVER_URL}/ttik/product/productArchive`, {
            withCredentials: true
        });
        let combined = Array.isArray(res.data) ? res.data : [];

        // 방금 삭제 처리되어 넘어온 데이터가 있다면 리스트 최상단에 추가
        if (location.state && location.state.product) {
          const newProduct = location.state.product;
          if (!combined.some(item => item.gds_cd === newProduct.gds_cd)) {
            combined = [{
              ...newProduct,
              archiveDate: new Date().toISOString().split('T')[0]
            }, ...combined];
          }
        }
        setArchiveList(combined);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setErrorMsg('보관 상품 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArchiveList();
  }, [SERVER_URL, location.state]);

  // 수정 후 복구
  const handleEditAndRestore = (product) => {
    if (window.confirm(`[${product.gds_nm}] 상품 정보를 수정하며 복구하시겠습니까?`)) {
      navigate('/product/productModify', { state: { product, fromArchive: true } });
    }
  };

  // 영구 삭제 (DB에서 진짜 지우기) ProductArchive.js 수정
  const handlePermanentDelete = async (gds_cd) => {
    if (!window.confirm("정말로 영구 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${SERVER_URL}/ttik/product/productArchive/${gds_cd}`, {
        withCredentials: true // 🔐 이 줄이 없어서 로그인 페이지로 튕기는 거야!
      });
      
      // 성공 시 로직...
      setModal({
          isOpen: true,
          title: 'Delete',
          message: '영구 삭제되었습니다.',
          onConfirm: () => {
            navigate("/product/list");
          }
        });
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <>
    <Modal
        {...modal} 
    />
    <div className={style['archive-wrapper']}>
      <h2 className={style['archive-title']}>
        📦 관리 제외 품목 (Archive)
      </h2>

      <div className={style['table-container']}>
        <table className={style['archive-table']}>
          <thead>
            <tr>
              <th className={style['col-cd']}>상품코드</th>
              <th className={style['col-nm']}>제품명</th>
              <th className={style['col-date']}>보관 처리일</th>
              <th className={style['col-status']}>상태</th>
              <th className={style['col-ctrl']}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className={style['status-msg']}>데이터 불러오는 중...</td></tr>
            ) : errorMsg ? (
              <tr><td colSpan="5" className={style['status-msg']} style={{ color: 'red' }}>{errorMsg}</td></tr>
            ) : archiveList.length === 0 ? (
              <tr><td colSpan="5" className={style['status-msg']}>보관된 품목이 없습니다.</td></tr>
            ) : (
              archiveList.map((product, index) => (
                <tr key={product.gds_cd || index}>
                  <td className={style['col-cd']}>{product.gds_cd}</td>
                  <td className={style['col-nm']}>{product.gds_nm}</td>
                  <td className={style['col-date']}>
                    {product.archiveDate || (product.frst_reg_dt ? product.frst_reg_dt.split(' ')[0] : '-')}
                  </td>
                  <td className={style['col-status']}>
                    <span className={style['status-badge']}>비활성</span>
                  </td>
                  <td className={style['col-ctrl']}>
                    <div className={style['btn-group']}>
                      <button 
                        onClick={() => handleEditAndRestore(product)} 
                        className={style['restore-btn']}
                      >
                        수정 후 복구
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(product.gds_cd)} 
                        className={style['delete-btn']}
                      >
                        영구 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default ProductArchive;