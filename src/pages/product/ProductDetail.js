import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 추가
import style from '../../css/ProductDetail.module.css'; 

const ProductDetail = () => {
  const navigate = useNavigate(); // 2. navigate 함수 생성

  const [cardList, setCardList] = useState([
    {
        id: 1,
        productCode: "SKU-B001",
        productName: "비스포크 냉장고",
        category: "가전 > 주방",
        basicPrice: "2,500,000",
        brand: "Samsung",
        locateInfo: "P-13C",
        inboundUnit: "1ea (낱개)",
        inventoryThreshold: "5",
        currentQuantity: "12"
    },
    {
        id: 2,
        productCode: "SKU-C011",
        productName: "AI 전용 세탁기",
        category: "가전 > 생활",
        basicPrice: "1,700,000",
        brand: "LG",
        locateInfo: "K-1B",
        inboundUnit: "2ea (낱개)",
        inventoryThreshold: "3",
        currentQuantity: "15"
    },
    {
        id: 3,
        productCode: "SKU-B012",
        productName: "노트북 gram",
        category: "가전 > IT",
        basicPrice: "2,800,000",
        brand: "LG",
        locateInfo: "P-16C",
        inboundUnit: "11ea (낱개)",
        inventoryThreshold: "6",
        currentQuantity: "14"
    },
    {
        id: 4,
        productCode: "SKU-V002",
        productName: "무선 청소기 Z",
        category: "가전 > 생활",
        basicPrice: "890,000",
        brand: "Samsung",
        locateInfo: "A-3C",
        inboundUnit: "1box / 5ea",
        inventoryThreshold: "10",
        currentQuantity: "24"
    }
  ]);

  const historyData = [
    { type: "출고", date: "2026.01.05 14:00", qty: "-2 EA", note: "A대리점" },
    { type: "입고", date: "2026.01.04 10:30", qty: "+10 EA", note: "삼성 물류센터" },
    { type: "출고", date: "2026.01.02 16:45", qty: "-1 EA", note: "B거래처" },
  ];

  const handleCardClick = () => {
    setCardList((prev) => {
      const newList = [...prev];
      const firstItem = newList.shift();
      newList.push(firstItem);
      return newList;
    });
  };

  return (
    <div className={style['card-stack-wrapper']} onClick={handleCardClick}>
      <p style={{ position: 'absolute', top: '15px', color: '#999', fontSize: '14px', zIndex: 5 }}>
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
                position: 'absolute', 
                width: '1100px', 
                padding: '60px',
                left: '50%',
                top: '30%', 
                x: '-50%'
            }}
          >
            <div style={{ marginBottom: '50px' }}>
              <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
                {product.productCode}
              </div>
              <h2 style={{ fontSize: '4rem', margin: 0, fontWeight: '900', color: '#2563eb' }}>
                {product.productName}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '100px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1e293b', fontSize: '22px', borderBottom: '3px solid #1e293b', paddingBottom: '10px', width: 'fit-content' }}>기본 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>상품코드(SKU)</span><span className={style['info-value']}>{product.productCode}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>제품명</span><span className={style['info-value']}>{product.productName}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>카테고리</span><span className={style['info-value']}>{product.category}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>기본 단가</span><span className={style['info-value']} style={{fontSize: '24px'}}>{product.basicPrice}원</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>입수량</span><span className={style['info-value']}>{product.inboundUnit}</span></div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#28a745', fontSize: '22px', borderBottom: '3px solid #28a745', paddingBottom: '10px', width: 'fit-content' }}>상세 정보</h3>
                <div className={style['info-item']}><span className={style['info-label']}>브랜드</span><span className={style['info-value']}>{product.brand}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>위치정보</span><span className={style['info-value']}>{product.locateInfo}</span></div>
                <div className={style['info-item']}><span className={style['info-label']}>현재재고</span><span className={style['info-value']} style={{fontSize: '28px', color: '#d32f2f'}}>{product.currentQuantity} EA</span></div>
                <div style={{ marginTop: '20px', padding: '15px', background: '#fff5f5', borderRadius: '10px', color: '#c62828', fontWeight: 'bold' }}>
                  재고 임계치: {product.inventoryThreshold}개 미만 알림
                </div>
              </div>
            </div>

            <div style={{ marginTop: '50px' }}>
              <h3 style={{ color: '#6a1b9a', fontSize: '22px', borderBottom: '3px solid #6a1b9a', paddingBottom: '10px', width: 'fit-content' }}>최근 입/출고 이력</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#666', fontSize: '14px' }}>
                    <th style={{ padding: '12px 0' }}>구분</th>
                    <th>일시</th>
                    <th>수량</th>
                    <th>비고/거래처</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '16px' }}>
                      <td style={{ padding: '15px 0', color: item.type === '입고' ? '#007bff' : '#d32f2f', fontWeight: 'bold' }}>
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

            <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); alert('잠깐~!! 이 제품이 입고가 되지 않을 예정인가요?'); }}
                style={{ 
                  flex: 1, height: '80px', fontSize: '26px', fontWeight: '900', borderRadius: '20px',
                  background: '#f5f5f5', color: '#666', border: 'none', cursor: 'pointer' 
                }}
              >
                제 품 삭 제
              </button>
              <button 
                /* 3. 이동 로직 적용 */
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate('/product/productModify', { state: { product } }); // 데이터와 함께 이동
                }}
                style={{ 
                  flex: 1, height: '80px', fontSize: '26px', fontWeight: '900', borderRadius: '20px',
                  background: '#000', color: '#fff', border: 'none', cursor: 'pointer' 
                }}
              >
                정 보 수 정
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;