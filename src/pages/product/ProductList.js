import { useEffect, useState, useRef } from 'react';
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
    const postsPerPage = 10; // 한페이지에 10개씩 (Pc)
    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;

    const scrollRef = useRef(null);
    // const [visibleCount, setVisibleCount] = useState(5); // 모바일에서 한번에 보여줄 개수
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); //더 가져올 데이터가 있는지

    // 1. 관찰할 대상을 가리킬 Ref 생성
    const observerTarget = useRef(null);

    //모바일 무한 스크롤
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 모바일 감지
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //화면에 보여줄 리스트 개수
    const currentProducts = isMobile 
                            ? productList //Mobile
                            : filteredProductList.slice(indexOfFirst, indexOfLast); //PC

    useEffect(()=>{

        if (!isMobile || !hasMore) return; // || isLoading

        //모바일 일때 상품 리스트 초기화
        // setProductList([]); 

        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting){
                console.log("바닥 감지");

                if(productList.length > 0){
                    //모바일 리스트 fetch
                    const currentLastItem = currentProducts[currentProducts.length - 1];
                    const lastItemDate = currentLastItem?.frstRegDt;
                    const lastItemProCd = currentLastItem?.productCd;
                    console.log("마지막 날짜 확인 ==> ", lastItemDate);
                    if(lastItemDate){
                        getNextData(lastItemDate, lastItemProCd);
                    }
                }
                

            }
        }, { threshold: 0.5 } // 대상이 100% 다 보였을 때 실행
        );


        // 4. 관찰 시작
        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        // 5. 언마운트 시 관찰 중단
        return () => {
            // if (observerTarget.current) observer.unobserve(observerTarget.current);
            if (observerTarget.current) observer.disconnect();
        };
    }, [isMobile, hasMore, productList]) //isLoading

    //모바일 두번째 이후 데이터 요청
    const getNextData = async (lastItemDate, lastItemProCd) => {

        if (isLoading || !hasMore) return;
        setIsLoading(true);

        const encodedDate = encodeURIComponent(lastItemDate);

        const { brandCd, categoryCd, seasonCd, stkStatus, keyword } = searchFilters;
        const filterQuery = `&lastDate=${encodedDate}&lastProCd=${lastItemProCd}&brandCd=${brandCd}&catCd=${categoryCd}&seasonCd=${seasonCd}&stkStatus=${stkStatus}&keyword=${encodeURIComponent(keyword)}`;
        let fetchUrl = `${URL}/list/scroll?size=5${filterQuery}`;

        try{
            const response = await fetch(fetchUrl);
            if(response.ok){
                const nextDataList = await response.json();
                console.log("다음 목록 리스트 --> ", nextDataList);
                
                
                if(nextDataList.length === 0){
                    setHasMore(false);
                    return;
                } 
                // setVisibleCount((prev) => prev + nextDataList.length);
                setProductList((prev) => [...prev, ...nextDataList]);
            }
        } catch(error){
            console.log("데이터 요청 실패 : ", error);
            return [];
        } finally {
            setIsLoading(false); // 로딩 종료를 반드시 해줘야 다시 Observer가 작동함
        }
    }


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

    //재고 상태 판단 - 없음 추가하기
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

            setIsLoading(true); // 로딩 시작

            try{
                let fetchUrl = "";

                if(isMobile){
                    // fetchUrl = `${URL}/list/scroll?size=5`;
                    // 모바일: 필터 조건을 쿼리 스트링으로 변환하여 5개만 요청
                    const { brandCd, categoryCd, seasonCd, stkStatus, keyword } = searchFilters;
                    const filterQuery = `&brandCd=${brandCd}&catCd=${categoryCd}&seasonCd=${seasonCd}&stkStatus=${stkStatus}&keyword=${encodeURIComponent(keyword)}`;
                    fetchUrl = `${URL}/list/scroll?size=5${filterQuery}`;
                    
                    // 모바일에서 필터가 바뀌면 '더보기' 상태도 초기화해줘야 함
                    setHasMore(true);
                } else {
                    fetchUrl = `${URL}/list`; //PC
                }

                const res = await fetch(fetchUrl);
                console.log("응답 상태:", res.status);
                if(res.ok){
                    const data = await res.json();
                    // console.log(data);
                    setProductList(data);
                    if(isMobile) {
                        // setVisibleCount(prev => prev + data.length);
                        if (data.length === 0) setHasMore(false); // 가져온 데이터가 요청한 size(5개)보다 적으면 더 가져올 게 없다고 판단
                    }
                }
            } catch (error){
                console.log("데이터 요청 실패 - ", error);
                return [];
            } finally {
                setIsLoading(false); 
            }
        }

        // 즉시 한 번 실행
        getProductList();

        // 1분마다 반복 실행
        // const timer = setInterval(getProductList, 60000);

        // 컴포넌트가 사라질 때 타이머 해제
        // return () => clearInterval(timer);

    }, [isMobile, searchFilters])


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

        if(isMobile){
            setProductList([]); //초기화
            setHasMore(true); //초기화
            // setVisibleCount(5); // 모바일 뷰 초기화 추가
            // 이후 useEffect가 searchFilters 변경을 감지하여 
            // 다시 처음 5개를 fetch하게 됩니다.
        }
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
                                <button className={styleList.btnReset} onClick={handleReset}></button>
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
                                                <div className={styleList.itemNo}>
                                                    {isMobile 
                                                        ? index + 1  // 모바일은 누적 리스트이므로 인덱스 그대로 사용
                                                        : (currentPage - 1) * postsPerPage + index + 1 // PC는 페이지 번호 고려
                                                    }
                                                </div>
                                                {/* <div className={styleList.itemAlignMo}> */}
                                                    <div className={styleList.itemInfoL}>
                                                        <div className={styleList.brand}>{product.brandNm}</div>
                                                        <div className={styleList.proCdNmWrap}>
                                                            <div className={styleList.proCd}>
                                                                <span className={styleList.infoLabel} style={{marginBottom: "0.5rem"}}>상품코드</span>
                                                                {product.productCd}
                                                            </div>
                                                            <div className={styleList.proNm}>
                                                                <span className={styleList.infoLabel}>상품명</span>{product.productNm}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styleList.itemInfoR}>
                                                        <div className={styleList.stkWrap}>
                                                            <div className={styleList.stkQty}><span className={styleList.infoLabel}>현재 재고 수량</span>{product.stkQty}</div>
                                                            <div className={`${styleList.stkStatus}`}>
                                                                <span className={styleList.infoLabel}>재고 상태</span>
                                                                {handleStkStatus(product.stkQty, product.threshold) ? "정상" : "부족"}
                                                            </div>
                                                        </div>
                                                        <div className={styleList.date}>
                                                            <span className={styleList.infoLabel}>등록일</span>
                                                            {product.frstRegDt.split('T')[0]}
                                                        </div>
                                                    </div>
                                                {/* </div> */}

                                                
                                            </a>
                                        </li>
                                    ))
                                }
                        </ul>
                    </div>
                </div>

                {
                    isMobile ? (
                                /* 모바일용: 스크롤 감지 타겟 */
                                <div ref={observerTarget} style={{ height: "60px", textAlign: "center" }}>
                                    {isLoading ? "상품을 불러오는 중입니다..." : 
                                        !hasMore ? "모든 상품을 다 불러왔습니다." : "상품을 불러오는 중입니다..."}
                                </div>)
                            : (
                                <Pagination 
                                    targetList={filteredProductList} 
                                    postsPerPage={postsPerPage}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    blockSize={5}
                                />
                            )
                }
            </div>
        </div>
    )
}

export default ProductList;