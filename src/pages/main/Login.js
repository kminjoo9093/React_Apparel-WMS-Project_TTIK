import { useState } from 'react';
import styleLogin from '../../css/Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  // 슬로건 토글 상태 관리
  const [isAltSlogan, setIsAltSlogan] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSlogan = () => {
    setIsAltSlogan(!isAltSlogan);
  };

  return (
   <div className={styleLogin.modernLoginContainer}>
      <div className={styleLogin.loginGlassCard}>
        <div className={styleLogin.loginBrandSection}>
          <div className={styleLogin.brandLogoLarge}>TTIK</div>
          
          <div className={styleLogin.brandContent}>
            {/* 매끄러운 전환을 위한 슬로건 컨테이너 */}
            <div className={styleLogin.sloganWrapper} onClick={toggleSlogan}>
              <div className={`${styleLogin.sloganShifter} ${isAltSlogan ? styleLogin.shifted : ''}`}>
                <div className={styleLogin.sloganItemMain}>Tap To Inventory Keeping</div>
                <div className={styleLogin.sloganItemAlt}>Time To Inventory Keep</div>
              </div>
            </div>
            <p className={styleLogin.subText}>스마트한 재고 관리의 시작, <br/>TTIK 대시보드에 접속하세요.</p>
          </div>

          <div className={styleLogin.visualElements}>
            <div className={styleLogin.floatingBox}>📦</div>
            <div className={styleLogin.floatingBox}>📦</div>
            <div className={styleLogin.floatingBox}>📦</div>
          </div>
        </div>

        {/* 우측: 로그인 폼 구역 */}
        <div className={styleLogin.loginFormSection}>
          <div className={styleLogin.form-header}>
            <h3>Login</h3>
            <p>관리자 계정으로 접속하세요.</p>
          </div>
          
          <form className={styleLogin.modernForm}>
            <div className={styleLogin.input-field}>
              <label>아이디</label>
              <input type="text" name="id" placeholder="ID" onChange={handleChange} />
            </div>
            <div className={styleLogin.input-field}>
              <label>비밀번호</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} />
            </div>
            <button type="submit" className={styleLogin.loginSubmitBtn}>접속하기</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;