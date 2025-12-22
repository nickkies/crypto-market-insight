package com.crypto.market.insight.unit.domain.market.dto;

import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OhlcDataTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("CoinGecko OHLC API 배열 응답을 OhlcData로 역직렬화한다")
    void deserialize_ohlcArrayResponse() throws Exception {
        // given
        String json = "[1709395200000, 61942, 62211, 61721, 61845]";

        // when
        OhlcData result = objectMapper.readValue(json, OhlcData.class);

        // then
        assertThat(result.timestamp()).isEqualTo(1709395200000L);
        assertThat(result.open()).isEqualByComparingTo(new BigDecimal("61942"));
        assertThat(result.high()).isEqualByComparingTo(new BigDecimal("62211"));
        assertThat(result.low()).isEqualByComparingTo(new BigDecimal("61721"));
        assertThat(result.close()).isEqualByComparingTo(new BigDecimal("61845"));
    }

    @Test
    @DisplayName("소수점이 포함된 OHLC 데이터를 처리한다")
    void deserialize_withDecimalValues() throws Exception {
        // given
        String json = "[1709395200000, 61942.50, 62211.75, 61721.25, 61845.00]";

        // when
        OhlcData result = objectMapper.readValue(json, OhlcData.class);

        // then
        assertThat(result.open()).isEqualByComparingTo(new BigDecimal("61942.50"));
        assertThat(result.high()).isEqualByComparingTo(new BigDecimal("62211.75"));
        assertThat(result.low()).isEqualByComparingTo(new BigDecimal("61721.25"));
        assertThat(result.close()).isEqualByComparingTo(new BigDecimal("61845.00"));
    }

    @Test
    @DisplayName("OHLC 배열 리스트를 역직렬화한다")
    void deserialize_ohlcListResponse() throws Exception {
        // given
        String json = """
                [
                    [1709395200000, 61942, 62211, 61721, 61845],
                    [1709409600000, 61828, 62139, 61726, 62139],
                    [1709424000000, 62171, 62210, 61821, 62068]
                ]
                """;

        // when
        List<OhlcData> result = objectMapper.readValue(json, new TypeReference<>() {});

        // then
        assertThat(result).hasSize(3);

        assertThat(result.get(0).timestamp()).isEqualTo(1709395200000L);
        assertThat(result.get(0).close()).isEqualByComparingTo(new BigDecimal("61845"));

        assertThat(result.get(1).timestamp()).isEqualTo(1709409600000L);
        assertThat(result.get(1).close()).isEqualByComparingTo(new BigDecimal("62139"));

        assertThat(result.get(2).timestamp()).isEqualTo(1709424000000L);
        assertThat(result.get(2).close()).isEqualByComparingTo(new BigDecimal("62068"));
    }

    @Test
    @DisplayName("timestamp를 Instant로 변환한다")
    void toInstant_convertsTimestampToInstant() {
        // given
        OhlcData ohlcData = new OhlcData(
                1709395200000L,
                new BigDecimal("61942"),
                new BigDecimal("62211"),
                new BigDecimal("61721"),
                new BigDecimal("61845")
        );

        // when
        Instant result = ohlcData.toInstant();

        // then
        assertThat(result).isEqualTo(Instant.ofEpochMilli(1709395200000L));
        assertThat(result.toString()).isEqualTo("2024-03-02T16:00:00Z");
    }

    @Test
    @DisplayName("빈 배열은 null을 반환한다")
    void deserialize_emptyArray_returnsNull() throws Exception {
        // given
        String json = "[]";

        // when
        OhlcData result = objectMapper.readValue(json, OhlcData.class);

        // then
        assertThat(result).isNull();
    }
}
