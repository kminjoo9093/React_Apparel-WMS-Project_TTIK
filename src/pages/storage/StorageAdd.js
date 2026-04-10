import { useEffect, useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import serverUrl from "../../db/server.json";
import useStorageData from "../../hooks/useStorageData";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";
import StorageSelector from "../../components/StorageSelector";

function StorageAdd({ setStorageMenu }) {
  const { fetchStorageData } = useStorageContext();

  const SERVER_URL = serverUrl.SERVER_URL;
  const [selectedStorage, setSelectedStorage] = useState(1); //창고 일련번호
  const [selectedZone, setSelectedZone] = useState(null); //구역 일련번호
  const [selectedRack, setSelectedRack] = useState(null); //선반 일련번호

  const [isCheckedAdd, setIsCheckedAdd] = useState({
    addZone: false,
    addRack: false,
  });
  const [newZone, setNewZone] = useState(""); // 추가 구역
  const [rackCountForNewZone, setRackCountForNewZone] = useState(""); //추가 구역의 선반 층수

  const [addRackCount, setAddRackCount] = useState(""); //추가 선반 층수 숫자 input은 null보다 ""가 더 안전

  const [currentRackCountForZone, setCurrentRackCountForZone] = useState(null);
  const [currentZoneCount, setCurrentZoneCount] = useState(null);
  const [currentZoneNm, setCurrentZoneNm] = useState(null);

  const openAlert = useOpenAlert();

  // 선택한 창고 별 구역 옵션 리스트, 구역 별 선반 옵션 리스트
  const { zoneOptions, rackOptions } = useStorageData(
    SERVER_URL,
    selectedStorage,
    selectedZone,
  );

  // 구역에 해당하는 선반 층 수
  useEffect(() => {
    const rackCount = rackOptions.length;
    setCurrentRackCountForZone(rackCount);
  }, [rackOptions, selectedZone]);

  //창고에 해당하는 구역 수
  useEffect(() => {
    if (!zoneOptions || zoneOptions.length === 0) return;

    const zoneCount = zoneOptions.length;
    setCurrentZoneCount(zoneCount);
    setCurrentZoneNm(zoneOptions[zoneOptions.length - 1].zoneNm);
  }, [zoneOptions, selectedStorage, isCheckedAdd.addZone]);

  // 창고 변경 시 상태값 초기화
  useEffect(() => {
    setSelectedZone(null);
    setSelectedRack(null);
  }, [selectedStorage]);

  //추가 버튼 체크
  const handleCheckChange = (e) => {
    const { name, checked } = e.target;

    setIsCheckedAdd((prev) => ({
      ...prev,
      [name]: checked,
    }));

    if (name === "addRack" && !checked) {
      setAddRackCount("");
      setSelectedZone("");
      setCurrentRackCountForZone(null);
    }

    if (name === "addZone" && !checked) {
      setNewZone("");
      setRackCountForNewZone("");
      setCurrentZoneCount(null);
    }
  };

  // 숫자 입력 유효성 검사
  const [errors, setErrors] = useState({
    addRack: false, // 기존 구역에 추가하는 선반
    newZone: false, // 추가 구역
    rackCountForNewZone: false, // 추가 구역의 선반 수
  });
  const [errorMsg, setErrorMsg] = useState({
    addRack: "",
    newZone: "",
    rackCountForNewZone: "",
  });

  const validateNumber = (e) => {
    const { value, name } = e.target; //객체 구조분해

    switch (name) {
      case "addRack":
        setAddRackCount(value);
        break;
      case "newZone":
        setNewZone(value);
        break;
      case "rackCountForNewZone":
        setRackCountForNewZone(value);
        break;
      default:
        break;
    }

    const num = Number(value);
    const isInvalid = value !== "" && (isNaN(num) || num <= 0);

    setErrors((prev) => ({
      ...prev,
      [name]: isInvalid,
    }));

    setErrorMsg((prev) => ({
      ...prev,
      [name]: isInvalid ? "0 이상의 숫자를 입력하세요." : "",
    }));
  };

  const resetForm = () => {
    // 1. 선택 데이터 초기화
    setSelectedStorage(1);
    setSelectedZone(null);
    setSelectedRack(null);

    // 2. 체크박스 및 입력 필드 초기화
    setIsCheckedAdd({
      addZone: false,
      addRack: false,
    });
    setNewZone(null);
    setRackCountForNewZone("");
    setAddRackCount("");
    setCurrentRackCountForZone(null);
    setCurrentZoneCount(null);
  };

  // 창고 정보 수정(선반/구역 추가) 서버 요청
  const handelSubmit = async (e) => {
    e.preventDefault();

    //창고 정보 수정 파라미터
    const storageAddReq = {
      storageSn: selectedStorage,
      zoneSn: selectedZone, //선반 추가할 구역
      addRackCount: addRackCount, //추가 선반 수
      newZone: newZone, //추가할 구역
      rackCountForNewZone: rackCountForNewZone, //추가할 구역의 선반수
    };

    // 구역추가, 선반 추가 동시에 할때 기존에 존재하는 구역을 입력할 경우 처리
    // if(isCheckedAdd.addRack && isCheckedAdd.addZone)

    // 구역 추가 시 기존에 존재하는 구역인지 확인
    const hasZone = zoneOptions.some(
      (zone) => zone.zoneNm.slice(1) === newZone,
    );

    if (hasZone) {
      openAlert({
        title: "",
        message: "이미 등록된 구역입니다.",
      });
      return;
    }

    openAlert({
      title: "",
      message: "수정을 진행하시겠습니까?",
    });

    try {
      const res = await fetch(`${SERVER_URL}/ttik/storage/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(storageAddReq),
      });
      if (res.ok) {
        const data = await res.json();
        openAlert({
          title: "Success",
          message: data.message,
        });

        resetForm();
        if (fetchStorageData) fetchStorageData();

        setStorageMenu("list"); //수정 후 창고 조회 리스트가 보이도록
      } else {
        const errorData = await res.json();
        openAlert({
          title: "Again",
          message: errorData.message,
        });
      }
    } catch (error) {
      console.log("수정 요청 실패", error);
    }
  };

  return (
    <>
      <form className={styleStorage.addForm} onSubmit={handelSubmit}>
        <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
          <h3 className={styleStorage.modifyHeading}>창고</h3>
          <StorageSelector
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
          />
        </div>

        <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
          <label className={styleStorage.addZone} htmlFor="addRack">
            <input
              type="checkbox"
              name="addRack"
              id="addRack"
              checked={isCheckedAdd.addRack}
              onChange={handleCheckChange}
            />
            선반 추가
          </label>
          <div className={styleStorage.addContents}>
            <div className={styleStorage.addItem}>
              <h3 className={styleStorage.modifyHeading}>구역</h3>
              <select
                name="zone"
                value={selectedZone}
                className={styleStorage.modifyZoneSelect}
                disabled={!isCheckedAdd.addRack}
                onChange={(e) => setSelectedZone(Number(e.target.value))}
              >
                <option value="">구역 선택</option>
                {zoneOptions.map((item) => (
                  <option key={item.zoneSn} value={item.zoneSn}>
                    {item.zoneNm.slice(1)}({item.zoneNm})
                  </option>
                ))}
              </select>
            </div>
            <div
              className={`${styleStorage.addItem} ${styleStorage.addRackArea}`}
            >
              <h3 className={styleStorage.modifyHeading}>선반</h3>
              <input
                type="number"
                name="addRack"
                value={addRackCount}
                required
                min="0"
                disabled={!isCheckedAdd.addRack}
                placeholder="추가할 층수 입력"
                onChange={validateNumber}
              ></input>
              <p
                className={styleStorage.errorMsg}
                style={{ visibility: errors.addRack ? "visible" : "hidden" }}
              >
                {errorMsg.addRack}
              </p>
              {Number(selectedZone) > 0 && (
                <span className={styleStorage.informRackCount}>
                  현재 해당 구역 선반은 {currentRackCountForZone}층 입니다.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
          <label className={styleStorage.addZone} htmlFor="addZone">
            <input
              type="checkbox"
              name="addZone"
              id="addZone"
              checked={isCheckedAdd.addZone}
              onChange={handleCheckChange}
            />
            구역 추가
          </label>
          <div className={styleStorage.addContents}>
            <div
              className={`${styleStorage.addItem} ${styleStorage.addZoneArea}`}
            >
              <h3 className={styleStorage.modifyHeading}>구역</h3>
              <input
                type="number"
                name="newZone"
                value={newZone}
                required
                min="0"
                disabled={!isCheckedAdd.addZone}
                placeholder="구역 번호 입력"
                onChange={validateNumber}
              ></input>
              <p
                className={styleStorage.errorMsg}
                style={{ visibility: errors.newZone ? "visible" : "hidden" }}
              >
                {errorMsg.newZone}
              </p>
              {isCheckedAdd.addZone && selectedStorage && (
                <span className={styleStorage.informZoneCount}>
                  현재 해당 창고의 마지막 구역은 {currentZoneCount} 입니다.
                </span>
              )}
            </div>
            <div className={styleStorage.addItem}>
              <h3 className={styleStorage.modifyHeading}>선반</h3>
              <input
                type="number"
                name="rackCountForNewZone"
                value={rackCountForNewZone}
                required
                min="0"
                disabled={!isCheckedAdd.addZone}
                placeholder="선반 별 층수 입력"
                onChange={validateNumber}
              ></input>
              <p
                className={styleStorage.errorMsg}
                style={{
                  visibility: errors.rackCountForNewZone ? "visible" : "hidden",
                }}
              >
                {errorMsg.rackCountForNewZone}
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default StorageAdd;
