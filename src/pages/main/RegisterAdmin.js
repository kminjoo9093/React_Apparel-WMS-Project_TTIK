import { useState } from 'react';
import style from '../../css/RegisterAdmin.module.css';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import serverUrl from "../../db/server.json"

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    storage: '', 
    monitorStorage: '' 
  });

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const navigate = useNavigate();
  const SERVER_URL = serverUrl.SERVER_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStorageChange = (e) => {
    setFormData({ ...formData, storage: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setModal({
        isOpen: true,
        title: 'Input Error',
        message: '비밀번호가 일치하지 않습니다.',
        onConfirm: closeModal
      });
      return;
    }

    if (!formData.storage) {
      setModal({
        isOpen: true,
        title: 'Input Error',
        message: '담당 권한을 선택해주세요.',
        onConfirm: closeModal
      });
      return;
    }

    if (formData.storage === 'MONITOR' && !formData.monitorStorage) {
      setModal({
        isOpen: true,
        title: 'Input Error',
        message: '모니터링할 창고 이름을 입력해주세요.',
        onConfirm: closeModal
      });
      return;
    }

    const submitData = {
      mngrId: formData.id,
      mngrPswd: formData.password,
      nickname: formData.nickname,
      tkcgStorage: formData.storage === 'MONITOR' ? formData.monitorStorage : formData.storage
    };

    try {
      const response = await fetch(`${SERVER_URL}/ttik/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          title: 'Success',
          message: `${submitData.nickname} 등록이 완료되었습니다.`,
          onConfirm: () => {
            closeModal();
            navigate('/ttik');
          }
        });
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || '등록 오류가 발생했습니다.');
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: 'Failed',
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
            <label>관리자 닉네임</label>
            <input type="text" name="nickname" placeholder="ex) 사무실 관리자 / 창고 이용자" onChange={handleChange} required />
          </div>

          <div className={style.inputGroup}>
            <label>관리자 ID</label>
            <input type="text" name="id" placeholder="ID를 설정하세요" onChange={handleChange} required />
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
            <label>담당 권한 설정</label>
            <div className={style.checkboxContainer}>
              {[
                { id: 'ALL', label: '전체 관리자 (ALL)' },
                { id: 'U', label: '이용자' },
                { id: 'MONITOR', label: '모니터용' }, // 모니터용 추가
              ].map((opt) => (
                <label key={opt.id} className={style.checkboxLabel}>
                  <input
                    type="radio"
                    name="storageOption"
                    value={opt.id}
                    className={style.customRadio}
                    checked={formData.storage === opt.id}
                    onChange={handleStorageChange}
                  />
                  <span className={style.checkmark}></span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 모니터용 선택 시 나타나는 추가 입력창 */}
          {formData.storage === 'MONITOR' && (
            <div className={style.inputGroup} style={{ marginTop: '1rem' }}>
              <label>모니터링 대상 창고명</label>
              <input 
                type="text" 
                name="monitorStorage" 
                placeholder="ex) C" 
                value={formData.monitorStorage}
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <button type="submit" className={style.submitBtn}>계정 생성하기</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;