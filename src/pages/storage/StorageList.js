import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import styleProdModal from "../../css/ProductModal.module.css";
import styleModal from "../../css/Modal.module.css";

function StorageList(){

    const [isOpen, setIsOpen] = useState(false);

    const openDetailModal = () => {
        console.log("정보 확인");
        setIsOpen(true);
    }

    const onCloseModal = () => {
        setIsOpen(false);
    }

    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 조회</h2>
            <span className={styleStorage.notice}>클릭 시 적재된 박스 정보 확인과 위치 수정이 가능합니다.</span>
            <table className={styleStorage.storageTable}>
                <thead>
                    <tr>
                        <th>창고명</th>
                        <th>선반 위치</th>
                        <th>재고 유무</th>
                        <th>가용 상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr onClick={openDetailModal}>
                        <td>A</td>
                        <td>A1-1</td>
                        <td>사용중</td>
                        <td>활성화</td>
                    </tr>
                    <tr>
                        <td>A</td>
                        <td>A1-2</td>
                        <td>비었음</td>
                        <td>활성화</td>
                    </tr>
                    <tr>
                        <td>A</td>
                        <td>A1-3</td>
                        <td>포화</td>
                        <td>활성화</td>
                    </tr>
                </tbody>
            </table>

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
