import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";

function ProductSeason(){
    return (
        <div className={styleProdModal.modalInner}>
            <p>상품 등록에 사용할 시즌을 추가하세요.</p>
            <div className={styleProdModal.modalContents}>
                <div className={styleProdModal.inputGroup}>
                    <div>
                        <input className={styleProdModal.year} type="number" placeholder="ex) 2026"></input>년도
                    </div>
                    <select name="" className={styleProdModal.seasonType}>
                        <option value="#">S/S</option>
                        <option value="#">F/W</option>
                    </select>
                </div> 
            </div>
            <button className={`${styleRegister.registerBtn}`}>등록</button>
        </div>
    )
}

export default ProductSeason;