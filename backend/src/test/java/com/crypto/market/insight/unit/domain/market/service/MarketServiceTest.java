package com.crypto.market.insight.unit.domain.market.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.service.MarketService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarketServiceTest {

    @Mock
    private CoinGeckoClient coinGeckoClient;

    @InjectMocks
    private MarketService marketService;

    @Nested
    @DisplayName("getCoins")
    class GetCoins {

        @Test
        @DisplayName("코인 목록을 조회한다")
        void returnsCoins() {
            // given
            List<CoinMarketData> mockData = List.of(
                    createCoinMarketData("bitcoin", "btc", "Bitcoin"),
                    createCoinMarketData("ethereum", "eth", "Ethereum")
            );
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), anyInt(), anyInt()))
                    .thenReturn(mockData);

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, null);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo("bitcoin");
        }

        @Test
        @DisplayName("symbol 키워드로 필터링한다")
        void filtersbySymbol() {
            // given
            List<CoinMarketData> mockData = List.of(
                    createCoinMarketData("bitcoin", "btc", "Bitcoin"),
                    createCoinMarketData("ethereum", "eth", "Ethereum")
            );
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), anyInt(), anyInt()))
                    .thenReturn(mockData);

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, "btc");

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).symbol()).isEqualTo("btc");
        }

        @Test
        @DisplayName("name 키워드로 필터링한다")
        void filtersByName() {
            // given
            List<CoinMarketData> mockData = List.of(
                    createCoinMarketData("bitcoin", "btc", "Bitcoin"),
                    createCoinMarketData("ethereum", "eth", "Ethereum")
            );
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), anyInt(), anyInt()))
                    .thenReturn(mockData);

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, "ether");

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).name()).isEqualTo("Ethereum");
        }

        @Test
        @DisplayName("키워드가 빈 문자열이면 전체 목록을 반환한다")
        void returnsAllWhenKeywordIsBlank() {
            // given
            List<CoinMarketData> mockData = List.of(
                    createCoinMarketData("bitcoin", "btc", "Bitcoin"),
                    createCoinMarketData("ethereum", "eth", "Ethereum")
            );
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), anyInt(), anyInt()))
                    .thenReturn(mockData);

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, "   ");

            // then
            assertThat(result).hasSize(2);
        }
    }

    @Nested
    @DisplayName("getCoinDetail")
    class GetCoinDetail {

        @Test
        @DisplayName("코인 상세 정보를 조회한다")
        void returnsCoinDetail() {
            // given
            CoinMarketData mockData = createCoinMarketData("bitcoin", "btc", "Bitcoin");
            when(coinGeckoClient.getCoinsMarkets("usd", "bitcoin"))
                    .thenReturn(List.of(mockData));

            // when
            CoinMarketData result = marketService.getCoinDetail("bitcoin");

            // then
            assertThat(result.id()).isEqualTo("bitcoin");
            assertThat(result.symbol()).isEqualTo("btc");
        }

        @Test
        @DisplayName("존재하지 않는 코인 조회 시 예외가 발생한다")
        void throwsExceptionWhenCoinNotFound() {
            // given
            when(coinGeckoClient.getCoinsMarkets("usd", "unknown"))
                    .thenReturn(List.of());

            // when & then
            assertThatThrownBy(() -> marketService.getCoinDetail("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException e = (BusinessException) ex;
                        assertThat(e.getErrorCode()).isEqualTo(ErrorCode.COIN_NOT_FOUND);
                    });
        }
    }

    @Nested
    @DisplayName("getOhlcv")
    class GetOhlcv {

        @ParameterizedTest
        @ValueSource(strings = {"1h", "4h", "1d", "1w"})
        @DisplayName("유효한 타임프레임으로 OHLCV 데이터를 조회한다")
        void returnsOhlcvData(String timeframe) {
            // given
            List<OhlcData> mockData = List.of(
                    new OhlcData(1709395200000L, new BigDecimal("61942"), new BigDecimal("62211"),
                            new BigDecimal("61721"), new BigDecimal("61845"))
            );
            when(coinGeckoClient.getOhlc(eq("bitcoin"), eq("usd"), anyString()))
                    .thenReturn(mockData);

            // when
            List<OhlcData> result = marketService.getOhlcv("bitcoin", timeframe);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).timestamp()).isEqualTo(1709395200000L);
        }

        @ParameterizedTest
        @ValueSource(strings = {"1m", "5m", "2h", "3d", "invalid"})
        @DisplayName("유효하지 않은 타임프레임이면 예외가 발생한다")
        void throwsExceptionForInvalidTimeframe(String invalidTimeframe) {
            // when & then
            assertThatThrownBy(() -> marketService.getOhlcv("bitcoin", invalidTimeframe))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException e = (BusinessException) ex;
                        assertThat(e.getErrorCode()).isEqualTo(ErrorCode.INVALID_PARAMETER);
                    });
        }
    }

    private CoinMarketData createCoinMarketData(String id, String symbol, String name) {
        return new CoinMarketData(
                id,
                symbol,
                name,
                "https://example.com/image.png",
                new BigDecimal("50000"),
                new BigDecimal("1000000000000"),
                1,
                new BigDecimal("500000000"),
                new BigDecimal("51000"),
                new BigDecimal("49000"),
                new BigDecimal("500"),
                new BigDecimal("1.5"),
                new BigDecimal("19000000"),
                new BigDecimal("21000000"),
                "2024-01-01T00:00:00.000Z"
        );
    }
}
