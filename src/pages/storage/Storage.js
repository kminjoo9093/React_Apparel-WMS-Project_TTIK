import styleStorage from "../../css/Storage.module.css";
import { useState, useEffect } from 'react';
import StorageModify from './StorageModify';
import StorageList from './StorageList';
import StorageRegister from './StorageRegister';
import styleList from "../../css/ProductList.module.css";
import serverUrl from "../../db/server.json";
import PageInfo from '../../components/PageInfo';

function Storage(){

    const SERVER_URL = serverUrl.SERVER_URL;
    const [view, setView] = useState("list");
    const [storageList, setStorageList] = useState([]);

    const storageMenuConfig = [
        {
            id : "list",
            text : "창고 조회",
            className : styleStorage.menuViewList
        },
        {
            id : "register",
            text : "창고 등록",
            className : styleStorage.menuRegister
        },
        {
            id : "modify",
            text : "창고 정보 수정",
            className : styleStorage.menuModify
        }
    ]                          


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
            <PageInfo title={"Storage"} description={"창고 정보를 조회하고 관리하세요."}/>
            <div className={styleStorage.contentArea}>
                <div className={styleStorage.contentWidth}>
                    <aside className={styleStorage.menuArea}>
                        <nav className={`${styleStorage.menuBox} ${styleList.filterCard}`}>
                            <ul className={styleStorage.menuList}>
                                {
                                    storageMenuConfig.map((item)=>{
                                        return <li key={item.id} onClick={()=>setView(item.id)} 
                                                    className={`${view === item.id ? styleStorage.selected : ""} ${styleStorage.menu} ${item.className}`}
                                                >{item.text}</li>
                                    })
                                }
                            </ul>
                        </nav>
                    </aside>

                    <section className={styleStorage.mainContentWrap}>
                        {view === "register" && <StorageRegister storageList={storageList} onUpdate={getStorageData} setView={setView}/>}
                        {view === "modify" && <StorageModify storageList={storageList} onUpdate={getStorageData} setView={setView}/>}
                        {view === "list" && <StorageList storageList={storageList} onUpdate={getStorageData} setView={setView}/>}
                    </section>
                </div>
                
            </div>
        </div>
    )
}

export default Storage;