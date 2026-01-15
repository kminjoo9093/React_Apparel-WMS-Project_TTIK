import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";

function BoxCode({onClose, qrCd}){

    function registerQRCd(e){
        e.preventDefault();

        //바코드 이미지 생성 로직 성공하면 모달 닫기

        if(qrCd){
            console.log("QR코드 생성 성공 : ", qrCd);
            //모달창 닫기
            onClose();
        }
    }

    return (
        <div className={styleProdModal.modalInner}>
        <p>브랜드를 검색하세요.</p>
        <form onSubmit={registerQRCd} className={styleProdModal.modalContents}>
            <div>
                <input className={styleProdModal.year} type="text" value={qrCd} readOnly></input>
            </div>
        <button type="submit" className={`${styleRegister.registerBtn}`}>등록</button>
        </form>
    </div>
    )
}

export default BoxCode;