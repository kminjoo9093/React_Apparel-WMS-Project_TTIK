import { style } from "framer-motion/client";
import { useState } from "react";
import styleStorage from "../../css/Storage.module.css";

function StorageRegister(){

    const [zoneList, setZoneList] = useState([{zone: "", rack: ""}]);

    const handleAddBtn = () => {
        setZoneList(prev => [...prev, {zone: "", rack: ""}]);
    }

    const handleRemoveBtn = (indexToRemove) => {
        setZoneList(prev => prev.filter((item, index) => index != indexToRemove));
    }

    return (
        <>
            <h2 className={styleStorage.contentTitle}>창고 등록</h2>
            <form>
                <div className={`${styleStorage.contentRow}`} style={{gap:"2rem"}}>
                    <h3 className={styleStorage.modifyHeading}>창고</h3>
                    <input type="text" name="storage" placeholder="창고 이름을 입력하세요 예) A"/>
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
                                            placeholder="1"
                                    ></input>
                                </div>
                                <div>
                                    <h3 className={styleStorage.modifyHeading}>선반</h3>
                                    <input type="text" 
                                            value={item.rack} 
                                            placeholder="선반 별 층수 입력"
                                    ></input>
                                </div>
                                {index > 0 && (
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
