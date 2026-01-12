import React, { useState } from 'react'; // useState 추가
import stylePlans from "../../css/plarns.module.css";

function PlanRegister({ isOpen, onClose, onRegisterSuccess, currentType }) {
    const [formData, setFormData] = useState({
        date: '',
        targetName: '',
        itemName: '',
        quantity: 0,
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const typeCode = currentType === "InBound" ? 0 : 1;
        const endpoint = currentType === "InBound" ? "inbound" : "outbound";

        try {
            const response = await fetch(`http://localhost:3001/ttik/${endpoint}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: typeCode,
                    quantity: Number(formData.quantity)
                }),
            });

            if (response.ok) {
                alert(`${currentType === "InBound" ? "입고" : "출고"} 일정이 등록되었습니다.`);
                onRegisterSuccess();
                onClose();
            } else {
                throw new Error('등록 실패');
            }
        } catch (error) {
            console.error("등록 중 에러:", error);
            alert('등록에 실패했습니다.');
        }
    };

    return (
        <div className={stylePlans.modalOverlay} onClick={onClose}>
            <div className={stylePlans.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={stylePlans.closeBtn} onClick={onClose}>&times;</button>
                
                <h2>{currentType === "InBound" ? "입고 일정 등록" : "출고 일정 등록"}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={stylePlans.modalItem}>
                        <label>예정일</label>
                        <input 
                            name="date"
                            className={stylePlans.inputBox} 
                            type='date' 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className={stylePlans.modalItem}>
                        <label>{currentType === "InBound" ? "입고처" : "출고처"}</label>
                        <select 
                            name="targetName"
                            className={stylePlans.inputBox}
                            placeholder="거래처명을 입력하세요"
                            onChange={handleChange}
                        />
                    </div>

                    <div className={stylePlans.modalItem}>
                        <label>상품명</label>
                        <select 
                            name="itemName"
                            className={stylePlans.inputBox}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className={stylePlans.modalItem}>
                        <label>수량</label>
                        <input 
                            name="quantity"
                            className={stylePlans.inputBox} 
                            type='number' 
                            onChange={handleChange}
                        />
                    </div>

                    <button type='submit' className={stylePlans.submitBtn}>등록</button>
                </form>
            </div>
        </div>
    );
}

export default PlanRegister;