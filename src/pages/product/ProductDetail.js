import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import style from '../../css/ProductDetail.module.css';
import serverUrl from "../../db/server.json"
import Modal from '../../components/Modal';

const ProductDetail = () => {
  const { gds_cd } = useParams();
  const navigate = useNavigate();
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const SERVER_URL = serverUrl.SERVER_URL;
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const fetchProductData = async () => {
    try {
    setLoading(true);
    const response = await axios.get(`${SERVER_URL}/ttik/product/productDetail/${gds_cd}`, {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache', // 우리가 아까 넣은 거!
        'Pragma': 'no-cache'
      }
    });

    if (response.data) {
      console.log("서버에서 갓 구워낸 데이터:", response.data);
      // 기존 배열 통째로 갈아치우기
      setCardList([response.data]); 
    }
  } catch (error) {
    console.error("데이터 호출 에러:", error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { 
  // 페이지 들어오자마자 기존 데이터 싹 비우기 (초기화)
  setCardList([]); 
  if(gds_cd) fetchProductData(); 
  }, [gds_cd]); // gds_cd가 바뀔 때마다 실행

  const handleCardClick = () => {
    if (cardList.length <= 1) return;
    setCardList((prev) => [...prev.slice(1), prev[0]]);
  };

const handleDelete = async (product) => {
  // 1. 데이터 누락 방어
  if (!product) {
    setModal({
          isOpen: true,
          title: 'Error',
          message: '상품 정보를 불러올 수 없습니다.',
          onConfirm: closeModal
        });
    return;
  }

  // 2. 대문자/소문자 혼용 및 데이터 추출
  const targetGdsCd = product.GDS_CD || product.gds_cd;
  const targetGdsNm = product.GDS_NM || product.gds_nm || "이 상품";
  // 재고량: 현재고(STK_QTY)를 우선으로 보고 없으면 최초재고라도 확인
  const currentStock = Number(product.STK_QTY ?? product.stk_qty ?? product.frst_stk_qty ?? 0);

  // 3. 재고가 0일 때만 실행
  if (currentStock === 0) {
    const confirmMessage = `[${targetGdsNm}] \n재고가 0입니다. 관리 제외 품목(Archive)으로 이동시킬까요?`;

    setModal({
      isOpen: true,
      title: 'Archive',
      message: confirmMessage,
      onCancel: closeModal,
      onConfirm: async () => {
        try {
          // 📍 axios 인자 구조 및 보안 설정 완벽 계승
          await axios.post(
            `${SERVER_URL}/ttik/product/disable`, 
            { 
              gds_cd: targetGdsCd,
              gds_enabled: 'N'
            }, 
            { 
              withCredentials: true 
            }
          );
          
          setModal({
            isOpen: true,
            title: 'Move',
            message: "관리 제외 품목으로 이동되었습니다.",
            onConfirm: () => {
              closeModal();
              navigate("/product/productArchive");
            }
          });
        } catch (error) {
          console.error("비활성화 처리 에러:", error);
          setModal({
            isOpen: true,
            title: 'Error',
            message: '처리 중 오류가 발생했습니다. (서버 연결 확인 필요)',
            onConfirm: closeModal
          });
        }
      }
    });
  } else {
    // 4. 재고가 남았을 때 차단 (기존 로직 유지)
    setModal({
      isOpen: true,
      title: 'Error',
      message: `현재 재고가 ${currentStock}개 남아있어 삭제할 수 없습니다. \n재고를 먼저 소진해주세요.`,
      onConfirm: closeModal
    });
  }
};

  const handleModifyClick = (product) => {
    navigate('/product/productModify', { state: { product } });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터 로딩 중...</div>;
  if (cardList.length === 0) return <div style={{ textAlign: 'center', marginTop: '100px' }}>표시할 상품이 없습니다.</div>;

  return (
    <>
    <Modal
        {...modal} 
    />
    <div className={style['card-stack-wrapper']} onClick={handleCardClick} style={{ cursor: 'pointer', position: 'relative', minHeight: '100vh', background: '#f8f9fa', paddingBottom: '100px' }}>
          <AnimatePresence mode="popLayout">
            {cardList.slice(0, 3).map((product, index) => {
              // 📍 데이터 추출 로직 동일
              const untprc = Number(product.UNTPRC || product.untprc || 0);
              const inbox = Number(product.INBOX_QTY || product.inbox_qty || 1);
              const gdsNm = product.GDS_NM || product.gds_nm || "이름 없음";
              const gdsCd = product.GDS_CD || product.gds_cd || gds_cd;
              const stock = Number(product.STK_QTY || product.frst_stk_qty || 0);
              const threshold = Number(product.THRESHOLD || product.threshold || 0);

              const isLowStock = stock <= threshold;
              const analysisData = [
                { name: '임계치', qty: threshold, fill: '#cbd5e1' },
                { name: '현재고', qty: stock, fill: isLowStock ? '#ef4444' : '#2563eb' }
              ];

          return (
            <motion.div
              key={gdsCd + index}
              className={style['detail-card']}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: index === 0 ? 1 : 0.6, y: index * 20, scale: 1 - index * 0.05, zIndex: cardList.length - index }}
              exit={{ opacity: 0, x: -500, rotate: -20 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', left: '50%', top: '180px', x: '-50%', background: 'transparent', width: '92%', maxWidth: '1050px', zIndex: cardList.length - index }}
            >
            
          {/* 1. 헤더 영역 (카드 판 없이 상단에 띄움) */}
              <div style={{ background: '#fff', padding: '30px', borderRadius: '25px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{gdsNm}</h2>
                    <p style={{ color: '#64748b', fontSize: '1.5rem', marginTop: '10px' }}>{product.SEASON_NM || product.season_nm} | {gdsCd}</p>
                  </div>
                  {isLowStock ? (
                    <div style={{ background: '#fff1f2', color: '#e11d48', padding: '10px 15px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #e11d48', fontSize: '1.7rem' }}>⚠️ 재고 위험</div>
                  ) : (
                    <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 15px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #bbf7d0', fontSize: '1.7rem' }}>✅ 정상</div>
                  )}
                </div>
              </div>

              {/* 2. 기본 정보 카드 */}
              <div style={{ background: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.4rem' }}>📦 기본 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>시즌</span><span className={style['info-value']}>{product.SEASON_NM || product.season_nm || "-"}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>브랜드</span><span className={style['info-value']} style={{color: '#2a9426', fontWeight: 'bold'}}>{product.BRAND_NM || product.brand_nm || "-"}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>상품 코드</span><span className={style['info-value']}>{product.GDS_CD || product.gds_cd}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>상품 명</span><span className={style['info-value']} style={{color: '#003cff', fontWeight: 'bold'}}>{product.GDS_NM || product.gds_nm}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>단가</span><span className={style['info-value']}>{untprc.toLocaleString()} 원</span></div>
                <div style={{marginTop: '15px', padding: '15px', background: '#f0f9ff', borderRadius: '15px', display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#0369a1', fontWeight: 'bold'}}>📍 창고 위치</span>
                  <span style={{color: '#0369a1', fontWeight: 'bold'}}>{product.STORAGE_DTL_PSTN || product.storage_dtl_pstn || '위치 미지정'}</span>
                </div>
              </div>

              {/* 3. 상세 정보 카드 */}
              <div style={{ background: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.4rem' }}>🔍 상세 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>카테고리</span><span className={style['info-value']}>{product.GDS_CAT_NM || product.gds_cat_nm || "-"}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>사이즈</span><span className={style['info-value']}>{product.SIZE_NM || product.size_nm || "-"}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>최초 등록일</span><span className={style['info-value']}>{product.FRST_REG_DT || product.frst_reg_dt}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>박스 입수 수량</span><span className={style['info-value']}>{inbox} EA</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>임계치</span><span className={style['info-value']} style={{color: '#e11d48', fontWeight: 'bold'}}>{threshold} EA</span></div>
                <div className={style['info-item']} style={{border: 'none'}}>
                  <span className={style['info-label']}>현재 재고</span>
                  <span className={style['info-value']} style={{ fontSize: '1.6rem', fontWeight: '900', color: isLowStock ? '#e11d48' : '#1e293b' }}>{stock} EA</span>
                </div>
              </div>

              {/* 4. 실시간 재고 지표 분석 카드 */}
              <div style={{ background: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.4rem' }}>📉 실시간 재고 지표 분석</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '15px 10px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.8rem', color: '#64748b', marginBottom: '5px' }}>자산 가치</p>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(stock * untprc).toLocaleString()}원</h4>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '15px 10px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.8rem', color: '#64748b', marginBottom: '5px' }}>박스 환산</p>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{Math.floor(stock / inbox)} BOX</h4>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '15px 10px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.8rem', color: '#64748b', marginBottom: '5px' }}>충족률</p>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isLowStock ? '#ef4444' : '#3b82f6' }}>{Math.round((stock / (threshold || 1)) * 100)}%</h4>
                  </div>
                </div>
              </div>

              {/* 5. 재고 보유 현황 분석 (기존 차트 카드) */}
              <div style={{ background: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px' }}>📊 재고 보유 현황 분석</h3>
                <div style={{ width: '100%', height: '160px', background: '#f8fafc', borderRadius: '20px', padding: '10px', border: '1px solid #f1f5f9' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData} layout="vertical" margin={{ left: 10, right: 40 }}>
                      <XAxis type="number" hide domain={[0, Math.max(stock, threshold) * 1.2]} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="qty" barSize={25} radius={[0, 10, 10, 0]}>
                        {analysisData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="qty" position="right" formatter={(v) => `${v} EA`} style={{fontWeight:'bold', fontSize:'11px'}} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 6. 하단 버튼 (카드 판 밖으로 빼서 강조) */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '50px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(product); }} style={{ flex: 1, height: '60px', borderRadius:'20px', border:'none', background:'#fff', color:'#e11d48', fontSize: '1.8rem', fontWeight:'bold', cursor:'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #fee2e2' }}>보관소(Archive)로 이동</button>
                <button onClick={(e) => { e.stopPropagation(); handleModifyClick(product); }} style={{ flex: 1, height: '60px', borderRadius:'20px', border:'none', background:'#1e293b', color:'#fff', fontSize: '1.8rem', fontWeight:'bold', cursor:'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>정보 수정</button>
              </div>

            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ProductDetail;