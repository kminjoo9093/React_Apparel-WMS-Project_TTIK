import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from "html5-qrcode";
import serverUrl from "../../db/server.json";
import styles from "../../css/StockDetail.module.css"; 

function StockDetail() {
    const { productCd } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const SERVER_URL = serverUrl.SERVER_URL;

    const planType = location.state?.type || "InBound"; 

    const [product, setProduct] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);
    const [checkedItems, setCheckedItems] = useState(new Set());

    const isProcessing = useRef(false);
    const scannerRef = useRef(null);
    // 실시간 수량 체크를 위한 가장 정확한 참조 데이터
    const scanHistoryRef = useRef([]); 
    const audioContextRef = useRef(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/ttik/product/${productCd}?type=${planType}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                }
            } catch (error) { console.error("데이터 로드 실패", error); }
        };
        if(productCd) fetchDetail();
    }, [productCd, SERVER_URL, planType]);

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

    // 화면 표시용 (선택된 수량)
    const selectedTotalQty = scanHistory
        .filter(h => checkedItems.has(h.barcode))
        .reduce((sum, h) => sum + h.increment, 0);

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

    const handleBarcodeScanned = (fullBarcode) => {
        // 1. 중복 스캔 방지 (Ref 사용)
        if (scanHistoryRef.current.some(h => h.barcode === fullBarcode)) {
            alert("이미 스캔된 고유 번호입니다: " + fullBarcode);
            return;
        }

        // 2. 바코드 파싱
        const parts = fullBarcode.split('-');
        let productId = "";
        let incrementValue = 1;
        let isBoxScan = false;

        if (fullBarcode.includes('-B')) {
            const bIndex = parts.findIndex(p => p.startsWith('B'));
            if (bIndex !== -1) {
                productId = parts.slice(0, bIndex).join('-');
                if (parts.length === bIndex + 2) { 
                    isBoxScan = true; 
                    incrementValue = parseInt(parts[bIndex].substring(1), 10) || 1;
                }
            }
        } else {
            productId = parts.slice(0, 3).join('-');
        }

        // 상품코드 불일치 차단
        if (productId !== productCd) {
            alert(`상품 불일치!\n현재 페이지: ${productCd}\n스캔 바코드: ${productId}`);
            return;
        }

        // 3. 실시간 수량 합산 및 초과 체크 (Ref를 기준으로 직접 계산)
        const currentSum = scanHistoryRef.current.reduce((sum, item) => sum + item.increment, 0);
        const limitQty = product?.stkQty || 0;

        if (currentSum + incrementValue > limitQty) {
            alert(`❌ 초과 차단! 더 이상 스캔할 수 없습니다.\n(예정: ${limitQty} / 현재: ${currentSum} / 추가시도: ${incrementValue})`);
            return; // 리스트에 추가하지 않고 종료
        }

        // 4. 모든 조건 통과 시 데이터 반영
        playBeep();
        
        const newLog = {
            barcode: fullBarcode,
            productId,
            isBox: isBoxScan,
            increment: incrementValue,
            time: new Date().toLocaleTimeString()
        };

        // Ref와 State를 동시에 업데이트하여 정합성 유지
        scanHistoryRef.current = [newLog, ...scanHistoryRef.current];
        setScanHistory([...scanHistoryRef.current]);
        setCheckedItems(prev => new Set(prev).add(fullBarcode));
    };

    const handleRegister = () => {
        if (checkedItems.size === 0) {
            alert("등록할 항목을 선택해주세요.");
            return;
        }
        if (window.confirm(`선택한 ${checkedItems.size}건(총 ${selectedTotalQty}개)을 등록하시겠습니까?`)) {
            navigate('/stock/plans', { state: { activeTab: planType } });
        }
    };

    useEffect(() => {
        if (isScannerOpen) {
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner("detail-reader", {
                    fps: 10,
                    qrbox: { width: 250, height: 180 },
                    aspectRatio: 1.0,
                    rememberLastUsedCamera: true
                });
                scanner.render((text) => {
                    if (isProcessing.current) return;
                    isProcessing.current = true;
                    handleBarcodeScanned(text);
                    setTimeout(() => { isProcessing.current = false; }, 1500);
                }, (err) => {});
                scannerRef.current = scanner;
            }, 500);
            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error(err));
                    scannerRef.current = null;
                }
            };
        }
    }, [isScannerOpen]);

    if (!product) return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div className={styles.headerInfo}>
                    <h1>{planType === "InBound" ? "📦 입고 실시간 검수" : "🚀 출고 실시간 검수"}</h1>
                    <div className={styles.productTitleArea}>
                        <p className={styles.productCodeRow}>
                            <span className={styles.label}>상품코드:</span> 
                            <span className={styles.productBadge}>{product.productCd}</span>
                        </p>
                        <p className={styles.productNameRow}>{product.productNm}</p>
                    </div>
                </div>
                <div className={styles.btnGroup}>
                    <button className={`${styles.btn} ${styles.btnBack}`} onClick={() => navigate('/stock/plans', { state: { activeTab: planType } })}>← 뒤로</button>
                    <button 
                        className={`${styles.btn} ${styles.btnScanner} ${isScannerOpen ? styles.active : ''}`}
                        onClick={() => setIsScannerOpen(!isScannerOpen)}
                    >
                        {isScannerOpen ? "✖ 스캐너 끄기" : "📷 스캐너 활성화"}
                    </button>
                </div>
            </div>

            {isScannerOpen && (
                <div className={styles.scannerWrapper}>
                    <div id="detail-reader" className={styles.readerBox}></div>
                </div>
            )}

            <div className={styles.contentGrid}>
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div className={styles.cardTitle} style={{ margin: 0 }}>📜 실시간 스캔 로그</div>
                            <label style={{ fontSize: '0.9rem', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                    type="checkbox" 
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    onChange={handleAllCheck}
                                    checked={scanHistory.length > 0 && checkedItems.size === scanHistory.length}
                                /> 
                                <span>전체선택</span>
                            </label>
                        </div>
                        <div className={styles.historyList}>
                            {scanHistory.length > 0 ? scanHistory.map((h, i) => (
                                <div key={i} className={`${styles.historyRow} ${h.isBox ? styles.boxLog : ''}`} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #edf2f7' }}>
                                    <input 
                                        type="checkbox"
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                                        checked={checkedItems.has(h.barcode)}
                                        onChange={() => handleCheckItem(h.barcode)}
                                    />
                                    <div style={{flex: 1, marginLeft: '12px'}}>
                                        <div className={styles.barcodeText} style={{ fontWeight: '500', fontSize: '0.95rem' }}>{h.barcode}</div>
                                        <div className={styles.timeText} style={{ fontSize: '0.8rem', color: '#718096' }}>
                                            {h.time} {h.isBox && <span className={styles.boxTag} style={{ marginLeft: '5px', padding: '2px 5px', backgroundColor: '#fed7d7', color: '#e53e3e', borderRadius: '4px', fontSize: '0.7rem' }}>BOX</span>}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: h.isBox ? '#e53e3e' : '#3182ce' }}>
                                        +{h.increment}
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.emptyText}>스캔된 내역이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>📊 검수 현황 (선택됨)</div>
                        <div className={styles.statGrid}>
                            <div className={styles.statItem} style={{ background: '#f0f7ff' }}>
                                <span className={styles.statLabel}>선택 수량</span>
                                <span className={styles.statValue} style={{ color: '#3182ce' }}>{selectedTotalQty}</span>
                                <small>EA</small>
                            </div>
                            <div className={styles.statItem} style={{ background: '#f0fff4' }}>
                                <span className={styles.statLabel}>지시 예정량</span>
                                <span className={styles.statValue} style={{ color: '#38a169' }}>{product.stkQty}</span>
                                <small>EA</small>
                            </div>
                        </div>
                        <div className={styles.progressBarWrapper}>
                            <div 
                                className={styles.progressBar} 
                                style={{ width: `${Math.min((selectedTotalQty / (product.stkQty || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <button onClick={handleRegister} style={{
                        width: '100%', padding: '15px', marginTop: '20px', 
                        backgroundColor: checkedItems.size > 0 ? '#3182ce' : '#a0aec0', 
                        color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', 
                        cursor: checkedItems.size > 0 ? 'pointer' : 'not-allowed'
                    }}>
                        📥 선택 항목({checkedItems.size}건) 등록하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StockDetail;