import { Link } from "react-router-dom";
import styleList from "../css/ProductList.module.css";

function ProductItem({product, index, isMobile, currentPage, postsPerPagePC}){

  const itemNo = isMobile 
                  ? index + 1  // 모바일은 누적 리스트이므로 인덱스 그대로 사용
                  : (currentPage - 1) * postsPerPagePC + index + 1 // PC는 페이지 번호 고려
  
  //재고 상태 판단
  function handleStkStatus(stkQty, threshold, enabled){
      let stkStatus = "";

      if(enabled === "W"){
          if(stkQty === 0){
              stkStatus = "입고 대기";
          }
      } else {
          if(stkQty > threshold){  // true: 정상, false: 부족
              stkStatus = "정상";
          } else {
              stkStatus = "부족";
          }
      }
      return stkStatus;
  }

  const status = handleStkStatus(product.stkQty, product.threshold, product.gdsEnabled);

  const statusClass = 
          status === "부족" ? styleList.warning :
          status === "입고 대기" ? styleList.waiting : "";

    return (
        <li key={product.productCd}
            className={`${styleList.productItem} ${statusClass}`} 
        >
            <Link to={`/product/productDetail/${product.productCd}`} // 변수명 확인: productCd
                className={`${styleList.itemCard} `
            }>
                <div className={styleList.itemNo}>{itemNo}</div>
                <div className={styleList.itemInfoL}>
                    <div className={styleList.brand}>{product.brandNm}</div>
                    <div className={styleList.proCdNmWrap}>
                        <div className={styleList.proCd}>
                            <span className={styleList.infoLabel} style={{marginBottom: "0.5rem"}}>상품코드</span>
                            {product.productCd}
                        </div>
                        <div className={styleList.proNm}>
                            <span className={styleList.infoLabel}>상품명</span>{product.productNm}
                        </div>
                    </div>
                </div>
                <div className={styleList.itemInfoR}>
                    <div className={styleList.stkWrap}>
                        <div className={styleList.stkQty}>
                            <span className={styleList.infoLabel}>현재 재고 수량</span>
                            {product.stkQty}
                        </div>
                        <div className={`${styleList.stkStatus}`}>
                            <span className={styleList.infoLabel}>재고 상태</span>
                            {handleStkStatus(product.stkQty, product.threshold, product.gdsEnabled)}
                        </div>
                    </div>
                    <div className={styleList.date}>
                        <span className={styleList.infoLabel}>최초 등록일</span>
                        {product.frstRegDt.split('T')[0]}
                    </div>
                </div>

            </Link>
        </li>
    )
}

export default ProductItem;