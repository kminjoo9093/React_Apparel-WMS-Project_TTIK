import { useRef, useState } from "react";
import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";
import Modal from "../../components/Modal";

function ProductSeason({onClose, setSeasonList}){

    const SERVER_URL = serverUrl.SERVER_URL;

    const yearRef = useRef();
    const seasonRef = useRef();

    //alert
    const closeAlert = () => setModal({ ...modal, isOpen: false });
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    async function registerSeason(e){
        e.preventDefault();

        const year = yearRef.current.value;
        const season = seasonRef.current.value;

        //유효성 검사 로직
        if(!year || year.length !== 4 ){
            setModal({
                isOpen: true,
                title: '입력값 확인',
                message: "연도 4자리 숫자를 정확히 입력하세요.",
                onConfirm: closeAlert
            });
            // alert("연도 4자리 숫자를 정확히 입력하세요.");
            return;
        }

        try{
            const res = await fetch(`${SERVER_URL}/ttik/product/seasonRegister`, {
                method: "POST",
                headers: {'Content-type': 'application/json'},
                credentials: 'include', 
                body: JSON.stringify({
                    "year": year,
                    "season": season,
                })
            });

            if(res.ok){
                console.log(year, season);
                const updatedList = await res.json();
                setSeasonList(updatedList);
                const newSeason = season === "S" ? "S/S" : "FW";
                setModal({
                    isOpen: true,
                    title: '등록 성공',
                    message: `${year} ${newSeason} 시즌이 정상 등록되었습니다.`,
                    onConfirm: closeAlert
                });
                // alert(`${year} ${newSeason} 시즌이 정상 등록되었습니다.`);

                //모달창 닫기
                onClose();
            } else {
                //이미 있는 시즌인 경우 처리
                setModal({
                    isOpen: true,
                    title: '등록 실패',
                    message: "이미 등록된 시즌이거나 등록할 수 없는 정보입니다.",
                    onConfirm: closeAlert
                });
                // alert("이미 등록된 시즌이거나 등록할 수 없는 정보입니다.");
            }
        } catch(error){
            console.error(error);
            setModal({
                isOpen: true,
                title: '등록 실패',
                message: "네트워크 통신 중 오류가 발생했습니다.",
                onConfirm: closeAlert
            });
            // alert("네트워크 통신 중 오류가 발생했습니다.");
        }

    }


    return (
        <div className={styleProdModal.modalInner}>
            <Modal {...modal}/>
            <p>상품 등록에 사용할 시즌을 추가하세요.</p>
            <form onSubmit={registerSeason} className={styleProdModal.modalContents}>
                <div className={styleProdModal.inputGroup}>
                    <div>
                        <input 
                            className={styleProdModal.year} 
                            type="number" 
                            min="0" 
                            name="year"
                            required 
                            placeholder="ex) 2026"
                            ref={yearRef}
                        >
                        </input>
                        년도
                    </div>
                    <select name="season" className={styleProdModal.seasonType} ref={seasonRef}>
                        <option value="S">S/S</option>
                        <option value="F">F/W</option>
                    </select>
                </div>             
                <button type="submit" className="btnSubmit">등록</button>
            </form>
        </div>
    )
}

export default ProductSeason;