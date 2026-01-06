import React, { useState, useEffect } from 'react';
import styleBrand from "../../css/Brand.module.css";

function BrandRegister({ isOpen, onClose }) {
    const [brNo, setBrNo] = useState("");
    const [brResult, setBrResult] = useState(null);
    const [brError, setBrError] = useState("");
    const [Tel, setTel] = useState("");
    const [brand, setbrand] = useState("");

    /* 사업자 조회 */
    useEffect(() => {
        if (brNo.length === 10 && brResult?.status !== "인증되었습니다.") {
            handleCheck();
        }
    }, [brNo]);

    if (!isOpen) return null;

    const handleCheck = async () => {
        const serviceKey = "nYrvOHdHDUUOV%2Fb8t4ddcrtVY02lgsfE%2BNmWpM%2F88LynhtxTOqBYkJZWbBCccrjZGcvSysLZVipV0g069cKT2A%3D%3D";
        const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}`;
        
        setBrError("");
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "b_no": [brNo] }),
            });
            const data = await res.json();
            let result = data.data?.[0];

            if (!result || result.b_stt !== "계속사업자") {
                setBrError("유효하지 않은 사업자 입니다.");
                return;
            }
            setBrResult({ status: "인증되었습니다." });
        } catch (error) {
            setBrError("조회 중 오류가 발생했습니다.");
        }
    };

    const handleTelChange = (e) => {
        const value = e.target.value;
        if (!/^[0-9-]*$/.test(value)) return;
        setTel(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log({ brand, brNo, Tel });
        alert("등록되었습니다!");
        onClose();
    };

    return (
        <div className={styleBrand.modalOverlay}>
            <div className={styleBrand.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styleBrand.closeBtn} onClick={onClose}>&times;</button>
                
                <h2>브랜드 등록</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styleBrand.modalItem}>
                        <label>브랜드 명</label>
                        <input
                            className={styleBrand.inputBox}
                            type="text"
                            value={brand}
                            onChange={(e) => setbrand(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styleBrand.modalItem}>
                        <label>사업자등록번호</label>
                        <input 
                            className={styleBrand.inputBox}
                            type="text" 
                            maxLength={10}
                            value={brNo}
                            onChange={(e) => setBrNo(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder='"-"을 제외한 숫자 10자리를 입력해 주세요'
                            readOnly={brResult?.status === "인증되었습니다."}
                            required
                        />
                        {brError && <p style={{color: 'red', fontSize: '12px'}}>{brError}</p>}
                        {brResult && <p style={{color: 'blue', fontSize: '12px'}}>{brResult.status}</p>}
                    </div>

                    <div className={styleBrand.modalItem}>
                        <label>연락처</label>
                        <input
                            className={styleBrand.inputBox} 
                            type="text" 
                            value={Tel}
                            onChange={handleTelChange}
                            placeholder='"-"을 포함하여 입력해 주세요'
                            required
                        />
                    </div>

                    <div className={styleBrand.buttonContainer}>
                        <button type='submit' className={styleBrand.submitBtn}>등록</button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default BrandRegister;