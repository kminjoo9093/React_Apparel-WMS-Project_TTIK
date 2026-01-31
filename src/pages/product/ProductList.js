import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom'; // URL 파라미터 감지용
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import styleList from "../../css/ProductList.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";
import Pagination from '../Pagination';

function ProductList(){
    const SERVER_URL = serverUrl.SERVER_URL;
    const URL = `${SERVER_URL}/ttik/product`;
    const location = useLocation(); // 추가: 대시보드에서 넘어온 쿼리 스트링 읽기

    const [productList, setProductList] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [seasonList, setSeasonList] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");

    // 필터 상태 (초기값에 URL 파라미터 로직 통합)
    const [searchFilters, setSearchFilters] = useState({
        brandCd: "",
        categoryCd: "",
        seasonCd: "",
        stkStatus: new URLSearchParams(location.search).get('status') || "",
        keyword: new URLSearchParams(location.search).get('search') || "" 
    });
    const [filteredProductList, setFilteredProductList] = useState([]);

    // 페이지네이션 관련 로직
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPagePC = 10; // 한페이지에 10개씩 (Pc)
    const [totalPages, setTotalPages] = useState(null);
    const [totalElements, setTotalElements] = useState(null); //전체 상품 수
    const indexOfLast = currentPage * postsPerPagePC;
    const indexOfFirst = indexOfLast - postsPerPagePC;

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
    // const currentProducts = isMobile 
    //                         ? productList //Mobile
    //                         : filteredProductList.slice(indexOfFirst, indexOfLast); //PC

    

    //추가 -- 레이아웃에서 상품명(코드) 검색시 이동할때 받는 함수 
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlSearch = params.get('search') || "";
        const urlStatus = params.get('status') || "";

        // 1. 필터 상태 업데이트
        setSearchFilters(prev => ({
            ...prev,
            keyword: urlSearch,
            stkStatus: urlStatus
        }));

        // 2. 입력창 상태 업데이트 (이 부분이 추가되어야 검색창에 글자가 남습니다)
        setKeywordInput(urlSearch);

        setCurrentPage(1); // 검색 시 1페이지로
    }, [location.search]);

    // 공통 데이터 요청 함수
    async function getData(url){
        try{
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            }); 
            if(!res.ok) throw new Error(`Error : ${res.status}`);
            const data = await res.json();
            return data || [];
        } catch(error){
            console.log(error);
            return [];
        }
    }

    // 브랜드, 카테고리, 시즌 공통 코드 데이터 가져오기
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
    }, []);


    //재고 상태 판단 - 없음 추가하기
    function handleStkStatus(stkQty, threshold, enabled){

        let stkStatus = "";

        if(enabled === "W"){
            if(stkQty === 0){
                stkStatus = "입고 대기";
            }
        } else {
            if(stkQty > threshold){  // true: 정상, false: 부족
                stkStatus = "정상";
            } else {
                stkStatus = "부족";
            }
        }

        return stkStatus;
    }

    // 상품 전체 목록 불러오기
    useEffect(()=>{
        const getProductList = async () => {    

            setIsLoading(true); // 로딩 시작

            try{
                let fetchUrl = "";
                
                // 모바일: 필터 조건을 쿼리 스트링으로 변환하여 5개만 요청
                const { brandCd, categoryCd, seasonCd, stkStatus, keyword } = searchFilters;
                const filterQuery = `&brandCd=${brandCd}&catCd=${categoryCd}&seasonCd=${seasonCd}&stkStatus=${stkStatus}&keyword=${encodeURIComponent(keyword)}`;
                if(isMobile){
                    fetchUrl = `${URL}/list/mobile?size=5${filterQuery}`;
                    
                    // 모바일에서 필터가 바뀌면 '더보기' 상태도 초기화해줘야 함
                    setHasMore(true);
                } else {
                    fetchUrl = `${URL}/list/pc?page=${currentPage - 1}&size=${postsPerPagePC}${filterQuery}`; //PC
                }

                const res = await fetch(fetchUrl, {
                    method: 'GET',
                    credentials: 'include', // 세션 쿠키 전송 (필수)
                    headers: {
                        'Accept': 'application/json', // JSON 응답 선호 명시
                        'Content-Type': 'application/json'
                    }
                });
                console.log("응답 상태:", res.status);
                if(res.ok){
                    const data = await res.json();

                    const products = data.content || [];
                    const total = data.totalPages || 0;
                    
                    if(isMobile) {
                        setProductList(products);
                        setTotalElements(total);
                        if(products.length > 0){
                            if (products.length < 5){
                                setHasMore(false); // 가져온 데이터가 요청한 size(5개)보다 적으면 더 가져올 게 없다고 판단
                                return;
                            } 
                        } else {
                            setHasMore(false);
                        }
                    } else { //pc
                        setTotalElements(data.totalElements);
                        setProductList(products); 
                        setTotalPages(total);
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

    }, [currentPage, isMobile, searchFilters])

    //상품 목록 - 모바일
    useEffect(()=>{

        if (!isMobile || !hasMore) return; // || isLoading

        //모바일 일때 상품 리스트 초기화
        // setProductList([]); 

        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting){
                console.log("바닥 감지");
                if (isScrollingToTop.current) return;

                if(productList.length > 0){
                    //모바일 리스트 fetch
                    const currentLastItem = productList[productList.length - 1];
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
    }, [isMobile, hasMore, productList]) //isLoading productList

    //모바일 두번째 이후 데이터 요청
    const getNextData = async (lastItemDate, lastItemProCd) => {

        if (isLoading || !hasMore) return;
        setIsLoading(true);

        const encodedDate = encodeURIComponent(lastItemDate);

        const { brandCd, categoryCd, seasonCd, stkStatus, keyword } = searchFilters;
        const filterQuery = `&lastDate=${encodedDate}&lastProCd=${lastItemProCd}&brandCd=${brandCd}&catCd=${categoryCd}&seasonCd=${seasonCd}&stkStatus=${stkStatus}&keyword=${encodeURIComponent(keyword)}`;
        let fetchUrl = `${URL}/list/scroll?size=5${filterQuery}`;

        try{
            const response = await fetch(fetchUrl, {
                method: 'GET',
                credentials: 'include'
            });
            if(response.ok){
                const nextDataList = await response.json();
                console.log("다음 목록 리스트 --> ", nextDataList);
                
                if(nextDataList.length > 0){
                    setProductList((prev) => [...prev, ...nextDataList]);

                    if(nextDataList.length < 5){
                        setHasMore(false);
                        return;
                    } 
                } else {
                    setHasMore(false);
                }
            }
        } catch(error){
            console.log("데이터 요청 실패 : ", error);
            return [];
        } finally {
            setIsLoading(false); // 로딩 종료를 반드시 해줘야 다시 Observer가 작동함
        }
    }

    // 인풋창 타이핑용 (서버 요청 안 보냄)
    const handleKeywordTyping = (e) => {
        setKeywordInput(e.target.value);
    };

    // 검색 버튼 클릭 시 (실제 필터 적용)
    const handleSearchClick = () => {
        const trimmedKeyword = keywordInput.trim();
        setSearchFilters(prev => ({
            ...prev,
            keyword: keywordInput.trim() // 현재 입력된 값을 필터에 세팅
        }));

        setKeywordInput(trimmedKeyword);
        setCurrentPage(1);

        if(isMobile){
            setProductList([]); 
            setHasMore(true);
        }
        setCurrentPage(1);
    };

    // 입력값 변경 핸들러
    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }))

        if(isMobile){
            setProductList([]); //초기화
            setHasMore(true); //초기화
        }
        setCurrentPage(1);
    };
    

    // 필터 초기화 핸들러
    const handleReset = (e) => {
        e.preventDefault();
        setSearchFilters({
            brandCd: "",
            categoryCd: "",
            seasonCd: "",
            stkStatus: "",
            keyword: ""
        });
        setCurrentPage(1);
    }

    const isScrollingToTop = useRef(false);
    const scrollContainerRef = useRef(null);
    // const listRef = useRef(null);
    const [showBtn, setShowBtn] = useState(false);


    // useEffect(() => {
    //     const scrollContainer = document.querySelector('.scrollArea'); // 상위 scroll div
    //     if (!scrollContainer) {
    //         console.warn('scrollArea not found, fallback to window');
    //     }
    //     scrollContainerRef.current = scrollContainer || document.scrollingElement;

    //     const handleScroll = () => {
    //         if (!scrollContainerRef.current) return;
    //         setShowBtn(scrollContainerRef.current.scrollTop > 300);
    //     };

    //     const el = scrollContainerRef.current;
    //     el.addEventListener('scroll', handleScroll);

    //     return () => el.removeEventListener('scroll', handleScroll);
    // }, []);

    useEffect(()=>{

        const el = document
        .querySelector(`.${styleList.productListBox}`)
        ?.closest('[style*="overflow"], [class]');

        let current = el;

        while (current) {
            const style = getComputedStyle(current);
            if (
                /(auto|scroll)/.test(style.overflowY) &&
                current.scrollHeight > current.clientHeight
            ) {
                scrollContainerRef.current = current;
                break;
            }
            current = current.parentElement;
        }

        if (!scrollContainerRef.current) {
            scrollContainerRef.current = document.scrollingElement;
        }
    }, [])

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleScroll = () => {
            setShowBtn(el.scrollTop > 300);
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);


    return(
        <div>
            <div className={styleMainDashBoard.welcomeSection}>
                <h1>Product List</h1>
                <p>상품 목록을 확인하세요. </p>
            </div>
            <div className={styleList.actionArea}>
                <Link to="/product/register" className={`${styleRegister.registerBtn} btnSubmit`}>상품 등록</Link>
            </div>
            <div className={styleList.productListBox}>
                <div className={styleList.listTopWrap}>
                    <div className={styleList.searchArea}>
                        <label htmlFor='searchProduct' className={styleList.searchLabel}>상품 검색</label>
                        <input className={styleList.searchInput} 
                                id='searchProduct'
                                name='keyword'
                                value={keywordInput} 
                                onChange={handleKeywordTyping}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} // 엔터키 지원
                                type="text" placeholder="상품명 또는 코드 검색"
                        ></input>
                        <button onClick={handleSearchClick}>검색</button>
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
                                    {brandList?.map((record) => (
                                        <option key={record.brandSn} value={record.brandSn}>{record.brandNm}</option>
                                    ))}
                                </select>
                                <select name="categoryCd" value={searchFilters.categoryCd} onChange={handleFilterChange}>
                                    <option value="">카테고리</option>
                                    {categoryList?.map((record) => (
                                        <option key={record.catCd} value={record.catCd}>{record.catNm}</option>
                                    ))}
                                </select>
                                <select name="seasonCd" value={searchFilters.seasonCd} onChange={handleFilterChange}>
                                    <option value="">시즌</option>
                                    {seasonList?.map((record, index) => (
                                        <option key={index} value={record.seasonCd}>{record.seasonNm}</option>
                                    ))}
                                </select>
                                <select name="stkStatus" value={searchFilters.stkStatus} onChange={handleFilterChange}>
                                    <option value="">재고상태</option>
                                    <option value="대기">입고 대기</option>
                                    <option value="정상">정상</option>
                                    <option value="부족">부족</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styleList.listArea}>
                        <div className={styleList.totalCount}>
                            [ 총 {totalElements}개 상품 ]
                        </div>
                        <ul className={styleList.productList}>
                            {
                                productList?.map((product, index) => {

                                    const status = handleStkStatus(product.stkQty, product.threshold, product.gdsEnabled);
                                    const statusClass = 
                                            status === "부족" ? styleList.warning :
                                            status === "입고 대기" ? styleList.waiting : "";

                                    return (
                                        <li key={product.productCd}
                                            className={`${styleList.productItem} ${statusClass}`} 
                                        >
                                            <Link to={`/product/productDetail/${product.productCd}`} // 변수명 확인: productCd
                                                className={`${styleList.itemCard} `
                                            }>
                                                <div className={styleList.itemNo}>
                                                    {isMobile 
                                                        ? index + 1  // 모바일은 누적 리스트이므로 인덱스 그대로 사용
                                                        : (currentPage - 1) * postsPerPagePC + index + 1 // PC는 페이지 번호 고려
                                                    }
                                                </div>
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
                                                        <div className={styleList.stkQty}>
                                                            <span className={styleList.infoLabel}>현재 재고 수량</span>
                                                            {product.stkQty}
                                                        </div>
                                                        <div className={`${styleList.stkStatus}`}>
                                                            <span className={styleList.infoLabel}>재고 상태</span>
                                                            {handleStkStatus(product.stkQty, product.threshold, product.gdsEnabled)}
                                                        </div>
                                                    </div>
                                                    <div className={styleList.date}>
                                                        <span className={styleList.infoLabel}>최초 등록일</span>
                                                        {product.frstRegDt.split('T')[0]}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                    
                                })
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
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    blockSize={5}
                                />
                            )
                }
            </div>
            {
                isMobile && showBtn && (
                    <button className={styleList.scrollToTopBtn} 
                            onClick={()=>{
                                isScrollingToTop.current = true;
                                console.log("위로 가기 버튼 클릭");
                                scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

                                setTimeout(() => {
                                    isScrollingToTop.current = false;
                                    }, 800); // smooth scroll 끝날 시간
                                }}
                    ></button>
                )
            }
        </div>
    )
}

export default ProductList;