import { useState } from "react";
import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";

function ProductCode({onClose, qrCd, setQrCd}){
    
    const [isDuplicate, setIsDuplicate] = useState(null); //QR 코드 중복체크 

    // 코드 중복체크
    async function checkDuplicate(e){
        e.preventDefault();

        //fetch
        try{
            const res = await fetch(`https://localhost:3002/productMaster?productCd=${qrCd}`);
            if(!res.ok){
                throw new Error(`Error : ${res.status}`);
            }
            const data = await res.json();
            console.log(data);
            
            if(data.length > 0){
                //코드 중복
                setIsDuplicate(true);
            } else {
                setIsDuplicate(false);
            }
            return;
        } catch(error){
            console.log(error);
            return;
        }
    }

    // 코드 등록
    function registerQRCd(e){
        e.preventDefault();

        //코드 중복 시
        if(isDuplicate){
            setQrCd("");
            setIsDuplicate(null);
            alert("상품 등록 정보를 확인해주세요.");
            onClose();
        }

        //바코드 이미지 생성 로직 성공하면 모달 닫기
        if(!isDuplicate && qrCd){
            console.log("QR코드 생성 성공 : ", qrCd);
            //모달창 닫기
            setIsDuplicate(null);
            onClose();
        }
    }

    return (
         <div className={styleProdModal.modalInner}>
            <p>사용 가능한 상품 QR 코드를 자동 생성합니다.</p>
            <form onSubmit={registerQRCd} className={styleProdModal.modalContents}>
                    <div className={styleProdModal.inputGroup}>
                        <input className={styleProdModal.productCdInput} type="text" value={qrCd} readOnly></input>
                        <button className={styleProdModal.checkBtn} onClick={checkDuplicate}>중복 체크</button>
                    </div>
                    <span className={`${styleProdModal.notice} ${styleProdModal.available}`} style={{ visibility: isDuplicate === false ? 'visible' : 'hidden'}}>사용 가능</span>
                    <span className={`${styleProdModal.notice} ${styleProdModal.duplicate}`} style={{ visibility: isDuplicate === true ? 'visible' : 'hidden'}}>중복된 코드</span>
                <button className={`${styleRegister.registerBtn}`}>등록</button>
            </form>
        </div>
    )
}

export default ProductCode;