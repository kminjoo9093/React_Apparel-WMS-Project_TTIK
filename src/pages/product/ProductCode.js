import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";

function ProductCode(){
    return (
         <div className={styleProdModal.modalInner}>
            <p>사용 가능한 상품 코드를 자동 생성합니다.</p>
            <div className={styleProdModal.modalContents}>
                <div className={styleProdModal.inputGroup}>
                    <input className={styleProdModal.year} type="text"></input>
                    <button className={styleProdModal.checkBtn}>중복 체크</button>
                </div>
                <span className={styleProdModal.notice}>사용 가능</span>
            </div>
            <button className={`${styleRegister.registerBtn}`}>등록</button>
        </div>
    )
}

export default ProductCode;