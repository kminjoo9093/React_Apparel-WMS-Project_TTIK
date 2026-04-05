import { createContext, useReducer, useEffect } from "react";
import { Outlet } from "react-router-dom";
import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;
const URL = `${SERVER_URL}/ttik/product`;

export const ProductContext = createContext();
export const SeasonDispatchContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return {
        brandList: action.data.brandData,
        categoryList: action.data.categoryData,
        seasonList: action.data.seasonData,
      };
    case "UPDATE_SEASON":
      return {
        ...state,
        seasonList: action.data.newSeasonList,
      };
    default:
      return state;
  }
}

const productData = {
  brandList: [],
  categoryList: [],
  seasonList: [],
};

export default function ProductDataProvider() {
  const [state, dispatch] = useReducer(reducer, productData);

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
      console.log(error);
      return null;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const brandData = await getData(`${URL}/brands`);
      const categoryData = await getData(`${URL}/category`);
      const seasonData = await getData(`${URL}/season`);

      dispatch({
        type: "SET",
        data: {
          brandData,
          categoryData,
          seasonData,
        },
      });
    };
    fetchData();
  }, []);

  const updateSeasonList = (newSeasonList) => {
    dispatch({
      type: "UPDATE_SEASON",
      data: newSeasonList,
    });
  };

  return (
    <ProductContext.Provider value={state}>
      <SeasonDispatchContext.Provider value={updateSeasonList}>
        <Outlet />
      </SeasonDispatchContext.Provider>
    </ProductContext.Provider>
  );
}
