import React, { useState } from 'react';
import BrnadRegister from '../Brand/BrandRegister';
import styleBrand from "../../css/Brand.module.css";

function BrnadList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="container">
            <div className={styleBrand.brandContainer}>
                <button onClick={() => setIsModalOpen(true)}>브랜드 등록</button>

                {/* 모달 컴포넌트 호출 */}
                <BrnadRegister 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>


        </div>
    );
}

export default BrnadList;