import { useEffect, useState } from 'react';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import styleList from "../../css/ProductList.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";
import Pagination from '../Pagination';

function ProductList(){

    const SERVER_URL = serverUrl.SERVER_URL;
    const URL = `${SERVER_URL}/ttik/product`;
    const [productList, setProductList] = useState([]);

    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [seasonList, setSeasonList] = useState([]);

    // const [brandCd, setBrandCd] = useState("");
    // const [categoryCd, setCategoryCd] = useState("");
    // const [seasonCd, setSeasonCd] = useState("");
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

    console.log("컴포넌트 렌더링됨!");

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
            // const sizeData = await getData(`${URL}/size`);
            setBrandList(brandData);
            setCategoryList(categoryData);
            setSeasonList(seasonData);
            // setSizeMap(sizeData);
            console.log("여기", brandData);
        };

        fetchData();
    }, [])

    //재고 상태 판단
    function handleStkStatus(stkQty, threshold){
        if(stkQty <= threshold) {
            return false;
        }else{
            return true;
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
        getProductList();
    }, [])

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

                    const status = handleStkStatus(product.stkQty, product.threshold) ? "부족" : "정상";
                    const isMatchStkStatus = status === searchFilters.stkStatus || searchFilters.stkStatus === "";

                    const isMatchKeyword = searchFilters.keyword === ""
                                            || product.productCd.toLowerCase().includes(searchFilters.keyword)
                                            || product.productNm.toLowerCase().includes(searchFilters.keyword);

                    console.log("확인2-->", isMatchBrand, isMatchCategory, isMatchSeason, isMatchKeyword);
                    return isMatchBrand && isMatchCategory && isMatchSeason && isMatchStkStatus && isMatchKeyword;
                });
                setFilteredProductList(filteredList);
    }, [searchFilters, productList])

    console.log("확인3-->", filteredProductList);

    const handleFilterChange = (e) => {
        const {name, value} = e.target;

        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }))

        setCurrentPage(1);
    }

    console.log("확인1 -->", searchFilters);

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
                    <div className={styleList.filterArea}>
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
                        <button className={styleList.btnRefresh}></button>
                    </div>
                    {/* <div className={styleList.actionArea}> */}
                        <div className={styleList.searchArea}>
                            <label htmlFor='searchProduct'>상품 검색</label>
                            <input className={styleList.searchInput} 
                                    id='searchProduct'
                                    name='keyword'
                                    value={searchFilters.keyword} 
                                    onChange={handleFilterChange}
                                    type="text" placeholder="등록된 상품을 검색하세요"
                            ></input>
                            {/* <button className={styleList.searchBtn} type="submit">검색</button> */}
                        </div>
                    {/* </div> */}
                </div>
                <div className={styleList.listArea}>
                    <table className={styleList.listTable}>
                        <thead className={styleList.listHead}>
                            <tr>
                                <th>NO</th>
                                <th>브랜드</th>
                                <th>상품코드</th>
                                <th>상품명</th>
                                <th>현재 재고 수량</th>
                                <th>재고상태</th>
                                <th>등록일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentProducts.map((product, index) => (
                                    <tr className={`${styleList.listRow} 
                                                    ${handleStkStatus(product.stkQty, product.threshold) ? styleList.warning : ""}`
                                    }>
                                        <td>{index + 1}</td>
                                        <td>{product.brandNm}</td>
                                        <td>{product.productCd}</td>
                                        <td>{product.productNm}</td>
                                        <td>{product.stkQty}</td>
                                        <td className={styleList.stkStatus}>
                                            {handleStkStatus(product.stkQty, product.threshold) ? "부족" : "정상"}
                                        </td>
                                        <td>{product.frstRegDt.split('T')[0]}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    targetList={filteredProductList} 
                    postsPerPage={postsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}

export default ProductList;