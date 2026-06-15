import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import style from "../../css/QRsave.module.css";
import serverUrl from "../../db/server.json";
import Alert from "../../components/Alert";

const QRsave = () => {
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  const closeAlert = () => setAlert({ ...alert, isOpen: false });
  const [generatedQrs, setGeneratedQrs] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [printConfig, setPrintConfig] = useState({
    productId: "", // 초기 선택값 비움
    boxQty: 50,
    boxStart: 1,
    boxEnd: 1,
    itemStart: 1,
    itemEnd: 1,
    includeItems: false,
  });

  const printAreaRef = useRef(null);
  const SERVER_URL = serverUrl.SERVER_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/ttik/product/list`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);

          // 브랜드 중복 제거하여 추출
          const uniqueBrands = [...new Set(data.map((p) => p.brandNm))];
          setBrands(uniqueBrands);
        }
      } catch (error) {
        console.error("상품 목록 로딩 실패:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = async (productId) => {
    const selectedProduct = products.find((p) => p.productCd === productId);
    if (!selectedProduct) return;

    // 1. 입수량(inboxQty) 자동 세팅
    const newBoxQty = selectedProduct.inboxQty || 50;

    try {
      const res = await fetch(
        `${SERVER_URL}/ttik/product/sequence/${productId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      let nextNum = 1;
      if (res.ok) {
        const data = await res.json();
        nextNum = data.nextBoxNum || 1; // 서버에서 계산된 다음 번호
      }

      setPrintConfig((prev) => ({
        ...prev,
        productId: productId,
        boxQty: newBoxQty,
        boxStart: nextNum,
        boxEnd: nextNum,
      }));
    } catch (error) {
      console.error("시퀀스 조회 실패:", error);
      setPrintConfig((prev) => ({
        ...prev,
        productId: productId,
        boxQty: newBoxQty,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "productId") {
      handleProductChange(value);
    } else {
      setPrintConfig((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const generateSequence = (e) => {
    e.preventDefault();
    const {
      productId,
      boxQty,
      boxStart,
      boxEnd,
      itemStart,
      itemEnd,
      includeItems,
    } = printConfig;

    if (!boxStart || !boxEnd || parseInt(boxStart) > parseInt(boxEnd)) {
      setAlert({
        isOpen: true,
        title: "Again",
        message: "박스 범위를 확인하세요.",
        onConfirm: closeModal,
      });
      return;
    }

    let list = [];
    for (let b = parseInt(boxStart); b <= parseInt(boxEnd); b++) {
      const boxBarcode = `${productId}-B${boxQty}-${b}`;
      list.push(boxBarcode);
      if (includeItems) {
        for (let i = parseInt(itemStart); i <= parseInt(itemEnd); i++) {
          list.push(`${boxBarcode}-${i}`);
        }
      }
    }
    setGeneratedQrs(list);
    setTimeout(
      () => printAreaRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleServerPrint = async () => {
    if (generatedQrs.length === 0) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: "인쇄할 QR 코드가 없습니다. 먼저 시퀀스를 생성하세요.",
        onConfirm: closeModal,
      });
      return;
    }
    setIsDownloading(true);
    setProgress(0);
    const userId = `user_${Date.now()}`;
    const progressTimer = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/test/labels/status/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const serverProgress = await res.json();
          setProgress((prev) => {
            const nextValue = Math.floor(serverProgress);
            if (nextValue >= 100) clearInterval(progressTimer);
            return Math.max(prev, nextValue);
          });
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    try {
      const selectedProduct = products.find(
        (p) => String(p.productCd) === String(printConfig.productId),
      );
      const productNameRaw = selectedProduct
        ? selectedProduct.productNm
        : "상품라벨";

      const labelDataList = generatedQrs.map((code) => ({
        qrContent: code,
        qrNumber: code,
        productName: productNameRaw,
        productCode: printConfig.productId, // 이 부분을 수정했습니다.
      }));

      const response = await fetch(
        `${SERVER_URL}/test/labels/download/${userId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(labelDataList),
        },
      );

      if (!response.ok) throw new Error(`서버 응답 에러 (${response.status})`);
      const blob = await response.blob();

      clearInterval(progressTimer);
      setProgress(100);

      setTimeout(() => {
        const safeProductName = productNameRaw.replace(/[\\/:*?"<>|]/g, "");
        const fileName = `${safeProductName}_${generatedQrs.length}개_${new Date().toISOString().split("T")[0]}.pdf`;

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        setAlert({
          isOpen: true,
          title: "Success",
          message: (
            <>
              {fileName}
              <br />
              파일 생성이 완료되었습니다!
            </>
          ),
          onConfirm: closeModal,
        });

        setIsDownloading(false);
        setProgress(0);
      }, 700);
    } catch (error) {
      clearInterval(progressTimer);
      setAlert({
        isOpen: true,
        title: "Error",
        message: "다운로드 중 오류가 발생했습니다: " + error.message,
        onConfirm: closeModal,
      });
      setIsDownloading(false);
    }
  };
  return (
    <>
      <Alert {...alert} />
      <div className={style.container}>
        <aside className={style.leftSection}>
          <div className={style.card}>
            <div className={style.header}>
              <h2>🖨️ 라벨 발행 설정</h2>
            </div>
            <form className={style.form} onSubmit={generateSequence}>
              {/* 브랜드 선택 추가 */}
              <div className={style.inputGroup}>
                <label>브랜드</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setPrintConfig((prev) => ({ ...prev, productId: "" })); // 브랜드 변경 시 상품 초기화
                  }}
                >
                  <option value="">브랜드를 선택하세요</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상품 선택 (브랜드에 따라 필터링) */}
              <div className={style.inputGroup}>
                <label>발행 대상 상품</label>
                <select
                  name="productId"
                  value={printConfig.productId}
                  onChange={handleChange}
                  disabled={!selectedBrand}
                >
                  <option value="">상품을 선택하세요</option>
                  {products
                    .filter((p) => p.brandNm === selectedBrand)
                    .map((p) => (
                      <option key={p.productCd} value={p.productCd}>
                        {p.productNm} ({p.productCd})
                      </option>
                    ))}
                </select>
              </div>

              <div className={style.inputGroup}>
                <label>박스당 입수량 (B-Qty)</label>
                <input
                  type="number"
                  name="boxQty"
                  value={printConfig.boxQty}
                  onChange={handleChange}
                />
              </div>

              <div className={style.inputGroup}>
                <label>박스 번호 (시작 - 끝)</label>
                <div className={style.flexRow}>
                  <input
                    type="number"
                    name="boxStart"
                    value={printConfig.boxStart}
                    onChange={handleChange}
                    placeholder="시작"
                  />
                  <input
                    type="number"
                    name="boxEnd"
                    value={printConfig.boxEnd}
                    onChange={handleChange}
                    placeholder="끝"
                  />
                </div>
              </div>

              <div className={style.checkboxContainer}>
                <input
                  type="checkbox"
                  id="includeItems"
                  name="includeItems"
                  checked={printConfig.includeItems}
                  onChange={handleChange}
                />
                <label htmlFor="includeItems" className={style.checkboxLabel}>
                  낱개 QR 포함 발행
                </label>
              </div>

              {printConfig.includeItems && (
                <div className={style.inputGroup}>
                  <label>낱개 번호 (시작 - 끝)</label>
                  <div className={style.flexRow}>
                    <input
                      type="number"
                      name="itemStart"
                      value={printConfig.itemStart}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="itemEnd"
                      value={printConfig.itemEnd}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className={style.submitBtn}>
                QR 시퀀스 생성하기
              </button>
            </form>
          </div>
        </aside>

        {/* 오른쪽 미리보기 영역 내부 */}
        <main className={style.rightSection} ref={printAreaRef}>
          {generatedQrs.length > 0 ? (
            <>
              <div className={style.printNoticeBox}>
                <h3
                  style={{
                    color: "#d48806",
                    marginTop: 0,
                    fontSize: "1.6rem",
                    fontWeight: 800,
                  }}
                >
                  🖨️ 인쇄 대기 중: {generatedQrs.length}개
                </h3>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#855800",
                    marginBottom: "1.5rem",
                  }}
                >
                  아래 버튼을 누르면 PDF파일이 다운로드 됩니다.
                </p>

                <button
                  onClick={handleServerPrint}
                  className={style.downloadBtn}
                  disabled={isDownloading}
                >
                  {isDownloading ? `생성 중... (${progress}%)` : "PDF 다운로드"}
                </button>

                {isDownloading && (
                  <div className={style.progressWrapper}>
                    <div className={style.progressBarBg}>
                      <div
                        className={style.progressBarFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={style.progressText}>
                      {progress}% 진행 중 (서버에서 PDF 제작 중)
                    </p>
                  </div>
                )}
              </div>

              {/* QR 그리드 미리보기 */}
              <div className={style.qrGrid}>
                {generatedQrs.map((code, index) => (
                  <div key={index} className={style.qrItem}>
                    <QRCodeCanvas value={code} size={110} marginSize={1} />
                    <div className={style.qrText}>{code}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={style.emptyState}>
              <div style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>📄</div>
              <h2 style={{ color: "#64748b" }}>미리보기 데이터가 없습니다.</h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default QRsave;
