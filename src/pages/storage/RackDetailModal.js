import styleProdModal from "../../css/ProductModal.module.css";
import styleModal from "../../css/Modal.module.css";
import styleStorage from "../../css/Storage.module.css";
import { CommonButton } from "../../components/CommonButton";
import { useOpenAlert } from "../../store/alert";
import {
  getRackListData,
  updateBoxLocation,
} from "../../api/storage/fetchStorageData";

export default function RackDetailModal({
  selectedRack,
  rackDetailList,
  setRackDetailList,
  onCloseModal,
}) {
  const openAlert = useOpenAlert();

  //위치 변경할 선반 선택
  const handleChangeRackInfo = (e, boxQr) => {
    const selectedValue = e.target.value;
    const selectedName = e.target.options[e.target.selectedIndex].text;

    setRackDetailList((prev) => ({
      ...prev,
      boxes: prev?.boxes?.map((box) =>
        box.boxQr === boxQr
          ? { ...box, newRackSn: selectedValue, newRackNm: selectedName }
          : box,
      ),
    }));
  };

  // 박스 이동
  const handelMoveBoxes = async (e) => {
    e.preventDefault();

    // 변경 위치가 선택된 박스들만 필터링
    const selectedBoxes = rackDetailList.boxes.filter((box) => box.newRackSn);
    console.log(selectedBoxes);

    if (selectedBoxes.length === 0) {
      // 위치변경하는 박스가 없는 경우
      onCloseModal();
      return;
    }

    openAlert({
      title: "Confirm",
      message: `${selectedBoxes.length}개의 박스를 이동시키겠습니까?`,
      onConfirm: async () => {
        try {
          const requests = selectedBoxes.map((box) =>
            updateBoxLocation({
              boxQr: box.boxQr,
              oldRack: selectedRack,
              newRack: box.newRackSn,
            }),
          );

          await Promise.all(requests);

          openAlert({
            title: "Success",
            message: "모든 박스의 위치 변경 및 이력 등록이 완료되었습니다.",
            onConfirm: () => {
              onCloseModal(); // 위치 수정 모달 닫기
              getRackListData(); // 리스트 새로고침
            },
          });
        } catch (error) {
          openAlert({
            isOpen: true,
            title: "Error",
            message: "서버 통신 중 에러가 발생했습니다.",
          });
        }
      },
    });
  };

  return (
    <div className={styleModal.modalOverlay}>
      <div className={`${styleProdModal.modal} ${styleStorage.storageModal}`}>
        <div
          className={styleProdModal.modalInner}
          style={{ alignItems: "stretch" }}
        >
          <h3 className={styleStorage.rackHeading}>
            Rack : {rackDetailList.rackNm}
            <span> (수량 : {rackDetailList.boxQty}개) </span>
          </h3>
          <div className={styleStorage.modalTableArea}>
            <table className={styleStorage.storageTable}>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>박스 QR</th>
                  <th>상품명</th>
                  <th>현재 위치</th>
                  <th>변경 위치</th>
                </tr>
              </thead>
              <tbody>
                {rackDetailList?.boxes && rackDetailList.boxes.length > 0 ? (
                  rackDetailList?.boxes?.map((box, index) => {
                    return (
                      <tr key={box.boxQr}>
                        <td>{index + 1}</td>
                        <td>{box.boxQr}</td>
                        <td>{box.productNm}</td>
                        <td>{box.rackNm}</td>
                        <td>
                          <select
                            name="newLoc"
                            value={box.newRackSn || ""}
                            onChange={(e) =>
                              handleChangeRackInfo(e, box.boxQr, box.rackSn)
                            }
                          >
                            <option value="">변경 안함</option>
                            {rackDetailList.availableRacks?.map((rack) => (
                              <option value={rack.availableRackSn}>
                                {rack.availableRackNm}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className={styleStorage.emptyRack}>
                    <td colSpan={5}>해당 선반에 적재된 상자가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <CommonButton
            variant="primary"
            type="submit"
            onClick={handelMoveBoxes}
          >
            확인
          </CommonButton>
        </div>
        <button
          className={styleProdModal.closeBtn}
          onClick={onCloseModal}
        ></button>
      </div>
    </div>
  );
}
