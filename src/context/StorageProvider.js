import { fetchStorageData } from "../api/storage/storageList";
import { createContext, useState, useContext } from "react";
import { useOpenAlert } from "../store/alert";

const storageContext = createContext();

export default function StorageProvider({ children }) {
  const [storageList, setStorageList] = useState([]);
  const openAlert = useOpenAlert();

  const getStorageData = async () => {
    try {
      const storageData = await fetchStorageData();
      setStorageList(storageData);
    } catch (error) {
      openAlert({
        title: "Error",
        message: "창고 정보 불러오기를 실패하였습니다.",
      });
      return [];
    }
  };

  return (
    <storageContext.Provider value={{ storageList, getStorageData }}>
      {children}
    </storageContext.Provider>
  );
}

export function useStorageContext() {
  return useContext(storageContext);
}
