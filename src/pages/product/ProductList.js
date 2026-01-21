import { useEffect, useState } from 'react';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import styleList from "../../css/ProductList.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";
import Pagination from '../Pagination';
import { Link } from 'lucide-react';

function ProductList(){

    const SERVER_URL = serverUrl.SERVER_URL;
    const URL = `${SERVER_URL}/ttik/product`;
    const [productList, setProductList] = useState([]);

    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [seasonList, setSeasonList] = useState([]);

    const [searchFilters, setSearchFilters] = useState({
        brandCd: "",
        categoryCd: "",
        seasonCd: "",
        stkStatus: "",
        keyword: ""
    })
    const [filteredProductList, setFilteredProductList] = useState([]);

    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; // 한페이지에 10개씩
    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;
    const currentProducts = filteredProductList.slice(indexOfFirst, indexOfLast);


    //데이터 요청
    async function getData(url){
        try{
            const res = await fetch(url); 
            if(!res.ok){
                throw new Error(`Error : ${res.status}`);
            }
            const data = await res.json();
            return data || [];
        } catch(error){
            console.log(error);
            return [];
        }
    }

    //브랜드,카테고리,시즌 데이터 가져오기
    useEffect(() => {
        const fetchData = async() => {
            const brandData = await getData(`${URL}/brands`);
            const categoryData = await getData(`${URL}/category`);
            const seasonData = await getData(`${URL}/season`);
            setBrandList(brandData);
            setCategoryList(categoryData);
            setSeasonList(seasonData);
        };

        fetchData();
    }, [])

    //재고 상태 판단
    function handleStkStatus(stkQty, threshold){
        if(stkQty <= threshold) {
            return false; //부족
        }else{
            return true; //정상
        }
    }

    //상품 목록 리스트 불러오기
    useEffect(()=>{
        const getProductList = async () => {    
            try{
                const res = await fetch(`${SERVER_URL}/ttik/product/list`);
                console.log("응답 상태:", res.status);
                if(res.ok){
                    const data = await res.json();
                    console.log(data);
                    setProductList(data);
                }
            } catch (error){
                console.log("데이터 요청 실패 - ", error);
                return [];
            }
        }

        // 즉시 한 번 실행
        getProductList();

        // 1분마다 반복 실행
        const timer = setInterval(getProductList, 60000);

        // 컴포넌트가 사라질 때 타이머 해제
        return () => clearInterval(timer);

    }, [SERVER_URL])


    //필터 & 검색
    useEffect(()=>{

        if(!searchFilters.brandCd && !searchFilters.categoryCd && !searchFilters.seasonCd && !searchFilters.stkStatus && !searchFilters.keyword){
            setFilteredProductList(productList);
            return;
        }

        const filteredList =
                productList.filter((product)=>{
                    const isMatchBrand = String(product.brandSn) === searchFilters.brandCd || searchFilters.brandCd === "";
                    const isMatchCategory = product.catCd === searchFilters.categoryCd || searchFilters.categoryCd === "";
                    const isMatchSeason = product.seasonCd === searchFilters.seasonCd || searchFilters.seasonCd === "";

                    const status = handleStkStatus(product.stkQty, product.threshold) ? "정상" : "부족";
                    const isMatchStkStatus = status === searchFilters.stkStatus || searchFilters.stkStatus === "";

                    const isMatchKeyword = searchFilters.keyword === ""
                                            || product.productCd.toLowerCase().includes(searchFilters.keyword)
                                            || product.productNm.toLowerCase().includes(searchFilters.keyword);

                    return isMatchBrand && isMatchCategory && isMatchSeason && isMatchStkStatus && isMatchKeyword;
                });
                setFilteredProductList(filteredList);
    }, [searchFilters, productList])

    const handleFilterChange = (e) => {
        const {name, value} = e.target;

        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }))

        setCurrentPage(1);
    }


    //필터링 초기화
    const handleReset = (e) => {
        e.preventDefault();

        setSearchFilters({
            brandCd: "",
            categoryCd: "",
            seasonCd: "",
            stkStatus: "",
            keyword: ""
        })
    }

    return(
        <div>
            <div className={styleMainDashBoard.welcomeSection}>
                <h1>Product List</h1>
                <p>상품 목록을 확인하세요. </p>
            </div>
            <div className={styleList.actionArea}>
                <button className={styleRegister.registerBtn}>상품 등록</button>
            </div>
            <div className={styleList.productListBox}>
                <div className={styleList.listTopWrap}>
                    <div className={styleList.searchArea}>
                        <label htmlFor='searchProduct' className={styleList.searchLabel}>상품 검색</label>
                        <input className={styleList.searchInput} 
                                id='searchProduct'
                                name='keyword'
                                value={searchFilters.keyword} 
                                onChange={handleFilterChange}
                                type="text" placeholder="상품명 또는 코드 검색"
                        ></input>
                        {/* <button className={styleList.searchBtn} type="submit">검색</button> */}
                    </div>
                </div>
                <div className={styleList.contentWrap}>
                    <div className={styleList.filterArea}>
                        <div className={styleList.filterCard}>
                            <div className={styleList.filterHeading}>
                                <h3>검색 필터 설정</h3>
                            </div>
                            <div className={styleList.filterContents}>
                                <select name="brandCd" id="brand" value={searchFilters.brandCd} onChange={handleFilterChange}>
                                    <option value="">브랜드</option>
                                    {
                                        brandList.map((record) => (
                                            <option key={record.brandSn} value={record.brandSn}>{record.brandNm}</option>
                                        ))
                                    }
                                </select>
                                <select name="categoryCd" value={searchFilters.categoryCd} onChange={handleFilterChange}>
                                    <option value="">카테고리</option>
                                    {
                                        categoryList.map((record) => (
                                            <option key={record.catCd} value={record.catCd}>{record.catNm}</option>
                                        ))
                                    }
                                </select>
                                <select name="seasonCd" value={searchFilters.seasonCd} onChange={handleFilterChange}>
                                    <option value="">시즌</option>
                                    {
                                        seasonList.map((record, index) => (
                                            <option key={index} value={record.seasonCd}>{record.seasonNm}</option>
                                        ))
                                    }
                                </select>
                                <select name="stkStatus" value={searchFilters.stkStatus} onChange={handleFilterChange}>
                                    <option value="">재고상태</option>
                                    <option value="정상">정상</option>
                                    <option value="부족">부족</option>
                                </select>
                                <button className={styleList.btnReset} onClick={handleReset}></button>
                            </div>
                        </div>

                    </div>
                    <div className={styleList.listArea}>
                        <div className={styleList.totalCount}>[ 총 {productList.length}개 상품 ]</div>
                        <ul className={styleList.productList}>
                                {
                                    currentProducts.map((product, index) => (
                                        <li className={`${styleList.productItem} ${handleStkStatus(product.stkQty, product.threshold) ? "" : styleList.warning}`} key={product.productCd}>
                                            <a href="#" 
                                            className={`${styleList.itemCard} `
                                            }>
                                                <div className={styleList.itemNo}>{index + postsPerPage + 1}</div>
                                                <div className={styleList.itemInfoL}>
                                                    <div className={styleList.brand}>{product.brandNm}</div>
                                                    <div>
                                                        <div className={styleList.proCd}>
                                                            <span className={styleList.infoLabel} style={{display: 'block', marginBottom: "0.5rem"}}>상품코드</span>
                                                            {product.productCd}
                                                        </div>
                                                        <div className={styleList.proNm}>
                                                            <span className={styleList.infoLabel} style={{display: 'block'}}>상품명</span>{product.productNm}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={styleList.itemInfoR}>
                                                    <div className={styleList.stkQty}><span className={styleList.infoLabel}>현재 재고 수량</span>{product.stkQty}</div>
                                                    <div className={`${styleList.stkStatus}`}>
                                                        <span className={styleList.infoLabel}>재고 상태</span>
                                                        {handleStkStatus(product.stkQty, product.threshold) ? "정상" : "부족"}
                                                    </div>
                                                    <div className={styleList.date}>
                                                        <span className={styleList.infoLabel}>등록일</span>
                                                        {product.frstRegDt.split('T')[0]}
                                                    </div>
                                                </div>
                                                
                                            </a>
                                        </li>
                                    ))
                                }
                        </ul>
                    </div>
                </div>


                <Pagination 
                    targetList={filteredProductList} 
                    postsPerPage={postsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    blockSize={5}
                />
            </div>
        </div>
    )
}

export default ProductList;