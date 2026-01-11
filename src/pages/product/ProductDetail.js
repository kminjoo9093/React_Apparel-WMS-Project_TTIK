import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import style from '../../css/ProductDetail.module.css';

const ProductDetail = () => {
  const navigate = useNavigate();

  const [cardList, setCardList] = useState([
    { id: 1, productCode: "SKU-B001", productName: "비스포크 냉장고", category: "가전 > 주방", basicPrice: "2,500,000", brand: "Samsung", locateInfo: "P-13C", inboundUnit: "1ea /1box", inventoryThreshold: "5", currentQuantity: "0" },
    { id: 2, productCode: "SKU-C011", productName: "AI 전용 세탁기", category: "가전 > 생활", basicPrice: "1,700,000", brand: "LG", locateInfo: "K-1B", inboundUnit: "2ea /1box", inventoryThreshold: "3", currentQuantity: "15" },
    { id: 3, productCode: "SKU-B012", productName: "노트북 gram", category: "가전 > IT", basicPrice: "2,800,000", brand: "LG", locateInfo: "P-16C", inboundUnit: "11ea /1box", inventoryThreshold: "6", currentQuantity: "14" },
    { id: 4, productCode: "SKU-V002", productName: "무선 청소기 Z", category: "가전 > 생활", basicPrice: "890,000", brand: "Samsung", locateInfo: "A-3C", inboundUnit: "5ea /1box", inventoryThreshold: "10", currentQuantity: "24" }
  ]);

  const historyData = [
    { type: "출고", date: "2026.01.05 14:00", qty: "-2 EA", note: "A대리점" },
    { type: "입고", date: "2026.01.04 10:30", qty: "+10 EA", note: "삼성 물류센터" },
    { type: "출고", date: "2026.01.02 16:45", qty: "-1 EA", note: "B거래처" },
  ];

  const dummyGraphData = [
    { name: '12-20', stock: 24 },
    { name: '12-25', stock: 18 },
    { name: '01-01', stock: 10 },
    { name: '01-04', stock: 22 },
    { name: '01-05', stock: 12 },
  ];

  const handleCardClick = () => {
    setCardList((prev) => {
      const newList = [...prev];
      const firstItem = newList.shift();
      newList.push(firstItem);
      return newList;
    });
  };

  // ★ INV-FUR-008: 상품 삭제 시 삭제 방지 로직(Validation) 및 아카이브 이동 적용 ★
  const handleDelete = (product) => {
    // 1. 현재 재고 확인 (재고가 0보다 크면 삭제 차단)
    if (Number(product.currentQuantity) > 0) {
      alert(`현재 재고가 ${product.currentQuantity}개 남아있어 삭제할 수 없습니다.\n먼저 재고를 비워주세요.`);
      return; // 로직 종료
    }

    // 2. 재고가 0일 때만 작동하는 비활성화 확인 창
    const isConfirm = window.confirm(`[${product.productName}] 제품을 비활성화하시겠습니까?\n확인을 누르면 '상품 보관함(Archive)'으로 이동합니다.`);
    if (isConfirm) {
      alert("비활성화 처리가 완료되었습니다. 보관함으로 이동합니다.");
      // 이동 경로를 기존 productList에서 productArchive로 변경
      navigate('/product/productArchive'); 
    }
  };
  
  return (
    <div className={style['card-stack-wrapper']} onClick={handleCardClick}>
      <p style={{ position: 'absolute', top: '0px', color: '#999', fontSize: '16px', zIndex: 5 }}>
        카드를 클릭하면 다음 정보를 보여줍니다.
      </p>
      
      <AnimatePresence mode="popLayout">
        {cardList.map((product, index) => (
          <motion.div
            key={product.id}
            className={style['detail-card']}
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ 
              opacity: 1, 
              y: index * 10, 
              scale: 1 - index * 0.03,
              zIndex: cardList.length - index 
            }}
            exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
            style={{ 
                position: 'absolute', width: '1100px', padding: '60px', left: '50%', top: '20%', x: '-50%'
            }}
          >
            <div style={{ marginBottom: '30px' }}>
              <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>{product.productCode}</div>
              <h2 style={{ fontSize: '3rem', margin: 0, fontWeight: '900', color: '#2563eb' }}>{product.productName}</h2>
            </div>

            <div style={{ display: 'flex', gap: '80px' }}>
              <div style={{ flex: 1 }}>
                <h3 className={style['info-header']}>기본 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>상품코드(SKU)</span><span className={style['info-value']}>{product.productCode}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>제품명</span><span className={style['info-value']}>{product.productName}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>카테 고리</span><span className={style['info-value']}>{product.category}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>기본 단가</span><span className={style['info-value']}>{product.basicPrice}원</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>입수량</span><span className={style['info-value']}>{product.inboundUnit}</span></div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className={style['info-header']}>상세 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>브랜드</span><span className={style['info-value']}>{product.brand}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>위치 정보</span><span className={style['info-value']}>{product.locateInfo}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>현재 재고</span><span className={style['info-value']} style={{color: '#d32f2f'}}>{product.currentQuantity} EA</span></div>
                <div style={{ marginTop: '20px', padding: '15px', fontWeight: '700', background: '#fff5f5', borderRadius: '12px', color: '#c62828' }}>
                  임계치 알림: {product.inventoryThreshold} 개 미만
                </div>
              </div>
            </div>

            {/* 입출고 이력 테이블 */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content' }}>최근 입/출고 요약 이력</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#666', fontSize: '15px' }}>
                    <th style={{ padding: '12px 0' }}>구분</th>
                    <th>일시</th>
                    <th>수량</th>
                    <th>비고/거래처</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '15px' }}>
                      <td style={{ padding: '8px 0', color: item.type === '입고' ? '#007bff' : '#d32f2f', fontWeight: 'bold' }}>
                        {item.type === '입고' ? '▲ 입고' : '▼ 출고'}
                      </td>
                      <td style={{ color: '#555' }}>{item.date}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.qty}</td>
                      <td style={{ color: '#777' }}>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 재고 변동 그래프 영역 */}
            <div style={{ marginTop: '30px' }}>
              <h3 className={style['info-header']}>재고 변동 추이</h3>
              <div style={{ width: '100%', height: '250px', background: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dummyGraphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <ReferenceLine y={Number(product.inventoryThreshold)} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="stock" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 하단 버튼 그룹 */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '25px' }}>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(product); }} style={{ flex: 1, height: '50px', fontSize: '22px', fontWeight: '600', background: '#f5f5f5', borderRadius: '40px', border: 'none' }}>제 품 삭 제</button>
              <button onClick={(e) => { e.stopPropagation(); navigate('/product/productModify', { state: { product } }); }} style={{ flex: 1, height: '50px', fontSize: '22px', fontWeight: '600', background: '#000', color: '#fff', borderRadius: '40px', border: 'none' }}>정 보 수 정</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;