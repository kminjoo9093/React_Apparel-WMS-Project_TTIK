import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from "html5-qrcode";
import serverUrl from "../../db/server.json";
import styles from "../../css/StockDetail.module.css"; 
import Modal from '../../components/Modal';

function StockDetail() {
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
        console.log(location.state?.type);
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
                // PlanRegister에서 사용했던 기초정보 API와 동일한 엔드포인트
                // const response = await fetch(`${SERVER_URL}/ttik/register-info`); - 수정
                const response = await fetch(`${SERVER_URL}/ttik/plans/register-info`);
                if (response.ok) {
                    const data = await response.json();
                    setSelectOptions(data); // storages, zones, racks가 한꺼번에 저장됨
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

    // 화면 표시용 
    const selectedTotalQty = scanHistory
        .filter(h => checkedItems.has(h.barcode))
        .reduce((sum, h) => sum + h.increment, 0);
    
    // 선택된 항목들 중 박스 스캔 횟수 계산
    const selectedBoxCount = scanHistory
        .filter(h => checkedItems.has(h.barcode) && h.isBox).length;

    // 선택된 항목들 중 낱개 스캔 횟수 계산 
    // const selectedSingleCount = scanHistory
    //     .filter(h => checkedItems.has(h.barcode) && !h.isBox).length;

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

        const boxMatch = fullBarcode.match(/^(.*)-B(\d+)-(\d+)(?:-(\d+))?$/);
        
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
        if (productId !== productCd) {
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
        playBeep();
        
        const newLog = {
            barcode: fullBarcode,
            productId,
            isBox: isBoxScan,
            increment: incrementValue,
            time: new Date().toLocaleTimeString()
        };

        scanHistoryRef.current = [newLog, ...scanHistoryRef.current];
        setScanHistory([...scanHistoryRef.current]);
        setCheckedItems(prev => new Set(prev).add(fullBarcode));
    };


    const handleRegister = () => {
        if (checkedItems.size === 0) {
            setModal({
                isOpen: true,
                title: '항목 선택',
                message: '등록할 항목을 선택해주세요.',
                onConfirm: closeModal
            });
            return;
        }

        //창고 선택 확인
        if (!selections.storage) {
            setModal({
                isOpen: true,
                title: '창고 선택',
                message: '창고(Storage)를 선택해주세요.',
                onConfirm: closeModal
            });
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
                        {/* 창고(Storage) */}
                        <select name="storage" value={selections.storage} onChange={handleSelectChange}>
                            <option value="">동</option>
                            {selectOptions.storages?.map(s => (
                                <option key={s.STR_CD} value={s.STR_CD}>{s.STR_NM}</option>
                            ))}
                        </select>

                        {/* 1. 구역(Zone) - '동'이 선택되지 않았을 때 비활성화 */}
                        <select 
                            name="zone" 
                            value={selections.zone} 
                            onChange={handleSelectChange}
                            disabled={!selections.storage} // storage 값이 없으면 클릭 불가
                            style={{ backgroundColor: !selections.storage ? '#f7fafc' : 'white' }} // 비활성화 시 색상 변경(선택)
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

                        {/* 2. 선반(Rack) - '구역'이 선택되지 않았을 때 비활성화 */}
                        <select 
                            name="rack" 
                            value={selections.rack} 
                            onChange={handleSelectChange}
                            disabled={!selections.zone} // zone 값이 없으면 클릭 불가
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
                            {/* 박스 수량 */}
                            <div className={styles.statItem} style={{ background: '#fff5f5', border: '1px solid #feb2b2' }}>
                                <span className={styles.statLabel}>박스 수</span>
                                <span className={styles.statValue} style={{ color: '#e53e3e' }}>{selectedBoxCount}</span>
                                <small>BOX</small>
                            </div>

                            {/* 선택 총 수량 (낱개 합산) */}
                            <div className={styles.statItem} style={{ background: '#f0f7ff', border: '1px solid #bee3f8' }}>
                                <span className={styles.statLabel}>선택 총량</span>
                                <span className={styles.statValue} style={{ color: '#3182ce' }}>{selectedTotalQty}</span>
                                <small>EA</small>
                            </div>

                            {/* 지시 예정량 (총 수량) */}
                            <div className={styles.statItem} style={{ background: '#f0fff4', border: '1px solid #c6f6d5' }}>
                                <span className={styles.statLabel}>지시 예정</span>
                                <span className={styles.statValue} style={{ color: '#38a169' }}>{product.stkQty}</span>
                                <small>EA</small>
                            </div>
                        </div>

                        {/* 진행률 바 */}
                        <div className={styles.progressBarWrapper} style={{ marginTop: '20px' }}>
                            <div 
                                className={styles.progressBar} 
                                style={{ 
                                    width: `${Math.min((selectedTotalQty / (product.stkQty || 1)) * 100, 100)}%`,
                                    backgroundColor: selectedTotalQty === product.stkQty ? '#38a169' : '#3182ce'
                                }}
                            ></div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#718096', marginTop: '5px' }}>
                            진행률: {Math.floor((selectedTotalQty / (product.stkQty || 1)) * 100)}%
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
    </>
    );
}

export default StockDetail;