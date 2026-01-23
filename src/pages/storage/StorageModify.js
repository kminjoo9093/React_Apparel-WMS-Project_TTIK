import styleStorage from "../../css/Storage.module.css";
import { useState } from "react";

function StorageModify(){

    const [selectedStorage, setSelectedStorage] = useState("");
    const [isCheckedDelete, setIsCheckedDelete] = useState({
        deleteStorage: false,
        deleteZone: false
    })
    const [isCheckedAdd, setIsCheckedAdd] = useState(false);

    const handleSelectStorage = (e) => {
        setSelectedStorage(e.target.value);
    }

    const handleCheckChange = (e) => {
        const {name, checked} = e.target;
    
        setIsCheckedDelete(prev => ({
            ...prev,
            [name]: checked
        }));
    }

    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 정보 수정</h2>
            <form>
                <div className={`${styleStorage.contentRow} ${styleStorage.row1}`}>
                    <h3 className={styleStorage.modifyHeading}>창고</h3>
                    <div className={styleStorage.storageBtnWrap}>
                        <div>
                            <label htmlFor="storageA" 
                                    className={`${styleStorage.btnStorage} ${selectedStorage === "A" ? styleStorage.selected : ""}`}
                            >A동</label>
                                <input type="radio"
                                        name="storage"
                                        value="A"
                                        checked={selectedStorage === 'A'}
                                        id="storageA"
                                        className={styleStorage.modifyRadio}
                                        onChange={handleSelectStorage}
                                />
                        </div>
                        <div>
                            <label htmlFor="storageB" 
                                    className={`${styleStorage.btnStorage} ${selectedStorage === "B" ? styleStorage.selected : ""}`}
                            >B동</label>
                                <input type="radio"
                                        name="storage"
                                        value="B"
                                        checked={selectedStorage === 'B'}
                                        id="storageB"
                                        className={styleStorage.modifyRadio}
                                        onChange={handleSelectStorage}
                                />
                        </div>
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
                            <select name="zone" className={styleStorage.modifyZoneSelect}>
                                <option value="">구역 선택</option>
                                <option value="1">A1</option>
                                <option value="2">A2</option>
                                <option value="3">A3</option>
                            </select>
                            <label className={styleStorage.checkDelete} htmlFor="deleteZone">
                                <input type="checkbox" 
                                        name="deleteZone" 
                                        checked={isCheckedDelete.deleteZone}
                                        onChange={handleCheckChange} 
                                        id="deleteZone"/>삭제
                            </label>
                        </div>
                        {
                            !isCheckedDelete.deleteZone &&
                                <div className={`${styleStorage.contentRow} ${styleStorage.row3}`}>
                                    <h3 className={styleStorage.modifyHeading}>선반</h3>
                                    <div className={styleStorage.rackStatusWrap}>
                                        <select name="rack">
                                            <option value="">선반 선택</option>
                                            <option value="1">A1-1</option>
                                            <option value="1">A1-2</option>
                                        </select>
                                        <div className={styleStorage.statusSelectWrap}>
                                            <select name="rackStatusActive">
                                                <option value="">가용 여부</option>
                                                <option value="1">활성화</option>
                                                <option value="2">비활성화</option>
                                            </select>
                                        </div>
                                        <div className={styleStorage.statusSelectWrap}>
                                            <select name="rackStatusFull">
                                                <option value="">적재 상태</option>
                                                <option value="1">여유</option>
                                                <option value="2">포화</option>
                                            </select>
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
                                    <div style={{display:"flex", justifyContent:"space-between", width:"100%"}}>
                                        <div className={styleStorage.addContents}>
                                            <h3 className={styleStorage.modifyHeading}>구역</h3>
                                            <input type="number" 
                                                value="" 
                                                required
                                                placeholder="구역 번호 입력"
                                            ></input>
                                        </div>
                                        <div className={styleStorage.addContents}>
                                            <h3 className={styleStorage.modifyHeading}>선반</h3>
                                            <div style={{position:"relative"}}>
                                                <input type="number" 
                                                        name="rack"
                                                        value="" 
                                                        required
                                                        placeholder="선반 별 층수 입력"
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
            </form>
        </>
    )
}

export default StorageModify;
