import { useOpenAlert } from "../../store/alert";
import { useState } from "react";

export const useStorageToggle = ({ resetZoneState, resetRackState }) => {
  const [disableValues, setDisableValues] = useState({
    isDisabledZone: false,
    isDisabledRack: false,
  });
  const openAlert = useOpenAlert();

  const handleToggle = (e, selectedZone, selectedRack) => {
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
      resetZoneState?.();
    }

    //선반 비활성화 -> 선반 재고 상태 초기화
    if (name === "disabledRack" && checked) {
      resetRackState?.();
    }
  };

  return {disableValues, setDisableValues, handleToggle};
};
