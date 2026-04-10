import { getStorageData } from "../api/storage/fetchStorageData";
import { createContext, useState, useContext, useEffect } from "react";
import { useOpenAlert } from "../store/alert";

const storageContext = createContext();

export default function StorageProvider({ children }) {
  const [storageList, setStorageList] = useState([]);
  const openAlert = useOpenAlert();

  const fetchStorageData = async () => {
    try {
      const storageData = await getStorageData();
      setStorageList(storageData);
    } catch (error) {
      openAlert({
        title: "Error",
        message: "창고 정보 불러오기를 실패하였습니다.",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  return (
    <storageContext.Provider value={{ storageList, fetchStorageData }}>
      {children}
    </storageContext.Provider>
  );
}

export function useStorageContext() {
  return useContext(storageContext);
}
