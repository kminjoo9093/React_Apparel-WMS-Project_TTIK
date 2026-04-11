export function getCheckMessage({
  rackCapacity,
  selectedZone,
  selectedRack,
  disableValues,
}) {
  let message = "수정을 진행하시겠습니까?";
  const newRackStatus = rackCapacity === "Y" ? "여유" : "포화";

  if (selectedZone && !disableValues.isDisabledZone && !selectedRack) {
    message = `해당 구역을 활성화 상태로 수정하시겠습니까?`;
  } else if (selectedZone && selectedRack) {
    if (disableValues.isDisabledRack) {
      message = "해당 선반을 비활성화 상태로 수정하시겠습니까?";
    } else {
      message = `해당 선반을 ${newRackStatus}상태로 활성화하시겠습니까?`;
    }
  } else if (selectedZone && disableValues.isDisabledZone) {
    message = "해당 구역과 하위 모든 선반을 비활성화하시겠습니까?";
  }

  return message;
}
