import { useState } from 'react';
import style from '../../css/Register.module.css';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import serverUrl from "../../db/server.json"

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    role: 'ADMIN',
    storage: [] // 선택된 창고 번호들을 담을 배열
  });

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const navigate = useNavigate();
  const SERVER_URL = serverUrl.SERVER_URL;


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 체크박스 변경 핸들러
  const handleStorageChange = (e) => {
    const { value, checked } = e.target;
    let newStorage = [...formData.storage];

    if (checked) {
      newStorage.push(value); 
    } else {
      newStorage = newStorage.filter((item) => item !== value); 
    }
    
    newStorage.sort();
    setFormData({ ...formData, storage: newStorage });
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  // 비밀번호 일치 확인
  if (formData.password !== formData.confirmPassword) {
    setModal({
      isOpen: true,
      title: 'Input Error',
      message: '비밀번호가 일치하지 않습니다.',
      onConfirm: closeModal
    });
    return;
  }

  // 창고 선택 여부 확인
  if (formData.storage.length === 0) {
    setModal({
      isOpen: true,
      title: 'Input Error',
      message: '최소 하나 이상의 담당 창고를 선택해주세요.',
      onConfirm: closeModal
    });
    return;
  }

  // 백엔드 엔티티 구조에 맞게 데이터 변환
  const submitData = {
    mngrId: formData.id,                
    mngrPswd: formData.password,        
    nickname: formData.nickname,        
    tkcgStorage: formData.storage.join(', ') 
  };

  try {
    const response = await fetch(`${SERVER_URL}/ttik/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
      credentials: 'include', 
    });

    if (response.ok) {
      setModal({
        isOpen: true,
        title: 'Registration Success',
        message: `${submitData.nickname} 관리자 등록이 완료되었습니다.`,
        onConfirm: () => {
          closeModal();
          navigate('/ttik'); 
        }
      });
    } else {
      const errorMsg = await response.text();
      throw new Error(errorMsg || '등록 중 오류가 발생했습니다.');
    }
  } catch (error) {
    setModal({
      isOpen: true,
      title: 'Registration Failed',
      message: error.message,
      onConfirm: closeModal
    });
  }
};

  return (
    <div className={style.container}>
      <Modal {...modal} />
      
      <div className={style.card}>
        <div className={style.header}>
          <h2>신규 관리자 등록</h2>
          <p>시스템에 접근할 새로운 관리자 계정을 생성합니다.</p>
        </div>

        <form onSubmit={handleRegister} className={style.form}>
          <div className={style.inputGroup}>
            <label>관리자 닉네임(담당창고+관리자)</label>
            <input type="text" name="nickname" placeholder="ex)1창고 관리자" onChange={handleChange} required />
          </div>

          <div className={style.inputGroup}>
            <label>관리자 ID</label>
            <input type="text" name="id" placeholder="접속 아이디를 설정하세요" onChange={handleChange} required />
          </div>

          <div className={style.inputGroup}>
            <label>비밀번호</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className={style.inputGroup}>
            <label>비밀번호 확인</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className={`${style.inputGroup} ${style.fullWidth}`}>
            <label>담당 창고 선택</label>
            <div className={style.checkboxContainer}>
              {[1, 2, 3, 4].map((num) => (
                <label key={num} className={style.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={num}
                    checked={formData.storage.includes(String(num))}
                    onChange={handleStorageChange}
                  />
                  <span>{num}번 창고</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className={style.submitBtn}>계정 생성하기</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;