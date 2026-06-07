import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import { useOpenAlert } from "../../store/alert";
import StorageSelector from "../../components/StorageSelector";
import ToggleSwitch from "../../components/ToggleSwitch";
import { getCheckMessage } from "../../utils/storage/getCheckMessage";
import { useStorageToggle } from "../../hooks/storage/useStorageToggle";
import StorageModifyButton from "../../components/StorageModifyButton";
import { useUpdateStorageState } from "../../hooks/mutations/useUpdateStorageState";
import { useZonesByStorage } from "../../hooks/queries/useZonesByStorage";
import { useRacksByZone } from "../../hooks/queries/useRacksByZone";

function StorageUpdateState({ setStorageMenu }) {
  const [selectedStorage, setSelectedStorage] = useState(null); //창고 일련번호
  const [selectedZone, setSelectedZone] = useState(null); //구역 일련번호
  const [selectedRack, setSelectedRack] = useState(null); //선반 일련번호
  const [rackCapacity, setRackCapacity] = useState(""); //선반 여유(Y)/포화(N)

  const openAlert = useOpenAlert();
  const { mutate: updateStorageState, isPending: isUpdateStorageStatePending } =
    useUpdateStorageState();

  // 선택한 창고 별 구역 옵션 리스트
  const { data: zoneOptions = [] } = useZonesByStorage(selectedStorage);
  // 구역 별 선반 옵션 리스트
  const { data: rackOptions = [] } = useRacksByZone(selectedZone);

  const resetRackInfo = () => {
    setSelectedRack("");
    setRackCapacity("");
  };

  const resetRackState = () => {
    setRackCapacity("");
  };

  const { disableValues, setDisableValues, handleToggle } = useStorageToggle({
    resetRackInfo,
    resetRackState,
  });

  const resetForm = () => {
    // 선택 데이터 초기화
    setSelectedStorage(1);
    setSelectedZone("");
    resetRackInfo();
    setDisableValues({
      isDisabledZone: false,
      isDisabledRack: false,
    });
  };

  const createPayload = () => {
    return {
      storageSn: selectedStorage,
      zoneSn: selectedZone,
      isDisabledZone: disableValues.isDisabledZone,
      rackSn: selectedRack,
      isDisabledRack: disableValues.isDisabledRack,
      rackEnabled: disableValues.isDisabledRack ? "N" : "Y",
      rackStts: disableValues.isDisabledRack ? "Y" : rackCapacity || "N",
    };
  };

  const validateForm = () => {
    if (selectedRack !== null && !disableValues.isDisabledRack) {
      if (rackCapacity === "") {
        openAlert({
          title: "Again",
          message: "선반 적재 상태를 선택하세요.",
        });
        return false;
      }
    }
    return true;
  };

  // 창고 정보 수정 서버 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 창고 정보 수정 파라미터
    const storageModifyReq = createPayload();

    let checkMessage = getCheckMessage(
      rackCapacity,
      selectedZone,
      selectedRack,
      disableValues,
    );

    openAlert({
      title: "Modify",
      message: checkMessage,
      onConfirm: () => {
        updateStorageState(storageModifyReq, {
          onSuccess: (data) => {
            openAlert({
              title: "Success",
              message: data.message,
              onConfirm: () => {
                resetForm();
                setStorageMenu("list");
              },
            });
          },
          onError: (error) => {
            if (error.message) {
              openAlert({
                title: "Again",
                message: error.message,
              });
            } else {
              openAlert({
                title: "Error",
                message: "서버 통신 중 에러가 발생했습니다.",
              });
            }
          },
        });
      },
    });
  };

  return (
    <>
      <form className={styleStorage.updateForm} onSubmit={handleSubmit}>
        <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
          <h3 className={styleStorage.modifyHeading}>창고</h3>
          <StorageSelector
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
          />
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
              <ToggleSwitch
                id={"disabledZone"}
                name={"isDisabledZone"}
                checked={disableValues.isDisabledZone}
                onChange={(e) => handleToggle(e, selectedZone, selectedRack)}
                labelOn={"비활성화"}
                labelOff={"활성화"}
              />
            </div>
          </div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
            <h3 className={styleStorage.modifyHeading}>선반</h3>
            <div className={styleStorage.rackArea}>
              <div className={styleStorage.selectWrap}>
                <select
                  name="rack"
                  value={selectedRack || ""}
                  disabled={!selectedZone || disableValues.isDisabledZone}
                  onChange={(e) => setSelectedRack(Number(e.target.value))}
                >
                  <option value="">선반 선택</option>
                  {rackOptions.map((item) => (
                    <option key={item.rackSn} value={item.rackSn}>
                      {item.rackNm}
                    </option>
                  ))}
                </select>
                <ToggleSwitch
                  id={"disabledRack"}
                  name={"isDisabledRack"}
                  checked={disableValues.isDisabledRack}
                  onChange={(e) => handleToggle(e, selectedZone, selectedRack)}
                  labelOn={"비활성화"}
                  labelOff={"활성화"}
                />
              </div>
              <div className={styleStorage.statusSelectWrap}>
                <select
                  name="rackCapacity"
                  value={rackCapacity || ""}
                  disabled={
                    !selectedZone ||
                    disableValues.isDisabledZone ||
                    disableValues.isDisabledRack
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
        <StorageModifyButton isPending={isUpdateStorageStatePending} />
      </form>
    </>
  );
}

export default StorageUpdateState;
