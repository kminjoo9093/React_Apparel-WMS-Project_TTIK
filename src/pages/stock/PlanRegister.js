import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";

const initialFormState = {
    date: '',
    targetName: '', // 입고 시 브랜드SN, 출고 시 거래처SN
    brand: '',      // 출고 시에만 사용
    category: '',
    itemName: '',
    quantity: 0,
    boxQuantity: 0,
    eaQuantity: 0,
    storage: '',
    zone: '',
    rack: ''
};

function PlanRegister({ isOpen, onClose, onRegisterSuccess, currentType }) {
    const [formData, setFormData] = useState(initialFormState);
    const [selectOptions, setSelectOptions] = useState({
        partners: [], brands: [], categories: [], Product: [], storages: [], zones: [], racks: []
    });

    useEffect(() => {
        if (isOpen) {
            const fetchRegisterData = async () => {
                try {
                    const response = await fetch('https://localhost:3001/ttik/register-info');
                    if (response.ok) {
                        const data = await response.json();
                        setSelectOptions(data);
                    }
                } catch (error) {
                    console.error("기초 데이터 로드 실패:", error);
                }
            };
            fetchRegisterData();
            setFormData(initialFormState); // 모달 열릴 때 초기화
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };
            
            // 필터링 조건(입고처, 브랜드, 카테고리) 변경 시 상품명 초기화
            if (['targetName', 'brand', 'category'].includes(name)) {
                nextData.itemName = '';
            }

            if (name === 'boxQuantity' || name === 'eaQuantity') {
                nextData.quantity = Number(nextData.boxQuantity || 0) * Number(nextData.eaQuantity || 0);
            }
            return nextData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
        
        // [보안/디버깅] 데이터가 제대로 채워졌는지 확인
        console.log("제출 데이터:", formData);

        const { itemName, eaQuantity, boxQuantity, targetName, date } = formData;

        // 필수값 검증
        if (!targetName || !itemName || !date || boxQuantity <= 0 || eaQuantity <= 0) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        try {
            // [1] 마지막 박스 번호 확인 (HTTPS)
            // itemName은 현재 상품 코드(GDS_CD)입니다.
            const lastNoRes = await fetch(
                `https://localhost:3001/ttik/last-box-no?itemName=${itemName}&eaQuantity=${eaQuantity}`
            );
            
            if (!lastNoRes.ok) throw new Error("서버로부터 박스 번호를 가져오지 못했습니다.");
            
            const { lastBoxNo } = await lastNoRes.json();

            const boxesData = [];
            let startNo = Number(lastBoxNo || 0);

            // [2] 박스 및 아이템 코드 생성 로직
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

            // [3] 최종 데이터 서버 전송
            const endpoint = currentType === "InBound" ? "inbound" : "outbound";
            const response = await fetch(`https://localhost:3001/ttik/${endpoint}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    // DTO 타입에 맞춰 숫자형으로 변환
                    date: formData.date.substring(0, 10),
                    targetName: Number(targetName),
                    type: currentType === "InBound" ? 0 : 1,
                    generatedBoxes: boxesData
                }),
            });

            if (response.ok) {
                alert(`${currentType === "InBound" ? "입고" : "출고"} 등록이 완료되었습니다.`);
                onRegisterSuccess(); // 부모 컴포넌트 목록 새로고침
                setFormData(initialFormState); // 폼 초기화
                onClose(); // 모달 닫기
            } else {
                const errorData = await response.text();
                alert(`등록 실패: ${errorData}`);
            }
        } catch (error) {
            console.error("등록 에러 상세:", error);
            alert('서버와 통신 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
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

                    {/* 첫 번째 줄: 입고(브랜드) vs 출고(거래처+브랜드) */}
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

                    {/* 두 번째 줄: 카테고리 + 상품명(필터링 적용) */}
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
                                        // 입고 시: targetName(브랜드SN)으로 필터링
                                        // 출고 시: brand(브랜드SN)로 필터링
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

                    {/* 수량 및 창고 정보 (기존과 동일) */}
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

                    <div className={stylePlans.doubleBox}>
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
                    </div>

                    <button type='submit' className={stylePlans.submitBtn}>등록</button>
                </form>
            </div>
        </div>
    );
}

export default PlanRegister;