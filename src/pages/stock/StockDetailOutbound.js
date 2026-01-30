import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from "html5-qrcode";
import serverUrl from "../../db/server.json";
import styles from "../../css/StockDetail.module.css"; 

function StockDetailOutbound() {
    const { productCd } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const SERVER_URL = serverUrl.SERVER_URL;

    // 출고 페이지이므로 타입을 OutBound로 고정
    const planType = "OutBound"; 
    const planYmd = location.state?.planYmd;

    const [product, setProduct] = useState(null);
    const [alreadyDoneQty, setAlreadyDoneQty] = useState(0); // [추가] 이미 출고된 수량 상태
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);
    const [checkedItems, setCheckedItems] = useState(new Set());

    const isProcessing = useRef(false);
    const scannerRef = useRef(null);
    const scanHistoryRef = useRef([]); 
    const audioContextRef = useRef(null);

    // 1. 초기 데이터 로드 (출고 예정 정보 조회)
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // 백엔드에서 해당 상품의 출고 지시 수량 등을 가져옴
                const url = `${SERVER_URL}/ttik/productdetail/product/${productCd}?type=${planType}&planYmd=${planYmd}`;
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'include', 
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("📌 출고 상품 정보:", data);
                    setProduct(data);
                    // [추가] 백엔드에서 HashMap으로 넘겨준 완료 수량을 상태에 저장
                    setAlreadyDoneQty(data.completedOutboundQty || 0);
                }
            } catch (error) { 
                console.error("데이터 로드 실패", error); 
            }
        };
        if(productCd) fetchDetail();
    }, [productCd, SERVER_URL, planYmd]);

    // 체크박스 제어
    const handleCheckItem = (barcode) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(barcode)) newSet.delete(barcode);
            else newSet.add(barcode);
            return newSet;
        });
    };

    const handleAllCheck = (e) => {
        if (e.target.checked) {
            const allBarcodes = scanHistory.map(h => h.barcode);
            setCheckedItems(new Set(allBarcodes));
        } else {
            setCheckedItems(new Set());
        }
    };

    // 통계 계산
    const selectedTotalQty = scanHistory
        .filter(h => checkedItems.has(h.barcode))
        .reduce((sum, h) => sum + h.increment, 0);

    const totalCompletedQty = (product?.completedOutboundQty || 0) + selectedTotalQty;
    
    const selectedBoxCount = scanHistory
        .filter(h => checkedItems.has(h.barcode) && h.isBox).length;



    const playBeep = () => {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    };

    // 2. 바코드 스캔 처리 (출고 수량 조회)
