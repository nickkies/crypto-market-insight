# 📝 Backend Coding Guidelines

> 본 문서는 Crypto Market Insight 백엔드 프로젝트의
> 코드 일관성, 가독성, 유지보수성을 확보하기 위한 코딩 가이드라인입니다.

본 프로젝트는 `Spring Boot` + `JPA` + `QueryDSL` + `Swagger(OpenAPI)` 기반으로 개발하며,
**도메인 중심 설계**와 **API 명세 자동화**를 핵심 원칙으로 합니다.

---

## 1. 폴더 구조

```bash
src/main/java/com/crypto/insight/
├── common/              # 공통 모듈
│   ├── dto/             # 공통 응답 객체
│   ├── exception/       # 예외 처리 및 에러 코드
│   └── utils/           # 유틸리티
├── config/              # 설정 클래스
├── domain/              # 비즈니스 도메인
│   └── [domain]/
│       ├── controller/  # REST 컨트롤러
│       ├── service/     # 비즈니스 로직
│       ├── repository/  # JPA / QueryDSL
│       ├── mapper/      # MapStruct
│       └── model/
│           ├── dto/     # Request / Response DTO
│           ├── entity/  # JPA 엔티티
│           └── vo/      # 값 객체
└── security/            # OAuth2 보안
```

### 설계 원칙

- 도메인 기준 패키지 분리
- 공통 로직은 `common`에 한정
- 도메인 간 직접 참조 최소화

---

## 2. 네이밍 컨벤션

| 대상              | 컨벤션                  | 예시                                             |
| ----------------- | ----------------------- | ------------------------------------------------ |
| Controller        | PascalCase + Controller | `MemberController`                               |
| Service           | PascalCase + Service    | `MemberService`                                  |
| Repository        | PascalCase + Repository | `MemberRepository`                               |
| Custom Repository | Interface + Impl        | `MemberRepositoryCustom`, `MemberRepositoryImpl` |
| Mapper            | PascalCase + Mapper     | `MemberMapper`                                   |
| DTO               | PascalCase              | `MemberDto`, `BacktestDto`                       |
| Entity            | PascalCase              | `Member`, `Strategy`                             |
| DB 컬럼           | snake_case              | `user_id`, `created_at`                          |

---

## 3. 데이터 접근 패턴 (JPA + QueryDSL)

- 단순 CRUD → JPA Repository
- 동적 조건 / 페이징 / 집계 → QueryDSL

```java
public interface MemberRepository
    extends JpaRepository<Member, String>, MemberRepositoryCustom {
}

public interface MemberRepositoryCustom {
    Page<MemberDto> searchMembers(MemberSearchDto searchDto, Pageable pageable);
}
```

```java
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<MemberDto> searchMembers(MemberSearchDto searchDto, Pageable pageable) {
        // QueryDSL 기반 동적 쿼리
    }
}
```

---

## 4. Service 패턴

### 기본 원칙

- 기본 트랜잭션: `@Transactional(readOnly = true)`
- 쓰기 작업만 `@Transactional`
- 비즈니스 로직은 Service 계층에 집중

```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberMapper memberMapper;

    public MemberDto getMember(String userId) {
        return memberRepository.findById(userId)
            .map(memberMapper::toDto)
            .orElseThrow(() ->
                new AlertMessageException(AlertMessageErrorCode.MEMBER_NOT_FOUND));
    }

    @Transactional
    public void createMember(MemberCreateRequest request) {
        Member member = memberMapper.toEntity(request);
        memberRepository.save(member);
    }
}
```

---

## 5. Facade 패턴 (도메인 조합)

여러 도메인을 조합하는 경우 Facade Service 사용

> Controller → Facade → 개별 Service 구조 유지

```java
@Service
@RequiredArgsConstructor
public class BacktestFacadeService {

    private final StrategyService strategyService;
    private final MarketService marketService;

    public BacktestDto.Response runBacktest(BacktestDto.Request request) {
        // 전략 조회 → 시세 조회 → 백테스트 실행
    }
}
```

---

## 6. 예외 처리

### 예외 구조

- `BusinessException`: 시스템/비즈니스 오류 (ErrorCode 기반)
- `AlertMessageException`: 사용자 입력 오류 (HTTP 422)

```java
public enum ErrorCode {

    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "요청 파라미터가 유효하지 않습니다"),
    DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "요청하신 데이터를 찾을 수 없습니다");
}
```

### 사용 원칙

- `BusinessException`의 메시지는 로그용
- 프론트에는 ErrorCode 기본 메시지만 전달
- `throw` 전에 `log.error()` 호출 금지

### 공통 에러 응답 (ErrorResponse DTO)

모든 API 에러는 동일한 응답 포맷으로 반환

```java
@Schema(description = "공통 에러 응답")
@Data
@Builder
@AllArgsConstructor
public class ErrorResponse {

    @Schema(description = "에러 코드", example = "DATA_NOT_FOUND")
    private String code;

    @Schema(description = "에러 메시지", example = "요청하신 데이터를 찾을 수 없습니다")
    private String message;

    @Schema(description = "발생 시각")
    private LocalDateTime timestamp;

    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
            .code(errorCode.name())
            .message(errorCode.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

### 전역 예외 처리 (GlobalExceptionHandler)

`@RestControllerAdvice`를 사용하여 모든 예외를 한 곳에서 처리

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.error("BusinessException: {}", e.getMessage());
        return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(ErrorResponse.of(e.getErrorCode()));
    }

    @ExceptionHandler(AlertMessageException.class)
    public ResponseEntity<ErrorResponse> handleAlertMessageException(AlertMessageException e) {
        log.error("AlertMessageException: {}", e.getMessage());
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ErrorResponse.of(e.getErrorCode()));
    }
}
```

