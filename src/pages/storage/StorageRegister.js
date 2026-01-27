import { style } from "framer-motion/client";
import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";
import styleRegister from "../../css/ProductRegister.module.css";
import serverUrl from "../../db/server.json";

function StorageRegister({storageList, onUpdate}){

    const SERVER_URL = serverUrl.SERVER_URL;
    const [storageNm, setStorageNm] = useState("");
    const [zoneList, setZoneList] = useState([{zone: 1, rack: ""}]);

    const handleAddBtn = () => {
        setZoneList(prev => {
            const nextZone = prev.length + 1;
            return [...prev, {zone: nextZone, rack: ""}];
        });
    }

    const handleRemoveBtn = (indexToRemove) => {
        setZoneList(prev => prev.filter((item, index) => index !== indexToRemove));
    }

    // 숫자 입력 유효성 검사 - 선반 층수
    const [error, setError] = useState(false); //선반 층수
    const [errorMsg, setErrorMsg] = useState("");

    const validateNumber = (e, index) => {        
        const value = e.target.value; //객체 구조분해
        const isInvalid = Number(value) < 0; //음수면 true

        if(!isInvalid){ //양수일 경우
            const newValue = e.target.value;
            setZoneList(prev => 
                prev.map((obj, i) => i === index ? {...obj, rack: newValue} : obj)
            );
        }

        setError(isInvalid);

        setErrorMsg(prev => isInvalid ? "0 이상의 숫자를 입력하세요." : "");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let value = storageNm;

        console.log(value);
        if(!value) {
            alert("창고명을 입력해주세요");    
            return;
        };

        //창고명에 동이 포함된 경우 파싱
        if(value.includes("동")){
            console.log("파싱");
           value = value.split("동").join("");
        }

        //알파벳이 맞는지 확인, 자릿수 확인
        const isAlphabet = (value) => value >= "A" && value <= "Z";

        if(value.length > 1 || !isAlphabet){
            alert("창고명을 다시 입력하세요.");
        } 

        //창고명 존재 여부 검사
        const hasStorage = storageList.some(storage => (
            storage.storageNm === storageNm
        ));
        if(hasStorage) {
            alert("이미 등록된 창고입니다.");
            return;
        }

        //서버에 등록 요청
        const submitData = {
            "storageNm" : storageNm,
            "zones" : zoneList.map(item => ({
                "zoneNo": item.zone,
                "rackCount": item.rack
            }))
        }

        console.log(submitData);

        try{
            const res = await fetch(`${SERVER_URL}/ttik/storage/register`, {
                method: 'POST',
                credentials: 'include', 
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify(submitData)
            })
            if(res.ok){
                alert("등록이 완료되었습니다.");
                setStorageNm("");
                setZoneList([{zone: 1, rack: ""}]);

                const data = await res.json();
                console.log(data);
            }
            
        } catch(error){
            console.log(error);
        }

    }





    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 등록</h2>
            <form onSubmit={handleSubmit}>
                <div className={`${styleStorage.contentRow}`} style={{gap:"2rem", alignItems:"flex-start"}}>
                    <h3 className={styleStorage.modifyHeading}>창고</h3>
                    <div className={styleStorage.storageNameWrap}>
                        <input type="text" 
                                name="storage" 
                                placeholder="창고 이름을 입력하세요"
                                className={styleStorage.storageName}
                                required
                                value={storageNm}
                                onChange={(e)=>{
                                    setStorageNm(e.target.value.toUpperCase());
                                }}
                                /> 동
                        <span className={styleStorage.storageGuide}>
                            * 창고 이름은 A부터 Z까지의 알파벳으로 입력하세요.<br/>
                            예시 ) A
                        </span>
                    </div>
                </div>

                <div className={`${styleStorage.registerRow} ${styleStorage.contentRow}`}>
                    {
                        zoneList.map((item, index) => (
                            <div key={index} className={styleStorage.zoneRackBox}>
                                <div>
                                    <h3 className={styleStorage.modifyHeading}>구역</h3>
                                    <input type="text" 
                                            value={item.zone} 
                                            readOnly 
                                            required
                                    ></input>
                                </div>
                                <div>
                                    <h3 className={styleStorage.modifyHeading}>선반</h3>
                                    <div style={{position:"relative"}}>
                                        <input type="number" 
                                                name="rack"
                                                value={item.rack} 
                                                required
                                                onChange={(e) => {
                                                    
                                                    validateNumber(e, index);
                                                }}
                                                placeholder="선반 별 층수 입력"
                                                ></input>
                                        <p className={`${styleRegister.errorMsg} ${styleStorage.errorMsg}`} 
                                            style={{ visibility: error ? "visible" : "hidden"}}
                                            >{errorMsg}</p>
                                    </div>
                                </div>
                                {(index > 0 && index === zoneList.length - 1) && (
                                    <button 
                                        type="button" 
                                        className={styleStorage.btnRemove} 
                                        onClick={() => handleRemoveBtn(index)}
                                    >
                                    </button>
                                )}
                            </div>
                        ))
                    }
                    
                    <button type="button" className={styleStorage.btnPlus} onClick={handleAddBtn}></button>
                </div>
                <div className={styleStorage.btnSubmitWrap}>
                    <button type="submit" className={`${styleStorage.btnRegister} btnSubmit`}>등록</button>
                </div>
            </form>
        </>
    )
}

export default StorageRegister;
