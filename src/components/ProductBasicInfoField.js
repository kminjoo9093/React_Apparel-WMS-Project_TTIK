import styleRegister from "../css/ProductRegister.module.css";
import { useContext, useState, useEffect } from "react";
import { ProductContext } from "../pages/product/ProductDataProvider";
import { useFormData, useSetFormData } from "../store/product";
import { CommonButton } from "./CommonButton";
import { useOpenModal } from "../store/productModal";
import { checkStyleNo } from "../utils/validation/styleNo";
import { fetchSizeMap } from "../api/product";
import { useOpenAlert } from "../store/alert";

export default function ProductBasicInfo() {
  //브랜드, 시즌, 카테고리 공통 데이터
  const { brandList, categoryList, seasonList } = useContext(ProductContext);

  const formData = useFormData();
  const setFormData = useSetFormData();
  const openAlert = useOpenAlert();
  const openModal = useOpenModal();

  const [inputValue, setInputValue] = useState(""); //임시 인풋값
  const [target, setTarget] = useState("");
  const [sizeMap, setSizeMap] = useState({});

  //스타일 넘버 -> 품번
  function handleStyleNo(e) {
    setFormData({ sizeCd: "" });

    const result = checkStyleNo(e.target.value);

    if (result.ok === false && result.empty) return;

    if (result.ok) {
      setFormData({ styleNo: result.styleNo });
      setTarget(result.target);
      return;
    } else {
      openAlert({
        title: "Error",
        message: "입력 형식을 확인하세요.",
      });
      setInputValue("");
    }
  }

  // 카테고리 선택
  function changedCategory(e) {
    const cat = e.target.value;
    setFormData({ category: cat, sizeCd: "" });
  }

  //사이즈 옵션 받아오기
  useEffect(() => {
    if (!target || !formData.category) return;

    const fetchData = async () => {
      const sizeData = await fetchSizeMap(target, formData.category);

      if (sizeData) {
        setSizeMap(sizeData);
      } else {
        setSizeMap({});
      }
    };
    fetchData();
  }, [target, formData.category]);

  return (
    <fieldset className={`${styleRegister.productInfo}`}>
      <div className={styleRegister.row}>
        <div className={styleRegister.col}>
          <label htmlFor="brand" className={styleRegister.label}>
            브랜드
          </label>
          <select
            name="brand"
            id="brand"
            value={formData.brandCd}
            onChange={(e) => setFormData({ brandCd: e.target.value })}
          >
            <option value="">선택하세요</option>
            {brandList?.map((record) => (
              <option key={record.brandSn} value={record.brandSn}>
                {record.brandNm}
              </option>
            ))}
          </select>
          <CommonButton
            variant="secondary"
            type="button"
            onClick={() => {
              openModal("brand");
            }}
          >
            검색
          </CommonButton>
        </div>
        <div className={`${styleRegister.col} ${styleRegister.right}`}>
          <label htmlFor="style" className={styleRegister.label}>
            품번
          </label>
          <input
            id="style"
            type="text"
            required
            placeholder="ex) M001 (성별 영문 + 숫자3자리)"
            maxLength={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleStyleNo}
            style={{ textTransform: "uppercase" }}
          ></input>
          <p className={styleRegister.guide}>M:남성 W:여성 U:공용 K:키즈</p>
        </div>
      </div>
      <div className={styleRegister.row}>
        <div className={`${styleRegister.col}`}>
          <label htmlFor="season" className={styleRegister.label}>
            시즌
          </label>
          <select
            name="season"
            id="season"
            value={formData.seasonCd}
            onChange={(e) => setFormData({ seasonCd: e.target.value })}
          >
            <option value="">선택하세요</option>
            {seasonList?.map((record, index) => (
              <option key={index} value={record.seasonCd}>
                {record.seasonNm}
              </option>
            ))}
          </select>
          <CommonButton
            variant="secondary"
            type="button"
            onClick={() => {
              openModal("season");
            }}
          >
            등록
          </CommonButton>
        </div>
        <div className={`${styleRegister.col} ${styleRegister.right}`}>
          <label htmlFor="category" className={styleRegister.label}>
            카테고리
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={changedCategory}
          >
            <option value="">선택하세요</option>
            {categoryList?.map((record) => (
              <option key={record.catCd} value={record.catCd}>
                {record.catNm}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styleRegister.row}>
        <div className={styleRegister.col}>
          <label
            htmlFor="product"
            className={`${styleRegister.required} ${styleRegister.label}`}
          >
            상품명
          </label>
          <input
            id="product"
            type="text"
            required
            placeholder="ex) 우븐 오버핏 티셔츠"
            value={formData.productNm}
            onChange={(e) => setFormData({ productNm: e.target.value })}
          ></input>
        </div>
        <div className={`${styleRegister.col} ${styleRegister.right}`}>
          <label htmlFor="size" className={styleRegister.label}>
            사이즈
          </label>
          <select
            name="size"
            id="size"
            disabled={!formData.category || !target}
            value={formData.sizeCd}
            onChange={(e) => setFormData({ sizeCd: e.target.value })}
          >
            <option value="">선택하세요</option>
            {target &&
              formData.category &&
              sizeMap[target]?.[formData.category]?.map((record) => (
                <option key={record.sizeCd} value={record.sizeCd}>
                  {record.sizeNm}
                </option>
              ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
