import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import serverUrl from "../../db/server.json";
import useStorageData from "../../hooks/useStorageData";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";

function StorageUpdateState({ setView }) {
  const {storageList, getStorageData} = useStorageContext;

  const SERVER_URL = serverUrl.SERVER_URL;
  const [selectedStorage, setSelectedStorage] = useState(1); //창고 일련번호
  const [selectedZone, setSelectedZone] = useState(""); //구역 일련번호
  const [selectedRack, setSelectedRack] = useState(""); //선반 일련번호

  const [rackEnabled, setRackEnabled] = useState(""); //선반 활성(Y)/비활성(N)
  const [rackCapacity, setRackCapacity] = useState(""); //선반 여유(Y)/포화(N)
  const [disableValues, setDisableValues] = useState({
    disabledZone: false,
    disabledRack: false,
  });

  const openAlert = useOpenAlert();

  const handleSelectStorage = (e) => {
    setSelectedStorage(Number(e.target.value));
  };

  // 선택한 창고, 구역별 구역, 선반 옵션 리스트
  const { zoneOptions, rackOptions } = useStorageData(
    SERVER_URL,
    selectedStorage,
    selectedZone,
  );

  const handleDisabledChange = (e) => {
    const { name, checked } = e.target;

    if (name === "disabledZone" && !selectedZone) {
      openAlert({
        title: "Again",
        message: "구역을 먼저 선택해주세요.",
      });
      return;
    }

    if (name === "disabledRack" && !selectedRack) {
      openAlert({
        title: "Again",
        message: "선반을 먼저 선택해주세요.",
      });
      return;
    }

    setDisableValues((prev) => ({
      ...prev,
      [name]: checked,
    }));

    //구역 비활성화 -> 선반 관련 상태 초기화
    if (name === "disabledZone" && checked) {
      setSelectedRack("");
      setRackCapacity("");
      setRackEnabled("");
    }

    //선반 비활성화 -> 선반 재고 상태 초기화
    if (name === "disabledRack" && checked) {
      setRackCapacity("");
      setRackEnabled("");
    }
  };

  const resetForm = () => {
    // 1. 선택 데이터 초기화
    setSelectedStorage(1);
    setSelectedZone("");
    setSelectedRack("");

    // 2. 입력 필드 초기화
    setRackCapacity("");
    setRackEnabled("");

    setDisableValues({
      disabledZone: false,
      disabledRack: false,
    });
  };

  // 창고 정보 수정 서버 요청
  const handelSubmit = async (e) => {
    e.preventDefault();

    // 선반 선택을 하고, 비활성화가 아닌경우 적재 상태를 선택해야하도록
    if (selectedRack !== "" && !disableValues.disabledRack) {
      if (rackCapacity === "") {
        openAlert({
          title: "Again",
          message: "선반 적재 상태를 선택하세요.",
        });
        return;
      }
    }

    // 창고 정보 수정 파라미터
    const storageModifyReq = {
      storageSn: selectedStorage,
      zoneSn: selectedZone,
      isDisabledZone: disableValues.disabledZone,
      rackSn: selectedRack,
      isDisabledRack: disableValues.disabledRack,
      rackEnabled: disableValues.disabledRack ? "N" : "Y",
      rackStts: disableValues.disabledRack ? "Y" : rackCapacity || "N",
    };

    let confirmMsg = "수정을 진행하시겠습니까?";
    const newRackStatus = rackCapacity === "Y" ? "여유" : "포화";

    // 조건별 메시지 생성 로직 (기존 로직 유지)
    if (selectedZone && !disableValues.disabledZone && !selectedRack) {
      confirmMsg = `해당 구역을 활성화 상태로 수정하시겠습니까?`;
    } else if (selectedZone && selectedRack) {
      if (disableValues.disabledRack) {
        confirmMsg = "해당 선반을 비활성화 상태로 수정하시겠습니까?";
      } else {
        confirmMsg = `해당 선반을 ${newRackStatus}상태로 활성화하시겠습니까?`;
      }
    } else if (selectedZone && disableValues.disabledZone) {
      confirmMsg = "해당 구역과 하위 모든 선반을 비활성화하시겠습니까?";
    }

    // 커스텀 모달 적용
    openAlert({
      title: "Modify",
      message: confirmMsg,
      onConfirm: async () => {
        try {
          const res = await fetch(`${SERVER_URL}/ttik/storage/modify`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(storageModifyReq),
          });

          if (res.ok) {
            const data = await res.json();
            openAlert({
              title: "Success",
              message: data.message,
              onConfirm: () => {
                resetForm();
                if (getStorageData) getStorageData();
                setView("list"); // 수정 후 리스트 보기
              },
            });
          } else {
            console.log("수정 요청 실패-->", res.status);
            const errorData = await res.json();
            openAlert({
              title: "Again",
              message: errorData.message,
            });
          }
        } catch (error) {
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
      <form className={styleStorage.updateForm} onSubmit={handelSubmit}>
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
        </div>

        <div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
            <h3 className={styleStorage.modifyHeading}>구역</h3>
            <div className={styleStorage.selectWrap}>
              <select
                name="zone"
                value={selectedZone}
                className={styleStorage.modifyZoneSelect}
                onChange={(e) => setSelectedZone(Number(e.target.value))}
              >
                <option value="">구역 선택</option>
                {zoneOptions.map((item) => (
                  <option key={item.zoneSn} value={item.zoneSn}>
                    {item.zoneNm.slice(1)}({item.zoneNm})
                  </option>
                ))}
              </select>

              <label
                htmlFor="disabledZone"
                className={`${styleStorage.disableButton} 
                                                ${disableValues.disabledZone ? styleStorage.disable : ""}`}
              >
                <div className={styleStorage.disableText}>
                  {disableValues.disabledZone ? "비활성화" : "활성화"}
                </div>
                <input
                  type="checkbox"
                  name="disabledZone"
                  checked={disableValues.disabledZone}
                  onChange={handleDisabledChange}
                  id="disabledZone"
                />
              </label>
            </div>
          </div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
            <h3 className={styleStorage.modifyHeading}>선반</h3>
            <div className={styleStorage.rackArea}>
              <div className={styleStorage.selectWrap}>
                <select
                  name="rack"
                  value={selectedRack || ""}
                  disabled={!selectedZone || disableValues.disabledZone}
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
                  htmlFor="disabledRack"
                  className={`${styleStorage.disableButton} 
                                                    ${disableValues.disabledRack ? styleStorage.disable : ""}`}
                >
                  <div className={styleStorage.disableText}>
                    {disableValues.disabledRack ? "비활성화" : "활성화"}
                  </div>
                  <input
                    type="checkbox"
                    name="disabledRack"
                    checked={disableValues.disabledRack}
                    onChange={handleDisabledChange}
                    id="disabledRack"
                  />
                </label>
              </div>
              <div className={styleStorage.statusSelectWrap}>
                <select
                  name="rackCapacity"
                  value={rackCapacity || ""}
                  disabled={
                    !selectedZone ||
                    disableValues.disabledZone ||
                    disableValues.disabledRack
                  }
                  onChange={(e) => setRackCapacity(e.target.value)}
                >
                  <option value="">적재 상태</option>
                  <option value="Y">여유</option>
                  <option value="N">포화</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default StorageUpdateState;
