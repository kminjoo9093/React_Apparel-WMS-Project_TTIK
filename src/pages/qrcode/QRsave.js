import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import style from '../../css/QRsave.module.css';
import serverUrl from "../../db/server.json";

const INITIAL_PRODUCTS = [
    { id: '0125S-TPS01-Z001', name: '데님 모자' },
    { id: '0820S-JAC02-C001', name: '청자켓' },
    { id: '1952S-SHO03-N001', name: '나이키 신발' }
];

const QRsave = () => {
    const [products] = useState(INITIAL_PRODUCTS);
    const [generatedQrs, setGeneratedQrs] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [printConfig, setPrintConfig] = useState({
        productId: '0125S-TPS01-Z001',
        boxQty: 50,
        boxStart: 1,
        boxEnd: 1,
        itemStart: 1,
        itemEnd: 1,
        includeItems: false
    });

    const printAreaRef = useRef(null);
    const SERVER_URL = serverUrl.SERVER_URL;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPrintConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateSequence = (e) => {
        e.preventDefault();
        const { productId, boxQty, boxStart, boxEnd, itemStart, itemEnd, includeItems } = printConfig;
        
        if (!boxStart || !boxEnd || parseInt(boxStart) > parseInt(boxEnd)) {
            alert("박스 범위를 확인하세요."); return;
        }

        let list = [];
        for (let b = parseInt(boxStart); b <= parseInt(boxEnd); b++) {
            const boxBarcode = `${productId}-B${boxQty}-${b}`;
            list.push(boxBarcode);
            if (includeItems) {
                for (let i = parseInt(itemStart); i <= parseInt(itemEnd); i++) {
                    list.push(`${boxBarcode}-${i}`);
                }
            }
        }
        setGeneratedQrs(list);
        setTimeout(() => printAreaRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

   const handleServerPrint = async () => {
    if (generatedQrs.length === 0) {
        alert("인쇄할 QR 코드가 없습니다. 먼저 시퀀스를 생성하세요.");
        return;
    }
    setIsDownloading(true);
    setProgress(0);
    const userId = `user_${Date.now()}`;
    // 전달해주신 API_BASE 주소 유지
    const API_BASE = "https://192.168.0.11:3001";

    const progressTimer = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE}/test/labels/status/${userId}`);
            if (res.ok) {
                const currentProgress = await res.json();
                // 원본 로직: 서버 진행률을 그대로 setProgress에 반영
                setProgress(currentProgress);
                if (currentProgress >= 100) clearInterval(progressTimer);
            }
        } catch (err) {
            console.error("상태 조회 실패:", err);
        }
    }, 500);

    try {
        const selectedProduct = products.find(p => p.id === printConfig.productId);
        const productNameRaw = selectedProduct ? selectedProduct.name : "상품라벨";
        
        const labelDataList = generatedQrs.map(code => ({
            qrContent: code,
            qrNumber: code,
            productName: productNameRaw,
            productCode: printConfig.productId
        }));

        const response = await fetch(`${API_BASE}/test/labels/download/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(labelDataList)
        });
        
        if (!response.ok) throw new Error(`서버 응답 에러 (${response.status})`);
        const blob = await response.blob();
        
        // 원본 로직: 다운로드 완료 시 인터벌 클리어 및 100 설정
        clearInterval(progressTimer);
        setProgress(100);

        const safeProductName = productNameRaw.replace(/[\\/:*?"<>|]/g, "");
        const fileName = `${safeProductName}_${generatedQrs.length}개_${new Date().toISOString().split('T')[0]}.pdf`;

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        alert(`${fileName} 파일 생성이 완료되었습니다!`);
    } catch (error) {
        clearInterval(progressTimer);
        alert('다운로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
        setIsDownloading(false);
    }
  };
    return (
        <div className={style.container}>
            {/* 좌측: 설정창 */}
            <aside className={style.leftSection}>
                <div className={style.card}>
                    <div className={style.header}>
                        <h2>🖨️ 라벨 발행 설정</h2>
                    </div>
                    <form className={style.form} onSubmit={generateSequence}>
                        <div className={style.inputGroup}>
                            <label>발행 대상 상품</label>
                            <select name="productId" value={printConfig.productId} onChange={handleChange}>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={style.inputGroup}>
                            <label>박스당 입수량 (B-Qty)</label>
                            <input type="number" name="boxQty" value={printConfig.boxQty} onChange={handleChange} />
                        </div>

                        <div className={style.inputGroup}>
                            <label>박스 번호 (시작 - 끝)</label>
                            <div className={style.flexRow}>
                                <input type="number" name="boxStart" value={printConfig.boxStart} onChange={handleChange} placeholder="시작" />
                                <input type="number" name="boxEnd" value={printConfig.boxEnd} onChange={handleChange} placeholder="끝" />
                            </div>
                        </div>

                        <div className={style.checkboxContainer}>
                            <input type="checkbox" id="includeItems" name="includeItems" checked={printConfig.includeItems} onChange={handleChange} />
                            <label htmlFor="includeItems" className={style.checkboxLabel}>낱개 QR 포함 발행</label>
                        </div>

                        {printConfig.includeItems && (
                            <div className={style.inputGroup}>
                                <label>낱개 번호 (시작 - 끝)</label>
                                <div className={style.flexRow}>
                                    <input type="number" name="itemStart" value={printConfig.itemStart} onChange={handleChange} />
                                    <input type="number" name="itemEnd" value={printConfig.itemEnd} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        <button type="submit" className={style.submitBtn}>
                            QR 시퀀스 생성하기
                        </button>
                    </form>
                </div>
            </aside>

         {/* 오른쪽 미리보기 영역 내부 */}
            <main className={style.rightSection} ref={printAreaRef}>
                {generatedQrs.length > 0 ? (
                    <>
                        {/* 인쇄 대기 알림창 (제시하신 노란 박스 스타일) */}
                        <div className={style.printNoticeBox}>
                            <h3 style={{ color: '#d48806', marginTop: 0, fontSize: '1.6rem', fontWeight: 800 }}>
                                🖨️ 인쇄 대기 중: {generatedQrs.length}개
                            </h3>
                            <p style={{ fontSize: '1.1rem', color: '#855800', marginBottom: '1.5rem' }}>
                                아래 버튼을 누르면 PDF파일이 다운로드 됩니다.
                            </p>
                            
                            <button 
                                onClick={handleServerPrint} 
                                className={style.downloadBtn}
                                disabled={isDownloading}
                            >
                                {isDownloading ? `생성 중... (${progress}%)` : 'PDF 다운로드'}
                            </button>

                            {isDownloading && (
                                <div className={style.progressWrapper}>
                                    <div className={style.progressBarBg}>
                                        {/* progress 상태값을 그대로 width에 대입 */}
                                        <div 
                                            className={style.progressBarFill} 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                    <p className={style.progressText}>
                                        {progress}% 진행 중 (서버에서 PDF 제작 중)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* QR 그리드 미리보기 */}
                        <div className={style.qrGrid}>
                            {generatedQrs.map((code, index) => (
                                <div key={index} className={style.qrItem}>
                                    <QRCodeCanvas value={code} size={110} marginSize={1} />
                                    <div className={style.qrText}>{code}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={style.emptyState}>
                        {/* 데이터 없을 때 화면 */}
                        <div style={{fontSize: '5rem', marginBottom: '1.5rem'}}>📄</div>
                        <h2 style={{color: '#64748b'}}>미리보기 데이터가 없습니다.</h2>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QRsave;