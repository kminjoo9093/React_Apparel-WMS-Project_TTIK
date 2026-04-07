import { useContext, useRef } from "react";
import styleProdModal from "../../css/ProductModal.module.css";
import { CommonButton } from "../../components/CommonButton";
import { SeasonDispatchContext } from "./ProductDataProvider";
import { useOpenAlert } from "../../store/alert";
import { registerSeasonData } from "../../api/season";

function ProductSeasonModal({ onClose }) {
  const yearRef = useRef();
  const seasonRef = useRef();
  const dispatch = useContext(SeasonDispatchContext);
  const openAlert = useOpenAlert();

  async function registerSeason(e) {
    e.preventDefault();

    const year = yearRef.current.value;
    const season = seasonRef.current.value;

    //유효성 검사 로직
    if (!year || year.length !== 4) {
      openAlert({
        title: "Again",
        message: "연도 4자리 숫자를 정확히 입력하세요.",
      });
      return;
    }

    try {
      const updatedList = await registerSeasonData({
        year: year,
        season: season,
      });

      dispatch(updatedList);
      const newSeason = season === "S" ? "S/S" : "FW";
      openAlert({
        title: "Success",
        message: `${year} ${newSeason} 시즌이 정상 등록되었습니다.`,
      });

      //모달창 닫기
      onClose();
    } catch (error) {
      if (error.status === 404) {
        openAlert({
          title: "Error",
          message: "네트워크 통신 중 오류가 발생했습니다.",
        });
      } else {
        openAlert({
          title: "Again",
          message: "이미 등록된 시즌이거나 등록할 수 없는 정보입니다.",
        });
      }
    }
  }

  return (
    <div className={styleProdModal.modalInner}>
      <p>상품 등록에 사용할 시즌을 추가하세요.</p>
      <form onSubmit={registerSeason} className={styleProdModal.modalContents}>
        <div className={styleProdModal.inputGroup}>
          <div>
            <input
              className={styleProdModal.year}
              type="number"
              min="0"
              name="year"
              required
              placeholder="ex) 2026"
              ref={yearRef}
            ></input>
            년도
          </div>
          <select
            name="season"
            className={styleProdModal.seasonType}
            ref={seasonRef}
          >
            <option value="S">S/S</option>
            <option value="F">F/W</option>
          </select>
        </div>
        <CommonButton variant="primary" type="submit">
          등록
        </CommonButton>
      </form>
    </div>
  );
}

export default ProductSeasonModal;
