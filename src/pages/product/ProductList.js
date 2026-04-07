import { useEffect, useState, useRef, useContext } from "react";
import { useLocation, Link } from "react-router-dom"; // URL 파라미터 감지용
import styleList from "../../css/ProductList.module.css";
import Pagination from "../Pagination";
import { CommonButton } from "../../components/CommonButton";
import { CommonSelect } from "../../components/CommonSelect";
import ProductItem from "../../components/ProductItem";
import { ProductContext } from "./ProductDataProvider";
import PageInfo from "../../components/PageInfo";
import { useOpenAlert } from "../../store/alert";
import { useProductList } from "../../hooks/product/useProductList";

function ProductList() {
  const openAlert = useOpenAlert();
  const location = useLocation(); // 추가: 대시보드에서 넘어온 쿼리 스트링 읽기
  const visibleCount = 5; // 한 번에 5개씩 (모바일)
  const postsPerPagePC = 10; // 한페이지에 10개씩 (Pc)

  const {productList, isLoading, hasMore, totalElements, totalPages, fetchProductList, fetchNextProductList} = useProductList();

  // const [productList, setProductList] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [hasMore, setHasMore] = useState(true); //더 가져올 데이터가 있는지
  const [keywordInput, setKeywordInput] = useState("");

  //브랜드, 시즌, 카테고리 공통 데이터
  const { brandList, categoryList, seasonList } = useContext(ProductContext);

  // 필터 상태 (초기값에 URL 파라미터 로직 통합)
  const [searchFilters, setSearchFilters] = useState({
    brandCd: "",
    categoryCd: "",
    seasonCd: "",
    stkStatus: new URLSearchParams(location.search).get("status") || "",
    keyword: new URLSearchParams(location.search).get("search") || "",
  });

  const stkStatusConfig = [
    { value: "대기", status: "입고 대기" },
    { value: "정상", status: "정상" },
    { value: "부족", status: "부족" },
  ];

  // 페이지네이션 관련 로직
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(null);
  // const [totalElements, setTotalElements] = useState(null); //전체 상품 수
  const indexOfLast = currentPage * postsPerPagePC;
  const indexOfFirst = indexOfLast - postsPerPagePC;

  const scrollRef = useRef(null);

  // 1. 관찰할 대상을 가리킬 Ref 생성
  const observerTarget = useRef(null);

  //모바일 무한 스크롤
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 모바일 감지
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //추가(김윤중) -- 레이아웃에서 상품명(코드) 검색시 이동할때 받는 함수
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    const urlStatus = params.get("status") || "";

    // 필터 상태 업데이트
    setSearchFilters((prev) => ({
      ...prev,
      keyword: urlSearch,
      stkStatus: urlStatus,
    }));

    // 입력창 상태 업데이트 (이 부분이 추가되어야 검색창에 글자가 남습니다)
    setKeywordInput(urlSearch);

    setCurrentPage(1); // 검색 시 1페이지로
  }, [location.search]);

  // 상품 전체 목록 불러오기
  useEffect(() => {
    fetchProductList({searchFilters, currentPage, isMobile});
  }, [currentPage, isMobile, searchFilters]);

    //모바일 두번째 이후 데이터 요청
  // const getNextData = async (lastItemDate, lastItemProCd, searchFilters) => {


  //상품 목록 - 모바일
  useEffect(() => {
    if (!isMobile || !hasMore) return; 

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("바닥 감지");
          if (isScrollingToTop.current) return;

          if (productList.length > 0) {
            //모바일 리스트 fetch
            const currentLastItem = productList[productList.length - 1];
            const lastItemDate = currentLastItem?.frstRegDt;
            const lastItemProCd = currentLastItem?.productCd;
            console.log("마지막 날짜 확인 ==> ", lastItemDate);
            if (lastItemDate) {
              fetchNextProductList({lastItemDate, lastItemProCd, searchFilters});
            }
          }
        }
      },
      { threshold: 0.5 },
    );

    // 4. 관찰 시작
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    // 5. 언마운트 시 관찰 중단
    return () => {
      if (observerTarget.current) observer.disconnect();
    };
  }, [isMobile, hasMore, productList]);



  // 인풋창 타이핑용 (서버 요청 안 보냄)
  const handleKeywordTyping = (e) => {
    setKeywordInput(e.target.value);
  };

  // 검색 버튼 클릭 시 (실제 필터 적용)
  const handleSearchClick = () => {
    const trimmedKeyword = keywordInput.trim();
    setSearchFilters((prev) => ({
      ...prev,
      keyword: keywordInput.trim(), // 현재 입력된 값을 필터에 세팅
    }));

    setKeywordInput(trimmedKeyword);
    setCurrentPage(1);

    if (isMobile) {
      setProductList([]);
      setHasMore(true);
    }
    setCurrentPage(1);
  };

  // 입력값 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (isMobile) {
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
      keyword: "",
    });
    setCurrentPage(1);
  };

  const isScrollingToTop = useRef(false);
  const scrollContainerRef = useRef(null);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowBtn(el.scrollTop > 300);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <PageInfo
        title={"Product List"}
        description={"상품 목록을 확인하세요."}
      />
      <div className={styleList.actionArea}>
        <CommonButton as={Link} to="/product/register" variant="primary">
          상품 등록
        </CommonButton>
      </div>
      <div className={styleList.productListBox}>
        <div className={styleList.listTopWrap}>
          <div className={styleList.searchArea}>
            <label htmlFor="searchProduct" className={styleList.searchLabel}>
              상품 검색
            </label>
            <input
              className={styleList.searchInput}
              id="searchProduct"
              name="keyword"
              value={keywordInput}
              onChange={handleKeywordTyping}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              type="text"
              placeholder="상품명 또는 코드 검색"
            ></input>
            <CommonButton variant="secondary" onClick={handleSearchClick}>
              검색
            </CommonButton>
          </div>
        </div>
        <div className={styleList.contentWrap}>
          <aside className={styleList.filterArea}>
            <div className={styleList.filterCard}>
              <div className={styleList.filterHeading}>
                <h3>검색 필터 설정</h3>
                <button
                  className={styleList.btnReset}
                  onClick={handleReset}
                ></button>
              </div>
              <div className={styleList.filterContents}>
                <CommonSelect
                  defaultOption="브랜드"
                  dataList={brandList}
                  dataValue="brandSn"
                  dataText="brandNm"
                  name="brandCd"
                  value={searchFilters.brandCd}
                  onChange={handleFilterChange}
                  id="brand"
                />
                <CommonSelect
                  defaultOption="카테고리"
                  dataList={categoryList}
                  dataValue="catCd"
                  dataText="catNm"
                  name="categoryCd"
                  value={searchFilters.categoryCd}
                  onChange={handleFilterChange}
                />
                <CommonSelect
                  defaultOption="시즌"
                  dataList={seasonList}
                  dataValue="seasonCd"
                  dataText="seasonNm"
                  name="seasonCd"
                  value={searchFilters.seasonCd}
                  onChange={handleFilterChange}
                />
                <CommonSelect
                  defaultOption="재고상태"
                  dataList={stkStatusConfig}
                  dataValue="value"
                  dataText="status"
                  name="stkStatus"
                  value={searchFilters.stkStatus}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </aside>
          <section className={styleList.listArea}>
            <div className={styleList.totalCount}>
              [ 총 {totalElements}개 상품 ]
            </div>
            <ul className={styleList.productList}>
              {productList?.map((product, index) => (
                <ProductItem
                  key={product.productCd}
                  product={product}
                  index={index}
                  isMobile={isMobile}
                  currentPage={currentPage}
                  postsPerPagePC={postsPerPagePC}
                />
              ))}
            </ul>
          </section>
        </div>

        {isMobile ? (
          /* 모바일용: 스크롤 감지 타겟 */
          <div
            ref={observerTarget}
            style={{ height: "60px", textAlign: "center" }}
          >
            {isLoading
              ? "상품을 불러오는 중입니다..."
              : !hasMore
                ? "모든 상품을 다 불러왔습니다."
                : "상품을 불러오는 중입니다..."}
          </div>
        ) : (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            blockSize={5}
          />
        )}
      </div>
      {isMobile && showBtn && (
        <button
          className={styleList.scrollToTopBtn}
          onClick={() => {
            isScrollingToTop.current = true;
            console.log("위로 가기 버튼 클릭");
            scrollContainerRef.current?.scrollTo({
              top: 0,
              behavior: "smooth",
            });

            setTimeout(() => {
              isScrollingToTop.current = false;
            }, 800); // smooth scroll 끝날 시간
          }}
        ></button>
      )}
    </div>
  );
}

export default ProductList;
