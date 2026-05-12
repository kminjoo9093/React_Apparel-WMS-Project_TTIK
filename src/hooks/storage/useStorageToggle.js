import { useOpenAlert } from "../../store/alert";
import { useState } from "react";

export const useStorageToggle = ({ resetRackInfo, resetRackState }) => {
  const [disableValues, setDisableValues] = useState({
    isDisabledZone: false,
    isDisabledRack: false,
  });
  const openAlert = useOpenAlert();

  const handleToggle = (e, selectedZone = null, selectedRack = null) => {
    const { name, checked } = e.target;

    console.log("change event test:", selectedZone, selectedRack);

    if (name === "isDisabledZone" && !selectedZone) {
      openAlert({
        title: "Again",
        message: "구역을 먼저 선택해주세요.",
      });
      return;
    }

    if (name === "isDisabledRack" && !selectedRack) {
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
      resetRackInfo?.();
    }

    //선반 비활성화 -> 선반 재고 상태 초기화
    if (name === "disabledRack" && checked) {
      resetRackState?.();
    }
  };

  return { disableValues, setDisableValues, handleToggle };
};
