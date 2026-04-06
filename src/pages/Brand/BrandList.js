import React, { useState, useEffect } from "react";
import BrandRegister from "./BrandRegister";
import styleBrand from "../../css/Brand.module.css";
import serverUrl from "../../db/server.json";
import Alert from "../../components/Alert";

function BrandList() {
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  const closeAlert = () => setAlert({ ...alert, isOpen: false });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // 1. 검색 필터링 로직
  const filteredBrands = brands.filter((brand) => {
    const nameMatch = brand.brandNm
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const telMatch = brand.telNo?.includes(searchTerm);
    const brNoMatch = brand.brNo?.includes(searchTerm);
    return nameMatch || telMatch || brNoMatch;
  });

  // 2. 페이지네이션 계산 로직
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  // 필터링된 결과에서 현재 페이지 분량만 추출
  const currentBrands = filteredBrands.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBrands.length / postsPerPage);

  const SERVER_URL = serverUrl.SERVER_URL;

  const fetchBrandList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/ttik/brand/list`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("서버 응답 에러.");
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Fetch 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      setAlert({
        isOpen: true,
        title: "Again",
        message: "삭제할 브랜드를 선택해 주세요.",
        onConfirm: closeModal,
      });
      return;
    }

    // 1. 먼저 삭제 여부를 묻는 모달을 띄움
    setAlert({
      isOpen: true,
      title: "DELETE",
      message: `선택한 ${selectedIds.length}개의 브랜드를 삭제하시겠습니까?`,
      onCancel: closeModal,
      onConfirm: async () => {
        try {
          const response = await fetch(`${SERVER_URL}/ttik/brand/delete`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedIds),
          });

          if (response.ok) {
            // 2. 삭제 성공 시 성공 알림 모달을 띄움
            setAlert({
              isOpen: true,
              title: "DELETE",
              message: "삭제되었습니다",
              onConfirm: () => {
                // 3. 성공 모달의 '확인'을 눌렀을 때만 상태 업데이트 및 모달 닫기
                setBrands((prev) =>
                  prev.filter((brand) => !selectedIds.includes(brand.brandSn)),
                );
                setSelectedIds([]);
                closeModal();
              },
            });
          } else {
            setAlert({
              isOpen: true,
              title: "ERROR",
              message: "삭제 실패",
              onConfirm: closeModal,
            });
          }
        } catch (error) {
          console.error("삭제 에러:", error);
          setAlert({
            isOpen: true,
            title: "ERROR",
            message: "서버 통신 중 에러가 발생했습니다.",
            onConfirm: closeModal,
          });
        }
      },
    });
  };

  useEffect(() => {
    fetchBrandList();
    setSelectedIds([]);
  }, [currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 1페이지로 이동
  };

  return (
    <>
      <Alert {...alert} />
      <div>
        <h1 className={styleBrand.brandTitle}>Brand</h1>
        <p className={styleBrand.brandSubTitle}>브랜드를 관리 하세요.</p>

        <div className={styleBrand.brandListbox}>
          <div className={styleBrand.searchBox}>
            <label style={{ fontWeight: "bold", marginLeft: "0.5rem" }}>
              브랜드 검색
            </label>
            <input
              className={styleBrand.searchInput}
              type="text"
              placeholder="브랜드 정보 검색"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              className={styleBrand.brandBtn}
              onClick={() => setIsModalOpen(true)}
            >
              브랜드 등록
            </button>
            <button className={styleBrand.brandBtn} onClick={handleDelete}>
              삭제
            </button>
          </div>

          <BrandRegister
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRegisterSuccess={fetchBrandList}
          />

          <div className={styleBrand.tableContainer}>
            {loading ? (
              <p>로딩 중...</p>
            ) : (
              <table className={styleBrand.brandTable}>
                <thead>
                  <tr>
                    <th>선택</th>
                    <th>브랜드명</th>
                    <th>사업자번호</th>
                    <th>연락처</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBrands.length > 0 ? (
                    currentBrands.map((brand) => (
                      <tr key={brand.brandSn}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(brand.brandSn)}
                            onChange={() => handleCheckboxChange(brand.brandSn)}
                          />
                        </td>
                        <td className={styleBrand.brandNameCell}>
                          <span>{brand.brandNm}</span>
                        </td>
                        <td>{brand.brNo}</td>
                        <td>{brand.telNo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styleBrand.noData}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* 3. 페이지네이션 UI (변수명 currentBrands로 수정) */}
          {filteredBrands.length > 0 && (
            <div className={styleBrand.pagination}>
              <button
                className={styleBrand.pageMoveBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &lt;
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${styleBrand.pageNumber} ${currentPage === i + 1 ? styleBrand.activePage : ""}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={styleBrand.pageMoveBtn}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BrandList;
