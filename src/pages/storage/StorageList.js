import styleStorage from "../../css/Storage.module.css";

function StorageList(){
    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 조회</h2>
            <table>
                <thead>
                    <tr>
                        <th>창고명</th>
                        <th>선반 위치</th>
                        <th>재고 유무</th>
                        <th>가용 상태</th>
                        <th>정보</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>A</td>
                        <td>A1-1</td>
                        <td>사용중</td>
                        <td>활성화</td>
                        <td>상세보기</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default StorageList;
