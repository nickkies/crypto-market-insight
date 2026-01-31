package com.crypto.market.insight.unit.domain.market.service;

import static com.crypto.market.insight.support.fixture.MarketFixture.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.MarketChartData;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Category;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import com.crypto.market.insight.domain.market.service.MarketService;
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
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), isNull(), anyInt(), anyInt()))
                    .thenReturn(defaultCoins());

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, null);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.getFirst().id()).isEqualTo("bitcoin");
        }

        @Test
        @DisplayName("카테고리로 필터링한다")
        void filtersByCategory() {
            // given
            when(coinGeckoClient.getCoinsMarkets(eq("usd"), isNull(), eq("layer-1"), anyInt(), anyInt()))
                    .thenReturn(defaultCoins());

            // when
            List<CoinMarketData> result = marketService.getCoins(1, 10, Category.LAYER_1);

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
            when(coinGeckoClient.getCoinsMarkets("usd", "bitcoin"))
                    .thenReturn(List.of(bitcoin()));

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
    @DisplayName("parseTimeframe")
    class ParseTimeframe {

        @ParameterizedTest
        @ValueSource(strings = {"1d", "3d", "1w"})
        @DisplayName("유효한 타임프레임을 파싱한다")
        void parsesValidTimeframe(String timeframe) {
            // when
            Timeframe result = marketService.parseTimeframe(timeframe);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getValue()).isEqualTo(timeframe);
        }

        @ParameterizedTest
        @ValueSource(strings = {"1h", "4h", "1m", "5m", "2h", "invalid"})
        @DisplayName("유효하지 않은 타임프레임이면 예외가 발생한다")
        void throwsExceptionForInvalidTimeframe(String invalidTimeframe) {
            // when & then
            assertThatThrownBy(() -> marketService.parseTimeframe(invalidTimeframe))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException e = (BusinessException) ex;
                        assertThat(e.getErrorCode()).isEqualTo(ErrorCode.INVALID_PARAMETER);
                    });
        }
    }

    @Nested
    @DisplayName("getOhlcv")
    class GetOhlcv {

        @Test
        @DisplayName("OHLCV 데이터를 조회한다")
        void returnsOhlcvData() {
            // given - ONE_DAY uses "30" days
            when(coinGeckoClient.getOhlc("bitcoin", "usd", "30"))
                    .thenReturn(defaultOhlcList());
            when(coinGeckoClient.getMarketChart("bitcoin", "usd", "30"))
                    .thenReturn(new MarketChartData(List.of(), List.of(), List.of()));

            // when
            List<OhlcvData> result = marketService.getOhlcv("bitcoin", Timeframe.ONE_DAY);

            // then
            assertThat(result).hasSize(3);
            assertThat(result.getFirst().timestamp()).isEqualTo(1709395200000L);
        }

        @Test
        @DisplayName("타임프레임에 따라 올바른 days 값을 사용한다")
        void useCorrectDaysForTimeframe() {
            // given - ONE_DAY uses "30" days
            when(coinGeckoClient.getOhlc("bitcoin", "usd", "30"))
                    .thenReturn(List.of());
            when(coinGeckoClient.getMarketChart("bitcoin", "usd", "30"))
                    .thenReturn(new MarketChartData(List.of(), List.of(), List.of()));

            // when
            marketService.getOhlcv("bitcoin", Timeframe.ONE_DAY);

            // then - no exception means correct days value was used
        }
    }
}
