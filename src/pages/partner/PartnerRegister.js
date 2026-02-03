import React, { useState, useEffect, useCallback } from 'react';
import stylePartner from "../../css/Partner.module.css";
import serverUrl from "../../db/server.json";
import Modal from '../../components/Modal';

function PartnerRegister({ isOpen, onClose, onRegisterSuccess }) {
    const [brNo, setBrNo] = useState("");
    
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });
    const [brResult, setBrResult] = useState(null);
    const [brError, setBrError] = useState("");
    const [Tel, setTel] = useState("");
    const [telError, setTelError] = useState(""); 
    const [Partner, setPartner] = useState("");
    const SERVER_URL = serverUrl.SERVER_URL;

    // 사업자 등록번호 진위확인 API
    const handleCheck = useCallback(async () => {
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
    }, [brNo]);

    useEffect(() => {
        if (brNo.length === 10 && brResult?.status !== "인증되었습니다.") {
            handleCheck();
        }
    }, [brNo, brResult?.status, handleCheck]);

    if (!isOpen) return null;

    const handleTelChange = (e) => {
        const value = e.target.value;
        if (!/^[0-9-]*$/.test(value)) return;
        
        setTel(value);

        const telPattern = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
        if (value.length > 0 && !telPattern.test(value)) {
            setTelError("연락처 형식이 올바르지 않습니다. (예: 02-123-4567)");
        } else {
            setTelError(""); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!Partner) { 
            setModal({
                isOpen: true,
                title: 'Again',
                message: '거래처명을 입력해 주세요.',
                onConfirm: closeModal
            });
            return; 
        }
        if (brResult?.status !== "인증되었습니다.") {
            setBrError("사업자 번호 인증이 필요합니다.");
            return;
        }
        if (telError || Tel.length < 9) {
            setModal({
                isOpen: true,
                title: 'Again',
                message: '올바른 연락처를 입력해 주세요.',
                onConfirm: closeModal
            }); 
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/ttik/partner/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partnerNm: Partner, 
                    brNo: brNo,
                    telNo: Tel
                }),
            });

            if (response.ok) {
                // 성공 모달 설정
                setModal({
                    isOpen: true,
                    title: 'Register',
                    message: '등록되었습니다!',
                    onConfirm: () => {
                        // 1. 알림 모달 닫기
                        closeModal(); 
                        
                        // 2. 입력 폼 초기화
                        setPartner("");
                        setBrNo("");
                        setTel("");
                        setTelError("");
                        setBrResult(null);
                        setBrError("");

                        // 3. 등록 창(부모 모달) 닫기 및 데이터 갱신
                        onClose();
                        if (onRegisterSuccess) onRegisterSuccess(); 
                    }
                });
            } else {
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: '서버 등록에 실패했습니다. (500 에러)',
                    onConfirm: closeModal
                });
            }
        } catch (error) {
            console.error("등록 에러:", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: '네트워크 오류 발생',
                onConfirm: closeModal
            });
        }
    };

    return (
        <>
        <Modal
            {...modal} 
        />
        <div className={stylePartner.modalOverlay}>
            <div className={stylePartner.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={stylePartner.closeBtn} onClick={onClose}>&times;</button>
                <h2>거래처 등록</h2>
                <form onSubmit={handleSubmit}>
                    <div className={stylePartner.modalItem}>
                        <label>거래처 명</label>
                        <input 
                            className={stylePartner.inputBox}
                            type="text" value={Partner}
                            onChange={(e) => setPartner(e.target.value)}
                            required
                        />
                    </div>

                    <div className={stylePartner.modalItem}>
                        <label>사업자등록번호</label>
                        <input
                            className={stylePartner.inputBox}
                            type="text" maxLength={10} value={brNo}
                            onChange={(e) => setBrNo(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder='숫자 10자리를 입력해 주세요'
                            readOnly={brResult?.status === "인증되었습니다."}
                            required
                        />
                        {brError && <p style={{color: 'red', fontSize: '12px'}}>{brError}</p>}
                        {brResult && <p style={{color: 'blue', fontSize: '12px'}}>{brResult.status}</p>}
                    </div>

                    <div className={stylePartner.modalItem}>
                        <label>연락처</label>
                        <input
                            className={stylePartner.inputBox}
                            type="text" value={Tel}
                            onChange={handleTelChange}
                            placeholder='"-"를 포함해 입력해 주세요'
                            required
                        />
                        {telError && <p style={{color: 'red', fontSize: '12px'}}>{telError}</p>}
                    </div>

                    <button type='submit' className={stylePartner.submitBtn}>등록</button>
                </form>
            </div>
        </div>
        </>
    );
}

export default PartnerRegister;