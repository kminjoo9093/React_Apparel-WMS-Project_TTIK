import { use, useEffect, useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import styleProdModal from "../../css/ProductModal.module.css";
import styleModal from "../../css/Modal.module.css";
import serverUrl from "../../db/server.json";
import Pagination from '../Pagination';
import { useLocation } from "react-router-dom";
import Modal from "../../components/Modal";
import { CommonButton } from "../../components/CommonButton";

function StorageList({storageList:storageOptions=[]}){

    const location = useLocation();
    const SERVER_URL = serverUrl.SERVER_URL;
    const [isOpen, setIsOpen] = useState(false);
    const [storageList, setStorageList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageFilter, setStorageFilter] = useState("");
    const [filteredList, setFilteredList] = useState([]);

    //조회리스트에서 선택한 선반 정보
    const [selectedRack, setSelectedRack] = useState("");
    const [rackDetailList, setRackDetailList] = useState([]);
    const [detailRackNm, setDetailRackNm] = useState("");
    const [boxCount, setBoxCount] = useState(null);

    //선반 이동 관련 상태값
    const [boxQr, setBoxQr] = useState("");
    const [oldRackSn, setOldRackSn] = useState("");
    const [newRackSn, setNewRackSn] = useState("");
    const [newRackNm, setNewRackNm] = useState("");

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; // 한페이지에 10개씩
    const [totalPages, setTotalPages] = useState(null);

    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;

    //alert
    const closeAlert = () => setModal({ ...modal, isOpen: false });
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    //메인 대시보드에서 창고 적재현황 클릭시 넘어오는 페이지 - 김윤중
    useEffect(() => {
        if (location.state?.autoOpenRackSn) {
            setSelectedRack(location.state.autoOpenRackSn);
            openDetailModal(location.state.autoOpenRackSn);
            setIsOpen(true);
            
            // 창고 필터 자동 선택 로직 
             if (location.state.autoOpenStorageNm && storageOptions.length > 0) {
                const targetStorage = storageOptions.find(
                    (s) => s.storageNm === location.state.autoOpenStorageNm
                );
                if (targetStorage) {
                    setStorageFilter(targetStorage.storageSn.toString());
                }
            }
            // 처리가 끝난 후 state를 비워주어 새로고침 시 계속 뜨는 것을 방지 (선택 사항)
            window.history.replaceState({}, document.title);
        }
    }, [location.state, storageOptions]);

    
    const handleRackClick = (rackSn)=>{
        setSelectedRack(rackSn);
        openDetailModal(rackSn);
        setIsOpen(true);
    }

    const openDetailModal = async (rackSn) => {
        console.log("정보 확인");

        //rackSn으로 상세 정보 요청
        try{
            const res = await fetch(`${SERVER_URL}/ttik/storage/rack/detail?rackSn=${rackSn}`, {
                method: 'GET',
                credentials: 'include',
            })

            if(res.ok){
                const data = await res.json();
                setRackDetailList(data);
                setDetailRackNm(data.rackNm);
                setBoxCount(data.boxQty);
                console.log("창고 랙 디테일 리스트-->", data);
            } 
        } catch(error) {
            console.log("창고 랙 디테일 받아오기 실패 : ", error);
        }
    }
    

    const onCloseModal = () => {
        setIsOpen(false);
        //상태값 초기화
        setSelectedRack("");
        setRackDetailList([]);
        setDetailRackNm("");
        setBoxCount(null);
    }

    const getStorageListData = async () => {
        setIsLoading(true);
        try{
            const res = await fetch(`${SERVER_URL}/ttik/storage/listByRack?page=${currentPage-1}&size=${postsPerPage}&filter=${storageFilter}`, {
                method: 'GET',
                credentials: 'include',
            })

            if(res.ok){
                const data = await res.json();
                setStorageList(data.content);
                setTotalPages(data.totalPages);
                console.log("창고 조회 리스트-->", data);
            } 
        } catch(error) {
            console.log("창고 리스트 받아오기 실패 : ", error);
        } finally {
            setIsLoading(false); // 성공/실패 상관없이 종료 시 false
        }
    }

    useEffect(()=>{
        getStorageListData();
    }, [currentPage, storageFilter])

    const handleRackStts = (rackStts, hasBox, rackEnabled) => {
        
        if(rackEnabled === "N") return {text:"비었음", color:"#333"}; //사용불가

        if(rackStts === "Y"){ //선반 사용가능 상태
            return hasBox ? {text:"사용중", color:"#10b981"} : {text:"비었음", color:"#333"};
        } else {
            return {text:"포화", color:"#cf1322"};
        }

    }


    //위치 변경할 선반 선택
    const handleChangeRackInfo = (e, boxQr, oldRackSn)=>{

        const selectedValue = e.target.value;
        const selectedName = e.target.options[e.target.selectedIndex].text;

        setRackDetailList(prev => ({
            ...prev,
            boxes: prev?.boxes?.map(box => 
                box.boxQr === boxQr 
                ? {...box, nextRackSn : selectedValue, nextRackNm: selectedName}
                : box
            )
        }));
    }

// 선반 위치 수정 서버 요청
    const confirmModifyRack = async (e) => {
        e.preventDefault();

        // 변경 위치가 선택된 박스들만 필터링
        const modifiedBoxes = rackDetailList.boxes.filter(box => box.nextRackSn);

        if (modifiedBoxes.length === 0) { // 위치변경하는 박스가 없는 경우
            onCloseModal();
            return;
        }

        setModal({
            isOpen: true,
            title: 'Confirm',
            message: `${modifiedBoxes.length}개의 박스를 이동시키겠습니까?`,
            onCancel: closeAlert,
            onConfirm: async () => {
                try {
                    const moveRequests = modifiedBoxes.map((box) =>
                        fetch(`${SERVER_URL}/ttik/storage/rack/modify`, {
                            method: 'PUT',
                            credentials: 'include',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({
                                boxQr: box.boxQr,
                                oldRack: selectedRack,
                                newRack: box.nextRackSn
                            })
                        })
                    );

                    const response = await Promise.all(moveRequests);

                    if (response.every(res => res.ok)) {
                        setModal({
                            isOpen: true,
                            title: 'Success',
                            message: "모든 박스의 위치 변경 및 이력 등록이 완료되었습니다.",
                            onConfirm: () => {
                                closeAlert();
                                onCloseModal(); // 위치 수정 모달 닫기
                                getStorageListData(); // 리스트 새로고침
                            }
                        });
                    } else {
                        setModal({
                            isOpen: true,
                            title: 'Error',
                            message: '일부 처리 중 오류가 발생했습니다.',
                            onConfirm: closeAlert
                        });
                    }
                } catch (error) {
                    console.error("수정 요청 실패:", error);
                    setModal({
                        isOpen: true,
                        title: 'Error',
                        message: '서버 통신 중 에러가 발생했습니다.',
                        onConfirm: closeAlert
                    });
                }
            }
        });
    };


    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 조회</h2>
            <div className={styleStorage.listTopWrap}>
                <span className={styleStorage.notice}>클릭 시 적재된 박스 정보 확인과 <br className={styleStorage.brMo}></br>위치 수정이 가능합니다.</span>
                <select name="storageFilter" 
                        value={storageFilter} 
                        className={styleStorage.listFilter}
                        onChange={(e)=>{
                            setStorageFilter(e.target.value)
                            setCurrentPage(1)
                        }}>
                    <option value="">창고 선택</option>
                    {
                        storageOptions.map((item)=>(
                            <option key={item.storageSn} value={item.storageSn}>{item.storageNm}</option>
                        ))
                    }
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
                    {
                        isLoading 
                            ? 
                            <div className={styleStorage.loading}>데이터를 불러오는 중입니다</div>
                            :
                        storageList?.map((data, index)=>(
                            <tr key={data.rackSn} onClick={()=>handleRackClick(data.rackSn)}>
                                <td>{(currentPage-1)*postsPerPage + index + 1}</td>
                                <td>{data.storageNm}</td>
                                <td>{data.rackNm}</td>
                                <td style={{color: handleRackStts(data.rackStts, data.hasBox, data.rackEnabled).color}}>
                                    {handleRackStts(data.rackStts, data.hasBox, data.rackEnabled).text}
                                </td>
                                <td>{data.rackEnabled === "Y" ? "활성화" : "비활성화"}</td>
                            </tr>
                        ))
                    }
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


            { isOpen && 
                <div className={styleModal.modalOverlay}>
                    <div className={`${styleProdModal.modal} ${styleStorage.storageModal}`}>
                        <div className={styleProdModal.modalInner} style={{alignItems: "stretch"}}>
                            <h3 className={styleStorage.rackHeading}>Rack : {detailRackNm}<span> (수량 : {boxCount}개) </span></h3>
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
                                        {
                                            rackDetailList?.boxes && rackDetailList.boxes.length > 0
                                            ? 
                                            rackDetailList?.boxes?.map((box, index) => {
                                            return (
                                                <tr key={box.boxQr}>
                                                    <td>{index + 1}</td>
                                                    <td>{box.boxQr}</td>
                                                    <td>{box.productNm}</td>
                                                    <td>{detailRackNm}</td>
                                                    <td>
                                                        <select name="newLoc" value={box.nextRackSn || ""} onChange={(e)=>handleChangeRackInfo(e, box.boxQr, box.rackSn)}>
                                                            <option value="">변경 안함</option>
                                                            {
                                                                rackDetailList.availableRacks?.map(rack=>(
                                                                    <option value={rack.availableRackSn}>{rack.availableRackNm}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </td>
                                                </tr>
                                            )})
                                            :
                                            (
                                                <tr className={styleStorage.emptyRack}>
                                                    <td colSpan={5}>해당 선반에 적재된 상자가 없습니다.</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <CommonButton variant="primary" type="submit" onClick={confirmModifyRack}>확인</CommonButton>
                        </div>
                        <button className={styleProdModal.closeBtn} onClick={onCloseModal}></button>
                    </div>
                </div>
            }        
            <Modal {...modal}/>
        </>
    )
}

export default StorageList;
