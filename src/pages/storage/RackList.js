import { useEffect, useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import Pagination from "../Pagination";
import { useLocation } from "react-router-dom";
import { useOpenAlert } from "../../store/alert";
import { useStorageContext } from "../../context/StorageProvider";
import RackDetailModal from "./RackDetailModal";
import {
  getRackDetailInfo,
  getRackListData,
} from "../../api/storage/fetchRackData";

function RackList() {
  const { storageList } = useStorageContext();
  const openAlert = useOpenAlert();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [rackList, setRackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageFilter, setStorageFilter] = useState("");

  // 선택한 선반 정보
  const [selectedRack, setSelectedRack] = useState("");
  const [rackDetailList, setRackDetailList] = useState([]);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10; 
  const [totalPages, setTotalPages] = useState(null);

  //메인 대시보드에서 창고 적재현황 클릭시 넘어오는 페이지 - 김윤중
  useEffect(() => {
    const state = location.state;
    if (state?.autoOpenRackSn) {
      setSelectedRack(state.autoOpenRackSn);
      fetchRackDetailInfo(state.autoOpenRackSn);
      setIsOpen(true);

      // 창고 필터 자동 선택 로직
      if (state.autoOpenStorageNm && storageList.length > 0) {
        const targetStorage = storageList.find(
          (s) => s.storageNm === state.autoOpenStorageNm,
        );
        if (targetStorage) {
          setStorageFilter(targetStorage.storageSn.toString());
        }
      }
      // 처리가 끝난 후 state를 비워주어 새로고침 시 계속 뜨는 것을 방지 (선택 사항)
      window.history.replaceState({}, document.title);
    }
  }, [location.state, storageList]);

  // 선반 조회
  const fetchRackList = async () => {
    setIsLoading(true);

    try {
      const data = await getRackListData({
        page: currentPage - 1,
        size: postsPerPage,
        filter: storageFilter,
      });
      setRackList(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      openAlert({
        title: "Error",
        message: "선반 목록을 받아오지 못했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRackList();
  }, [currentPage, storageFilter]);

  const fetchRackDetailInfo = async (rackSn) => {
    try {
      const data = await getRackDetailInfo(rackSn);
      setRackDetailList(data);
    } catch (error) {
      openAlert({
        title: "Error",
        message: "해당 선반의 상세정보를 받아오지 못했습니다.",
      });
    }
  };

  const handleRackClick = (rackSn) => {
    setSelectedRack(rackSn);
    fetchRackDetailInfo(rackSn);
    setIsOpen(true);
  };

  const onCloseModal = () => {
    setIsOpen(false);
    setSelectedRack("");
    setRackDetailList([]);
  };

  const handleRackStts = (rackStts, hasBox, rackEnabled) => {
    if (rackEnabled === "N") return { text: "비었음", color: "#333" }; //사용불가

    if (rackStts === "Y") {
      //선반 사용가능 상태
      return hasBox
        ? { text: "사용중", color: "#10b981" }
        : { text: "비었음", color: "#333" };
    } else {
      return { text: "포화", color: "#cf1322" };
    }
  };

  return (
    <>
      <h2 className={styleStorage.contentTitle}>창고 조회</h2>
      <div className={styleStorage.listTopWrap}>
        <span className={styleStorage.notice}>
          클릭 시 적재된 박스 정보 확인과{" "}
          <br className={styleStorage.brMo}></br>위치 수정이 가능합니다.
        </span>
        <select
          name="storageFilter"
          value={storageFilter}
          className={styleStorage.listFilter}
          onChange={(e) => {
            setStorageFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">창고 선택</option>
          {storageList.map((item) => (
            <option key={item.storageSn} value={item.storageSn}>
              {item.storageNm}
            </option>
          ))}
        </select>
      </div>
      <table className={styleStorage.storageTable}>
        <thead>
          <tr>
            <th>NO</th>
            <th>창고명</th>
            <th>선반 위치</th>
            <th>재고 유무</th>
            <th>가용 상태</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className={styleStorage.loading}>
                데이터를 불러오는 중입니다..
              </td>
            </tr>
          ) : rackList.length === 0 ? (
            <tr>
              <td colSpan={5} className={styleStorage.loading}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            rackList?.map((data, index) => (
              <tr
                key={data.rackSn}
                onClick={() => handleRackClick(data.rackSn)}
              >
                <td>{(currentPage - 1) * postsPerPage + index + 1}</td>
                <td>{data.storageNm}</td>
                <td>{data.rackNm}</td>
                <td
                  style={{
                    color: handleRackStts(
                      data.rackStts,
                      data.hasBox,
                      data.rackEnabled,
                    ).color,
                  }}
                >
                  {
                    handleRackStts(data.rackStts, data.hasBox, data.rackEnabled)
                      .text
                  }
                </td>
                <td>{data.rackEnabled === "Y" ? "활성화" : "비활성화"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styleStorage.paginationArea}>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          blockSize={5}
        />
      </div>

      {isOpen && (
        <RackDetailModal
          selectedRack={selectedRack}
          rackDetailList={rackDetailList}
          setRackDetailList={setRackDetailList}
          onCloseModal={onCloseModal}
        />
      )}
    </>
  );
}

export default RackList;
