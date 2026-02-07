package com.crypto.market.insight.support.fixture;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * JSON fixture 파일을 로드하는 유틸리티 클래스.
 *
 * <p>프로젝트 루트의 fixtures/ 디렉토리에서 JSON 파일을 읽어
 * 지정된 타입으로 역직렬화합니다.</p>
 *
 * <h3>디렉토리 구조</h3>
 * <pre>
 * fixtures/
 * ├── market/
 * │   ├── happy/
 * │   │   └── coins.json
 * │   ├── edge/
 * │   │   └── empty-response.json
 * │   └── error/
 * │       └── invalid-coin.json
 * ├── strategy/
 * │   ├── happy/
 * │   ├── edge/
 * │   └── error/
 * └── auth/
 *     ├── happy/
 *     ├── edge/
 *     └── error/
 * </pre>
 *
 * <h3>사용 예시</h3>
 * <pre>{@code
 * // 단일 객체 로드
 * CoinMarketData bitcoin = FixtureLoader.load("market/happy/bitcoin.json", CoinMarketData.class);
 *
 * // 리스트 로드
 * List<CoinMarketData> coins = FixtureLoader.loadList("market/happy/coins.json", CoinMarketData.class);
 *
 * // Raw JSON 문자열 로드 (WireMock 등에서 사용)
 * String json = FixtureLoader.loadRaw("market/happy/coins.json");
 * }</pre>
 */
public final class FixtureLoader {

    private static final ObjectMapper OBJECT_MAPPER = createObjectMapper();
    private static final Path FIXTURES_ROOT = findFixturesRoot();

    private FixtureLoader() {
    }

    /**
     * JSON 파일을 지정된 타입으로 로드합니다.
     *
     * @param path  fixtures/ 디렉토리 기준 상대 경로 (예: "market/happy/bitcoin.json")
     * @param clazz 역직렬화할 타입
     * @param <T>   반환 타입
     * @return 역직렬화된 객체
     * @throws FixtureLoadException 파일을 읽거나 파싱하는데 실패한 경우
     */
    public static <T> T load(String path, Class<T> clazz) {
        try {
            Path filePath = FIXTURES_ROOT.resolve(path);
            return OBJECT_MAPPER.readValue(Files.newInputStream(filePath), clazz);
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load fixture: " + path, e);
        }
    }

    /**
     * JSON 배열 파일을 리스트로 로드합니다.
     *
     * @param path        fixtures/ 디렉토리 기준 상대 경로
     * @param elementType 리스트 요소 타입
     * @param <T>         요소 타입
     * @return 역직렬화된 리스트
     * @throws FixtureLoadException 파일을 읽거나 파싱하는데 실패한 경우
     */
    public static <T> List<T> loadList(String path, Class<T> elementType) {
        try {
            Path filePath = FIXTURES_ROOT.resolve(path);
            return OBJECT_MAPPER.readValue(
                    Files.newInputStream(filePath),
                    OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, elementType)
            );
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load fixture list: " + path, e);
        }
    }

    /**
     * JSON 파일을 TypeReference를 사용하여 복잡한 제네릭 타입으로 로드합니다.
     *
     * @param path          fixtures/ 디렉토리 기준 상대 경로
     * @param typeReference 타입 레퍼런스
     * @param <T>           반환 타입
     * @return 역직렬화된 객체
     * @throws FixtureLoadException 파일을 읽거나 파싱하는데 실패한 경우
     */
    public static <T> T load(String path, TypeReference<T> typeReference) {
        try {
            Path filePath = FIXTURES_ROOT.resolve(path);
            return OBJECT_MAPPER.readValue(Files.newInputStream(filePath), typeReference);
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load fixture: " + path, e);
        }
    }

    /**
     * JSON 파일을 원본 문자열로 로드합니다.
     * WireMock 스텁 등에서 사용할 수 있습니다.
     *
     * @param path fixtures/ 디렉토리 기준 상대 경로
     * @return JSON 문자열
     * @throws FixtureLoadException 파일을 읽는데 실패한 경우
     */
    public static String loadRaw(String path) {
        try {
            Path filePath = FIXTURES_ROOT.resolve(path);
            return Files.readString(filePath);
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load raw fixture: " + path, e);
        }
    }

    /**
     * 클래스패스에서 JSON 파일을 로드합니다 (test/resources 하위).
     * 기존 테스트 리소스 파일과의 호환성을 위해 제공됩니다.
     *
     * @param resourcePath 클래스패스 기준 경로 (예: "/fixtures/market/coins.json")
     * @param clazz        역직렬화할 타입
     * @param <T>          반환 타입
     * @return 역직렬화된 객체
     * @throws FixtureLoadException 파일을 읽거나 파싱하는데 실패한 경우
     */
    public static <T> T loadFromClasspath(String resourcePath, Class<T> clazz) {
        try (InputStream is = FixtureLoader.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new FixtureLoadException("Resource not found: " + resourcePath);
            }
            return OBJECT_MAPPER.readValue(is, clazz);
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load classpath fixture: " + resourcePath, e);
        }
    }

    /**
     * 클래스패스에서 JSON 배열 파일을 리스트로 로드합니다.
     *
     * @param resourcePath 클래스패스 기준 경로 (예: "/fixtures/market/happy/coins.json")
     * @param elementType  리스트 요소 타입
     * @param <T>          요소 타입
     * @return 역직렬화된 리스트
     * @throws FixtureLoadException 파일을 읽거나 파싱하는데 실패한 경우
     */
    public static <T> List<T> loadListFromClasspath(String resourcePath, Class<T> elementType) {
        try (InputStream is = FixtureLoader.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new FixtureLoadException("Resource not found: " + resourcePath);
            }
            return OBJECT_MAPPER.readValue(
                    is,
                    OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, elementType)
            );
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load classpath fixture list: " + resourcePath, e);
        }
    }

    /**
     * 클래스패스에서 JSON 파일을 원본 문자열로 로드합니다.
     * WireMock 스텁 등에서 사용할 수 있습니다.
     *
     * @param resourcePath 클래스패스 기준 경로 (예: "/fixtures/market/happy/bitcoin.json")
     * @return JSON 문자열
     * @throws FixtureLoadException 파일을 읽는데 실패한 경우
     */
    public static String loadRawFromClasspath(String resourcePath) {
        try (InputStream is = FixtureLoader.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new FixtureLoadException("Resource not found: " + resourcePath);
            }
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new FixtureLoadException("Failed to load raw classpath fixture: " + resourcePath, e);
        }
    }

    private static ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    private static Path findFixturesRoot() {
        // 프로젝트 루트의 fixtures/ 디렉토리를 찾음
        Path currentDir = Paths.get("").toAbsolutePath();

        // backend/ 디렉토리에서 실행되는 경우
        if (currentDir.endsWith("backend")) {
            return currentDir.getParent().resolve("fixtures");
        }

        // 프로젝트 루트에서 실행되는 경우
        Path fixturesPath = currentDir.resolve("fixtures");
        if (Files.exists(fixturesPath)) {
            return fixturesPath;
        }

        // 상위 디렉토리 탐색
        Path parent = currentDir.getParent();
        while (parent != null) {
            fixturesPath = parent.resolve("fixtures");
            if (Files.exists(fixturesPath)) {
                return fixturesPath;
            }
            parent = parent.getParent();
        }

        throw new IllegalStateException("Could not find fixtures directory from: " + currentDir);
    }

    /**
     * Fixture 로드 실패 시 발생하는 예외
     */
    public static class FixtureLoadException extends RuntimeException {
        public FixtureLoadException(String message) {
            super(message);
        }

        public FixtureLoadException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
