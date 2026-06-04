import { createContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import serverUrl from "../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const URL = `${SERVER_URL}/ttik/product`;

export const ProductContext = createContext();
export const SeasonDispatchContext = createContext();

export default function ProductDataProvider() {
  const [productMeta, setProductMeta] = useState({ brandList: [], categoryList: [], seasonList: [] });

  async function getData(url) {
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Error : ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const brandData = await getData(`${URL}/brands`);
      const categoryData = await getData(`${URL}/category`);
      const seasonData = await getData(`${URL}/season`);

      setProductMeta({ brandList: brandData, categoryList: categoryData, seasonList: seasonData });
    };
    fetchData();
  }, []);

  const updateSeasonList = (seasonList) => {
    setProductMeta((prev) => ({ ...prev, seasonList }));
  };

  return (
    <ProductContext.Provider value={productMeta}>
      <SeasonDispatchContext.Provider value={updateSeasonList}>
        <Outlet />
      </SeasonDispatchContext.Provider>
    </ProductContext.Provider>
  );
}
