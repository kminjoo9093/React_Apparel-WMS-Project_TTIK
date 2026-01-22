import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, LabelList } from 'recharts';
import style from '../../css/ProductDetail.module.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://localhost:3001/ttik/product/list01');
      if (response.data && Array.isArray(response.data)) {
        setCardList(response.data);
      }
    } catch (error) {
      console.error("데이터 호출 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductData(); }, []);

  const handleCardClick = () => {
    if (cardList.length <= 1) return;
    setCardList((prev) => [...prev.slice(1), prev[0]]);
  };

  const handleDelete = async (product) => {
    if (!product || product.gds_cd === undefined) {
      alert("상품 정보를 불러올 수 없습니다.");
      return;
    }
    const currentStock = Number(product.frst_stk_qty);
    if (currentStock === 0) {
      const confirmMessage = `[${product.gds_nm}] \n재고가 0입니다. 관리 제외 품목(Archive)으로 이동시킬까요?`;
      if (window.confirm(confirmMessage)) {
        try {
          await axios.post('https://localhost:3001/ttik/product/disable', { 
            gds_cd: product.gds_cd,
            gds_enabled: 'N'
          });
          alert("관리 제외 품목으로 이동되었습니다.");
          navigate('/product/productArchive', { state: { product: { ...product, gds_enabled: 'N' } } });
        } catch (error) {
          console.error("비활성화 처리 에러:", error);
          alert("처리 중 오류가 발생했습니다.");
        }
      }
    } else {
      alert(`현재 재고가 ${currentStock}개 남아있어 삭제할 수 없습니다. \n재고를 먼저 소진해주세요.`);
    }
  };

  const handleModifyClick = (product) => {
    navigate('/product/productModify', { state: { product } });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터 로딩 중...</div>;
  if (cardList.length === 0) return <div style={{ textAlign: 'center', marginTop: '100px' }}>표시할 상품이 없습니다.</div>;

  return (
    <div className={style['card-stack-wrapper']} onClick={handleCardClick} style={{ cursor: 'pointer', position: 'relative', minHeight: '100vh', background: '#f8f9fa', paddingBottom: '100px' }}>
      <AnimatePresence mode="popLayout">
        {cardList.slice(0, 3).map((product, index) => {
          const isLowStock = product.frst_stk_qty <= product.threshold;
          const analysisData = [
            { name: '임계치', qty: product.threshold, fill: '#cbd5e1' },
            { name: '현재고', qty: product.frst_stk_qty, fill: isLowStock ? '#ef4444' : '#2563eb' }
          ];

          return (
            <motion.div
              key={product.gds_cd}
              className={style['detail-card']}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: index === 0 ? 1 : 0.6, y: index * 20, scale: 1 - index * 0.05, zIndex: cardList.length - index }}
              exit={{ opacity: 0, x: -500, rotate: -20 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', width: '1050px', padding: '45px 55px', left: '50%', top: '180px', x: '-50%', background: '#fff', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            >
              {/* 1. 헤더 영역 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                  <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{product.gds_nm}</h2>
                  <p style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '10px' }}>{product.season_nm} | {product.gds_cd}</p>
                </div>
                {isLowStock ? (
                  <div style={{ background: '#fff1f2', color: '#e11d48', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', border: '2px solid #e11d48' }}>⚠️ 재고 위험: {product.threshold}EA 이하!</div>
                ) : (
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '15px 25px', borderRadius: '15px', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>✅ 재고 정상</div>
                )}
              </div>

              {/* 2. 정보 그리드 (창고 위치 추가됨) */}
              <div style={{ display: 'flex', gap: '80px', marginBottom: '35px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px' }}>기본 정보</h3>
                  <div className={style['info-item']}><span className={style['info-label']}>시즌</span><span className={style['info-value']}>{product.season_nm}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>브랜드</span><span className={style['info-value']} style={{color: '#2a9426', fontWeight: 'bold'}}>{product.brand_nm}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>상품 코드</span><span className={style['info-value']}>{product.gds_cd}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>상품 명</span><span className={style['info-value']} style={{color: '#003cff', fontWeight: 'bold'}}>{product.gds_nm}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>단가</span><span className={style['info-value']}>{product.untprc?.toLocaleString()} 원</span></div>
                  {/* 창고 상세 위치 추가 */}
                  <div className={style['info-item']} style={{marginTop: '10px', padding: '10px', background: '#f0f9ff', borderRadius: '10px'}}>
                    <span className={style['info-label']} style={{color: '#0369a1'}}>📍 창고 위치</span>
                    <span className={style['info-value']} style={{color: '#0369a1', fontWeight: 'bold'}}>{product.storage_dtl_pstn || '위치 미지정'}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px' }}>상세 정보</h3>
                  <div className={style['info-item']}><span className={style['info-label']}>카테고리</span><span className={style['info-value']}>{product.gds_cat_nm}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>최초 등록일</span><span className={style['info-value']}>{product.frst_reg_dt}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>사이즈</span><span className={style['info-value']}>{product.size_nm}</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>입수 수량</span><span className={style['info-value']}>{product.inbox_qty} EA</span></div>
                  <div className={style['info-item']}><span className={style['info-label']}>임계치</span><span className={style['info-value']} style={{color: '#e11d48', fontWeight: 'bold'}}>{product.threshold} EA</span></div>
                  <div className={style['info-item']}>
                    <span className={style['info-label']}>현재 재고</span>
                    <span className={style['info-value']} style={{ fontSize: '1.4rem', fontWeight: '900', color: isLowStock ? '#e11d48' : '#1e293b' }}>{product.frst_stk_qty} EA</span>
                  </div>
                </div>
              </div>

              {/* 3. 재고 자산 분석 카드 (기존 유지) */}
              <div style={{ marginBottom: '35px' }}>
                <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '20px' }}>📉 실시간 재고 지표 분석</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>재고 자산 가치</p>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{(product.frst_stk_qty * product.untprc).toLocaleString()}원</h4>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>박스 단위 환산</p>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2563eb' }}>{Math.floor(product.frst_stk_qty / (product.inbox_qty || 1))} BOX</h4>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>재고 충족률</p>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: isLowStock ? '#ef4444' : '#16a34a' }}>{Math.round((product.frst_stk_qty / (product.threshold || 1)) * 100)}%</h4>
                  </div>
                </div>
              </div>

              {/* 4. 재고 안전성 비교 차트 (기존 유지) */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '12px' }}>📊 재고 보유 현황 분석</h3>
                <div style={{ width: '100%', height: '160px', background: '#f8fafc', borderRadius: '20px', padding: '20px', border: '1px solid #f1f5f9' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData} layout="vertical" margin={{ left: 20, right: 60 }}>
                      <XAxis type="number" hide domain={[0, Math.max(product.frst_stk_qty, product.threshold) * 1.2]} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="qty" barSize={30} radius={[0, 10, 10, 0]}>
                        {analysisData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="qty" position="right" formatter={(v) => `${v} EA`} style={{fontWeight:'bold', fontSize:'12px'}} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 5. 하단 버튼 */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(product); }} style={{ flex: 1, height: '60px', borderRadius:'15px', border:'none', background:'#f1f5f9', color:'#1e293b', fontSize: '1.4rem', fontWeight:'bold', cursor:'pointer' }}>제품 삭제</button>
                <button onClick={(e) => { e.stopPropagation(); handleModifyClick(product); }} style={{ flex: 1, height: '60px', borderRadius:'15px', border:'none', background:'#1e293b', color:'#fff', fontSize: '1.4rem', fontWeight:'bold', cursor:'pointer' }}>정보 수정</button>
              </div>
              <p style={{ position: 'absolute', top: '10px', color: '#999', fontSize: '11px', zIndex: 5 }}>
                카드를 클릭하면 다음 정보를 보여줍니다.
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;