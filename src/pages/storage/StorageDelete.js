import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import serverUrl from "../../db/server.json";
import useStorageData from "../../hooks/useStorageData";
import { useOpenAlert } from "../../store/alert";

function StorageDelete({ storageList, onUpdate, setView }) {
  const SERVER_URL = serverUrl.SERVER_URL;
  const [selectedStorage, setSelectedStorage] = useState(1); //창고 일련번호
  const [selectedZone, setSelectedZone] = useState(null); //구역 일련번호
  const [selectedRack, setSelectedRack] = useState(null); //선반 일련번호

  const [isCheckedDelete, setIsCheckedDelete] = useState({
    deleteStorage: false, //창고 삭제
    deleteZone: false, //구역 삭제
    deleteRack: false, //선반 삭제
  });

  const openAlert = useOpenAlert();

  const handleSelectStorage = (e) => {
    setSelectedStorage(Number(e.target.value));
  };

  //창고별 구역리스트, 구역별 선반리스트
  const { zoneOptions, rackOptions } = useStorageData(
    SERVER_URL,
    selectedStorage,
    selectedZone,
  );

  const handleCheckChange = (e) => {
    const { name, checked } = e.target;

    setIsCheckedDelete((prev) => ({
      ...prev,
      [name]: checked,
    }));

    //창고 삭제 선택 -> 구역, 선반, 구역추가 선택상태 초기화
    if (name === "deleteStorage" && checked) {
      setSelectedZone(null);
      setSelectedRack(null);
    }

    //구역 삭제 선택 -> 선반 선택상태 초기화
    if (name === "deleteZone" && checked) {
      setSelectedRack(null);
    }
  };

  const resetForm = () => {
    // 1. 선택 데이터 초기화
    setSelectedStorage(1);
    setSelectedZone(null);
    setSelectedRack(null);

    // 2. 체크박스 및 입력 필드 초기화
    setIsCheckedDelete({
      deleteStorage: false,
      deleteZone: false,
      deleteRack: false,
    });
  };

  // 창고 정보 수정(삭제) 서버 요청
  const handelSubmit = async (e) => {
    e.preventDefault();

    // 삭제 체크가 하나도 없을 경우
    if (
      !isCheckedDelete.deleteStorage &&
      !isCheckedDelete.deleteZone &&
      !isCheckedDelete.deleteRack
    ) {
      openAlert({
        title: "",
        message: "삭제 버튼을 눌러 체크 후 삭제를 진행하세요",
      });
      return;
    }

    // 창고 삭제시 관련 관리자 삭제를 위한 데이터 준비
    const currentStorageNm = storageList.find(
      (s) => s.storageSn === selectedStorage,
    )?.storageNm;

    // 창고 정보 수정(삭제) 파라미터
    const storageDeleteReq = {
      storageSn: selectedStorage,
      zoneSn: selectedZone,
      rackSn: selectedRack,
      storageNm: isCheckedDelete.deleteStorage ? currentStorageNm : null,
    };

    openAlert({
      title: "DELETE",
      message: "삭제를 진행하시겠습니까?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${SERVER_URL}/ttik/storage/delete`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(storageDeleteReq),
          });

          if (res.ok) {
            const data = await res.json();

            // 어떤 구역, 선반을 삭제했는지 안내
            openAlert({
              title: "Success",
              message: data.message,
              onConfirm: () => {
                if (onUpdate) onUpdate();
                resetForm();
                setView("list"); // 수정 후 창고 조회 리스트가 보이도록
              },
            });
          } else {
            const errorData = await res.json();
            openAlert({
              title: "DELETE",
              message: errorData.message,
            });
          }
        } catch (error) {
          console.log("수정 요청 실패", error);
          openAlert({
            title: "Error",
            message: "서버 통신 중 에러가 발생했습니다.",
          });
        }
      },
    });
  };
  return (
    <>
      <form className={styleStorage.deleteForm} onSubmit={handelSubmit}>
        <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
          <h3 className={styleStorage.modifyHeading}>창고</h3>
          <div className={styleStorage.storageBtnWrap}>
            {storageList.map((item) => (
              <div key={item.storageSn}>
                <label
                  htmlFor={`storage${item.storageNm}`}
                  className={`${styleStorage.btnStorage} ${selectedStorage === item.storageSn ? styleStorage.selected : ""}`}
                >
                  {item.storageNm}동
                </label>
                <input
                  type="radio"
                  name="storage"
                  value={item.storageSn}
                  checked={selectedStorage === item.storageSn}
                  id={`storage${item.storageNm}`}
                  className={styleStorage.modifyRadio}
                  onChange={handleSelectStorage}
                />
              </div>
            ))}
          </div>
          <label className={styleStorage.checkDelete} htmlFor="deleteStorage">
            <input
              type="checkbox"
              name="deleteStorage"
              checked={isCheckedDelete.deleteStorage}
              onChange={handleCheckChange}
              id="deleteStorage"
            />
            삭제
          </label>
        </div>

        <div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
            <h3 className={styleStorage.modifyHeading}>구역</h3>
            <div className={styleStorage.selectWrap}>
              <select
                name="zone"
                value={selectedZone}
                className={styleStorage.modifyZoneSelect}
                disabled={isCheckedDelete.deleteStorage}
                onChange={(e) => setSelectedZone(Number(e.target.value))}
              >
                <option value="">구역 선택</option>
                {zoneOptions.map((item) => (
                  <option key={item.zoneSn} value={item.zoneSn}>
                    {item.zoneNm.slice(1)}({item.zoneNm})
                  </option>
                ))}
              </select>
              <label className={styleStorage.checkDelete} htmlFor="deleteZone">
                <input
                  type="checkbox"
                  name="deleteZone"
                  checked={isCheckedDelete.deleteZone}
                  onChange={handleCheckChange}
                  id="deleteZone"
                />
                삭제
              </label>
            </div>
          </div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
            <h3 className={styleStorage.modifyHeading}>선반</h3>
            <div className={styleStorage.rackArea}>
              <div className={styleStorage.selectWrap}>
                <select
                  name="rack"
                  value={selectedRack}
                  disabled={
                    isCheckedDelete.deleteStorage || isCheckedDelete.deleteZone
                  }
                  onChange={(e) => setSelectedRack(Number(e.target.value))}
                >
                  <option value="">선반 선택</option>
                  {rackOptions.map((item) => (
                    <option key={item.rackSn} value={item.rackSn}>
                      {item.rackNm}
                    </option>
                  ))}
                </select>
                <label
                  className={styleStorage.checkDelete}
                  htmlFor="deleteRack"
                >
                  <input
                    type="checkbox"
                    name="deleteRack"
                    checked={isCheckedDelete.deleteRack}
                    onChange={handleCheckChange}
                    id="deleteRack"
                  />
                  삭제
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default StorageDelete;
