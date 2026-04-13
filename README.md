# 패션 물류 관리 시스템 - Frontend
QR 기반의 실시간 입출고 및 로케이션 관리 시스템으로, <br>
박스/단품별 물류 추적과 B2B·B2C 맞춤형 출고가 가능한 패션 물류 WMS


<br><br>

프로세스 시연 영상 : https://drive.google.com/file/d/1aeK2BOoRoCKSpT8KB41ZeHfSyoa4tdJT/view?usp=sharing
<br>
시스템 기능 설명 영상 : https://drive.google.com/file/d/16UDGscPzfVxy5I_0mqD-jndgrWXfUIAl/view?usp=sharing
<br>
<br>


### Tech Skills
![JavaScript](https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript)
![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react)
![Java](https://img.shields.io/badge/Java-000000?style=for-the-badge&logo=Java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-000000?style=for-the-badge&logo=springboot)
![JPA](https://img.shields.io/badge/JPA-000000?style=for-the-badge&logo=JPA)
![MyBatis](https://img.shields.io/badge/MyBatis-000000?style=for-the-badge&logo=MyBatis)
![Oracle](https://img.shields.io/badge/Oracle-000000?style=for-the-badge&logo=oracle)
![SQL](https://img.shields.io/badge/SQL-000000?style=for-the-badge&logo=SQL)

<br>

[Backend Repository 바로가기 → ](https://github.com/kminjoo9093/SpringBoot_Apparel-WMS-Project_TTIK)

<br><br>

## 기여한 부분


#### **상품 등록 페이지 개발** &emsp; 
- **신규 상품 등록** 및 SKU 기반 **상품 코드 자동 생성 로직 설계**
- [children 기반의 재사용 가능한 **공통 Modal 컴포넌트** 설계](./src/components/RegistModalFrame.js)
    - 브랜드, 시즌, 상품코드 모달에 활용
- [Context API를 활용하여 브랜드, 시즌, 카테고리 데이터를 전역 상태 관리](./src/context/ProductDataProvider.js)
- [Zustand를 활용한 상품 등록 폼 상태 관리로 컴포넌트 간 상태 공유 및 관리 단순화](./src/store/product.js)
- 입력값 유효성 검증과 안내 (숫자, 자릿수, 알파벳)
- 비동기 API 요청 및 실패 응답에 대한 예외 처리 로직 구현

<br>

#### **상품 목록 페이지 개발**  &emsp; 
- API 연동으로 상품 조회 및 재고 상태 확인<br>
- 필터링 및 검색어 기반 상품 검색<br>
- [ 디바이스 환경 기반 **데이터 목록 조회 전략 분리** 구현](./src/pages/product/ProductList.js)<br>
PC: 페이지네이션 / Mobile: 무한스크롤<Br>
- 컬러 활용한 상태 구분으로 정보의 직관성 높임 : 입고 대기, 부족, 정상<Br>

<br>

#### 창고 관리 페이지 개발  
- 창고 정보 수정(등록, 구조 수정, 삭제) 및 선반 정보 조회와 재고 위치 변경 기능 구현
- [다수의 재고 위치 변경 시 Promise.all 활용한 병렬 처리](./src/pages/storage/RackDetailModal.js)
- [선택 상태 및 비활성화 여부에 따라 입력 필드를 동적으로 제어 하여 입력 오류 방지](./src/pages/storage/StorageUpdateState.js#L176)
- [구역/선반 간 의존 관계를 고려하여 상위 상태 변경 시 하위 상태 자동 초기화하는 로직 설계](./src/hooks/storage/useStorageToggle.js)
- [해당 창고의 구역/선반 정보를 실시간 조회하여 사용자 입력 가이드를 제공하고 오류를 사전 방지](./src/pages/storage/StorageAdd.js#L266-L270)
- 현장 상황과 데이터의 일치를 고려한 **예외 처리** ( 적재 상품 존재 시 삭제 불가/최상층 선반 삭제 불가 )
<br>

<br>

## 문제 해결 및 성과

### **1. 상품 코드 체계 재설계로 데이터 고유성 & 연결성 확보 및 시스템 확장에 기여** 
- **문제**
    - 초기 설계한 상품 코드 (브랜드 코드 + 시즌 코드) - (카테고리 코드 + 사이즈 코드) 구조 하에 <br>
      속성값이 모두 동일할 경우 데이터 **고유성 확보가 불가함**을 확인
        
- **해결**
    - **품번(성별 식별자+3자리 숫자) 도입**으로 상품 코드 구조 재설계 <br>
      →  (브랜드 코드 + 시즌 코드) - (카테고리 코드 + 사이즈 코드) - 품번
    - 표준화가 어려운 컬러 정보를 품번 내에 반영하도록 설계하여 관리 유연성 확보
    - [ 데이터 적재 전 **상품 코드 중복 여부 체크**로 검증 로직 강화 ](./src/pages/product/ProductCodeModal.js)
    
- **결과**
    - 모든 등록 상품에 대해 **100% 고유 식별 가능**한 체계를 구축
    - 해당 코드를 개별 QR코드 및 박스 코드에 활용하여 **시스템 확장성에 기여**

<br>

### **2. 상태 관리 분리로 컴포넌트 단순화**
- **문제**
    - 창고 관리 기능의 구역/선반 선택 상태, 활성/비활성 토글 상태, 적재 상태 값이 서로 영향을 주는 구조로 인해 <br/>
    하나의 컴포넌트에 모든 로직이 집중되어 코드 복잡도 증가 및 유지보수 어려움 발생
    
- **해결**
    - [구역/선반의 활성화 상태 변경 로직을 커스텀 훅(useStorageToggle)으로 분리](./src/hooks/storage/useStorageToggle.js)하고 <br/>
      상태 초기화 로직(resetRackInfo, resetRackState)을 외부에서 주입받도록 설계
    - 창고 상태와 선택 조건에 따른 [확인 메시지 생성 로직을 getCheckMessage 함수로 분리](./src/utils/storage/getCheckMessage.js)
    
- **결과**
    - 상태 및 비즈니스 로직을 외부로 분리하여 코드 가독성 향상 및 유지보수성 개선
    - 훅이 특정 상태에 의존하지 않도록 하여 재사용 가능

<br>

### **3. 상품 상태 값 세분화로 재고 부족 오 분류 문제 해결**  
- **문제**
    - 상품 상태를 활성,비활성으로만 관리하여 상품 등록 후 입고 전인 수량 0의 상품이
        
        실제 품절 상품과 함께 **'재고 부족'으로 오 분류되는 데이터 정합성 오류**를 확인
        
- **해결** &emsp; [ 관련 코드 바로가기 → ](./src/pages/product/ProductItem.js)
    - **입고 대기 상태(W)를 신규 정의**하여 상품 등록 시 기본값으로 설정하고, 실제 입고 처리 전까지
        
        재고 부족 판단 대상에서 제외되도록 비즈니스 로직을 설계하여 데이터 혼선을 방지
        
- **결과**
    - **재고 분류 정합성 100% 확보** 및 실제 물류 흐름과 시스템 데이터 간의 **일치성** 강화
