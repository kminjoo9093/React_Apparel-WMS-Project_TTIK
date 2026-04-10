import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import { useNavigate } from "react-router-dom";
import { checkNumber } from "../../utils/validation/numbers";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";
import { CommonButton } from "../../components/CommonButton";
import { registerStorage } from "../../api/storage/fetchStorageData";

function StorageRegister() {
  const navigate = useNavigate();
  const { storageList } = useStorageContext();
  const [storageNm, setStorageNm] = useState("");
  const [zoneList, setZoneList] = useState([{ zone: 1, rack: "" }]);
  const openAlert = useOpenAlert();
  // 숫자 입력 유효성 검사
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddBtn = () => {
    setZoneList((prev) => {
      const nextZone = prev.length + 1;
      return [...prev, { zone: nextZone, rack: "" }];
    });
  };

  const handleRemoveBtn = (indexToRemove) => {
    setZoneList((prev) =>
      prev.filter((item, index) => index !== indexToRemove),
    );
  };

  const validateNumber = (e, rackNo) => {
    const value = e.target.value;
    const { isInvalid, message } = checkNumber(value);

    if (!isInvalid) {
      setZoneList((prev) =>
        prev.map((obj, i) => (i === rackNo ? { ...obj, rack: value } : obj)),
      );
    }

    setError(isInvalid);
    setErrorMsg(message);
  };

  const validateStorageName = (value, storageList) => {
    if (!value) {
      return "창고명을 입력해주세요";
    }

    const parsedValue = value.includes("동")
      ? value.split("동").join("")
      : value;
    const isAlphabet = (v) => v >= "A" && v <= "Z";

    if (parsedValue.length > 1 || !isAlphabet(value)) {
      return "창고명을 다시 입력해주세요";
    }

    const existStorage = storageList.some((item) => item.storageNm === value);

    if (existStorage) {
      return "이미 등록된 창고입니다.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateStorageName(storageNm, storageList);
    if (errorMessage) {
      openAlert({
        title: "Again",
        message: errorMessage,
      });
      return;
    }

    //서버에 등록 요청
    const submitData = {
      storageNm: storageNm,
      zones: zoneList.map((item) => ({
        zoneNo: item.zone,
        rackCount: item.rack,
      })),
    };

    try {
      await registerStorage(submitData);

      setStorageNm("");
      setZoneList([{ zone: 1, rack: "" }]);
      openAlert({
        title: "Success",
        message: (
          <>
            등록이 완료되었습니다.
            <br />
            관리자/모니터 등록을 진행해 주세요
          </>
        ),
        onConfirm: () => {
          navigate("/register/admin");
        },
      });
    } catch (error) {
      openAlert({
        title: "Error",
        message: "등록에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <h2 className={styleStorage.contentTitle}>창고 등록</h2>
      <form onSubmit={handleSubmit}>
        <div
          className={`${styleStorage.contentRow}`}
          style={{ gap: "2rem", alignItems: "flex-start" }}
        >
          <h3 className={styleStorage.modifyHeading}>창고</h3>
          <div className={styleStorage.storageNameWrap}>
            <input
              type="text"
              name="storage"
              placeholder="창고 이름을 입력하세요"
              className={styleStorage.storageName}
              required
              value={storageNm}
              onChange={(e) => {
                setStorageNm(e.target.value.toUpperCase());
              }}
            />{" "}
            동
            <span className={styleStorage.storageGuide}>
              * 창고 이름은 A부터 Z까지의{" "}
              <br className={styleStorage.brMo}></br>알파벳으로 입력하세요.
              <br />
              예시 ) A
            </span>
          </div>
        </div>

        <div
          className={`${styleStorage.registerRow} ${styleStorage.contentRow}`}
        >
          {zoneList.map((item, index) => (
            <div key={index} className={styleStorage.zoneRackBox}>
              <div>
                <h3 className={styleStorage.modifyHeading}>구역</h3>
                <input type="text" value={item.zone} readOnly required></input>
              </div>
              <div>
                <h3 className={styleStorage.modifyHeading}>선반</h3>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    name="rack"
                    value={item.rack}
                    required
                    onChange={(e) => {
                      validateNumber(e, index);
                    }}
                    placeholder="선반 층수 입력"
                  ></input>
                  <p
                    className={`${styleRegister.errorMsg} ${styleStorage.errorMsg}`}
                    style={{ visibility: error ? "visible" : "hidden" }}
                  >
                    {errorMsg}
                  </p>
                </div>
              </div>
              {index > 0 && index === zoneList.length - 1 && (
                <button
                  type="button"
                  className={styleStorage.btnRemove}
                  onClick={() => handleRemoveBtn(index)}
                ></button>
              )}
            </div>
          ))}

          <button
            type="button"
            className={styleStorage.btnPlus}
            onClick={handleAddBtn}
          ></button>
        </div>
        <div className={styleStorage.btnSubmitWrap}>
          <CommonButton variant="primary" type="submit">
            등록
          </CommonButton>
        </div>
      </form>
    </>
  );
}

export default StorageRegister;
