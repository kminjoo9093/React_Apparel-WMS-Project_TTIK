import styleStorage from "../../css/Storage.module.css";
import { useEffect, useState } from "react";
import serverUrl from "../../db/server.json";
import StorageUpdate from "./StorageUpdate";
import StorageAdd from "./StorageAdd";
import StorageDelete from "./StorageDelete";

function StorageModify({storageList, onUpdate}){

    const SERVER_URL = serverUrl.SERVER_URL;

    const modifyTypes = [{id: "update", type: "상태 수정"}, {id: "add", type: "추가"}, {id: "delete", type: "삭제"}];
    const [modifyType, setModifyType] = useState("update");

    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 정보 수정</h2>
            <div>
                <div className={styleStorage.contentWrap}>
                    <div className={styleStorage.contentType}>
                        {
                            modifyTypes.map(item => (
                                <button type="button"
                                        key={item.id} 
                                        className={`${styleStorage.typeBtn} ${modifyType === item.id ? styleStorage.active : ""}`} 
                                        onClick={()=>setModifyType(item.id)}>{item.type}</button>
                            ))
                        }
                    </div>

                    {modifyType === "update" && <StorageUpdate storageList={storageList} onUpdate={onUpdate}/>}
                    {modifyType === "add" && <StorageAdd storageList={storageList} onUpdate={onUpdate}/>}
                    {modifyType === "delete" && <StorageDelete storageList={storageList} onUpdate={onUpdate}/>}

                </div>
            </div>
        </>
    )
}

export default StorageModify;
