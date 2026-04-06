import styleStorage from "../../css/Storage.module.css";
import { useState } from "react";
import serverUrl from "../../db/server.json";
import StorageUpdateState from "./StorageUpdateState";
import StorageAdd from "./StorageAdd";
import StorageDelete from "./StorageDelete";
import { CommonButton } from "../../components/CommonButton";

function StorageModify({storageList, onUpdate, setView}){

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

                    {modifyType === "update" && <StorageUpdateState storageList={storageList} onUpdate={onUpdate} setView={setView}/>}
                    {modifyType === "add" && <StorageAdd storageList={storageList} onUpdate={onUpdate} setView={setView}/>}
                    {modifyType === "delete" && <StorageDelete storageList={storageList} onUpdate={onUpdate} setView={setView}/>}

                    <div className={styleStorage.btnSubmitWrap}>
                        <CommonButton variant="primary" type="submit">수정</CommonButton>
                    </div> 
                </div>
            </div>
        </>
    )
}

export default StorageModify;
