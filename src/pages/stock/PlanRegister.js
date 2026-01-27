import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";
import serverUrl from "../../db/server.json";


const initialFormState = {
    date: '',
    targetName: '', 
    brand: '',      
    category: '',
    itemName: '',
    untprc: 0,
    quantity: 0,
    boxQuantity: 0,
    eaQuantity: 0,
};

function PlanRegister({ isOpen, onClose, onRegisterSuccess, currentType }) {
    const [formData, setFormData] = useState(initialFormState);
    const [selectOptions, setSelectOptions] = useState({
        partners: [], brands: [], categories: [], Product: [] 
    });
    const SERVER_URL = serverUrl.SERVER_URL;
    useEffect(() => {
        if (isOpen) {
            const fetchRegisterData = async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/ttik/register-info`, {
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
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };

            if (name === 'itemName') {
                const selectedProduct = selectOptions.Product?.find(p => String(p.GDS_CD) === String(value));
                
                // 💡 브라우저 콘솔(F12)에서 실제 어떤 데이터가 들어오는지 확인하는 용도
                console.log("선택된 상품 데이터 전체:", selectedProduct);

                if (selectedProduct) {
                    // 만약 실제 필드명이 UNTPRC가 아니라 PRICE라면 아래를 수정해야 함
                    nextData.untprc = selectedProduct.UNTPRC || selectedProduct.PRICE || 0; 
                } else {
                    nextData.untprc = 0;
                }
            }
                        
            // ✅ [추가] 상품 선택 시 단가(UNTPRC)를 자동으로 찾아 formData에 할당
            if (name === 'itemName') {
                const selectedProduct = selectOptions.Product?.find(p => String(p.GDS_CD) === String(value));
                if (selectedProduct) {
                    nextData.untprc = selectedProduct.UNTPRC || 0; // DB 컬럼명에 맞춰 확인 필요
                } else {
                    nextData.untprc = 0;
                }
            }

            // 필터링 조건 변경 시 상품명 및 단가 초기화
            if (['targetName', 'brand', 'category'].includes(name)) {
                nextData.itemName = '';
                nextData.untprc = 0; // ✅ 단가도 함께 초기화
            }

            if (name === 'boxQuantity' || name === 'eaQuantity') {
                nextData.quantity = Number(nextData.boxQuantity || 0) * Number(nextData.eaQuantity || 0);
            }
            return nextData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        console.log("제출 데이터:", formData);

        const { itemName, eaQuantity, boxQuantity, targetName, date, untprc } = formData;

        // 필수값 검증 (untprc가 NOT NULL이므로 검증에 추가 권장)
        if (!targetName || !itemName || !date || boxQuantity <= 0 || eaQuantity <= 0) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        try {
            const lastNoRes = await fetch(
                `${SERVER_URL}/ttik/last-box-no?itemName=${itemName}&eaQuantity=${eaQuantity}`, {
                method: 'GET',
                credentials: 'include'
            }); 
            
            if (!lastNoRes.ok) throw new Error("서버로부터 박스 번호를 가져오지 못했습니다.");
            
            const { lastBoxNo } = await lastNoRes.json();

            const boxesData = [];
            let startNo = Number(lastBoxNo || 0);

            for (let i = 1; i <= Number(boxQuantity); i++) {
                const currentBoxNo = startNo + i;
                const boxCode = `${itemName}-b${eaQuantity}-${currentBoxNo}`;
                const itemCodes = [];
                for (let j = 1; j <= Number(eaQuantity); j++) {
                    itemCodes.push(`${boxCode}-${j}`);
                }
                boxesData.push({
                    boxCode: boxCode,
                    boxNo: currentBoxNo,
                    itemCodes: itemCodes
                });
            }

            const endpoint = currentType === "InBound" ? "inbound" : "outbound";
            const response = await fetch(`${SERVER_URL}/ttik/${endpoint}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    date: formData.date.substring(0, 10),
                    targetName: Number(targetName),
                    type: currentType === "InBound" ? 0 : 1,
                    generatedBoxes: boxesData,
                    untprc: Number(untprc) // ✅ 명시적으로 숫자형으로 전송
                }),
            });

            if (response.ok) {
                alert(`${currentType === "InBound" ? "입고" : "출고"} 등록이 완료되었습니다.`);
                onRegisterSuccess(); 
                setFormData(initialFormState); 
                onClose(); 
            } else {
                const errorData = await response.text();
                alert(`등록 실패: ${errorData}`);
            }
        } catch (error) {
            console.error("등록 에러 상세:", error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={stylePlans.modalOverlay}>
            <div className={stylePlans.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={stylePlans.closeBtn} onClick={onClose}>&times;</button>
                <h2>{currentType === "InBound" ? "입고 일정 등록" : "출고 일정 등록"}</h2>
                
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
                                <select name="brand" value={formData.brand} onChange={handleChange}>
                                    <option value="">브랜드 선택</option>
                                    {selectOptions.brands?.map(b => (
                                        <option key={b.PARTNER_SN} value={b.PARTNER_SN}>{b.PARTNER_NM}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={stylePlans.doubleBox}>
                        <div className={stylePlans.inputBox}>
                            <label>카테고리</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="">전체</option>
                                {selectOptions.categories?.map(c => (
                                    <option key={c.CATE_CD} value={c.CATE_CD}>{c.CATE_NM}</option>
                                ))}
                            </select>
                        </div>
                        <div className={stylePlans.inputBoxL}>
                            <label>상품명</label>
                            <select name="itemName" value={formData.itemName} onChange={handleChange} required>
                                <option value="">상품 선택</option>
                                {selectOptions.Product
                                    ?.filter(item => {
                                        const filterBrandSN = currentType === "InBound" ? formData.targetName : formData.brand;
                                        const matchBrand = !filterBrandSN || String(item.BRAND_SN) === String(filterBrandSN);
                                        const matchCategory = !formData.category || String(item.GDS_CAT_CD) === String(formData.category);
                                        return matchBrand && matchCategory;
                                    })
                                    .map((i, index) => (
                                        <option key={i.GDS_CD || index} value={i.GDS_CD}>{i.GDS_NM}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className={stylePlans.modalItem}>
                        <label>단가(자동입력)</label>
                        <input 
                            name="untprc" 
                            type="text" 
                            value={Number(formData.untprc).toLocaleString() + " 원"} 
                            readOnly 
                            style={{textAlign: 'right'}}
                        />
                    </div>

                    <div className={stylePlans.doubleBox}>
                        <div className={stylePlans.inputBox}>
                            <label>상자수량(Box)</label>
                            <input name="boxQuantity" type="number" value={formData.boxQuantity} onChange={handleChange} required />
                        </div>
                        <div className={stylePlans.inputBoxL}>
                            <label>입수량(EA)</label>
                            <input name="eaQuantity" type="number" value={formData.eaQuantity} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* <div className={stylePlans.doubleBox}>
                        <div className={stylePlans.inputBox}>
                            <label>창고</label>
                            <select name="storage" value={formData.storage} onChange={handleChange}>
                                <option value="">선택</option>
                                {selectOptions.storages?.map(s => <option key={s.STR_CD} value={s.STR_CD}>{s.STR_NM}</option>)}
                            </select>
                        </div>
                        <div className={stylePlans.inputBoxL}>
                            <label>구역</label>
                            <select name="zone" value={formData.zone} onChange={handleChange}>
                                <option value="">선택</option>
                                {selectOptions.zones?.map(z => <option key={z.ZONE_CD} value={z.ZONE_CD}>{z.ZONE_NM}</option>)}
                            </select>
                        </div>
                        <div className={stylePlans.inputBoxL}>
                            <label>선반</label>
                            <select name="rack" value={formData.rack} onChange={handleChange}>
                                <option value="">선택</option>
                                {selectOptions.racks?.map(r => <option key={r.RACK_CD} value={r.RACK_CD}>{r.RACK_NM}</option>)}
                            </select>
                        </div>
                    </div> */}

                    <button type='submit' className={stylePlans.submitBtn}>등록</button>
                </form>
            </div>
        </div>
    );
}

export default PlanRegister;