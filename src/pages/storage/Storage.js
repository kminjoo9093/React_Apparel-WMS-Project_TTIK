import styleStorage from "../../css/Storage.module.css";
import { useState, useEffect } from "react";
import StorageModify from "./StorageModify";
import StorageList from "./StorageList";
import StorageRegister from "./StorageRegister";
import styleList from "../../css/ProductList.module.css";
import PageInfo from "../../components/PageInfo";
import { useStorageContext } from "../../context/StorageProvider";

const storageMenuConfig = [
  {
    id: "list",
    text: "창고 조회",
    className: styleStorage.menuViewList,
  },
  {
    id: "register",
    text: "창고 등록",
    className: styleStorage.menuRegister,
  },
  {
    id: "modify",
    text: "창고 정보 수정",
    className: styleStorage.menuModify,
  },
];

function Storage() {
  const { storageList, getStorageData } = useStorageContext();
  const [view, setView] = useState("list");

  useEffect(() => {
    getStorageData();
  }, []);

  return (
    <div className={styleStorage.storage}>
      <PageInfo
        title={"Storage"}
        description={"창고 정보를 조회하고 관리하세요."}
      />
      <div className={styleStorage.contentArea}>
        <div className={styleStorage.contentWidth}>
          <aside className={styleStorage.menuArea}>
            <nav className={`${styleStorage.menuBox} ${styleList.filterCard}`}>
              <ul className={styleStorage.menuList}>
                {storageMenuConfig.map((item) => {
                  return (
                    <li
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`${view === item.id ? styleStorage.selected : ""} ${styleStorage.menu} ${item.className}`}
                    >
                      {item.text}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <section className={styleStorage.mainContentWrap}>
            {view === "register" && <StorageRegister setView={setView} />}
            {view === "modify" && <StorageModify setView={setView} />}
            {view === "list" && <StorageList setView={setView} />}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Storage;
