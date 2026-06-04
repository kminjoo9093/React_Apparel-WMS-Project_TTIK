import { createContext } from "react";
import { Outlet } from "react-router-dom";
import { useBrandList } from "../hooks/queries/useBrandList";
import { useCategoryList } from "../hooks/queries/useCategoryList";
import { useSeasonList } from "../hooks/queries/useSeasonList";

export const ProductContext = createContext();

export default function ProductDataProvider() {

  const { data: brandList = [] } = useBrandList();
  const { data: categoryList = [] } = useCategoryList();
  const { data: seasonList = [] } = useSeasonList();

  return (
    <ProductContext.Provider value={{brandList, categoryList, seasonList}}>
        <Outlet />
    </ProductContext.Provider>
  );
}
