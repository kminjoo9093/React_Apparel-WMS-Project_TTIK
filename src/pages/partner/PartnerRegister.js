import React, { useState } from 'react';

function PartnerRegister() {

    /* 사업자 진위여부 */
    const [brNo, setBrNo] = useState("");
    const [brResult, setBrResult] = useState(null);
    const [brError, setBrError] = useState("");

    const serviceKey = "nYrvOHdHDUUOV%2Fb8t4ddcrtVY02lgsfE%2BNmWpM%2F88LynhtxTOqBYkJZWbBCccrjZGcvSysLZVipV0g069cKT2A%3D%3D";
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}`;

    const handleCheck = async () => {
        setBrError("");
        
        try {
            const body = {
                "b_no": [brNo]
            };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            let result = data.data?.[0];

            if (!result || result.b_stt !== "계속사업자") {
                setBrError("유효하지 않은 사업자 입니다.");
                return;
            }

            setBrResult({ status: "인증되었습니다." });

        } catch (error) {
            console.error("조회 중 에러:", error);
            setBrError("조회 중 오류가 발생했습니다.");
        }
    };

    /* 연락처 */
    const [Tel, setTel] = useState("");

    const phoneRegex = /^\d{2,4}-\d{3,4}-\d{4}$/;

    const isTelValid = phoneRegex.test(Tel);

    const handleTelChange = (e) => {
        const value = e.target.value;

        if (!/^[0-9-]*$/.test(value)) return;
            setTel(value);
    };

    const [partner, setPartner] = useState("");

    /* 데이터 전달 */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("Partner", partner);
        formData.append("brNo", brNo);
        formData.append("Tel", Tel);

         console.log("--- 서버 전송 데이터 목록 ---");

        // 전송 데이터 확인 - 지우기
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: [파일] ${value.name} (${(value.size / 1024).toFixed(1)} KB)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }
        console.log("------------------------------");

    };

    return (
        <div className="contentTopPosition">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>거래처 명</label> <br/>
                        <input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} />
                    </div>

                    <div>
                        <label>사업자등록번호</label> <br/>
                        <input 
                            id="brno"
                            type="text" 
                            maxLength={10}
                            value={brNo}
                            onChange={(e) => setBrNo(e.target.value)}
                            placeholder='"-" 제외 숫자 10자리를 입력해 주세요'
                            readOnly={brResult?.status === "인증되었습니다."}
                        />
                        <button type="button" onClick={handleCheck}>조회</button>

                        {brError && <p style={{color: 'red'}}>{brError}</p>}
                        {brResult && <p style={{color: 'blue'}}>{brResult.status}</p>}
                    </div>

                    <div>
                        <label>연락처</label><br/>
                        <input type="text" value={Tel}
                            onChange={handleTelChange}
                            placeholder='"-"을 포함하여 전화번호를 입력해 주세요'
                        />
                        {Tel.length > 0 && !isTelValid && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                            올바른 전화번호 형식(하이픈 포함)으로 입력해주세요.
                        </p>
                        )}
                    </div>
                    <button type='submit'>등록</button>
                </form>
            </div> 
        </div>
    );
}

export default PartnerRegister;