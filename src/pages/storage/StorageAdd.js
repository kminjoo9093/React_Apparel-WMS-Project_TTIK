import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import useStorageData from "../../hooks/storage/useStorageData";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";
import StorageSelector from "../../components/StorageSelector";
import CheckButton from "../../components/CheckButton";
import { addStorageStructure } from "../../api/storage/fetchStorageData";
import { checkNumber } from "../../utils/validation/numbers";

function StorageAdd({ setStorageMenu }) {
  const { fetchStorageData } = useStorageContext();
  const openAlert = useOpenAlert();
  const initialFormData = {
    //선택
    selectedStorage: 1,
    selectedZone: null,
    //추가 여부
    addZone: false,
    addRack: false,
    //입력값
    addRackCount: "",
    newZone: "",
    rackCountForNewZone: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // 선택한 창고 별 구역 옵션 리스트, 구역 별 선반 옵션 리스트
  const { zoneOptions, rackOptions } = useStorageData(
    formData.selectedStorage,
    formData.selectedZone,
  );

  //추가 버튼 체크
  const handleCheckChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => {
      //addRack 해제
      if (name === "addRack" && !checked) {
        return {
          ...prev,
          addRackCount: "",
          selectedZone: null,
        };
      }
      //addZone 해제
      if (name === "addZone" && !checked) {
        return {
          ...prev,
          newZone: "",
          rackCountForNewZone: "",
        };
      }

      return {
        ...prev,
        [name]: checked,
      };
    });
  };

  // 숫자 입력 유효성 검사
  const [errors, setErrors] = useState({
    addRackCount: false, // 기존 구역에 추가하는 선반
    newZone: false, // 추가 구역
    rackCountForNewZone: false, // 추가 구역의 선반 수
  });
  const [errorMsg, setErrorMsg] = useState({
    addRackCount: "",
    newZone: "",
    rackCountForNewZone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const { isInvalid, message } = checkNumber(value);

    setErrors((prev) => ({
      ...prev,
      [name]: isInvalid,
    }));

    setErrorMsg((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  // 창고 정보 수정(선반/구역 추가) 서버 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.addRack && !formData.selectedZone) {
      return openAlert({ message: "구역을 선택하세요." });
    }

    if (formData.rackCountForNewZone && !formData.newZone) {
      return openAlert({ message: "구역 번호를 입력하세요." });
    }

    //창고 정보 수정 파라미터
    const storageAddReq = {
      storageSn: formData.selectedStorage,
      zoneSn: formData.selectedZone, //선반 추가할 구역
      addRackCount: formData.addRackCount, //추가 선반 수
      newZone: formData.newZone, //추가할 구역
      rackCountForNewZone: formData.rackCountForNewZone, //추가할 구역의 선반수
    };

    // 구역 추가 시 기존에 존재하는 구역인지 확인
    const hasZone = zoneOptions.some(
      (zone) => zone.zoneNm.slice(1) === formData.newZone,
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
      const data = await addStorageStructure(storageAddReq);
      openAlert({
        title: "Success",
        message: data.message,
      });
      resetForm();
      if (fetchStorageData) fetchStorageData();
      setStorageMenu("list");
    } catch (error) {
      openAlert({
        title: "Again",
        message: error.message,
      });
    }
  };

  return (
    <>
      <form className={styleStorage.addForm} onSubmit={handleSubmit}>
        <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
          <h3 className={styleStorage.modifyHeading}>창고</h3>
          <StorageSelector
            selectedStorage={formData.selectedStorage}
            setSelectedStorage={(value) =>
              setFormData({
                ...initialFormData,
                selectedStorage: value,
              })
            }
          />
        </div>

        <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
          <CheckButton
            type={"add"}
            id={"addRack"}
            name={"addRack"}
            checked={formData.addRack}
            onChange={handleCheckChange}
            label={"선반추가"}
          />
          <div className={styleStorage.addContents}>
            <div className={styleStorage.addItem}>
              <h3 className={styleStorage.modifyHeading}>구역</h3>
              <select
                name="selectedZone"
                value={formData.selectedZone}
                className={styleStorage.modifyZoneSelect}
                disabled={!formData.addRack}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedZone: Number(e.target.value),
                  }))
                }
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
                name="addRackCount"
                value={formData.addRackCount}
                required
                min="0"
                disabled={!formData.addRack}
                placeholder="추가할 층수 입력"
                onChange={handleInputChange}
              ></input>
              <p
                className={styleStorage.errorMsg}
                style={{
                  visibility: errors.addRackCount ? "visible" : "hidden",
                }}
              >
                {errorMsg.addRackCount}
              </p>
              {Number(formData.selectedZone) > 0 && (
                <span className={styleStorage.informRackCount}>
                  현재 해당 구역 선반은 {rackOptions.length}층 입니다.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
          <CheckButton
            type={"add"}
            id={"addZone"}
            name={"addZone"}
            checked={formData.addZone}
            onChange={handleCheckChange}
            label={"구역추가"}
          />
          <div className={styleStorage.addContents}>
            <div
              className={`${styleStorage.addItem} ${styleStorage.addZoneArea}`}
            >
              <h3 className={styleStorage.modifyHeading}>구역</h3>
              <input
                type="number"
                name="newZone"
                value={formData.newZone}
                required
                min="0"
                disabled={!formData.addZone}
                placeholder="구역 번호 입력"
                onChange={handleInputChange}
              ></input>
              <p
                className={styleStorage.errorMsg}
                style={{ visibility: errors.newZone ? "visible" : "hidden" }}
              >
                {errorMsg.newZone}
              </p>
              {formData.addZone && formData.selectedStorage && (
                <span className={styleStorage.informZoneCount}>
                  현재 해당 창고의 마지막 구역은 {zoneOptions.length} 입니다.
                </span>
              )}
            </div>
            <div className={styleStorage.addItem}>
              <h3 className={styleStorage.modifyHeading}>선반</h3>
              <input
                type="number"
                name="rackCountForNewZone"
                value={formData.rackCountForNewZone}
                required
                min="0"
                disabled={!formData.addZone}
                placeholder="선반 별 층수 입력"
                onChange={handleInputChange}
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
