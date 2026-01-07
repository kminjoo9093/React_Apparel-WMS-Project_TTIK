import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";

function ProductBarcode(){
    return (
        <div className={styleProdModal.modalInner}>
        <p>상품 바코드를 자동 생성합니다.</p>
        <div className={styleProdModal.modalContents}>
            <div>
                <input className={styleProdModal.year} type="text"></input>
            </div>
        </div>
        <button className={`${styleRegister.registerBtn}`}>등록</button>
    </div>
    )
}

export default ProductBarcode;