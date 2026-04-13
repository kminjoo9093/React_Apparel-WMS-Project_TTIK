import { useEffect } from "react";
import { useStorageContext } from "../context/StorageProvider";
import styleStorage from "../css/Storage.module.css";

export default function StorageSelector({
  selectedStorage,
  setSelectedStorage,
}) {
  const { storageList } = useStorageContext();

  useEffect(()=>{
    if(storageList.length > 0 && !selectedStorage){
      setSelectedStorage(storageList[0].storageSn);
    }
  }, [storageList])

  const handleSelectStorage = (e) => {
    setSelectedStorage(Number(e.target.value));
  };

  return (
    <div className={styleStorage.storageBtnWrap}>
      {storageList.map((item) => (
        <div key={item.storageSn}>
          <label
            htmlFor={`storage${item.storageNm}`}
            className={`${styleStorage.btnStorage} ${selectedStorage === Number(item.storageSn) ? styleStorage.selected : ""}`}
          >
            {item.storageNm}동
          </label>
          <input
            type="radio"
            name="storage"
            value={item.storageSn}
            checked={Number(selectedStorage) === Number(item.storageSn)}
            id={`storage${item.storageNm}`}
            className={styleStorage.modifyRadio}
            onChange={handleSelectStorage}
          />
        </div>
      ))}
    </div>
  );
}
