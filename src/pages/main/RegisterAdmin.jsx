import { useState } from "react";
import style from "../../css/RegisterAdmin.module.css";
import Alert from "../../components/Alert";
import { useNavigate } from "react-router-dom";
import serverUrl from "../../db/server.json";

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    storage: "",
    monitorStorage: "",
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const closeAlert = () => setAlert({ ...alert, isOpen: false });
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

    const trimmedId = formData.id.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();
    const trimmedNickname = formData.nickname.trim();
    const trimmedMonitorStorage = formData.monitorStorage.trim();

    // 비밀번호 일치 확인 시 trim 적용값 사용
    if (trimmedPassword !== trimmedConfirmPassword) {
      setAlert({
        isOpen: true,
        title: "Input Error",
        message: "비밀번호가 일치하지 않습니다.",
        onConfirm: closeAlert,
      });
      return;
    }

    if (!formData.storage) {
      setAlert({
        isOpen: true,
        title: "Input Error",
        message: "담당 권한을 선택해주세요.",
        onConfirm: closeAlert,
      });
      return;
    }

    if (formData.storage === "MONITOR" && !trimmedMonitorStorage) {
      setAlert({
        isOpen: true,
        title: "Input Error",
        message: "모니터링할 창고 이름을 입력해주세요.",
        onConfirm: closeAlert,
      });
      return;
    }

    const submitData = {
      mngrId: trimmedId,
      mngrPswd: trimmedPassword,
      nickname: trimmedNickname,
      tkcgStorage:
        formData.storage === "MONITOR"
          ? trimmedMonitorStorage
          : formData.storage,
    };

    try {
      const response = await fetch(`${SERVER_URL}/ttik/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      if (response.ok) {
        setAlert({
          isOpen: true,
          title: "Success",
          message: `${submitData.nickname} 등록이 완료되었습니다.`,
          onConfirm: () => {
            closeAlert();
            navigate("/storage");
          },
        });
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "등록 오류가 발생했습니다.");
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Failed",
        message: error.message,
        onConfirm: closeAlert,
      });
    }
  };

  return (
    <div className={style.container}>
      <Alert {...alert} />

      <div className={style.card}>
        <div className={style.header}>
          <h2>신규 관리자 등록</h2>
          <p>모니터 계정의 경우 동+모니터 로 생성 ex)B모니터</p>
        </div>

        <form onSubmit={handleRegister} className={style.form}>
          <div className={style.inputGroup}>
            <label>관리자 닉네임</label>
            <input
              type="text"
              name="nickname"
              placeholder="ex) 사무실 관리자 / 창고 이용자 / A모니터"
              onChange={handleChange}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label>관리자 ID</label>
            <input
              type="text"
              name="id"
              placeholder="ID를 설정하세요"
              onChange={handleChange}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <div className={`${style.inputGroup} ${style.fullWidth}`}>
            <label>담당 권한 설정</label>
            <div className={style.checkboxContainer}>
              {[
                { id: "ALL", label: "전체 관리자 (ALL)" },
                { id: "U", label: "이용자" },
                { id: "MONITOR", label: "모니터용" }, // 모니터용 추가
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
          {formData.storage === "MONITOR" && (
            <div className={style.inputGroup} style={{ marginTop: "1rem" }}>
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

          <button type="submit" className={style.submitBtn}>
            계정 생성하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
