import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import serverUrl from "../../db/server.json";
import useStorageData from "../../hooks/useStorageData";

function StorageUpdate ({storageList, onUpdate}) {

    const SERVER_URL = serverUrl.SERVER_URL;
    const [selectedStorage, setSelectedStorage] = useState(1); //창고 일련번호
    const [selectedZone, setSelectedZone] = useState(""); //구역 일련번호
    const [selectedRack, setSelectedRack] = useState(""); //선반 일련번호

    // const [rackEnabled, setRackEnabled] = useState(""); //선반 활성(Y)/비활성(N)
    const [rackCapacity, setRackCapacity] = useState(""); //선반 여유(Y)/포화(N)
    const [disableValues, setDisableValues] = useState({
        disabledZone: false,
        disabledRack: false
    })
    // const [isDisabledZone, setIsDisabledZone] = useState(false);
    // const [isDisabledRack, setIsDisabledRack] = useState(false);


    const handleSelectStorage = (e) => {
        setSelectedStorage(Number(e.target.value));
    }


    // 선택한 창고 별 구역 옵션 리스트
    // 선택한 구역 별 선반 옵션 리스트
    const {zoneOptions, rackOptions} = useStorageData(SERVER_URL, selectedStorage, selectedZone);

    //창고 정보 수정 파라미터
    const storageModifyReq = {
        "storageSn" : selectedStorage,
        "zoneSn" : selectedZone,
        "isDisabledZone" : disableValues.disabledZone, //boolean
        "rackSn" : selectedRack,
        "rackEnabled": disableValues.disabledRack, //boolean
        "rackCapacity": rackCapacity
    }

    const handleDisabledChange = (e) => {

        const {name, checked} = e.target;

        if(name === "disabledZone" && !selectedZone){
            alert("구역을 먼저 선택해주세요.");
            return;
        }

        if(name === "disabledRack" && !selectedRack){
            alert("선반을 먼저 선택해주세요.");
            return;
        }

        setDisableValues(prev => ({
            ...prev,
            [name] : checked
        }))

        //구역 비활성화 -> 선반 관련 상태 초기화
        if(name === "disabledZone" && checked){ 
            setSelectedRack("");
            setRackCapacity("");
        }

        //선반 비활성화 -> 선반 재고 상태 초기화
        if(name === "disabledRack" && checked){ 
            setRackCapacity("");
        }
    }

    const resetForm = ()=>{
        // 1. 선택 데이터 초기화
        setSelectedStorage(1);
        setSelectedZone("");
        setSelectedRack("");
        
        // 2. 입력 필드 초기화
        // isDisabledRack("");
        setRackCapacity("");
        // setIsDisabledZone(false);
    }

    // 창고 정보 수정 서버 요청
    const handelSubmit = async (e) => {

        e.preventDefault();

        // 구역 추가 시 기존에 존재하는 구역인지 확인
        // const hasZone = zoneOptions.some((zone)=>(
        //     zone.zoneNm.slice(1) === newZone
        // ))
        // if(hasZone){
        //     alert("이미 등록된 구역입니다.");
        //     return;
        // }


        //구역 비활성화 선택한 경우 선반 정보 리셋
        // if(disableValues.disabledZone){
        //     setRackCapacity("");
        //     isDisabledRack("");
        //     setSelectedRack("");
        // }


        // 구역은 선택했는데 '구역 비활성화','선반' 모두 선택 안 한 경우
        if (selectedZone && !disableValues.disabledZone && !selectedRack) {
            alert("수정할 선반을 선택하거나 구역 비활성화를 선택해주세요.");
            return;
        }

        // 선반은 선택했는데 '선반 비활성화', '적재 상태' 모두 선택 안 한 경우
        if (selectedRack && !disableValues.disabledRack && !rackCapacity) {
            alert("선반의 적재 상태를 선택하거나 선반 비활성화를 선택해주세요.");
            return;
        }

        alert("수정을 진행하시겠습니까?");

        try{
            const res = await fetch(`${SERVER_URL}/ttik/storage/modify`, {
                method: 'PUT',
                credentials: 'include', 
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify(storageModifyReq)
            });
            if(res.ok){
                const data = await res.json();
                // console.log("수정 요청 응답-->", data);
                alert(data.message);

                resetForm();
                if(onUpdate) onUpdate();
            } else {
                console.log("수정 요청 실패-->", res.status);
                const errorData = await res.json();
                alert(errorData.message);
            }
        } catch(error){
            console.log("수정 요청 실패", error);
        } 
    }

    return (
        <>
            <form className={styleStorage.updateForm} onSubmit={handelSubmit}>
                <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
                    <h3 className={styleStorage.modifyHeading}>창고</h3>
                    <div className={styleStorage.storageBtnWrap}>
                        {
                            storageList.map((item) => (
                                <div key={item.storageSn}>
                                    <label htmlFor={`storage${item.storageNm}`} 
                                            className={`${styleStorage.btnStorage} ${selectedStorage === item.storageSn ? styleStorage.selected : ""}`}
                                    >{item.storageNm}동</label>
                                        <input type="radio"
                                                name="storage"
                                                value={item.storageSn} 
                                                checked={selectedStorage === item.storageSn}
                                                id={`storage${item.storageNm}`} 
                                                className={styleStorage.modifyRadio}
                                                onChange={handleSelectStorage}
                                        />
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div>
                    <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
                        <h3 className={styleStorage.modifyHeading}>구역</h3>
                        <select name="zone" value={selectedZone} className={styleStorage.modifyZoneSelect} onChange={(e)=>setSelectedZone(Number(e.target.value))}>
                            <option value="">구역 선택</option>
                            {
                                zoneOptions.map((item) => (
                                    <option key={item.zoneSn} value={item.zoneSn}>{item.zoneNm.slice(1)}({item.zoneNm})</option>
                                ))
                            }
                        </select>
                        
                        <label htmlFor="disabledZone" 
                                className={`${styleStorage.disableButton} 
                                            ${disableValues.disabledZone ? styleStorage.disable : ""}`}>
                            <div className={styleStorage.disableText}>
                                비활성화
                            </div>
                            <input type="checkbox" 
                                    name="disabledZone" 
                                    checked={disableValues.disabledZone}
                                    onChange={handleDisabledChange} 
                                    id="disabledZone"/>
                        </label>
                    </div>
                    <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
                        <h3 className={styleStorage.modifyHeading}>선반</h3>
                        <div className={styleStorage.rackArea}>
                            <div className={styleStorage.rackSelectWrap}>
                                <select name="rack" 
                                        value={selectedRack || ""} 
                                        disabled={disableValues.disabledZone}
                                        onChange={(e)=>setSelectedRack(Number(e.target.value))}>
                                    <option value="">선반 선택</option>
                                    {
                                        rackOptions.map((item) => (
                                            <option key={item.rackSn} value={item.rackSn}>{item.rackNm}</option>
                                        ))
                                    }
                                </select>

                                <label htmlFor="disabledRack" 
                                        className={`${styleStorage.disableButton} 
                                                    ${disableValues.disabledRack ? styleStorage.disable : ""}`}>
                                    <div className={styleStorage.disableText}>
                                        비활성화
                                    </div>
                                    <input type="checkbox" 
                                        name="disabledRack"
                                        checked={disableValues.disabledRack}
                                        onChange={handleDisabledChange} 
                                        id="disabledRack"/>
                                </label>
                            </div>
                            <div className={styleStorage.statusSelectWrap}>
                                <select name="rackCapacity" 
                                        value={rackCapacity || ""} 
                                        disabled={disableValues.disabledZone || disableValues.disabledRack}
                                        onChange={(e)=>setRackCapacity(e.target.value)}>
                                    <option value="">적재 상태</option>
                                    <option value="Y">여유</option>
                                    <option value="N">포화</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                    
                <div className={styleStorage.btnSubmitWrap}>
                    <button type="submit" className={`${styleStorage.btnModify} btnSubmit`}>수정</button>
                </div>
            </form>
        </>
    )
}

export default StorageUpdate;