# 패션 물류 관리 시스템 - Frontend
의류 물류 센터의 입출고·재고·로케이션 정보를 통합 관리하고 상품 이동 이력을 실시간으로 추적할 수 있는 QR 기반 WMS

<br>

<img width="500" alt="image" src="https://github.com/user-attachments/assets/94fa6d0d-93ed-4201-af6e-ebd6bb995cec" />


<br><br>

### 🔗 Link
- 🎬 [ 담당 기능 시연 영상 바로가기 → ](https://drive.google.com/file/d/1SmhvBcRSdJg7eU3xR7mTtKnKi20nCUL4/view?usp=sharing)
  <br>
  
- 🎬 [ 입출고 프로세스 시연 영상 바로가기 → ](https://drive.google.com/file/d/1aeK2BOoRoCKSpT8KB41ZeHfSyoa4tdJT/view?usp=sharing)
  <br>
  
- ⚙️[Backend Repository 바로가기 → ](https://github.com/kminjoo9093/SpringBoot_Apparel-WMS-Project_TTIK)

<br>

### 🛠 Frontend Stack
![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge)


<br><br>

## 🔍 기여한 부분

### **상품 관리 페이지 개발** &emsp; 
  <img width="600" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/45274b49-593f-4809-8652-ac3cc713e45a" /> <br/>
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/ab668ca0-bd7c-42c0-8fe5-da84fa1edf2f" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/d595d559-0334-4cc9-9e79-9dd2944db833" />
<br>

- **Zustand + createPortal**로 전역 모달 시스템 구현 및 type 기반 [컨텐츠 동적 렌더링으로 재사용성 확보](./src/components/RegistModalFrame.js)
- **TanStack Query** 도입으로 마스터 데이터(브랜드, 카테고리, 시즌) 중복 요청 및 동기화 문제 해결
- SKU 기반 [**상품 코드 자동 생성 및 중복 검증**](./src/pages/product/ProductCodeModal.js), 성별·카테고리 조합에 따른 사이즈 옵션 동적 바인딩 구현

<br>

<div style="display: flex; align-items: flex-start; gap: 10px;">
  <img width="450" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/a389780f-454a-411d-8376-7eb6140fddbc" />
  <img height="350" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/8e2b8ac9-35ad-4220-b93a-c7e1d3d63427" />
  <img height="350" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/a16b4e36-727b-4421-80e1-b75b6434b667" />
</div>

<br>

- [ 디바이스 환경별 **상품 목록 조회 전략 분리** 구현](./src/pages/product/ProductList.js) (PC: 페이지네이션 / Mobile: 무한스크롤)<br>
- 필터링 및 상품명/상품코드 기반 상품 검색 구현
- [상품 조회 및 재고 상태 확인](./src/components/ProductItem.js)<br>


<br>
<br>


### 창고 관리 페이지 개발  
<img width="400" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/28fddc1a-b0a7-4e53-92b1-8f1bd2bca7c2" />
<img width="400" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/4fcee0d8-30f2-47b2-a44c-935be531cfde" />
<div style="display: flex; align-items: flex-start; gap: 10px;">
  <img width="400" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/c4bd89f2-7427-484e-b89b-a1ffcda8879c" />
  <img width="300" style="vertical-align: top;" alt="image" src="https://github.com/user-attachments/assets/bacb3e55-eb5a-4cd7-bb46-c92195e7720d" />
</div>

<br>

- 창고 등록, 구조 수정(구역/선반 추가·삭제), 상태 수정 및 [선반 별 재고 위치 변경](./src/pages/storage/RackDetailModal.js) 구현
- [**Promise.all** 병렬 처리](./src/hooks/mutations/useMoveBox.js)로 다수 박스 이동 시 순차 요청 응답 지연 문제 해결
- **TanStack Query** 도입으로 구조 수정 후 컴포넌트별 수동 재요청 로직 제거 및 [**Query Key** 설계](./src/lib/constants.js)로 관련 데이터 자동 동기화
- 창고의 계층 관계를 반영해 [상위 선택 변경 시 하위 상태 자동 초기화](./src/hooks/storage/useStorageToggle.js), 구역 미선택 시 선반 비활성화 등 **조건 기반 UI제어**로 잘못된 API 요청을 UI 레벨에서 사전 차단
- 구역/선반 정보를 실시간 조회하여 수정에 필요한 정보를 제공하고 사용자 입력 가이드를 구현
- 적재 상품 존재 시 삭제 또는 비활성화 불가, 최상층 선반 삭제 불가 등 [**현장 상황 반영**한 예외 처리](./src/pages/storage/StorageDelete.js)

<br>
<br>

## 💡 문제 해결 및 성과

### **1. 상품 코드 체계 재설계로 데이터 고유성 확보 및 시스템 확장에 기여** 
- **문제**
    - 초기 상품 코드 체계는 브랜드·시즌·카테고리·사이즈 정보만으로 구성되어, <br/>
      동일 속성의 상품 등록 시 고유 식별이 불가능한 문제 발생
        
- **해결**
    - [**품번(성별 식별자+3자리 숫자) 도입**](./src/utils/validation/styleNo.js)으로 상품 코드 구조 재설계 <br>
      →  (브랜드 코드 + 시즌 코드) - (카테고리 코드 + 사이즈 코드) - 품번
    - 상품 등록 전 [ **상품 코드 중복 여부 검증** 로직 추가 ](./src/pages/product/ProductCodeModal.js)
    - 표준화가 어려운 컬러 정보는 품번에 포함하여 관리 유연성 확보
    
- **결과**
    - 상품별 고유 식별 가능한 코드 체계 구축 및 데이터 무결성 강화
    - 상품 코드를 개별 QR코드 및 박스 코드 생성 기준으로 활용하여 **시스템 확장성에 기여**


<br>


### **2. 상품 상태 값 세분화로 재고 부족 오 분류 문제 해결**  
- **문제**
    - 상품 상태를 활성,비활성으로만 관리하여 상품 등록 직후 아직 입고되지 않은 상품이
        
        실제 품절 상품과 동일하게 **'재고 부족'으로 오 분류되는** 문제 발생
        
- **해결**
    - **입고 대기 상태(W)를 새롭게 정의**하여 상품 등록 시 기본값으로 설정
    - 실제 입고 처리 전까지 재고 부족 판단 대상에서 제외되도록 설계
        
- **결과**
    - 입고 전 상품과 실제 품절 상품을 구분할 수 있는 상태 체계 구축
    - 실제 물류 흐름과 시스템 데이터 간의 일치성 강화
 
  <br>
  

### **3. TanStack Query 도입으로 마스터 데이터(브랜드·카테고리·시즌) 중복 요청 및 동기화 문제 해결**

- **문제**
    - 브랜드, 카테고리, 시즌 데이터를 컴포넌트마다 로컬 state로 관리하여 중복 API 요청 발생
    - Context API로 공유를 시도했으나 데이터 변경 후 최신 상태 반영을 위한 수동 재요청 필요
    
- **해결**
    - Context API 제거 및 TanStack Query 기반 서버 상태 관리로 전환
    - 시즌 등록 성공 시 관련 쿼리 무효화로 자동 재조회
    
- **결과**
    - 상품 등록·목록 페이지 간 데이터 공유로 **중복 API 요청 제거**
    - 불필요해진 Context 레이어 제거로 구조 단순화
    - 데이터 변경 후 **최신 데이터 자동 반영**

<br>
