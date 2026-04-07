import styleProdModal from "../../css/ProductModal.module.css";
import { useState } from "react";
import { CommonButton } from "../../components/CommonButton";
import { searchBrandData } from "../../api/brand";

function BrandSearchModal({onClose, setBrandCd}){
    const [inputVal, setInputVal] = useState("");
    const [resultList, setResultList] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const confirmBrand = async (e) => {
        e.preventDefault();

        if(selectedBrand){
            setBrandCd(selectedBrand.brandSn);
            onClose();
        }
    }

    const searchBrand = async (e) => {
        e.preventDefault();

        if(inputVal.length === 0) return;

        try{
            const data = await searchBrandData(inputVal);
            setResultList(data);
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
        <form onSubmit={confirmBrand} className={styleProdModal.modalContents}>
            <div className={styleProdModal.inputGroup}>
                <input className={styleProdModal.brandSearchInput} type="text" value={inputVal} onChange={(e)=>{setInputVal(e.target.value)}}></input>
                <CommonButton as="button" variant="secondary" onClick={searchBrand}>
                    검색
                </CommonButton>
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
            <CommonButton variant="primary" type="submit">확인</CommonButton>
        </form>
    </div>
    )
}

export default BrandSearchModal;