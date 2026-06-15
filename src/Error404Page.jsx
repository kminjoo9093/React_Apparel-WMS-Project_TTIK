import { Link } from "react-router-dom";
import styleLayout from "../src/css/Layout.module.css"

function Error404Page(){

    return (
        <>
            <div className="contentTopPosition" style={{textAlign:"center"}}>
                <h1>존재하지않는 페이지 입니다.</h1>
                <br></br>
                <button className={styleLayout.logoutBtn}><Link to="/ttik" >돌아가기</Link></button>
            </div>
           
        </>
    )
}

export default Error404Page;