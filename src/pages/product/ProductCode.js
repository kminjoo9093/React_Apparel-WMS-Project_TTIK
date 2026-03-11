import { useState } from "react";
import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";
import Modal from "../../components/Modal";
import { CommonButton } from "../../components/CommonButton";

function ProductCode({onClose, productCd, setProductCd}){

    const SERVER_URL = serverUrl.SERVER_URL;
    
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });
    const [isChecked, setIsChecked] = useState(false); //중복체크 여부 
    const [isDuplicate, setIsDuplicate] = useState(null); //QR 코드 중복체크 

    // 코드 중복체크
    async function checkDuplicate(e){
        e.preventDefault();

        try{
            const res = await fetch(`${SERVER_URL}/ttik/product/exist/${productCd}`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json'
                }
            });
            if(!res.ok){
                throw new Error(`Error : ${res.status}`);
            }
            const data = await res.json();
            console.log(data);
            
            if(data === true){
                //코드 중복
                setIsDuplicate(true);
            } else {
                //중복 X. 사용 가능
                setIsDuplicate(false);
                setIsChecked(true);
            }
            return;
        } catch(error){
            console.log(error);
            return;
        }
    }

    // 코드 등록
    function registerProductCd(e){
        e.preventDefault();

        //코드 중복 시
        if(isDuplicate){
            setProductCd("");
            setIsDuplicate(null);
            setModal({
                isOpen: true,
                title: 'Again',
                message: '상품 등록 정보를 확인해주세요.',
                onConfirm: closeModal
            });
            onClose();
        }

        //바코드 이미지 생성 로직 성공하면 모달 닫기
        if(!isDuplicate && productCd){
            console.log("상품코드 생성 성공 : ", productCd);
            //모달창 닫기
            setIsDuplicate(null);
            onClose();
        }
    }

    return (
        <>
        <Modal
            {...modal} 
        />

         <div className={styleProdModal.modalInner}>
            <p>사용 가능한 상품 코드를 자동 생성합니다.</p>
            <form onSubmit={registerProductCd} className={styleProdModal.modalContents}>
                <div className={styleProdModal.inputGroup}>
                    <input className={styleProdModal.productCdInput} type="text" value={productCd} readOnly></input>
                    <button className={styleProdModal.checkBtn} onClick={checkDuplicate}>중복 체크</button>
                    <div className={styleProdModal.noticeArea}>
                        <span className={`${styleProdModal.notice} ${styleProdModal.available}`} style={{ visibility: isDuplicate === false ? 'visible' : 'hidden'}}>사용 가능</span>
                        <span className={`${styleProdModal.notice} ${styleProdModal.duplicate}`} style={{ visibility: isDuplicate === true ? 'visible' : 'hidden'}}>중복된 코드</span>
                    </div>
                </div>
                
                <CommonButton variant="primary" disabled={!isChecked}>등록</CommonButton>
            </form>
        </div>
        </>
    )
}

export default ProductCode;