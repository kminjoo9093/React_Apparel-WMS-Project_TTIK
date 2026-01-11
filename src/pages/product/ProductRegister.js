import { useEffect, useState } from "react";
import styleRegister from "../../css/ProductRegister.module.css";
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import ModalFrame from "./ModalFrame";
import ProductSeason from "./ProductSeason";
import ProductCode from "./ProductCode";
import BoxCode from "./BoxCode";

function ProductRegister(){

    // 입력값
    const [brandCd, setBrandCd] = useState("");
    const [productNm, setProductNm] = useState("");
    const [category, setCategory] = useState(""); //선택된 카테고리(상/하/신/악)
    const [seasonCd, setSeasonCd] = useState("");
    const [sizeCd, setSizeCd] = useState("");
    const [styleNo, setStyleNo] = useState("");
    const [target, setTarget] = useState("");

    const [lmtQty, setLmtQty] = useState(""); //입수량
    const [price, setPrice] = useState(""); //단가
    const [threshold, setThreshold] = useState(""); //임계치

    const [productCd, setProductCd] = useState("");
    const [boxCd, setBoxCd] = useState("");


    // 모달
    const [modalConfig, setModalConfig] = useState({
        isOpen: false, title: '', children: null
    })

    const openModal = (title, children) => {
        setModalConfig({ isOpen: true, title, children });
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    // 데이터
    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [seasonList, setSeasonList] = useState([]);
    const [sizeMap, setSizeMap] = useState({});
    const [sizeList, setSizeList] = useState([]);

    const jsonUrl = "http://localhost:3002";
    async function getData(url){
        try{
            const res = await fetch(url); 
            if(!res.ok){
                throw new Error(`Error : ${res.status}`);
            }
            const data = await res.json();
            return data;
        } catch(error){
            console.log(error);
            return [];
        }
    }

    //브랜드,카테고리,시즌 데이터 가져오기
    useEffect(() => {
        const fetchData = async() => {
            const brandData = await getData(`${jsonUrl}/brands`);
            const categoryData = await getData(`${jsonUrl}/category`);
            const seasonData = await getData(`${jsonUrl}/season`);
            const sizeData = await getData(`${jsonUrl}/size`);
            setBrandList(brandData);
            setCategoryList(categoryData);
            setSeasonList(seasonData);
            setSizeMap(sizeData);
            console.log(seasonData);
        };

        fetchData();
    }, [])

    // 숫자 입력 유효성 검사 
    const [errors, setErrors] = useState({
        stock: false,    // 박스 입수량
        price: false,    // 단가
        threshold: false // 임계치
    })
    const [errorMsg, setErrorMsg] = useState({
        stock: "",
        price: "",
        threshold: ""
    });

    const validateNumber = (e) => {        
        const { value, name } = e.target; //객체 구조분해
        const isInvalid = Number(value) < 0; //음수면 true

        if(!isInvalid){
            switch (name){
                case "stock" : setLmtQty(value);
                    break;
                case "price" : setPrice(value);
                    break;
                case "threshold" : setThreshold(value);
                    break;
            }
        }

        setErrors((prev) => ({
            ...prev
            , [name] : isInvalid
        }))

        setErrorMsg(prev => ({
            ...prev
            , [name] : isInvalid ? "0 이상의 숫자를 입력하세요." : ""
        }))
    }

    // 카테고리 선택
    function changedCategory(e){
        const cat = e.target.value;
        console.log("카테고리", cat);
        setCategory(cat);
        setSizeCd("");
        // setSizeList(sizeMap[cat] || []);
    }

    // QR 코드 생성 & 모달 오픈
    // 상품 qr 코드
    function generateProQRCd(){

        const code = brandCd + seasonCd + "-" + category + sizeCd + "-" + styleNo;

        setProductCd(code);
        return code;
    }

    function handleProQRCd(){

        if(!brandCd || !seasonCd || !category || !sizeCd) {
            console.log(brandCd, seasonCd, category, sizeCd);
            alert("브랜드, 스타일넘버, 시즌, 카테고리, 사이즈를 모두 입력해야 합니다.");
            return;
        }

        // 상자 QR 코드 생성
        const newQRCode = generateProQRCd();

        console.log("qr1 -> ", newQRCode);

        // 모달 오픈
        openModal("QR코드 생성", <ProductCode onClose={closeModal} qrCd={newQRCode} setQrCd={setProductCd}/>)
    }

    //상자 qr코드
    function generateBoxQRCd(){

        const code = productCd + "-B" + lmtQty;

        setBoxCd(code);
        return code;
    }

    function handleBoxQRCd(){

        if(!productCd || !styleNo || !lmtQty) {
            alert("입수량, 상품 QR 코드를 먼저 입력해야 합니다.");
            return;
        }

        // 상자 QR 코드 생성
        const newQRCode = generateBoxQRCd();

        console.log("qr1 -> ", newQRCode);

        // 모달 오픈
        openModal("QR코드 생성", <BoxCode onClose={closeModal} qrCd={newQRCode}/>)
    }

    // 인풋 값 변경 시 qr코드 초기화
    useEffect(()=>{
        // if(!productCd || !boxCd) return;

        setProductCd("");

        console.log("qrcode2 -> ", productCd);
    }, [brandCd, seasonCd, category, sizeCd, styleNo])

    useEffect(()=>{
        setBoxCd("");

    }, [lmtQty])


    // 상품 등록 처리 
    async function handleSubmit(e){

        e.preventDefault();

        if(!productCd || !boxCd){
            alert("상품QR코드와 상자QR코드 모두 생성해야 등록이 가능합니다.");
            return;
        }
        
        const hasError = Object.values(errors).some(val => val === true);
        if(hasError) alert("입력값을 확인하세요.");

        try{
            const res = await fetch(`${jsonUrl}/productMaster`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({
                    "productCd": productCd,
                    "boxCd" : boxCd,
                    "brandCd": brandCd,
                    "sizeCd": sizeCd,
                    "catCd": category,
                    "seasonCd": seasonCd,
                    "productNm": productNm,
                    "lmtQty": Number(lmtQty), 
                    "price": Number(price),
                    "threshold": Number(threshold),
                    // "stkCount": "",
                    // "storage": "" 
                })
            })

            if(res.ok){
                alert("등록이 완료되었습니다.");
                setBrandCd("");
                setProductNm("");
                setCategory("");
                setSeasonCd("");
                setSizeCd("");
                setLmtQty("");
                setPrice("");
                setThreshold("");
                setProductCd("");
                setBoxCd("");
            }
        } catch(error){
            alert("등록 실패 입력한 정보를 확인하세요.")
        }
    }

    function handleStyleNo(e){
        const value = e.target.value;
        setStyleNo(value);
        
        const target = value.substring(0, 1);
        setTarget(target);
    }

    return (
        <div className={`${styleRegister.register} container`}>
            <div className={styleMainDashBoard.welcomeSection}>
                <h1>Register</h1>
                <p>상품을 등록하세요. </p>
            </div>
            <div className={`${styleRegister.content} contentBox`}>
                <form onSubmit={handleSubmit} className={styleRegister.registerForm}>
                    <fieldset className={`${styleRegister.productInfo}`}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label htmlFor="brand" className={styleRegister.label}>브랜드</label>
                                <select name="brand" id="brand" value={brandCd} onChange={(e)=>setBrandCd(e.target.value)}>
                                    <option value="">선택하세요</option>
                                    {
                                        brandList.map((record) => (
                                            <option key={record.code} value={record.code}>{record.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="style" className={styleRegister.label}>스타일 넘버</label>
                                <input id="style" 
                                        type="text" 
                                        required 
                                        placeholder="ex) M001"
                                        value={styleNo}
                                        onChange={handleStyleNo}
                                >
                                </input>
                                <p className={styleRegister.guide}>첫 글자 남성: M, 여성: W, 공용: U, 키즈: K</p>
                            </div> 
                        </div>
                        <div className={styleRegister.row}>
                            <div className={`${styleRegister.col}`}>
                                <label htmlFor="season" className={styleRegister.label}>시즌</label>
                                <select name="season" id="season" value={seasonCd} onChange={(e)=>setSeasonCd(e.target.value)}>
                                    <option value="">선택하세요</option>
                                    {
                                        seasonList.map((record, index) => (
                                            <option key={index} value={record.seasonCd}>{record.seasonNm}</option>
                                        ))
                                    }
                                </select>
                                <button type="button" onClick={()=>{openModal("시즌 등록", <ProductSeason onClose={closeModal}/>)}}>등록</button>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="category" className={styleRegister.label}>카테고리</label>
                                {/* <select name="category" id="category" onChange={(e) => setSelectedCat(e.target.value)}> */}
                                <select name="category" id="category" value={category} onChange={changedCategory}>
                                    <option value="">선택하세요</option>
                                    {
                                        categoryList.map((record) => (
                                            <option key={record.catCd} value={record.catCd}>{record.catNm}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label htmlFor="product" className={`${styleRegister.required} ${styleRegister.label}`}>상품명</label>
                                <input id="product" 
                                        type="text" 
                                        required 
                                        placeholder="ex) 우븐 오버핏 티셔츠"
                                        value={productNm}
                                        onChange={(e)=>setProductNm(e.target.value)}
                                >
                                </input>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="size" className={styleRegister.label}>사이즈</label>
                                <select name="size" id="size" disabled={!category || !target} value={sizeCd} onChange={(e)=>setSizeCd(e.target.value)}>
                                    <option value="">선택하세요</option>
                                    {/* {
                                        (!target || !category) && <option value="">스타일 넘버와 카테고리를 먼저 선택하세요</option>
                                    } */}
                                    { target && category && 
                                        sizeMap[target]?.[category]?.map((record) => (
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
                                <div className={styleRegister.numberWrapper}>
                                    <input type="number" name="stock" min="0" required placeholder="EA 수량 입력" value={lmtQty} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.stock ? "visible" : "hidden" }}>{errorMsg.stock}</p>
                                </div>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label className={styleRegister.label}>단가 (원)</label>
                                <div className={styleRegister.numberWrapper}>
                                    <input type="number" name="price" placeholder="개별 단가를 입력해주세요" value={price} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.price ? "visible" : "hidden" }}>{errorMsg.price}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={styleRegister.label}>임계치</label>
                                <div className={styleRegister.numberWrapper}>
                                    <input type="number" name="threshold" placeholder="알림을 받을 최소 재고 수량 입력" value={threshold} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.threshold ? "visible" : "hidden" }}>{errorMsg.threshold}</p>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className={styleRegister.codeInfo}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={`${styleRegister.required} ${styleRegister.label}`}>상품 QR 코드</label>
                                <input type="text" placeholder="생성 버튼을 누르세요" readOnly value={productCd}></input>
                                <button type="button" onClick={handleProQRCd}>생성</button>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={`${styleRegister.required} ${styleRegister.label}`}>상자 QR코드</label>
                                <input type="text" placeholder="생성 버튼을 누르세요" readOnly value={boxCd}></input>
                                <button type="button" onClick={handleBoxQRCd}>생성</button>
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
                    {modalConfig.children} 
            </ModalFrame>
            {/* { (clickedSeasonBtn && isDimmedOpen ) && <SeasonModal />} */}
            {/* {isDimmedOpen && <div className={styleRegister.dimmed} onClick={()=>{setIsDimmedOpen(false)}}></div>} */}
        </div>
    )
}

export default ProductRegister;