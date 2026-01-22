import styleStorage from "../../css/Storage.module.css";
import { useState } from "react";

function StorageModify(){

    const [selectedStorage, setSelectedStorage] = useState("");

    const handleSelectStorage = (e) => {
        setSelectedStorage(e.target.value);
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
                            >A</label>
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
                            >B</label>
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
                </div>

                <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
                    <h3 className={styleStorage.modifyHeading}>구역</h3>
                    <select name="zone" className={styleStorage.modifyZoneSelect}>
                        <option value="1">A1</option>
                        <option value="2">A2</option>
                        <option value="3">A3</option>
                    </select>
                </div>

                <div className={`${styleStorage.contentRow} ${styleStorage.row2}`}>
                    <h3 className={styleStorage.modifyHeading}>선반</h3>
                    <div className={styleStorage.rackStatusWrap}>
                        <select name="rack">
                            <option value="1">A1-1</option>
                            <option value="1">A1-2</option>
                        </select>
                        <select name="rackStatus">
                            <option value="1">활성화</option>
                            <option value="2">비활성화</option>
                        </select>
                    </div>
                    {/* <div className={styleStorage.rackStatusWrap}>
                        <label htmlFor="rackStatus2">A1-2</label>
                        <select name="rackStatus" id="rackStatus1">
                            <option value="1">활성화</option>
                            <option value="2">비활성화</option>
                        </select>
                    </div>
                    <div className={styleStorage.rackStatusWrap}>
                        <label htmlFor="rackStatus3">A1-3</label>
                        <select name="rackStatus" id="rackStatus1">
                            <option value="1">활성화</option>
                            <option value="2">비활성화</option>
                        </select>
                    </div> */}
                </div>
                <div className={styleStorage.btnSubmitWrap}>
                    <button type="submit" className={`${styleStorage.btnModify} btnSubmit`}>수정</button>
                </div>
            </form>
        </>
    )
}

export default StorageModify;
