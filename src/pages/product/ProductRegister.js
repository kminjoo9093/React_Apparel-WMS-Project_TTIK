import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styleRegister from "../../css/ProductRegister.module.css";
import RegistModalFrame from "../../components/RegistModalFrame";
import ProductSeason from "./ProductSeason";
import ProductCode from "./ProductCode";
import ModalBrandSearch from "./ModalBrandSearch";
import Modal from "../../components/Modal";
import { CommonButton } from "../../components/CommonButton";
import { ProductContext } from "./ProductDataProvider";
import {
  fetchSizeMap,
  createProductCd,
  registerProduct,
} from "../../api/product";
import PageInfo from "../../components/PageInfo";

function ProductRegister() {
  const navigate = useNavigate();

  //브랜드, 시즌, 카테고리 공통 데이터
  const { brandList, categoryList, seasonList } = useContext(ProductContext);

  //alert
  const closeAlert = () => setModal({ ...modal, isOpen: false });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });

  // 폼 입력값
  const [formData, setFormData] = useState({
    brandCd: "",
    productNm: "",
    category: "",
    seasonCd: "",
    sizeCd: "",
    styleNo: "",
    inboxQty: "", //입수량
    price: "",
    threshold: "", //임계치
  });

  const [target, setTarget] = useState("");
  const [productCd, setProductCd] = useState("");
  const [inputValue, setInputValue] = useState(""); //임시 인풋값
  const [sizeMap, setSizeMap] = useState({});

  // 모달
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    children: null,
  });

  const openModal = (title, children) => {
    setModalConfig({ isOpen: true, title, children });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // 숫자 입력 유효성 검사
  const [errors, setErrors] = useState({
    qty: false, // 박스 입수량
    price: false, // 단가
    threshold: false, // 임계치
  });
  const [errorMsg, setErrorMsg] = useState({
    qty: "",
    price: "",
    threshold: "",
  });

  const validateNumber = (e) => {
    const { value, name } = e.target; //객체 구조분해
    const isInvalid = Number(value) < 0; //음수면 true

    if (!isInvalid) {
      switch (name) {
        case "qty":
          setFormData({ ...formData, inboxQty: value });
          break;
        case "price":
          setFormData({ ...formData, price: value });
          break;
        case "threshold":
          setFormData({ ...formData, threshold: value });
          break;
        default:
          break;
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: isInvalid,
    }));

    setErrorMsg((prev) => ({
      ...prev,
      [name]: isInvalid ? "0 이상의 숫자를 입력하세요." : "",
    }));
  };

  // 카테고리 선택
  function changedCategory(e) {
    const cat = e.target.value;
    setFormData({ ...formData, category: cat });
    setFormData({ ...formData, sizeCd: "" });
  }

  //스타일 넘버 -> 품번
  function handleStyleNo(e) {
    setFormData({ ...formData, sizeCd: "" });

    //유효성 검사(W/M/U/K)
    const value = e.target.value.toUpperCase();

    if (!value) return;

    const startAlphas = ["W", "M", "U", "K"];
    const isValid = startAlphas.some((alpha) => value.startsWith(alpha));

    //첫 글자 뒤 3자리가 숫자인지 확인
    const num = Number(value.substring(1));
    const isNumber = Number.isInteger(num) && num >= 0 && num < 1000;

    if (value.length === 4 && isValid && isNumber) {
      setFormData({ ...formData, styleNo: value });

      const target = value.substring(0, 1);
      setTarget(target);
    } else {
      setModal({
        isOpen: true,
        title: "Error",
        message: "입력 형식을 확인하세요.",
        onConfirm: closeAlert,
      });
      setInputValue("");
    }
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

  // 상품 코드 생성 & 모달 오픈
  async function generateProductCd() {
    try {
      const code = await createProductCd({
        styleNo: formData.styleNo,
        brandCd: formData.brandCd,
        sizeCd: formData.sizeCd,
        catCd: formData.brandCd,
        seasonCd: formData.seasonCd,
      });
      setProductCd(code);
      return code;
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "입력한 정보를 확인하세요.",
        onConfirm: closeAlert,
      });
    }
  }

  async function handleProductCd() {
    if (
      !formData.brandCd ||
      !formData.seasonCd ||
      !formData.category ||
      !formData.sizeCd
    ) {
      setModal({
        isOpen: true,
        title: "Again",
        message: "브랜드, 품번, 시즌, 카테고리, 사이즈를 모두 입력해야 합니다.",
        onConfirm: closeAlert,
      });
      return;
    }

    // 상품 코드 생성
    const newProductCd = await generateProductCd();

    // 모달 오픈
    openModal(
      "상품 코드 생성",
      <ProductCode
        onClose={closeModal}
        productCd={newProductCd}
        setProductCd={setProductCd}
      />,
    );
  }

  // 인풋 값 변경 시 상품 코드 초기화
  useEffect(() => {
    setProductCd("");
  }, [
    formData.brandCd,
    formData.seasonCd,
    formData.category,
    formData.sizeCd,
    formData.styleNo,
  ]);

  // 상품 등록 처리
  async function handleSubmit(e) {
    e.preventDefault();

    if (!productCd) {
      setModal({
        isOpen: true,
        title: "Again",
        message: "상품코드를 생성해야 등록이 가능합니다.",
        onConfirm: closeAlert,
      });
      return;
    }

    const hasError = Object.values(errors).some((val) => val === true);
    if (hasError)
      setModal({
        isOpen: true,
        title: "Again",
        message: "입력값을 확인하세요",
        onConfirm: closeAlert,
      });

    try {
      const res = await registerProduct({
        productCd: productCd,
        styleNo: formData.styleNo,
        productNm: formData.productNm,
        brandSn: Number(formData.brandCd),
        sizeCd: formData.sizeCd,
        catCd: formData.brandCd,
        seasonCd: formData.seasonCd,
        inboxQty: Number(formData.inboxQty), //입수량
        price: Number(formData.price), //단가
        threshold: Number(formData.threshold), //임계치
      });

      setModal({
        isOpen: true,
        title: "Success",
        message: "상품 등록이 완료되었습니다.",
        onConfirm: () => {
          closeAlert(); // 모달 닫기
          navigate("/product/list"); // 확인 후 이동
        },
      });
      setFormData({
        brandCd: "",
        productNm: "",
        category: "",
        seasonCd: "",
        sizeCd: "",
        inboxQty: "",
        price: "",
        threshold: "",
        styleNo: "",
      });

      setProductCd("");
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Again",
        message: "입력한 정보를 확인하세요.",
        onConfirm: closeAlert,
      });
    }
  }

  return (
    <div className={`${styleRegister.register} container`}>
      <PageInfo title={"Register"} description={"상품을 등록하세요."} />
      <div className={`${styleRegister.content} contentBox`}>
        <form onSubmit={handleSubmit} className={styleRegister.registerForm}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, brandCd: e.target.value })
                  }
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
                    openModal(
                      "브랜드 검색",
                      <ModalBrandSearch
                        onClose={closeModal}
                        setBrandCd={(value) =>
                          setFormData({ ...formData, brandCd: value })
                        }
                      />,
                    );
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
                <p className={styleRegister.guide}>
                  M:남성 W:여성 U:공용 K:키즈
                </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, seasonCd: e.target.value })
                  }
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
                    openModal(
                      "시즌 등록",
                      <ProductSeason onClose={closeModal} />,
                    );
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
                  onChange={(e) =>
                    setFormData({ ...formData, productNm: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, sizeCd: e.target.value })
                  }
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
          <fieldset className={`${styleRegister.stockInfo}`}>
            <div className={styleRegister.row}>
              <div className={styleRegister.col}>
                <label
                  className={`${styleRegister.required} ${styleRegister.label}`}
                >
                  박스 입수량
                  <span className={styleRegister.unit}>(EA/BOX)</span>{" "}
                </label>
                <div className={styleRegister.numberWrapper}>
                  <input
                    type="number"
                    name="qty"
                    min="0"
                    required
                    placeholder="EA 수량 입력"
                    value={formData.inboxQty}
                    onChange={validateNumber}
                  ></input>
                  <p
                    className={styleRegister.errorMsg}
                    style={{ visibility: errors.qty ? "visible" : "hidden" }}
                  >
                    {errorMsg.qty}
                  </p>
                </div>
              </div>
              <div className={`${styleRegister.col} ${styleRegister.right}`}>
                <label
                  className={`${styleRegister.label} ${styleRegister.required}`}
                >
                  단가 (원)
                </label>
                <div className={styleRegister.numberWrapper}>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    required
                    placeholder="개별 단가를 입력해주세요"
                    value={formData.price}
                    onChange={validateNumber}
                  ></input>
                  <p
                    className={styleRegister.errorMsg}
                    style={{ visibility: errors.price ? "visible" : "hidden" }}
                  >
                    {errorMsg.price}
                  </p>
                </div>
              </div>
            </div>
            <div className={styleRegister.row}>
              <div className={styleRegister.col}>
                <label className={styleRegister.label}>임계치</label>
                <div className={styleRegister.numberWrapper}>
                  <input
                    type="number"
                    name="threshold"
                    min="0"
                    placeholder="알림을 받을 최소 재고 수량 입력"
                    value={formData.threshold}
                    onChange={validateNumber}
                  ></input>
                  <p
                    className={styleRegister.errorMsg}
                    style={{
                      visibility: errors.threshold ? "visible" : "hidden",
                    }}
                  >
                    {errorMsg.threshold}
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset className={styleRegister.codeInfo}>
            <div className={styleRegister.row}>
              <div className={styleRegister.col}>
                <label
                  className={`${styleRegister.required} ${styleRegister.label}`}
                >
                  상품 코드
                </label>
                <input
                  type="text"
                  placeholder="생성 버튼을 누르세요"
                  readOnly
                  value={productCd}
                ></input>
                <CommonButton
                  variant="secondary"
                  type="button"
                  onClick={handleProductCd}
                >
                  생성
                </CommonButton>
              </div>
            </div>
          </fieldset>
          <div className={styleRegister.formBtnWrap}>
            <CommonButton variant="primary" type="submit">
              등록
            </CommonButton>
          </div>
        </form>
      </div>

      {/* 공통 모달 하나만 배치 */}
      <RegistModalFrame
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.children}
      </RegistModalFrame>
      <Modal {...modal} />
    </div>
  );
}

export default ProductRegister;
