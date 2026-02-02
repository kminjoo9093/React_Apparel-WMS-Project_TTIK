import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from "html5-qrcode";
import serverUrl from "../../db/server.json";
import styles from "../../css/StockDetail.module.css"; 
import Modal from '../../components/Modal';

function StockDetailInbound() {
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });
    const { productCd } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const SERVER_URL = serverUrl.SERVER_URL;

    const [selectOptions, setSelectOptions] = useState({
        storages: [], zones: [], racks: []
    });
    const [selections, setSelections] = useState({
        storage: '',
        zone: '',
        rack: ''
    });
    const planType = (location.state?.type); 
    const planYmd = location.state?.planYmd;

    const [product, setProduct] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);
    const [checkedItems, setCheckedItems] = useState(new Set());

    const isProcessing = useRef(false);
    const scannerRef = useRef(null);
    const scanHistoryRef = useRef([]); 
    const audioContextRef = useRef(null);

    // 창고 카테고리 상위 변경시 초기화
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setSelections(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'storage') { next.zone = ''; next.rack = ''; }
            if (name === 'zone') { next.rack = ''; }
            return next;
        });
    };

    useEffect(() => {
        const fetchDetail = async () => {
        try {
            const url = `${SERVER_URL}/ttik/productdetail/product/${productCd}?type=${planType}${planYmd ? `&planYmd=${planYmd}` : ''}`;
            
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json' 
                }
            });

            if (res.ok) {
                const data = await res.json();
                setProduct(data);
            } else {
                    console.error("서버 응답 상태 에러:", res.status);
                    }
                } catch (error) { 
                    console.error("데이터 로드 실패", error); 
                }
            };
            if(productCd) fetchDetail();
        }, [productCd, SERVER_URL, planType, planYmd]);

    const handleCheckItem = (barcode) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(barcode)) newSet.delete(barcode);
            else newSet.add(barcode);
            return newSet;
        });
    };

    //창고 리스트 불러오기
    useEffect(() => {
        const fetchSelectData = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/ttik/plans/register-info`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json' 
                }
            });
                if (response.ok) {
                    const data = await response.json();
                    setSelectOptions(data); 
                    console.log(data);
                }
            } catch (error) {
                console.error("기초 데이터 로드 실패:", error);
            }
        };
        fetchSelectData();
    }, [SERVER_URL]);

    const handleAllCheck = (e) => {
        if (e.target.checked) {
            const allBarcodes = scanHistory.map(h => h.barcode);
            setCheckedItems(new Set(allBarcodes));
        } else {
            setCheckedItems(new Set());
        }
    };

    // 화면 표시용 수량 계산 (선택된 항목 기준)
    const selectedTotalQty = scanHistory
        .filter(h => checkedItems.has(h.barcode))
        .reduce((sum, h) => sum + h.increment, 0);
    
    // 선택된 항목들 중 박스 스캔 횟수 계산 (h.isBox가 true인 것만 카운트)
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


    const handleBarcodeScanned = async (fullBarcode) => {
        if (scanHistoryRef.current.some(h => h.barcode === fullBarcode)) {
            setModal({
                isOpen: true,
                title: '중복 스캔',
                message: (
                    <>
                        이미 스캔된 고유 번호입니다:<br />
                        {fullBarcode}
                    </>
                ),
                onConfirm: closeModal
            });
            return;
        }

        try {
            // DB에서 실제 박스/아이템 수량 조회
            const res = await fetch(`${SERVER_URL}/ttik/productdetail/scan-check/${fullBarcode}`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json' 
                }
            });
            if (!res.ok) throw new Error("수량 조회 실패");
            const actualQty = await res.json();

            if (actualQty <= 0) {
                setModal({
                    isOpen: true,
                    title: 'Again',
                    message: '해당 박스에 입고 가능한 아이템이 없습니다.',
                    onConfirm: closeModal
                });
                return;
            }

            // 대소문자 구분 없이 박스 여부 및 상품코드 추출
            const parts = fullBarcode.split('-');
            const boxMatch = fullBarcode.match(/^(.*)-B(\d+)-(\d+)(?:-(\d+))?$/i);
        
            let productId = "";
            let incrementValue = 1;
            let isBoxScan = false;

            if (boxMatch) {
                productId = boxMatch[1];
                const bQty = parseInt(boxMatch[2], 10);
                const isSingleItem = !!boxMatch[4]; 

                if (!isSingleItem) {
                    isBoxScan = true;
                    incrementValue = bQty;
                } else {
                    isBoxScan = false;
                    incrementValue = 1;
                }
            } else {
                productId = fullBarcode.split('-').slice(0, 3).join('-');
            }

            // 상품코드 불일치 차단
        if (productId.toUpperCase() !== productCd.toUpperCase()) {
            setModal({
                isOpen: true,
                title: '상품 불일치',
                message: (
                    <span>
                        상품 불일치! 더 이상 스캔할 수 없습니다.<br />
                        현재 페이지: {productCd} <br/>
                        스캔 바코드: {productId}
                    </span>
                ),
                onConfirm: closeModal
            });
            return;
        }

            // 실시간 수량 합산 및 초과 체크
            const currentSum = scanHistoryRef.current.reduce(
                    (sum, item) => sum + item.increment, 0
                );
            const limitQty = product?.stkQty || 0;

            if (currentSum + incrementValue > limitQty) {
                setModal({
                    isOpen: true,
                    title: '수량 초과',
                    message: (
                        <span>
                            ❌ 초과 차단! 더 이상 스캔할 수 없습니다.<br />
                            (예정: {limitQty} / 현재: {currentSum} / 추가시도: {incrementValue})
                        </span>
                    ),
                    onConfirm: closeModal
                });
                return; 
            }

            // 6. 성공 시 알림음 및 데이터 반영
            playBeep();
            
            const newLog = {
                barcode: fullBarcode,
                productId,
                isBox: isBoxScan,
                increment: actualQty,
                time: new Date().toLocaleTimeString()
            };

            scanHistoryRef.current = [newLog, ...scanHistoryRef.current];
            setScanHistory([...scanHistoryRef.current]);
            
            // 스캔 즉시 체크박스 선택 처리
            setCheckedItems(prev => new Set(prev).add(fullBarcode));

        } catch (error) {
            console.error("스캔 처리 오류:", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: '정보 조회 중 오류가 발생했습니다.',
                onConfirm: closeModal
            });
        }
    };

    const handleRegister = async () => {
        const itemsToProcess = scanHistory.filter(h => checkedItems.has(h.barcode));

        if (itemsToProcess.length === 0) {
            setModal({
                isOpen: true,
                title: '항목 선택',
                message: '등록할 항목을 선택해주세요.',
                onConfirm: closeModal
            });
            return;
        }

        //수정여부확인(창고인지 선반인지)
        if (!selections.rack) {
            setModal({
                isOpen: true,
                title: '선반 선택',
                message: '선반(Rack)를 선택해주세요.',
                onConfirm: closeModal
            });
            return;
        }

        if (window.confirm(`선택한 ${itemsToProcess.length}건을 [${selections.rack}] 위치에 등록하시겠습니까?`)) {
            try {
                let successCount = 0;

                for (const item of itemsToProcess) {
                    const payload = {
                        boxCd: item.barcode,
                        gdsCd: productCd,
                        rackSn: Number(selections.rack), 
                        brandNm: product?.brandNm || '',
                        qty: item.increment 
                    };

                    console.log(`🚀 [${item.barcode}] 전송 시도...`);
                    console.log("📦 Payload:", payload);

                    const response = await fetch(`${SERVER_URL}/ttik/productdetail/inbound/process`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        console.log(`✅ [${item.barcode}] 전송 성공!`);
                        successCount++;
                    } else {
                        const errorText = await response.text();
                        console.error(`❌ [${item.barcode}] 전송 실패:`, response.status, errorText);
                        throw new Error(`${item.barcode} 처리 중 서버 에러 발생`);
                    }
                }

                setModal({
                    isOpen: true,
                    title: 'Success',
                    message: `${successCount}건의 입고 및 적재 처리가 완료되었습니다.`,
                    onConfirm: closeModal
                });

                // 성공 후 상태 업데이트
                const remainingHistory = scanHistory.filter(h => !checkedItems.has(h.barcode));
                setScanHistory(remainingHistory);
                scanHistoryRef.current = remainingHistory;
                setCheckedItems(new Set());

                if (remainingHistory.length === 0) {
                    navigate('/stock/plans', { state: { activeTab: planType } });
                }

            } catch (error) {
                console.error("🏁 최종 등록 실패:", error);
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: "처리 중 오류가 발생했습니다. 콘솔창(F12)의 에러 메시지를 확인해주세요.",
                    onConfirm: closeModal
                });
            }
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
        <>
        <Modal
            {...modal} 
        />
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

                <div className={styles.selectContainer}>
                    <h3 style={{marginBottom:'1rem'}}>🛅 창고 선택</h3>
                    <div className={styles.selectBox}>
                        <select name="storage" value={selections.storage} onChange={handleSelectChange}>
                            <option value="">동</option>
                            {selectOptions.storages?.map(s => (
                                <option key={s.STR_CD} value={s.STR_CD}>{s.STR_NM}</option>
                            ))}
                        </select>

                        <select 
                            name="zone" 
                            value={selections.zone} 
                            onChange={handleSelectChange}
                            disabled={!selections.storage} 
                            style={{ backgroundColor: !selections.storage ? '#f7fafc' : 'white' }} 
                        >
                            <option value="">구역</option>
                            {selectOptions.zones
                                ?.filter(z => {
                                    const storageKey = z.STORAGE_SN || z.STR_CD; 
                                    return !selections.storage || String(storageKey) === String(selections.storage);
                                })
                                .map(z => (
                                    <option key={z.ZONE_SN || z.ZONE_CD} value={z.ZONE_SN || z.ZONE_CD}>
                                        {z.ZONE_NM}
                                    </option>
                                ))
                            }
                        </select>

                        <select 
                            name="rack" 
                            value={selections.rack} 
                            onChange={handleSelectChange}
                            disabled={!selections.zone} 
                            style={{ backgroundColor: !selections.zone ? '#f7fafc' : 'white' }}
                        >
                            <option value="">선반</option>
                            {selectOptions.racks
                                ?.filter(r => {
                                    const zoneKey = r.ZONE_SN || r.ZONE_CD;
                                    return !selections.zone || String(zoneKey) === String(selections.zone);
                                })
                                .map(r => (
                                    <option key={r.RACK_SN || r.RACK_CD} value={r.RACK_SN || r.RACK_CD}>
                                        {r.RACK_NM}
                                    </option>
                                ))
                            }
                        </select>
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
                        <div className={styles.statGrid} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '10px' 
                        }}>
                            <div className={styles.statItem} style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '10px', textAlign: 'center', borderRadius: '8px' }}>
                                <span className={styles.statLabel} style={{display:'block', fontSize:'0.8rem', color:'#666'}}>박스 수</span>
                                <span className={styles.statValue} style={{ color: '#e53e3e', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedBoxCount}</span>
                                <small style={{display:'block'}}>BOX</small>
                            </div>

                            <div className={styles.statItem} style={{ background: '#f0f7ff', border: '1px solid #bee3f8', padding: '10px', textAlign: 'center', borderRadius: '8px' }}>
                                <span className={styles.statLabel} style={{display:'block', fontSize:'0.8rem', color:'#666'}}>선택 총량</span>
                                <span className={styles.statValue} style={{ color: '#3182ce', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedTotalQty}</span>
                                <small style={{display:'block'}}>EA</small>
                            </div>

                            <div className={styles.statItem} style={{ background: '#f0fff4', border: '1px solid #c6f6d5', padding: '10px', textAlign: 'center', borderRadius: '8px' }}>
                                <span className={styles.statLabel} style={{display:'block', fontSize:'0.8rem', color:'#666'}}>지시 예정</span>
                                <span className={styles.statValue} style={{ color: '#38a169', fontSize: '1.5rem', fontWeight: 'bold' }}>{product.stkQty}</span>
                                <small style={{display:'block'}}>EA</small>
                            </div>
                        </div>

                        <div className={styles.progressBarWrapper} style={{ marginTop: '20px', height: '10px', backgroundColor: '#edf2f7', borderRadius: '5px', overflow: 'hidden' }}>
                            <div 
                                className={styles.progressBar} 
                                style={{ 
                                    height: '100%',
                                    width: `${Math.min((selectedTotalQty / (product.stkQty || 1)) * 100, 100)}%`,
                                    backgroundColor: selectedTotalQty === product.stkQty ? '#38a169' : '#3182ce',
                                    transition: 'width 0.3s ease'
                                }}
                            ></div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#718096', marginTop: '5px' }}>
                            진행률: {Math.floor((selectedTotalQty / (product.stkQty || 1)) * 100)}%
                        </div>
                    </div>
                    
                    <button onClick={handleRegister} style={{
                        width: '100%', padding: '15px', marginTop: '20px', 
                        backgroundColor: (checkedItems.size > 0 && selections.rack) ? '#3182ce' : '#a0aec0', 
                        color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', 
                        cursor: (checkedItems.size > 0 && selections.rack) ? 'pointer' : 'not-allowed'
                    }}>
                        📥 선택 항목({checkedItems.size}건) 등록하기
                    </button>
                </div>
            </div>
        </div>
    </>
    );
}

export default StockDetailInbound;