**처리 흐름:**

1. Service/Controller에서 예외 발생 (`throw new BusinessException(...)`)
2. `GlobalExceptionHandler`가 예외 catch
3. `ErrorResponse.of()`로 공통 응답 객체 생성
4. 클라이언트에 일관된 JSON 포맷으로 반환

> 개별 Controller에서 try-catch 금지 → 전역 예외 처리기에 위임

---

## 7. Controller 패턴 + Swagger(OpenAPI)

### Controller 원칙

- Controller는 얇게 유지
- 모든 API는 Swagger 어노테이션 필수

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Tag(name = "Member", description = "Member APIs")
public class MemberController {

    private final MemberService memberService;

    @Operation(
        summary = "Search members",
        description = "Search members by criteria"
    )
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping
    public ResponseEntity<Page<MemberDto>> searchMembers(
        @ParameterObject @ModelAttribute MemberSearchDto searchDto,
        @ParameterObject Pageable pageable
    ) {
        return ResponseEntity.ok(
            memberService.searchMembers(searchDto, pageable)
        );
    }
}
```

---

## 8. DTO 설계 원칙

### Request / Response Nested 패턴 사용

특정 API 또는 도메인에 종속적인 DTO는
Request / Response를 하나의 클래스에 Nested 형태로 관리

> 공통 DTO만 별도 클래스로 분리

### DTO Lombok 어노테이션

#### Request DTO

- `@Data`: Getter, Setter 자동 생성 (Jackson 역직렬화에 사용)
- `@NoArgsConstructor(access = AccessLevel.PRIVATE)`: 외부 직접 생성 방지

#### Response DTO

- `@Data`: Getter 자동 생성 (직렬화에 사용)
- `@Builder`: Builder 또는 MapStruct로 생성
- `@AllArgsConstructor`: Builder 동작에 필요

```java
public class BacktestDto {

    @Schema(description = "백테스트 실행 요청")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class Request {

        @Schema(description = "전략 ID", example = "rsi-001")
        private String strategyId;

        @Schema(description = "코인 심볼", example = "BTC")
        private String symbol;

        @Schema(description = "백테스트 기간(일)", example = "90")
        private int periodDays;
    }

    @Schema(description = "백테스트 결과")
    @Data
    @Builder
    @AllArgsConstructor
    public static class Response {

        @Schema(description = "누적 수익률", example = "0.42")
        private double cumulativeReturn;

        @Schema(description = "최대 낙폭(MDD)", example = "-0.18")
        private double maxDrawdown;
    }
}
```

---

## 9. MapStruct 매퍼

```java
@Mapper(componentModel = "spring")
public interface MemberMapper {

    MemberDto toDto(Member entity);

    Member toEntity(MemberCreateRequest request);

    @BeanMapping(
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    void updateEntity(
        MemberUpdateRequest request,
        @MappingTarget Member entity
    );
}
```

---

## 10. Entity 패턴

```java
@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    private String userId;

    private String nickname;

    // 생성: Builder 또는 생성자
    @Builder
    public Member(String userId, String nickname) {
        this.userId = userId;
        this.nickname = nickname;
    }

    // 변경: 명시적 비즈니스 메서드
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}
```

### Entity 규칙

- 기본 생성자는 `PROTECTED`
- Setter 남용 금지
- 생성자 또는 Builder로 상태 제어

---

## 11. 코드 스타일

- Lombok 사용: `@Getter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`
- DB 컬럼: `snake_case`
- Java 필드: `camelCase`
- 포매팅/룰: `Spotless` + `Checkstyle`(NAVER 기준)

---

## 12. 캐싱 전략 (Caffeine)

### 캐싱 대상

- 외부 API 호출 결과 (시세, 캔들 데이터)
- 자주 조회되는 지표 계산 결과
- 변경이 적은 메타 정보

> 원본 시계열 데이터는 DB에 저장하지 않고, 캐시로만 관리

### 캐시 설정

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)  // TTL 설정
            .maximumSize(1000));                     // 최대 엔트리 수
        return cacheManager;
    }
}
```

### 캐시 적용

```java
@Service
@RequiredArgsConstructor
public class MarketService {

    @Cacheable(value = "candles", key = "#symbol + '_' + #timeframe")
    public List<CandleDto> getCandles(String symbol, String timeframe) {
        // 외부 API 호출
    }

    @CacheEvict(value = "candles", allEntries = true)
    public void refreshCandles() {
        // 캐시 초기화
    }
}
```

### 캐시 사용 원칙

| 어노테이션    | 용도                           |
| ------------- | ------------------------------ |
| `@Cacheable`  | 캐시 조회, 없으면 실행 후 저장 |
| `@CacheEvict` | 캐시 삭제                      |
| `@CachePut`   | 항상 실행 후 캐시 갱신         |

- TTL은 데이터 특성에 따라 짧게 설정 (최신성 유지)
- 캐시 키는 명확하게 정의
- 외부 API 호출 비용 절감 목적

---

## 13. Swagger 문서화 원칙

- 모든 API는 `@Operation` 필수
- Controller에는 `@Tag` 사용
- 파라미터는 `@ParameterObject` 사용
- DTO 필드는 `@Schema`로 설명

> Swagger는 API 명세의 **단일 기준(Single Source of Truth)**

---

## 14. 정리

- 도메인 중심 설계
- Nested DTO 전략 채택
- Swagger 기반 API 계약
- Caffeine 기반 캐싱 전략
- 자동 포매팅과 규칙 검사 우선
