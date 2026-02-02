import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";
import serverUrlData from "../../db/server.json";
import Modal from '../../components/Modal';

const initialFormState = {
    date: '',
    targetName: '', 
    brand: '',      
    category: '',
    itemName: '',
    untprc: 0,
    quantity: 0,
    boxQuantity: 0, // 입고 시 사용
    eaQuantity: 0,  // 입고 시: 입수량, 출고 시: 출고수량
    boxCode: '',    // 출고 시: 선택된 박스 코드
    currentStock: 0 // 출고 시: 선택된 박스의 실제 재고
};

function PlanRegister({ isOpen, onClose, onRegisterSuccess, currentType }) {
    const [formData, setFormData] = useState(initialFormState);
    const [selectOptions, setSelectOptions] = useState({
        partners: [], brands: [], categories: [], Product: [] 
    });
    const [availableBoxes, setAvailableBoxes] = useState([]); // 출고 가능 박스 목록
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    const SERVER_URL = serverUrlData.SERVER_URL; 

    // 기초 데이터 로드
    useEffect(() => {
        if (isOpen) {
            const fetchRegisterData = async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/ttik/plans/register-info`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSelectOptions(data);
                    }
                } catch (error) {
                    console.error("기초 데이터 로드 실패:", error);
                }
            };
            fetchRegisterData();
            setFormData(initialFormState);
            setAvailableBoxes([]);
        }
    }, [isOpen, SERVER_URL]);

    // [출고 전용] 상품 선택 시 해당 상품이 들어있는 박스 리스트 가져오기
    useEffect(() => {
        if (currentType === "OutBound" && formData.itemName) {
            const fetchBoxes = async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/ttik/plans/available-boxes?gdsCd=${formData.itemName}`, {
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json(); // [{boxCd: '...', stock: 10}, ...]
                        setAvailableBoxes(data);
                    }
                } catch (e) { console.error("박스 로드 실패", e); }
            };
            fetchBoxes();
        }
    }, [formData.itemName, currentType, SERVER_URL]);

    if (!isOpen) return null;

    const isBrandSelected = currentType === "InBound" ? !!formData.targetName : !!formData.brand;

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            let nextData = { ...prev, [name]: value };

            // 브랜드 변경 시 하위 항목 초기화
            if (name === 'targetName' || name === 'brand') {
                nextData.category = '';
                nextData.itemName = '';
                nextData.untprc = 0;
                nextData.boxCode = '';
                nextData.currentStock = 0;
            }

            // 상품 선택 시 단가 매칭 및 박스 정보 초기화 + 입수량 기본값 세팅
            if (name === 'itemName') {
                const selectedProduct = selectOptions.Product?.find(
                    p => String(p.GDS_CD) === String(value)
                );

                nextData.untprc = selectedProduct ? (selectedProduct.UNTPRC || 0) : 0;
                nextData.boxCode = '';
                nextData.currentStock = 0;

                // ⭐ 입고일 때만 INBOX_QTY를 eaQuantity 기본값으로 세팅
                if (currentType === "InBound") {
                    nextData.eaQuantity = selectedProduct?.INBOX_QTY ?? 1;
                }
            }

            // [출고] 박스 선택 시 해당 박스 재고 업데이트
            if (name === 'boxCode') {
                const selectedBox = availableBoxes.find(b => b.boxCd === value);
                nextData.currentStock = selectedBox ? selectedBox.stock : 0;
                nextData.eaQuantity = 0; // 박스 변경 시 입력 수량 초기화
            }

            // 총 수량 자동 계산
            if (currentType === "InBound") {
                const bQty = name === 'boxQuantity' ? Number(value) : Number(prev.boxQuantity);
                const eQty = name === 'eaQuantity' ? Number(value) : Number(prev.eaQuantity);
                nextData.quantity = bQty * eQty;
            } else {
                nextData.quantity = name === 'eaQuantity' ? Number(value) : Number(prev.eaQuantity);
            }

            return nextData;
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. 출고 시 수량 유효성 검사
        if (currentType === "OutBound") {
            if (!formData.boxCode) { 
                setModal({
                    isOpen: true,
                    title: 'Select',
                    message: '출고할 박스를 선택해주세요.',
                    onConfirm: closeModal
                });
                return; 
            }
            if (formData.eaQuantity > formData.currentStock) {
                setModal({
                    isOpen: true,
                    title: 'Warning',
                    message: `선택한 박스의 재고(${formData.currentStock}EA)를 초과할 수 없습니다.`,
                    onConfirm: closeModal
                });
                return;
            }
        }

        try {
            let boxesData = [];
            
            if (currentType === "InBound") {
                // 2. [입고] 마지막 박스 번호 조회
                const lastNoRes = await fetch(
                    `${SERVER_URL}/ttik/plans/last-box-no?itemName=${formData.itemName}&eaQuantity=${formData.eaQuantity}`,
                    { credentials: 'include' }
                );
                
                if (!lastNoRes.ok) throw new Error("박스 번호 조회 실패");
                const { lastBoxNo } = await lastNoRes.json();
                let startNo = Number(lastBoxNo || 0);
                console.log(formData.boxQuantity,"확인");
                console.log(startNo,"스타트넘버11");

                // 3. [입고] 박스 및 아이템 코드 생성 규칙 적용
                for (let i = 1; i <= Number(formData.boxQuantity); i++) {
                    const currentBoxNo = startNo + i;
                    const boxCode = `${formData.itemName}-B${formData.eaQuantity}-${currentBoxNo}`;
                    console.log(startNo,"스타트넘버22");
                    console.log(boxCode,"박스코드");
                    console.log(formData.itemName,"아이템이름");
                    console.log(formData.eaQuantity,"수량");
                    console.log(currentBoxNo,"박스넘버");
                    const itemCodes = [];
                    for (let j = 1; j <= Number(formData.eaQuantity); j++) {
                        itemCodes.push(`${boxCode}-${j}`);
                    }
                    boxesData.push({ boxCode, itemCodes });
                }
            } else {
                // 4. [출고] 선택된 박스 정보 담기
                boxesData = [{ boxCode: formData.boxCode, eaQuantity: formData.eaQuantity }];
            }

            // 5. 서버 전송용 데이터 구성 (gdsCd 추가 수정)
            const payload = { 
                ...formData, 
                gdsCd: formData.itemName, // 💡 itemName에 담긴 상품 코드를 gdsCd 필드로 전달
                type: currentType === "InBound" ? 0 : 1,
                date: formData.date.substring(0, 10),
                targetName: Number(formData.targetName),
                generatedBoxes: boxesData 
            };

            const endpoint = currentType === "InBound" ? "inbound" : "outbound";

            const response = await fetch(`${SERVER_URL}/ttik/plans/${endpoint}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                setModal({
                    isOpen: true,
                    title: 'Register',
                    message: `${currentType === "InBound" ? "입고" : "출고"} 등록이 완료되었습니다.`,
                    onConfirm: closeModal
                });
                onRegisterSuccess(); 
                onClose();
            } else {
                const errorData = await response.text();
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: `등록 실패: ${errorData}`,
                    onConfirm: closeModal
                });
            }
        } catch (error) { 
            console.error("등록 중 에러:", error);
            setModal({
                    isOpen: true,
                    title: 'Error',
                    message: '서버와 통신 중 오류가 발생했습니다.',
                    onConfirm: closeModal
                });
        }
    };

    return (
        <>
        <div className={stylePlans.modalOverlay}>
            <div className={stylePlans.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={stylePlans.closeBtn} onClick={onClose}>&times;</button>
                <h2>{currentType === "InBound" ? "📦 입고 일정 등록" : "🚚 출고 일정 등록"}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={stylePlans.modalItem}>
                        <label>예정일</label>
                        <input name="date" value={formData.date} type='date' onChange={handleChange} required />
                    </div>

                    <div className={stylePlans.doubleBox}>
                        <div className={stylePlans.inputBox}>
                            <label>{currentType === "InBound" ? "브랜드(입고처)" : "출고처(거래처)"}</label>
                            <select name="targetName" value={formData.targetName} onChange={handleChange} required>
                                <option value="">선택하세요</option>
                                {currentType === "InBound" 
                                    ? selectOptions.brands?.map(b => <option key={b.PARTNER_SN} value={b.PARTNER_SN}>{b.PARTNER_NM}</option>)
                                    : selectOptions.partners?.map(p => <option key={p.PARTNER_SN} value={p.PARTNER_SN}>{p.PARTNER_NM}</option>)
                                }
                            </select>
                        </div>
                        {currentType !== "InBound" && (
                            <div className={stylePlans.inputBoxL}>
                                <label>브랜드</label>
                                <select name="brand" value={formData.brand} onChange={handleChange} required disabled={!formData.targetName}>
                                    <option value="">브랜드 선택</option>
                                    {selectOptions.brands?.map(b => <option key={b.PARTNER_SN} value={b.PARTNER_SN}>{b.PARTNER_NM}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={stylePlans.doubleBox}>
                        <div className={stylePlans.inputBox}><label>카테고리</label>
                            <select name="category" value={formData.category} onChange={handleChange} disabled={!isBrandSelected}>
                                <option value="">전체</option>
                                {selectOptions.categories?.map(c => <option key={c.CATE_CD} value={c.CATE_CD}>{c.CATE_NM}</option>)}
                            </select>
                        </div>
                        <div className={stylePlans.inputBoxL}><label>상품명</label>
                            <select name="itemName" value={formData.itemName} onChange={handleChange} required disabled={!isBrandSelected}>
                                <option value="">상품 선택</option>
                                {selectOptions.Product?.filter(item => {
                                    const filterSN = currentType === "InBound" ? formData.targetName : formData.brand;
                                    return (!filterSN || String(item.BRAND_SN) === String(filterSN)) && (!formData.category || String(item.GDS_CAT_CD) === String(formData.category));
                                }).map(i => <option key={i.GDS_CD} value={i.GDS_CD}>{i.GDS_NM}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={stylePlans.modalItem}>
                        <label>단가(자동입력)</label>
                        <input name="untprc" type="text" value={Number(formData.untprc).toLocaleString() + " 원"} readOnly style={{textAlign: 'right', backgroundColor: '#f5f5f5'}} />
                    </div>

                    {currentType === "InBound" ? (
                        <div className={stylePlans.doubleBox}>
                            <div className={stylePlans.inputBox}>
                                <label>상자수량(Box)</label>
                                <input name="boxQuantity" type="number" value={formData.boxQuantity} onChange={handleChange} required min="1" />
                            </div>
                            <div className={stylePlans.inputBoxL}>
                                <label>입수량(EA)</label>
                                <input name="eaQuantity" type="number" value={formData.eaQuantity} onChange={handleChange} required min="1" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={stylePlans.modalItem}>
                                <label>출고 박스 선택</label>
                                <select name="boxCode" value={formData.boxCode} onChange={handleChange} required disabled={!formData.itemName}>
                                    <option value="">박스 코드를 선택하세요</option>
                                    {availableBoxes.map(box => (
                                        <option key={box.boxCd} value={box.boxCd}>{box.boxCd}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={stylePlans.modalItem}>
                                <label>출고량(EA)</label>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <input 
                                        name="eaQuantity" 
                                        type="number" 
                                        value={formData.eaQuantity} 
                                        onChange={handleChange} 
                                        required 
                                        min="1" 
                                        max={formData.currentStock} 
                                        style={{flex: 1}}
                                        placeholder="수량 입력"
                                    />
                                    <span style={{color: '#007bff', fontWeight: 'bold', fontSize: '0.9em', whiteSpace: 'nowrap'}}>
                                        재고: {formData.currentStock} EA
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className={stylePlans.modalItem} style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                        <label>총 예정 수량: <strong style={{color: '#e74c3c'}}>{formData.quantity.toLocaleString()} EA</strong></label>
                    </div>

                    <button type='submit' className={stylePlans.submitBtn}>등록하기</button>
                </form>
            </div>
        </div>
        <Modal
            {...modal} 
        />
        </>
    );
}

export default PlanRegister;