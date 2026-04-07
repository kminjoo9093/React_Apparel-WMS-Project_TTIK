import { useState } from "react";
import { getProductList } from "../../api/product/productList";
import { getNextProductList } from "../../api/product/productList";
import { useOpenAlert } from "../../store/alert";

const visibleCountMobile = 5;

export const useProductList = () => {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const openAlert = useOpenAlert();

  const fetchProductList = async ({ searchFilters, currentPage, isMobile }) => {
    setIsLoading(true);

    try {
      const data = await getProductList(searchFilters, currentPage, isMobile);
      const products = data.content || [];
      const total = data.totalPages || 0;

      setProductList(products);
      setTotalElements(data.totalElements || 0);

      if (isMobile) {
        setHasMore(products.length >= visibleCountMobile);
      } else {
        //pc
        setTotalPages(total);
      }
    } catch (error) {
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextProductList = async ({
    lastItemDate,
    lastItemProCd,
    searchFilters,
  }) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const nextDataList = await getNextProductList(
        lastItemDate,
        lastItemProCd,
        searchFilters,
      );
      if (nextDataList.length > 0) {
        setProductList((prev) => [...prev, ...nextDataList]);
        setHasMore(nextDataList.length >= visibleCountMobile);
      }
    } catch (error) {
      openAlert({
        title: "Error",
        message: "상품목록을 받아오지 못했습니다.",
      });
      return [];
    } finally {
      setIsLoading(false); // 다시 Observer 작동시키지 위해 로딩 종료
    }
  };

  return {
    productList,
    isLoading,
    hasMore,
    totalElements,
    totalPages,
    fetchProductList,
    fetchNextProductList,
  };
};
