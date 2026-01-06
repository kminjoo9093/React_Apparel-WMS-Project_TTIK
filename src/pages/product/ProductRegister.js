import { useState } from "react";
import styleRegister from "../../css/ProductRegister.module.css";

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
            ,seasonNm: "25 S/S"
        }
        , {
            seasonCd: "25F"
            ,seasonNm: "25 F/W"
        }
        , {
            seasonCd: "24S"
            ,seasonNm: "24 S/S"
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

    return (
        <div className="container">
            <h1 className="heading">상품 등록</h1>
            <div className={styleRegister.content}>
                <form action={""} method="">
                    <fieldset className={styleRegister.productInfo}>
                        <label htmlFor="brand">브랜드</label>
                        <select name="brand" id="brand">
                            <option value="#">선택하세요</option>
                            {
                                brands.map((record) => (
                                    <option key={record.code} value={record.code}>{record.name}</option>
                                ))
                            }
                        </select>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label htmlFor="product" className={styleRegister.required}>상품명</label>
                                <input id="product" type="text" required></input>
                            </div>
                            <div className={styleRegister.col}>
                                <label htmlFor="category">카테고리</label>
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
                            <div className={styleRegister.col}>
                                <label htmlFor="season">시즌</label>
                                <select name="season" id="season">
                                    <option value="#">선택하세요</option>
                                    {
                                        season.map((record) => (
                                            <option key={record.seasonCd} value={record.seasonCd}>{record.seasonNm}</option>
                                        ))
                                    }
                                </select>
                                <button type="button">등록</button>
                            </div>
                            <div className={styleRegister.col}>
                                <label htmlFor="size">사이즈</label>
                                <select name="size" id="size">
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
                    <fieldset className={styleRegister.stockInfo}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={styleRegister.required}>박스 입수량</label>
                                <input type="number" required></input>
                            </div>
                            <div className={styleRegister.col}>
                                <label>단가</label>
                                <input type="number"></input>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <label>임계치</label>
                            <input type="number"></input>
                        </div>
                    </fieldset>
                    <fieldset className={styleRegister.codeInfo}>
                        <div className={styleRegister.row}>
                            <label className={styleRegister.required}>상품코드</label>
                            <input type="text" disabled></input>
                            <button type="button">생성</button>
                        </div>
                        <div className={styleRegister.row}>
                            <label>바코드</label>
                            <input type="text" disabled></input>
                            <button type="button">생성</button>
                        </div>
                    </fieldset>
                    <button type="submit">등록</button>
                    <button type="button">취소</button>
                </form>
            </div>
        </div>
    )
}

export default ProductRegister;