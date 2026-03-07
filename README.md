# 의류 재고 관리 시스템 TTIK - Frontend
B2B 대량 출고와 B2C 개별 출고를 통합 관리하는 QR 기반 패션 물류 재고 관리 시스템


<br><br>

프로세스 시연 영상 : https://drive.google.com/file/d/1aeK2BOoRoCKSpT8KB41ZeHfSyoa4tdJT/view?usp=sharing
<br>
시스템 기능 설명 영상 : https://drive.google.com/file/d/16UDGscPzfVxy5I_0mqD-jndgrWXfUIAl/view?usp=sharing
<br>
<br>


### Tech Skills
![HTML5](https://img.shields.io/badge/HTML5-000000?style=for-the-badge&logo=html5)
![CSS](https://img.shields.io/badge/CSS-000000?style=for-the-badge&logo=css&logoColor=663399)
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

#### **상품 목록 페이지 개발**  &emsp; [ 코드 보기 → ](./src/pages/product/ProductList.js)
- API 연동으로 상품 조회 및 재고 상태 확인<br>
- 필터링 및 검색어 기반 상품 검색<br>
- 디바이스 환경 기반 **데이터 목록 조회 전략 분리**  <br>
PC: 페이지네이션 / Mobile: 무한스크롤<Br>
- 컬러 활용한 상태 구분으로 정보의 직관성 높임 : 입고 대기, 부족, 정상<Br>

<br>

#### **상품 등록 페이지 개발** &emsp; [ 코드 보기 → ](./src/pages/product/ProductRegister.js)
- **신규 상품 등록** 및 SKU 기반 **상품 코드 자동 부여**
- children 기반 재사용 가능한 **공통 Modal 컴포넌트** 설계 &emsp; [ 관련 코드 바로가기 → ](./src/pages/product/ModalFrame.js)
    - 브랜드, 시즌, 상품코드 모달
- 입력값 유효성 검증
    - 숫자(음수), 자릿수, 알파벳
- 비동기 API 요청 및 실패 응답에 대한 예외 처리 로직 구현
- 상품 등록 기능 관련 관계형 DB 설계

<br>

#### 창고 관리 페이지 개발   &emsp; [ 코드 보기 → ](./src/pages/storage/)
- 창고 등록, 창고 정보 수정, 창고 삭제 기능
- 선반 정보 조회 및 재고 위치 변경 기능
- **컨텍스트 인식형 입력 가이드** 구현 &emsp; [ 관련 코드 바로가기 → ](./src/pages/storage/StorageAdd.js#L38-L51)
    - 창고 관리의 구역/선반 추가 시 **현재 최댓값 및 상태 정보 실시간 조회하여 정보 제공**으로 오류 차단
- 현장 상황과 데이터의 일치를 고려한 **예외 처리**
    - 적재 상품 존재 시 창고/구역/선반 삭제 불가
    - 최상층 선반 삭제 불가
- RESTful API 설계 및 CRUD 로직 구현
<br>

---

## 문제 해결 및 성과

### **1. 상품 코드 체계 재설계로 데이터 고유성 & 연결성 확보 및 시스템 확장에 기여** 

- **문제**
    - 초기 설계한 상품 코드 (브랜드 코드 + 시즌 코드) - (카테고리 코드 + 사이즈 코드) 구조 하에
        
        속성값이 모두 동일할 경우 데이터 **고유성 확보가 불가함**을 확인
        
- **해결**
    - **품번(성별 식별자+3자리 숫자) 도입**으로 상품 코드 구조 재설계 &emsp; [ 관련 코드 바로가기 → ](https://github.com/kminjoo9093/SpringBoot_Apparel-WMS-Project_TTIK/blob/master/src/main/java/com/ttik/serviceImpl/ProductCodeServiceImpl.java) <br>
      →  (브랜드 코드 + 시즌 코드) - (카테고리 코드 + 사이즈 코드) - 품번
    - 표준화가 어려운 컬러 정보를 품번 내에 반영하도록 설계하여 관리 유연성 확보
    - 데이터 적재 전 **상품 코드 중복 여부 체크**로 검증 로직 강화 &emsp; [ 관련 코드 바로가기 → ](./src/pages/product/ProductCode.js#L17-L48)
    
- **결과**
    - 모든 등록 상품에 대해 **100% 고유 식별 가능**한 체계를 구축
    - 해당 코드를 개별 QR코드 및 박스 코드에 활용하여 **시스템 확장성에 기여**

<br>

### **2. 서버 사이드 페이지네이션 적용으로 대용량 데이터 조회 시 렌더링 지연 문제 개선**

- **문제**
    - 상품 데이터 증가 시 전체 데이터를 브라우저로 전송하여 발생하는 **렌더링 속도 지연 문제 발생**
    
- **해결**
    - Spring Data JPA **Pageable 기반 서버 사이드 페이지네이션 적용**
    - DB 엔진 레벨에서 **현재 페이지에 필요한 데이터만 추출**하는 부분 조회하는 방식으로 전환
    - LEFT JOIN 및 동적 쿼리를 활용하여 **필터링을 DB 단계에서 처리**
    
- **결과**
    - 데이터 규모와 무관하게 일정한 응답 시간을 유지하고 브라우저 렌더링 성능 최적화

<br>

### **3. 상품 상태 값 세분화로 재고 부족 오 분류 문제 해결**  

- **문제**
    - 상품 상태를 활성,비활성으로만 관리하여 상품 등록 후 입고 전인 수량 0의 상품이
        
        실제 품절 상품과 함께 **'재고 부족'으로 오 분류되는 데이터 정합성 오류**를 확인
        
- **해결** &emsp; [ 관련 코드 바로가기 → ](./src/pages/product/ProductList.js#L112-L130)
    - **입고 대기 상태(W)를 신규 정의**하여 상품 등록 시 기본값으로 설정하고, 실제 입고 처리 전까지
        
        재고 부족 판단 대상에서 제외되도록 비즈니스 로직을 설계하여 데이터 혼선을 방지
        
- **결과**
    - **재고 분류 정합성 100% 확보** 및 실제 물류 흐름과 시스템 데이터 간의 **일치성** 강화
