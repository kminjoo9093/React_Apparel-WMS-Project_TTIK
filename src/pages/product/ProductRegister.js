import { useEffect, useState } from "react";
import styleRegister from "../../css/ProductRegister.module.css";
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import ModalFrame from "./ModalFrame";
import ProductSeason from "./ProductSeason";
import ProductCode from "./ProductCode";
import ModalBrandSearch from "./ModalBrandSearch";
import serverUrl from "../../db/server.json";

function ProductRegister(){

    const SERVER_URL = serverUrl.SERVER_URL;
    const URL = `${SERVER_URL}/ttik/product`;


    // 입력값
    const [brandCd, setBrandCd] = useState("");
    const [productNm, setProductNm] = useState("");
    const [category, setCategory] = useState(""); //선택된 카테고리(상/하/신/악)
    const [seasonCd, setSeasonCd] = useState("");
    const [sizeCd, setSizeCd] = useState("");
    const [styleNo, setStyleNo] = useState("");
    const [target, setTarget] = useState("");
    
    const [inboxQty, setInboxQty] = useState(""); //입수량
    const [price, setPrice] = useState(""); //단가
    const [threshold, setThreshold] = useState(""); //임계치
    // const [frstStock, setFrstStock] = useState(0); //초기 재고량
    
    const [productCd, setProductCd] = useState("");
    // const [boxCd, setBoxCd] = useState("");

    const [searchWord, setSearchWord] = useState("");
    const [inputValue, setInputValue] = useState(""); //임시 인풋값


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
    // const [sizeList, setSizeList] = useState([]);
    // const [brandNm, setBrandNm] = useState("");

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
            return null;
        }
    }

    //브랜드,카테고리,시즌 데이터 가져오기
    useEffect(() => {
        const fetchData = async() => {
            const brandData = await getData(`${URL}/brands`);
            const categoryData = await getData(`${URL}/category`);
            const seasonData = await getData(`${URL}/season`);
            // const sizeData = await getData(`${URL}/size`);
            setBrandList(brandData);
            setCategoryList(categoryData);
            setSeasonList(seasonData);
            // setSizeMap(sizeData);
            console.log("여기" + seasonData);
        };

        fetchData();
    }, [])

    // 숫자 입력 유효성 검사 
    const [errors, setErrors] = useState({
        qty: false,    // 박스 입수량
        price: false,    // 단가
        threshold: false, // 임계치
        // init: false    //초기재고량
    })
    const [errorMsg, setErrorMsg] = useState({
        qty: "",
        price: "",
        threshold: "",
        // init: ""
    });

    const validateNumber = (e) => {        
        const { value, name } = e.target; //객체 구조분해
        const isInvalid = Number(value) < 0; //음수면 true

        if(!isInvalid){
            switch (name){
                case "qty" : setInboxQty(value);
                    break;
                case "price" : setPrice(value);
                    break;
                case "threshold" : setThreshold(value);
                    break;
                // case "frstStock" : setFrstStock(value);
                //     break;
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

    //스타일 넘버 -> 품번
    function handleStyleNo(e){
        setSizeCd("");

        //유효성 검사(W/M/U/K)
        const value = e.target.value.toUpperCase();

        if(!value) return;

        const startAlphas = ["W", "M", "U", "K"];
        const isValid = startAlphas.some(alpha => value.startsWith(alpha));

        if(value.length > 0 && isValid){
            setStyleNo(value);

            const target = value.substring(0, 1);
            setTarget(target);
        } else {
            alert("입력 형식을 확인하세요.");
            setInputValue("");
        }
    
    }


    //사이즈 옵션 받아오기
    useEffect(()=>{

        if(!target || !category) return;

         const fetchData = async () => {
            const sizeData = await getData(`${URL}/size?target=${target}&category=${category}`);
            
            if(sizeData){
                setSizeMap(sizeData);
            } else {
                setSizeMap({});
            }
        }
        fetchData();
        
    }, [target, category])


    // 상품 코드 생성 & 모달 오픈
    // 상품 코드
    async function generateProductCd(){
        try{
            const res = await fetch(`${SERVER_URL}/ttik/productCode`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({
                    "styleNo": styleNo,
                    "brandCd": brandCd,
                    "sizeCd": sizeCd, 
                    "catCd": category,
                    "seasonCd": seasonCd,
                })
            })
            if(res.ok){
                const code = await res.text();
                console.log("상품코드 생성 완료", code);
                setProductCd(code);
                return code;
            }
        } catch(error){
            alert("생성 실패. 입력한 정보를 확인하세요.")
        }

        // const code = brandCd + seasonCd + "-" + category + sizeCd + "-" + styleNo;

        // setProductCd(code);
        // return code;
    }

    async function handleProductCd(){

        if(!brandCd || !seasonCd || !category || !sizeCd) {
            console.log(brandCd, seasonCd, category, sizeCd);
            alert("브랜드, 스타일넘버, 시즌, 카테고리, 사이즈를 모두 입력해야 합니다.");
            return;
        }

        // 상품 코드 생성
        const newProductCd = await generateProductCd();
        console.log("qr1 -> ", newProductCd);

        // 모달 오픈
        openModal("QR코드 생성", <ProductCode onClose={closeModal} productCd={newProductCd} setProductCd={setProductCd}/>)
    }

    // 인풋 값 변경 시 상품 코드 초기화
    useEffect(()=>{
        // if(!productCd || !boxCd) return;

        setProductCd("");
    }, [brandCd, seasonCd, category, sizeCd, styleNo])


    // 상품 등록 처리 
    async function handleSubmit(e){

        e.preventDefault();

        if(!productCd){
            alert("상품QR코드를 생성해야 등록이 가능합니다.");
            return;
        }
        
        const hasError = Object.values(errors).some(val => val === true);
        if(hasError) alert("입력값을 확인하세요.");

        try{
            const res = await fetch(`${URL}/register`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({
                    "productCd": productCd,
                    "styleNo": styleNo,
                    "productNm": productNm,
                    "brandSn": Number(brandCd),
                    "sizeCd": sizeCd,
                    "catCd": category,
                    "seasonCd": seasonCd ,
                    "inboxQty": Number(inboxQty),  //입수량
                    "price": Number(price), //단가
                    "threshold": Number(threshold), //임계치
                    // "frstStock": Number(frstStock) //초기재고량
                })
            })
            if(res.ok){
                alert("등록이 완료되었습니다.");
                setBrandCd("");
                setProductNm("");
                setCategory("");
                setSeasonCd("");
                setSizeCd("");
                setInboxQty("");
                setPrice("");
                setThreshold("");
                setProductCd("");
                setStyleNo("");
                // setBoxCd("");

                const data = await res.json();
                console.log(data);
            }
        } catch(error){
            alert("등록 실패 입력한 정보를 확인하세요.")
        }
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
                                            <option key={record.brandSn} value={record.brandSn}>{record.brandNm}</option>
                                        ))
                                    }
                                </select>
                                <button type="button" onClick={()=>{openModal("브랜드 검색", <ModalBrandSearch onClose={closeModal} setBrandCd={setBrandCd}/>)}}>검색</button>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label htmlFor="style" className={styleRegister.label}>품번</label>
                                <input id="style" 
                                        type="text" 
                                        required 
                                        placeholder="ex) M001"
                                        value={inputValue}
                                        onChange={(e)=>setInputValue(e.target.value)}
                                        onBlur={handleStyleNo}
                                        style={{textTransform: 'uppercase'}}
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
                                <button type="button" onClick={()=>{openModal("시즌 등록", <ProductSeason onClose={closeModal} setSeasonList={setSeasonList}/>)}}>등록</button>
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
                                    <input type="number" name="qty" min="0" required placeholder="EA 수량 입력" value={inboxQty} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.qty ? "visible" : "hidden" }}>{errorMsg.qty}</p>
                                </div>
                            </div>
                            <div className={`${styleRegister.col} ${styleRegister.right}`}>
                                <label className={styleRegister.label}>단가 (원)</label>
                                <div className={styleRegister.numberWrapper}>
                                    <input type="number" name="price" min="0" placeholder="개별 단가를 입력해주세요" value={price} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.price ? "visible" : "hidden" }}>{errorMsg.price}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={styleRegister.label}>임계치</label>
                                <div className={styleRegister.numberWrapper}>
                                    <input type="number" name="threshold" min="0" placeholder="알림을 받을 최소 재고 수량 입력" value={threshold} onChange={validateNumber}></input>
                                    <p className={styleRegister.errorMsg} style={{ visibility: errors.threshold ? "visible" : "hidden" }}>{errorMsg.threshold}</p>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className={styleRegister.codeInfo}>
                        <div className={styleRegister.row}>
                            <div className={styleRegister.col}>
                                <label className={`${styleRegister.required} ${styleRegister.label}`}>상품 코드</label>
                                <input type="text" placeholder="생성 버튼을 누르세요" readOnly value={productCd}></input>
                                <button type="button" onClick={handleProductCd}>생성</button>
                            </div>
                        </div>
                    </fieldset>
                    <div className={styleRegister.formBtnWrap}>
                        <button type="submit" className={`${styleRegister.registerBtn} btnSubmit`}>등록</button>
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