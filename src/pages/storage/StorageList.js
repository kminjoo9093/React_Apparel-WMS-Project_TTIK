import { useEffect, useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import styleProdModal from "../../css/ProductModal.module.css";
import styleModal from "../../css/Modal.module.css";
import serverUrl from "../../db/server.json";
import Pagination from '../Pagination';

function StorageList({storageList:storageOptions=[]}){

    const SERVER_URL = serverUrl.SERVER_URL;
    const [isOpen, setIsOpen] = useState(false);
    const [storageList, setStorageList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageFilter, setStorageFilter] = useState("");
    const [filteredList, setFilteredList] = useState([]);

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; // 한페이지에 10개씩
    const [totalPages, setTotalPages] = useState(null);

    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;

    const openDetailModal = () => {
        console.log("정보 확인");
        setIsOpen(true);
    }

    const onCloseModal = () => {
        setIsOpen(false);
    }

    useEffect(()=>{
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
        getStorageListData();
    }, [currentPage, storageFilter])

    const handleRackStts = (rackStts, hasBox, rackEnabled) => {
        
        if(rackEnabled === "N") return "비었음"; //사용불가

        if(rackStts === "Y"){ //선반 사용가능 상태
            return hasBox ? "사용중" : "비었음";
        } else {
            return "포화";
        }

        // return hasBox ? "포화" : "사용대기";
    }

    // 창고 필터
    // useEffect(()=>{
    //     if(!storageFilter && storageFilter === "") {
    //         setFilteredList(storageList);
    //         return;
    //     }

    //     const newList = storageList.filter(data => {
    //         return data.storageSn === Number(storageFilter);
    //     })
    //     setFilteredList(newList);
    // }, [storageFilter, storageList])


    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 조회</h2>
            <div className={styleStorage.listTopWrap}>
                <span className={styleStorage.notice}>클릭 시 적재된 박스 정보 확인과 위치 수정이 가능합니다.</span>
                <select name="storageFilter" 
                        value={storageFilter} 
                        className={styleStorage.listFilter}
                        onChange={(e)=>setStorageFilter(e.target.value)}>
                    <option value="">창고 선택</option>
                    {
                        storageOptions.map((item)=>(
                            <option value={item.storageSn}>{item.storageNm}</option>
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
                            <tr key={data.rackSn} onClick={openDetailModal}>
                                <td>{(currentPage-1)*postsPerPage + index + 1}</td>
                                <td>{data.storageNm}</td>
                                <td>{data.rackNm}</td>
                                <td>{handleRackStts(data.rackStts, data.hasBox, data.rackEnabled)}</td>
                                <td>{data.rackEnabled === "Y" ? "활성화" : "비활성화"}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <Pagination 
                // targetList={filteredList} 
                totalPages={totalPages}
                // postsPerPage={postsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                blockSize={5}
            />

            { isOpen && 
                <div className={styleModal.modalOverlay}>
                    <div className={`${styleProdModal.modal} ${styleStorage.storageModal}`} style={{height: "auto", maxWidth: "90rem"}}>
                        <div className={styleProdModal.modalInner} style={{alignItems: "stretch"}}>
                            <h3 className={styleStorage.rackHeading}>Rack : A1-1<span> (수량 : 2개) </span></h3>
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
                                    <tr onClick={openDetailModal}>
                                        <td>1</td>
                                        <td>12345678</td>
                                        <td>조거팬츠</td>
                                        <td>A1-1</td>
                                        <td>
                                            <select name="newLoc">
                                                <option value="">변경 안함</option>
                                                <option value="">A1-2</option>
                                                <option value="">A1-3</option>
                                                <option value="">A2-3</option>
                                                <option value="">B1-1</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>12121212</td>
                                        <td>빅 로고 롱 슬리브</td>
                                        <td>A1-1</td>
                                        <td>
                                            <select name="newLoc">
                                                <option value="">변경 안함</option>
                                                <option value="">A1-2</option>
                                                <option value="">A1-3</option>
                                                <option value="">A2-3</option>
                                                <option value="">B1-1</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button type="submit" className="btnSubmit">확인</button>
                        </div>
                        <button className={styleProdModal.closeBtn} onClick={onCloseModal}></button>
                    </div>
                </div>
            }        
            {/* <StorageModal /> */}
        </>
    )
}

export default StorageList;
