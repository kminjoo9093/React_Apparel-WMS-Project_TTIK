import styleProdModal from "../../css/ProductModal.module.css";
import styleModal from "../../css/Modal.module.css";
import styleStorage from "../../css/Storage.module.css";
import { CommonButton } from "../../components/CommonButton";
import { useOpenAlert } from "../../store/alert";
import { useRackDetail } from "../../hooks/queries/useRackDetail";
import { useEffect, useState } from "react";
import { useMoveBoxes } from "../../hooks/mutations/useMoveBox";

export default function RackDetailModal({ selectedRack, onCloseModal }) {
  const openAlert = useOpenAlert();

  const {
    data: rackDetailData = [],
    isLoading: isRackDetailLoading,
    isError: isRackDetailDataError,
  } = useRackDetail(selectedRack);

  const [boxSelections, setBoxSelections] = useState({});

  useEffect(() => {
    if (isRackDetailDataError) {
      openAlert({
        title: "Error",
        message: "해당 선반의 상세정보를 받아오지 못했습니다.",
      });
    }
  }, [isRackDetailDataError]);

  //위치 변경할 선반 선택
  const handleChangeRackInfo = (e, boxQr) => {
    const selectedRackSn = e.target.value;
    const selectedRackName = e.target.options[e.target.selectedIndex].text;

    setBoxSelections((prev) => ({
      ...prev,
      [boxQr]: { newRackSn: selectedRackSn, newRackNm: selectedRackName },
    }));
  };

  const { mutate: moveBoxes, isPending: isMoveBoxesPending } = useMoveBoxes();

  const handelMoveBoxes = (e) => {
    e.preventDefault();

    // 이동할 박스들(새 선반 o)만 필터링
    const selectedBoxes = rackDetailData.boxes.filter(
      (box) => boxSelections[box.boxQr]?.newRackSn,
    );

    if (selectedBoxes.length === 0) {
      onCloseModal();
      return;
    }

    openAlert({
      title: "Confirm",
      message: `${selectedBoxes.length}개의 박스를 이동시키겠습니까?`,
      onConfirm: () => {
        moveBoxes(
          selectedBoxes.map((box) => ({
            boxQr: box.boxQr,
            oldRack: selectedRack,
            newRack: boxSelections[box.boxQr].newRackSn,
          })),
          {
            onSuccess: () => {
              openAlert({
                title: "Success",
                message: "모든 박스의 위치 변경 및 이력 등록이 완료되었습니다.",
                onConfirm: () => {
                  onCloseModal();
                },
              });
            },
            onError: () => {
              openAlert({
                isOpen: true,
                title: "Error",
                message: "서버 통신 중 에러가 발생했습니다.",
              });
            },
          },
        );
      },
    });
  };

  const renderTableBody = () => {
    if (isRackDetailLoading) {
      return (
        <tr>
          <td colSpan={5} className={styleStorage.loading}>
            선반 정보를 불러오는 중입니다...
          </td>
        </tr>
      );
    }

    if (!rackDetailData?.boxes?.length) {
      return (
        <tr className={styleStorage.emptyRack}>
          <td colSpan={5}>해당 선반에 적재된 상자가 없습니다.</td>
        </tr>
      );
    }

    return rackDetailData.boxes.map((box, index) => (
      <tr key={box.boxQr}>
        <td>{index + 1}</td>
        <td>{box.boxQr}</td>
        <td>{box.productNm}</td>
        <td>{box.rackNm}</td>
        <td>
          <select
            name="newLoc"
            value={boxSelections[box.boxQr]?.newRackSn || ""}
            onChange={(e) => handleChangeRackInfo(e, box.boxQr, box.rackSn)}
          >
            <option value="">변경 안함</option>
            {rackDetailData.availableRacks?.map((rack) => (
              <option key={rack.availableRackSn} value={rack.availableRackSn}>
                {rack.availableRackNm}
              </option>
            ))}
          </select>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styleModal.modalOverlay}>
      <div className={`${styleProdModal.modal} ${styleStorage.storageModal}`}>
        <div
          className={styleProdModal.modalInner}
          style={{ alignItems: "stretch" }}
        >
          <h3 className={styleStorage.rackHeading}>
            Rack : {rackDetailData.rackNm}
            <span> (수량 : {rackDetailData.boxQty}개) </span>
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
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
          <CommonButton
            disabled={isMoveBoxesPending}
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
