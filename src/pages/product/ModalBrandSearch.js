import styleProdModal from "../../css/ProductModal.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import { useState } from "react";
import serverUrl from "../../db/server.json";

function ModalBrandSearch({onClose, setBrandCd}){

    const SERVER_URL = serverUrl.SERVER_URL;

    // const [keyword, setKeyword] = useState("");
    const [inputVal, setInputVal] = useState("");
    const [resultList, setResultList] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const confirmBrand = async (e) => {
        e.preventDefault();

        if(selectedBrand){
            // setBrandCd(inputVal);
            setBrandCd(selectedBrand.brandSn);

            onClose();
        }
    }

    const searchBrand = async (e) => {
        e.preventDefault();

        // setKeyword(inputVal);
        if(inputVal.length === 0) return;

        try{
            const res = await fetch(`${SERVER_URL}/ttik/brand/search?keyword=${inputVal}`);
            if(res.ok){
                const data = await res.json();
                console.log("브랜드 검색 결과 --> ", data)
                setResultList(data);
            }
        } catch(error){
            console.log("브랜드 검색 실패 : ", error);
        }
    }

    const selectBrand = (brand) => {
        setInputVal(brand.brandNm);
        setSelectedBrand(brand);
        
    }

    return (
        <div className={styleProdModal.modalInner}>
        {/* <p>브랜드를 검색하세요.</p> */}
        <form onSubmit={confirmBrand} className={styleProdModal.modalContents}>
            <div className={styleProdModal.inputGroup}>
                <input className={styleProdModal.brandSearchInput} type="text" value={inputVal} onChange={(e)=>{setInputVal(e.target.value)}}></input>
                <button className={styleProdModal.brandSearchBtn} onClick={searchBrand}>검색</button>
            </div>
            <ul className={styleProdModal.brandResultList}>
                {
                    resultList && resultList.map((result) => (
                        <li key={result.brandSn} 
                            onClick={() => selectBrand(result)}
                            className={`${styleProdModal.brandResultItem} ${
                                        selectedBrand?.brandSn === result.brandSn ? styleProdModal.selectedItem : ""}`
                }
                        >
                            {result.brandNm}
                        </li> 
                    ))
                }
            </ul>
            
            <button type="submit" className="btnSubmit">확인</button>
        </form>
    </div>
    )
}

export default ModalBrandSearch;