import { useEffect } from "react";
import styleStorage from "../css/Storage.module.css";
import { useStorage } from "../hooks/queries/useStorage";

export default function StorageSelector({
  selectedStorage,
  setSelectedStorage,
}) {
  const {data: storageList} = useStorage();

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