const handleBarcodeScanned = async (fullBarcode) => {
    if (scanHistoryRef.current.some(h => h.barcode === fullBarcode)) {
        alert("이미 스캔된 고유 번호입니다.");
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/ttik/productdetail/scan-check/${fullBarcode}?type=OutBound`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json' 
                }
            });

        // JSON 응답 확인 (HTML 에러 방지)
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            console.error("서버 응답 에러");
            return;
        }

        const actualQty = await response.json();
        
        // 🔍 [추가 로직] 출고 지시 수량 초과 체크
        const currentTotal = scanHistoryRef.current.reduce((sum, item) => sum + item.increment, 0);
        const limitQty = product?.stkQty || 0;

        if (currentTotal + actualQty > limitQty) {
            alert(`❌ 출고 수량 초과!\n지시 수량: ${limitQty}\n현재까지 스캔: ${currentTotal}\n이번 박스 수량: ${actualQty}\n\n박스 내 일부 아이템만 출고해야 한다면 박스를 해체하고 낱개 스캔하세요.`);
            return;
        }

        if (actualQty <= 0) {
            alert("출고 가능한 아이템이 없습니다.");
            return;
        }

        playBeep();
        const newLog = {
            barcode: fullBarcode,
            increment: Number(actualQty),
            time: new Date().toLocaleTimeString(),
            isBox: fullBarcode.split('-').length - 1 === 4 //수정(1/29 18:30)
        };

        scanHistoryRef.current = [newLog, ...scanHistoryRef.current];
        setScanHistory([...scanHistoryRef.current]);
        setCheckedItems(prev => new Set(prev).add(fullBarcode));

    } catch (error) {
        console.error("스캔 처리 중 예외 발생:", error);
    }
};

    // 3. 최종 출고 등록 (서버의 processStock 호출)
    const handleRegister = async () => {
        const itemsToProcess = scanHistory.filter(h => checkedItems.has(h.barcode));

        if (itemsToProcess.length === 0) {
            alert("등록할 항목을 선택해주세요.");
            return;
        }

        if (window.confirm(`선택한 ${itemsToProcess.length}건을 출고 등록 하시겠습니까?`)) {
            try {
                let successCount = 0;
                for (const item of itemsToProcess) {
                    const payload = {
                        type: "OutBound", // 출고 고정
                        boxCd: item.barcode,
                        gdsCd: productCd,
                        brandNm: product?.brandNm || '',
                        partnerNm: product?.partnerNm || ''
                    };

                    const response = await fetch(`${SERVER_URL}/ttik/productdetail/outbound/process`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) successCount++;
                }

                alert(`${successCount}건의 출고 처리가 완료되었습니다.`);
                navigate('/stock/plans', { state: { activeTab: "OutBound" } });

            } catch (error) {
                console.error("출고 등록 실패:", error);
                alert("처리 중 오류가 발생했습니다.");
            }
        }
    };

    // 스캐너 설정
    useEffect(() => {
        if (isScannerOpen) {
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner("outbound-reader", {
                    fps: 10,
                    qrbox: { width: 250, height: 180 },
                    aspectRatio: 1.0,
                });
                scanner.render((text) => {
                    if (isProcessing.current) return;
                    isProcessing.current = true;
                    handleBarcodeScanned(text);
                    setTimeout(() => { isProcessing.current = false; }, 1500);
                }, () => {});
                scannerRef.current = scanner;
            }, 500);
            return () => {
                clearTimeout(timer);
                if (scannerRef.current) scannerRef.current.clear().catch(() => {});
            };
        }
    }, [isScannerOpen]);

    if (!product) return <div className={styles.loading}>출고 데이터를 불러오는 중...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div className={styles.headerInfo}>
                    <h1>🚀 출고 실시간 검수</h1>
                    <div className={styles.productTitleArea}>
                        <p><span className={styles.label}>상품코드:</span> <span className={styles.productBadge}>{product.productCd}</span></p>
                        <p className={styles.productNameRow}>{product.productNm}</p>
                    </div>
                </div>
                <div className={styles.btnGroup}>
                    <button 
                        className={`${styles.btn} ${styles.btnBack}`} 
                        onClick={() => navigate('/stock/plans', { state: { activeTab: "OutBound" } })} // -1 대신 경로와 state 명시
                    >
                        ← 뒤로
                    </button>
                    <button className={`${styles.btn} ${styles.btnScanner}`} onClick={() => setIsScannerOpen(!isScannerOpen)}>
                        {isScannerOpen ? "✖ 스캐너 끄기" : "📷 스캐너 활성화"}
                    </button>
                </div>
            </div>

            {isScannerOpen && <div id="outbound-reader" className={styles.readerBox}></div>}

            <div className={styles.contentGrid}>
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>📜 출고 스캔 로그
                            {/* <input type="checkbox" onChange={handleAllCheck} checked={scanHistory.length > 0 && checkedItems.size === scanHistory.length} /> */}
                        </div>
                        <div className={styles.historyList}>
                            {scanHistory.map((h, i) => (
                                <div key={i} className={styles.historyRow}>
                                    {/* <input type="checkbox" checked={checkedItems.has(h.barcode)} onChange={() => handleCheckItem(h.barcode)} /> */}
                                    <div style={{flex: 1, marginLeft: '10px'}}>
                                        <div>{h.barcode}</div>
                                        <small>{h.time}</small>
                                    </div>
                                    <div style={{color: '#3182ce', fontWeight: 'bold'}}>+{h.increment} EA</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>📊 출고 현황</div>
                        <div className={styles.statGrid} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '10px' 
                        }}>

                            <div className={styles.statItem} style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{fontSize: '0.8rem'}}>스캔 총량</span>
                                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce'}}>{selectedTotalQty}</div>
                            </div>

                            <div className={styles.statItem} style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '10px', textAlign: 'center', borderRadius: '8px' }}>
                                <span className={styles.statLabel} style={{display:'block', fontSize:'0.8rem', color:'#666'}}>출고 완료</span>
                                <span className={styles.statValue} style={{ color: '#e53e3e', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCompletedQty}</span>
                            </div>

                            <div className={styles.statItem} style={{ background: '#f0fff4', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{fontSize: '0.8rem'}}>출고 예정</span>
                                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#38a169'}}>{product.stkQty || 0}</div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleRegister} 
                        className={styles.registerBtn}
                        style={{
                            width: '100%', padding: '15px', marginTop: '20px', 
                            backgroundColor: checkedItems.size > 0 ? '#3182ce' : '#cbd5e0',
                            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
                            cursor: checkedItems.size > 0 ? 'pointer' : 'not-allowed'
                        }}
                    >
                        📥 선택 항목({checkedItems.size}건) 출고 완료 처리
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StockDetailOutbound;