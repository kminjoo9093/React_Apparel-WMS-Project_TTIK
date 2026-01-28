import styleMainDashBoard from '../../css/MainDashboard.module.css';
import styleStorage from "../../css/Storage.module.css";
import { useState, useEffect } from 'react';
import StorageModify from './StorageModify';
import StorageList from './StorageList';
import StorageRegister from './StorageRegister';
import styleList from "../../css/ProductList.module.css";
import serverUrl from "../../db/server.json";

function Storage(){

    const SERVER_URL = serverUrl.SERVER_URL;
    const [view, setView] = useState("list");
    const [storageList, setStorageList] = useState([]);

    //현재 존재하는 창고 리스트
    const getStorageData = async () => {
        try{
            const res = await fetch(`${SERVER_URL}/ttik/storage/allStorages`, {
                method: 'GET',
                credentials: 'include', 
            })

            if(res.ok){
                const storageData = await res.json();
                console.log(storageData);

                setStorageList(storageData);
            }
        } catch(error){
            console.log(error);
            return [];
        }
        
    }

    useEffect(()=>{
        getStorageData();
    }, [])

    return (
        <div className={styleStorage.storage}>
             <div className={styleMainDashBoard.welcomeSection}>
                <h1>Storage</h1>
                <p>창고 정보를 조회하고 관리하세요.</p>
            </div>
            <div className={styleStorage.contentArea}>
                <div className={styleStorage.contentWidth}>
                    <div className={styleStorage.menuArea}>
                        <div className={`${styleStorage.menuBox} ${styleList.filterCard}`}>
                            <ul className={styleStorage.menuList}>
                                <li onClick={()=>setView("list")} 
                                    className={`${view === "list" ? styleStorage.selected : ""} ${styleStorage.menu} ${styleStorage.menuViewList}`}
                                >창고 조회</li>
                                <li onClick={()=>setView("register")} 
                                    className={`${view === "register" ? styleStorage.selected : ""} ${styleStorage.menu} ${styleStorage.menuRegister}`}
                                >창고 등록</li>
                                <li onClick={()=>setView("modify")} 
                                    className={`${view === "modify" ? styleStorage.selected : ""} ${styleStorage.menu} ${styleStorage.menuModify}`}
                                >창고 정보 수정</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styleStorage.mainContentWrap}>
                        {view === "register" && <StorageRegister storageList={storageList} onUpdate={getStorageData}/>}
                        {view === "modify" && <StorageModify storageList={storageList} onUpdate={getStorageData}/>}
                        {view === "list" && <StorageList storageList={storageList} onUpdate={getStorageData}/>}
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default Storage;