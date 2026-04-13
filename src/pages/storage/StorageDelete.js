import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import useStorageData from "../../hooks/storage/useStorageData";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";
import StorageSelector from "../../components/StorageSelector";
import CheckButton from "../../components/CheckButton";
import { deleteStorageStructure } from "../../api/storage/fetchStorageData";

function StorageDelete({ setStorageMenu }) {
  const { storageList, fetchStorageData } = useStorageContext();
  const initialFormData = {
    selectedStorage: null,
    selectedZone: null,
    selectedRack: null,
    //삭제 여부
    isDeleteStorage: false,
    isDeleteZone: false,
    isDeleteRack: false,
  };
  const [formData, setFormData] = useState(initialFormData);
  const openAlert = useOpenAlert();

  //창고별 구역리스트, 구역별 선반리스트
  const { zoneOptions, rackOptions } = useStorageData(
    formData.selectedStorage,
    formData.selectedZone,
  );

  const handleCheckChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => {
      let result = {
        ...prev,
        [name]: checked,
      };
      if (checked) {
        if (name === "deleteStorage") {
          result.selectedZone = null;
          result.selectedRack = null;
        }
      }

      if (name === "deleteZone") {
        result.selectedRack = null;
      }

      return result;
    });
  };

  const resetForm = () => setFormData(initialFormData);

  const handelSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.isDeleteStorage &&
      !formData.isDeleteZone &&
      !formData.isDeleteRack
    ) {
      openAlert({
        title: "",
        message: "삭제 버튼을 눌러 체크 후 삭제를 진행하세요",
      });
      return;
    }

    // 창고 삭제시 관련 관리자 삭제를 위한 데이터 준비 - 김윤중
    const currentStorageNm = storageList.find(
      (s) => s.storageSn === formData.selectedStorage,
    )?.storageNm;

    const storageDeleteReq = {
      storageSn: formData.selectedStorage,
      zoneSn: formData.selectedZone,
      rackSn: formData.selectedRack,
      storageNm: formData.isDeleteStorage ? currentStorageNm : null,
    };

    openAlert({
      title: "DELETE",
      message: "삭제를 진행하시겠습니까?",
      onConfirm: async () => {
        try {
          const data = await deleteStorageStructure(storageDeleteReq);
          openAlert({
            title: "Success",
            message: data.message,
            onConfirm: () => {
              if (fetchStorageData) fetchStorageData();
              resetForm();
              setStorageMenu("list");
            },
          });
        } catch (error) {
          if (error.message) {
            openAlert({
              title: "DELETE",
              message: error.message,
            });
          } else {
            openAlert({
              title: "Error",
              message: "서버 통신 중 에러가 발생했습니다.",
            });
          }
        }
      },
    });
  };
  return (
    <>
      <form className={styleStorage.deleteForm} onSubmit={handelSubmit}>
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
          <CheckButton
            type={"delete"}
            id={"deleteStorage"}
            name={"isDeleteStorage"}
            checked={formData.isDeleteStorage}
            onChange={handleCheckChange}
            label={"삭제"}
          />
        </div>

        <div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
            <h3 className={styleStorage.modifyHeading}>구역</h3>
            <div className={styleStorage.selectWrap}>
              <select
                name="zone"
                value={formData.selectedZone}
                className={styleStorage.modifyZoneSelect}
                disabled={formData.isDeleteStorage}
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
              <CheckButton
                type={"delete"}
                id={"deleteZone"}
                name={"isDeleteZone"}
                checked={formData.isDeleteZone}
                onChange={handleCheckChange}
                label={"삭제"}
              />
            </div>
          </div>
          <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
            <h3 className={styleStorage.modifyHeading}>선반</h3>
            <div className={styleStorage.rackArea}>
              <div className={styleStorage.selectWrap}>
                <select
                  name="rack"
                  value={formData.selectedRack}
                  disabled={formData.isDeleteStorage || formData.isDeleteZone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedRack: Number(e.target.value),
                    }))
                  }
                >
                  <option value="">선반 선택</option>
                  {rackOptions.map((item) => (
                    <option key={item.rackSn} value={item.rackSn}>
                      {item.rackNm}
                    </option>
                  ))}
                </select>
                <CheckButton
                  type={"delete"}
                  id={"deleteRack"}
                  name={"isDeleteRack"}
                  checked={formData.isDeleteRack}
                  onChange={handleCheckChange}
                  label={"삭제"}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default StorageDelete;
