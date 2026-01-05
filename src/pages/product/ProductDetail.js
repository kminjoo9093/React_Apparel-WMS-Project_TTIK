import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import style from '../../css/ProductDetail.module.css'; 


// 1. 테스트용 임시 데이터 정의
const dummyData = [
  {
    id: 1,
    productName: "Md. Shamsul Alam",
    priority: "High",
    deliveryEmail: "hello@fibo.studio",
    phoneNumber: "Md. Shamsul Alam",
    taskDescription: "상세 설명 예시입니다."
  },
  {
    id: 2,
    productName: "Second Product",
    priority: "Medium",
    deliveryEmail: "test@example.com",
    phoneNumber: "010-1234-5678",
    taskDescription: "두 번째 카드 예시입니다."
  }
];

// 2. props로 products를 받되, 없으면 dummyData를 사용하도록 설정
const ProductDetail = ({ products = [
    {
        id: 1,
    productName: "Md. Shamsul Alam",
    priority: "High",
    deliveryEmail: "hello@fibo.studio",
    phoneNumber: "Md. Shamsul Alam",
    taskDescription: "경로 에러 해결 후 데이터가 정상적으로 표시됩니다."
    }
]}) => { 
  return (
    <div className={style['card-stack-wrapper']}>
      <AnimatePresence>
        {products.map((product, index) => {
          const reverseIndex = products.length - 1 - index;
          
          return (
            <motion.div
              key={product.id}
              className={style['detail-card']}
              initial={{ opacity: 0, y: -300, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                y: reverseIndex * -15, 
                scale: 1 - reverseIndex * 0.04,
                zIndex: index 
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className={style['card-header']}>
                <h2>Create order</h2>
                <div className={style['stepper']}>
                  <div className={style['step-badge']}>1 Order Info</div>
                  <div className={style['step-dot']}></div>
                </div>
              </div>

              <div className={style['info-grid']}>
                <div className={style['info-item']}>
                  <span className={style['info-label']}>Order name</span>
                  <span className={style['info-value']}>{product.productName}</span>
                </div>
                <div className={style['info-item']}>
                  <span className={style['info-label']}>Priority</span>
                  <span className={style['info-value']}>{product.priority}</span>
                </div>
                <div className={style['info-item']}>
                  <span className={style['info-label']}>Delivery email</span>
                  <span className={style['info-value']}>{product.deliveryEmail}</span>
                </div>
                <div className={style['info-item']}>
                  <span className={style['info-label']}>Phone number</span>
                  <span className={style['info-value']}>{product.phoneNumber}</span>
                </div>
              </div>

              <div className={style['description-area']} style={{marginTop: '20px'}}>
                <span className={style['info-label']}>Task description</span>
                <p className={style['info-value']}>{product.taskDescription}</p>
              </div>

              <button className={style['continue-btn']}>Continue →</button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;