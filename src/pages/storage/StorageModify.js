import styleStorage from "../../css/Storage.module.css";
import { useEffect, useState } from "react";
import serverUrl from "../../db/server.json";

function StorageModify({storageList}){

    const SERVER_URL = serverUrl.SERVER_URL;
    const [selectedStorage, setSelectedStorage] = useState(null); //창고 일련번호
    const [selectedZone, setSelectedZone] = useState(null); //구역 일련번호
    const [selectedRack, setSelectedRack] = useState(null); //선반 일련번호
    const [isCheckedDelete, setIsCheckedDelete] = useState({
        deleteStorage: false, //창고 삭제
        deleteZone: false,  //구역 삭제
        deleteRack: false //선반 삭제
    })
    const [rackEnabled, setRackEnabled] = useState(""); //선반 활성(Y)/비활성(N)
    const [rackCapacity, setRackCapacity] = useState(""); //선반 여유(Y)/포화(N)
    const [isCheckedAdd, setIsCheckedAdd] = useState(false);
    const [newZone, setNewZone] = useState(null); // 추가 구역
    const [newRackCount, setNewRackCount] = useState(null) //추가 선반 개수

    const [isCheckedDisableZone, setIsCheckedDisableZone] = useState(false);

    const modifyTypes = ["추가", "수정", "삭제"];
    const [modifyType, setModifyType] = useState("추가");
    

    // 데이터
    // const [storageList, setStorageList] = useState([]); //창고
    const [zoneOptions, setZoneOptions] = useState([]); //구역
    const [rackOptions, setRackOptions] = useState([]); //선반

    const handleSelectStorage = (e) => {
        setSelectedStorage(Number(e.target.value));
    }

    const handleCheckChange = (e) => {
        const {name, checked} = e.target;
    
        setIsCheckedDelete(prev => ({
            ...prev,
            [name]: checked
        }));

        //창고 삭제 선택 -> 구역, 선반, 구역추가 선택상태 초기화
        if(name === "deleteStorage" && checked){
            setSelectedZone(null);
            setSelectedRack(null);
            setIsCheckedAdd(false); 
        }

        //구역 삭제 선택 -> 선반 선택상태 초기화
        if(name === "deleteZone" && checked){
            setSelectedRack(null);
        }
    }

    // 선택한 창고 별 구역 옵션 리스트
    useEffect(()=>{
        if(!selectedStorage) return;

        const getZoneData = async () => {
            try{
                const res = await fetch(`${SERVER_URL}/ttik/storage/zones?storageSn=${selectedStorage}`, {
                    method: 'GET',
                    credentials: 'include', 
                })

                if(res.ok){
                    const zoneData = await res.json();
                    console.log(getZoneData);

                    setZoneOptions(zoneData);
                }
            } catch(error){
                console.log(error);
                return [];
            }
            
        }
        getZoneData();
    }, [selectedStorage])

    // 선택한 구역 별 선반 옵션 리스트
    useEffect(()=>{
        if(!selectedZone) return;

        const getRackData = async () => {
            try{
                const res = await fetch(`${SERVER_URL}/ttik/storage/racks?zoneSn=${selectedZone}`, {
                    method: 'GET',
                    credentials: 'include', 
                })

                if(res.ok){
                    const rackData = await res.json();
                    console.log(rackData);

                    setRackOptions(rackData);
                }
            } catch(error){
                console.log(error);
                return [];
            }
            
        }
        getRackData();
    }, [selectedZone])

    //창고 정보 수정 파라미터
    const storageModifyReq = {
        "storageSn" : selectedStorage,
        "deleteStorage" : isCheckedDelete.deleteStorage,
        "zoneUpdate" : {
            "zoneSn" : selectedZone,
            "deleteZone": isCheckedDelete.deleteZone,
            "newZone": newZone, //구역 번호
            "newRackCount": newRackCount
        },
        "rackUpdate" : {
            "rackSn" : selectedRack,
            "rackEnabled": rackEnabled,
            "rackCapacity": rackCapacity
        }
    }

    const resetForm = ()=>{
        // 1. 선택 데이터 초기화
        setSelectedStorage(null);
        setSelectedZone(null);
        setSelectedRack(null);
        
        // 2. 체크박스 및 입력 필드 초기화
        setIsCheckedDelete({
            deleteStorage: false,
            deleteZone: false
        });
        setRackEnabled("");
        setRackCapacity("");
        setIsCheckedAdd(false);
        setNewZone(null);
        setNewRackCount(null);

        // 3. 옵션 리스트 비우기 (창고/구역 선택이 풀렸으므로)
        setZoneOptions([]);
        setRackOptions([]);
    }

    // 창고 정보 수정 서버 요청
    const handelSubmit = async (e) => {

        e.preventDefault();

        // 구역 추가 시 기존에 존재하는 구역인지 확인
        const hasZone = zoneOptions.some((zone)=>(
            zone.zoneNm.slice(1) === newZone
        ))
        if(hasZone){
            alert("이미 등록된 구역입니다.");
            return;
        }

        // 선반을 선택했는데 상태값 중 하나라도 선택 안 된 경우
        if (selectedRack && (!rackEnabled || !rackCapacity)) {
            alert("선반의 가용 여부와 적재 상태를 모두 선택해주세요.");
            return;
        }

        // 수정 버튼 누르고 alert 확인 메시지 출력
        // 삭제일 경우 삭제 확인
        // 구역 추가일 경우
        // ?선반을 ?로 수정
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
                console.log("수정 요청 응답-->", data);
                resetForm();
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
            <h2 className={styleStorage.contentTitle}>창고 정보 수정</h2>
            <form onSubmit={handelSubmit}>
                <div className={styleStorage.contentWrap}>
                    <div className={styleStorage.contentType}>
                        {
                            modifyTypes.map((type, index) => (
                                <button type="button"
                                        key={index} 
                                        className={`${styleStorage.typeBtn} ${modifyType === type ? styleStorage.active : ""}`} 
                                        onClick={()=>setModifyType(type)}>{type}</button>
                            ))
                        }
                    </div>

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
                        <label className={styleStorage.checkDelete} htmlFor="deleteStorage">
                            <input type="checkbox" 
                                    name="deleteStorage"
                                    checked={isCheckedDelete.deleteStorage}
                                    onChange={handleCheckChange} 
                                    id="deleteStorage"/>삭제
                        </label>
                    </div>

                    { !isCheckedDelete.deleteStorage && (
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
                                <label className={styleStorage.checkDelete} htmlFor="deleteZone">
                                    <input type="checkbox" 
                                            name="deleteZone" 
                                            checked={isCheckedDelete.deleteZone}
                                            onChange={handleCheckChange} 
                                            id="deleteZone"/>삭제
                                </label>
                                
                                <label htmlFor="disableZone" className={`${styleStorage.disableButton} ${isCheckedDisableZone ? styleStorage.disable : ""}`}>
                                    <div className={styleStorage.disableText}>
                                        비활성화
                                    </div>
                                    <input type="checkbox" 
                                            name="disableZone" 
                                            checked={isCheckedDisableZone}
                                            onChange={()=>setIsCheckedDisableZone(prev=>!prev)} 
                                            id="disableZone"/>
                                </label>
                            </div>
                            {
                                !isCheckedDelete.deleteZone &&
                                    <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
                                        <h3 className={styleStorage.modifyHeading}>선반</h3>
                                        <div className={styleStorage.rackArea}>
                                            <div className={styleStorage.rackSelectWrap}>
                                                <select name="rack" value={selectedRack} onChange={(e)=>setSelectedRack(Number(e.target.value))}>
                                                    <option value="">선반 선택</option>
                                                    {
                                                        rackOptions.map((item) => (
                                                            <option key={item.rackSn} value={item.rackSn}>{item.rackNm}</option>
                                                        ))
                                                    }
                                                </select>
                                                <label className={styleStorage.checkDelete} htmlFor="deleteRack">
                                                    <input type="checkbox" 
                                                            name="deleteRack" 
                                                            checked={isCheckedDelete.deleteRack}
                                                            onChange={handleCheckChange} 
                                                            id="deleteRack"/>삭제
                                                </label>
                                            </div>
                                            <div className={styleStorage.statusSelectWrap}>
                                                {/* <div > */}
                                                    <select name="rackCapacity" value={rackCapacity} onChange={(e)=>setRackCapacity(e.target.value)}>
                                                        <option value="">적재 상태</option>
                                                        <option value="Y">여유</option>
                                                        <option value="N">포화</option>
                                                    </select>
                                                {/* </div> */}
                                                {/* <div className={styleStorage.statusSelectWrap}> */}
                                                    <select name="rackEnabled" value={rackEnabled} onChange={(e)=>setRackEnabled(e.target.value)}>
                                                        <option value="">가용 여부</option>
                                                        <option value="Y">활성화</option>
                                                        <option value="N">비활성화</option>
                                                    </select>
                                                {/* </div> */}
                                            </div>
                                        </div>
                                    </div>
                            }
                            

                            <div className={`${styleStorage.contentRow} ${styleStorage.row4}`}>
                                <label className={styleStorage.addZone} htmlFor="addZone">
                                    <input type="checkbox" id="addZone" checked={isCheckedAdd} onChange={()=>setIsCheckedAdd(prev => !prev)}/>구역 추가
                                </label>
                                {
                                    isCheckedAdd && (
                                        <div className={styleStorage.addContents}>
                                            <div className={styleStorage.addItem}>
                                                <h3 className={styleStorage.modifyHeading}>구역</h3>
                                                <input type="number" 
                                                    name="newZone"
                                                    value={newZone} 
                                                    required
                                                    placeholder="구역 번호 입력"
                                                    onChange={(e)=>setNewZone(e.target.value)}
                                                ></input>
                                            </div>
                                            <div className={styleStorage.addItem}>
                                                <h3 className={styleStorage.modifyHeading}>선반</h3>
                                                <div style={{position:"relative"}}>
                                                    <input type="number" 
                                                            name="newRackCount"
                                                            value={newRackCount}
                                                            required
                                                            placeholder="선반 별 층수 입력"
                                                            onChange={(e)=>setNewRackCount(e.target.value)}
                                                    ></input>
                                                </div>
                                            </div>
                                        </div>
                                    )

                                }
                                
                            </div>
                        </div>
                        
                    )}

                    <div className={styleStorage.btnSubmitWrap}>
                        <button type="submit" className={`${styleStorage.btnModify} btnSubmit`}>수정</button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default StorageModify;
