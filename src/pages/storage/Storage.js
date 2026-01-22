import styleMainDashBoard from '../../css/MainDashboard.module.css';
import styleStorage from "../../css/Storage.module.css";
import { useState } from 'react';
import StorageModify from './StorageModify';
import StorageList from './StorageList';
import StorageRegister from './StorageRegister';
import styleList from "../../css/ProductList.module.css";

function Storage(){

    const [view, setView] = useState("list");

    return (
        <div className={styleStorage.storage}>
             <div className={styleMainDashBoard.welcomeSection}>
                <h1>Storage</h1>
                <p>창고 관리</p>
            </div>
            <div className={styleStorage.contentArea}>
                <div className={styleStorage.menuArea}>
                    <div className={`${styleStorage.menuBox} ${styleList.filterCard}`}>
                        <ul className={styleStorage.menuList}>
                            <li onClick={()=>setView("list")} 
                                className={`${view === "list" ? styleStorage.selected : ""} ${styleStorage.menu} ${styleStorage.menuList}`}
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
                    {view === "register" && <StorageRegister />}
                    {view === "modify" && <StorageModify />}
                    {view === "list" && <StorageList />}
                </div>
            </div>
        </div>
    )
}

export default Storage;