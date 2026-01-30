import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styleLogin from '../../css/Login.module.css';
import Modal from '../../components/Modal';
import serverUrl from "../../db/server.json";

const Login = ({ setUser, setIsLoggedIn }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isAltSlogan, setIsAltSlogan] = useState(false);
  const navigate = useNavigate();
  const SERVER_URL = serverUrl.SERVER_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSlogan = () => setIsAltSlogan(!isAltSlogan);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    params.append('mngrId', formData.id);
    params.append('mngrPswd', formData.password);

    try {
      // 1️⃣ 로그인 요청
      const response = await fetch(`${SERVER_URL}/ttik/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        credentials: 'include', // ✅ 쿠키 포함
      });

      if (!response.ok) {
        // 로그인 실패
        setModal({
          isOpen: true,
          title: response.status === 401 ? '로그인 실패' : '서버 오류',
          message: response.status === 401
            ? '아이디 또는 비밀번호가 일치하지 않습니다.'
            : '로그인 중 서버 오류가 발생했습니다.',
          onConfirm: closeModal
        });
        return;
      }

      // 2️⃣ 로그인 성공 → /ttik/me 호출
      const meResponse = await fetch(`${SERVER_URL}/ttik/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!meResponse.ok) {
        setModal({
          isOpen: true,
          title: '유저 정보 오류',
          message: '로그인 후 사용자 정보를 불러오지 못했습니다.',
          onConfirm: closeModal
        });
        return;
      }

      const userData = await meResponse.json();

      // 3️⃣ 로그인 성공 모달
      setModal({
        isOpen: true,
        title: '환영합니다',
        message: `${userData.nickname || userData.mngrId}님, 환영합니다.`,
        onConfirm: () => {
          setUser(userData);
          setIsLoggedIn(true);
          navigate("/ttik");
        }
      });

    } catch (error) {
      console.error("네트워크 에러:", error);
      setModal({
        isOpen: true,
        title: '네트워크 오류',
        message: '서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
        onConfirm: closeModal
      });
    }
  };

  return (
    <>
      <Modal {...modal} />
      <div className={styleLogin.modernLoginContainer}>
        <div className={styleLogin.loginGlassCard}>
          <div className={styleLogin.loginBrandSection}>
            <div className={styleLogin.brandLogoLarge}>TTIK</div>
            <div className={styleLogin.brandContent}>
              <div className={styleLogin.sloganWrapper} onClick={toggleSlogan}>
                <div className={`${styleLogin.sloganShifter} ${isAltSlogan ? styleLogin.shifted : ''}`}>
                  <div className={`${styleLogin.sloganItem} ${styleLogin.sloganItemMain}`}>
                    Tap To Inventory Keeping
                  </div>
                  <div className={`${styleLogin.sloganItem} ${styleLogin.sloganItemAlt}`}>
                    Time To Inventory Keep
                  </div>
                </div>
              </div>
              <p className={styleLogin.subText}>스마트한 재고 관리의 시작, 띡</p>
            </div>
            <div className={styleLogin.visualElements}>
              <div className={styleLogin.floatingBox}>📦</div>
              <div className={styleLogin.floatingBox}>📦</div>
              <div className={styleLogin.floatingBox}>📦</div>
            </div>
          </div>
          <div className={styleLogin.loginFormSection}>
            <div className={styleLogin.formHeader}>
              <h3>Login</h3>
            </div>
            <form className={styleLogin.modernForm} onSubmit={handleSubmit}>
              <div className={styleLogin.inputField}>
                <label>아이디</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  placeholder="ID"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styleLogin.inputField}>
                <label>비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className={styleLogin.loginSubmitBtn}>접속하기</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
