import { useState } from "react";
import styleRegister from "../../css/ProductRegister.module.css";
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import ModalFrame from "./ModalFrame";
import ProductSeason from "./ProductSeason";
import ProductCode from "./ProductCode";
import ProductBarcode from "./ProductBarcode";

function ProductRegister(){

    const brands = [
        {
            name: "나이키"
            ,code: "01"
        }
        ,        {
            name: "아디다스"
            ,code: "02"
        }
        ,        {
            name: "아식스"
            ,code: "03"
        }
    ];

    const category = [
        {
            catNm: "상의"
            ,catCd: "TP"
        }
        ,{
            catNm: "하의"
            ,catCd: "BT"
        }
        ,{
            catNm: "악세서리"
            ,catCd: "AC"
        }
        ,{
            catNm: "신발"
            ,catCd: "SH"
        }
    ];

    const season = [
        {
            seasonCd: "25S"
            ,seasonNm: "2025 S/S"
        }
        , {
            seasonCd: "25F"
            ,seasonNm: "2025 F/W"
        }
        , {
            seasonCd: "24S"
            ,seasonNm: "2024 S/S"
        }
    ]

    const size = {
        "TP" : [
            {sizeCd: "F01", sizeNm: "FREE"}
            ,{sizeCd: "XS1", sizeNm: "XS"}
            ,{sizeCd: "S01", sizeNm: "S"}
            ,{sizeCd: "M01", sizeNm: "M"}
            ,{sizeCd: "L01", sizeNm: "L"}
            ,{sizeCd: "XL1", sizeNm: "XL"}
            ,{sizeCd: "2L1", sizeNm: "XXL"}
            ,{sizeCd: "080", sizeNm: "80"}
            ,{sizeCd: "085", sizeNm: "85"}
            ,{sizeCd: "090", sizeNm: "90"}
            ,{sizeCd: "095", sizeNm: "95"}
            ,{sizeCd: "100", sizeNm: "100"}
            ,{sizeCd: "105", sizeNm: "105"}
            ,{sizeCd: "110", sizeNm: "110"}
            ,{sizeCd: "115", sizeNm: "115"}
        ]
        , "BT" : [
            {sizeCd: "F02", sizeNm: "FREE"}
            ,{sizeCd: "XS2", sizeNm: "XS"}
            ,{sizeCd: "S02", sizeNm: "S"}
            ,{sizeCd: "M02", sizeNm: "M"}
            ,{sizeCd: "L02", sizeNm: "L"}
            ,{sizeCd: "XL2", sizeNm: "XL"}
            ,{sizeCd: "2L2", sizeNm: "XXL"}
            ,{sizeCd: "W24", sizeNm: "24"}
            ,{sizeCd: "W25", sizeNm: "25"}
            ,{sizeCd: "W26", sizeNm: "26"}
            ,{sizeCd: "W27", sizeNm: "27"}
            ,{sizeCd: "W28", sizeNm: "28"}
            ,{sizeCd: "W29", sizeNm: "29"}
            ,{sizeCd: "W30", sizeNm: "30"}
            ,{sizeCd: "W31", sizeNm: "31"}
            ,{sizeCd: "W32", sizeNm: "32"}
            ,{sizeCd: "W33", sizeNm: "33"}
            ,{sizeCd: "W34", sizeNm: "34"}
        ]
    }
    
    const [selectedCat, setSelectedCat] = useState(""); //선택된 카테고리(상/하/신/악)
    const [isDimmedOpen, setIsDimmedOpen] = useState(false);
    const [clickedSeasonBtn, setClickedSeasonBtn] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // const [isOpen, setIsOpen] = useState(false);
    // const [onClose, setOnClose] = useState(false);
    
    const [modalConfig, setModalConfig] = useState({
        isOpen: false, title: '', children: null
    })

    const openModal = (title, children) => {
        setModalConfig({ isOpen: true, title, children });
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    const validateNumber = (value) => {        
        if(value < 0){
            return "0 이상의 숫자를 입력하세요.";
        }
        return "";
    }

    return (
        <div className={`${styleRegister.register} container`}>
            {/* <h1 className={`${styleRegister.register} heading`}>상품 등록하기</h1> */}
            <div className={styleMainDashBoard.welcomeSection}>
                <h1>Register</h1>
                <p>상품을 등록하세요. </p>
            </div>
            <div className={`${styleRegister.content} contentBox`}>
                <form action={""} method="" className={styleRegister.registerForm}>
                    <fieldset className={`${styleRegister.productInfo}`}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label htmlFor="brand" className={styleRegister.label}>브랜드</label>
                                <select name="brand" id="brand">
                                    <option value="#">선택하세요</option>
                                    {
                                        brands.map((record) => (
                                            <option key={record.code} value={record.code}>{record.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label htmlFor="product" className={`${styleRegister.required} ${styleRegister.label}`}>상품명</label>
                                <input id="product" type="text" required placeholder="ex) 우븐 오버핏 티셔츠"></input>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="category" className={styleRegister.label}>카테고리</label>
                                <select name="category" id="category" onChange={(e) => setSelectedCat(e.target.value)}>
                                    <option value="#">선택하세요</option>
                                    {
                                        category.map((record) => (
                                            <option key={record.catCd} value={record.catCd}>{record.catNm}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={`${styleRegister.col}`}>
                                <label htmlFor="season" className={styleRegister.label}>시즌</label>
                                <select name="season" id="season">
                                    <option value="#">선택하세요</option>
                                    {
                                        season.map((record) => (
                                            <option key={record.seasonCd} value={record.seasonCd}>{record.seasonNm}</option>
                                        ))
                                    }
                                </select>
                                <button type="button" onClick={()=>{openModal("시즌 등록", <ProductSeason/>)}}>등록</button>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="size" className={styleRegister.label}>사이즈</label>
                                <select name="size" id="size" disabled={!selectedCat}>
                                    <option value="#">선택하세요</option>
                                    { selectedCat && 
                                        size[selectedCat].map((record) => (
                                            <option key={record.sizeCd} value={record.sizeCd}>{record.sizeNm}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className={`${styleRegister.stockInfo}`}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={`${styleRegister.required} ${styleRegister.label}`}>박스 입수량<span className={styleRegister.unit}>(EA/BOX)</span> </label>
                                <input type="number" min="0" required placeholder="EA 수량 입력" onChange={(e)=>validateNumber(e.target.value)}></input>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label className={styleRegister.label}>단가 (원)</label>
                                <input type="number" placeholder="개별 단가를 입력해주세요"></input>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={styleRegister.label}>임계치</label>
                                <input type="number" placeholder="알림을 받을 최소 재고 수량 입력"></input>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className={styleRegister.codeInfo}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={`${styleRegister.required} ${styleRegister.label}`}>상품코드</label>
                                <input type="text" placeholder="생성 버튼을 누르세요" disabled></input>
                                <button type="button" onClick={()=>{openModal("상품코드", <ProductCode/>)}}>생성</button>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={styleRegister.label}>QR코드</label>
                                <input type="text" placeholder="생성 버튼을 누르세요" disabled></input>
                                <button type="button" onClick={()=>{openModal("QR코드 생성", <ProductBarcode/>)}}>생성</button>
                            </div>
                        </div>
                    </fieldset>
                    <div className={styleRegister.formBtnWrap}>
                        <button type="submit" className={styleRegister.registerBtn}>등록</button>
                        {/* <button type="button" className={styleRegister.cancelBtn}>취소</button> */}
                    </div>
                </form>
            </div>
    
            {/* 공통 모달 하나만 배치 */}
            <ModalFrame 
                isOpen={modalConfig.isOpen} 
                onClose={closeModal} 
                title={modalConfig.title}
                >
                    {modalConfig.children} {/* 버튼 누를 때 넘겨준 컨텐츠가 여기 쏙 들어감 */}
            </ModalFrame>
            {/* { (clickedSeasonBtn && isDimmedOpen ) && <SeasonModal />} */}
            {/* {isDimmedOpen && <div className={styleRegister.dimmed} onClick={()=>{setIsDimmedOpen(false)}}></div>} */}
        </div>
    )
}

export default ProductRegister;