package com.crypto.market.insight.domain.market.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

public class MarketDto {

    @Schema(description = "코인 목록 응답")
    public record CoinListResponse(
            @Schema(description = "코인 목록")
            List<CoinSummary> coins,

            @Schema(description = "페이지 번호", example = "1")
            int page,

            @Schema(description = "페이지당 개수", example = "10")
            int size
    ) {
        public static CoinListResponse of(List<CoinSummary> coins, int page, int size) {
            return new CoinListResponse(coins, page, size);
        }
    }

    @Schema(description = "코인 요약 정보")
    public record CoinSummary(
            @Schema(description = "코인 ID", example = "bitcoin")
            String id,

            @Schema(description = "코인 심볼", example = "btc")
            String symbol,

            @Schema(description = "코인 이름", example = "Bitcoin")
            String name,

            @Schema(description = "코인 이미지 URL")
            String image,

            @Schema(description = "현재 가격", example = "97500.25")
            BigDecimal currentPrice,

            @Schema(description = "시가총액", example = "1930000000000")
            BigDecimal marketCap,

            @Schema(description = "시가총액 순위", example = "1")
            Integer marketCapRank,

            @Schema(description = "24시간 가격 변화율 (%)", example = "2.5")
            BigDecimal priceChangePercentage24h
    ) {
        public static CoinSummary from(CoinMarketData data) {
            return new CoinSummary(
                    data.id(),
                    data.symbol(),
                    data.name(),
                    data.image(),
                    data.currentPrice(),
                    data.marketCap(),
                    data.marketCapRank(),
                    data.priceChangePercentage24h()
            );
        }
    }

    @Schema(description = "OHLCV 차트 응답")
    public record OhlcvResponse(
            @Schema(description = "코인 ID", example = "bitcoin")
            String coinId,

            @Schema(description = "타임프레임", example = "1d")
            String timeframe,

            @Schema(description = "OHLCV 데이터 목록")
            List<OhlcvDataDto> data
    ) {
        public static OhlcvResponse of(String coinId, String timeframe, List<OhlcvDataDto> data) {
            return new OhlcvResponse(coinId, timeframe, data);
        }
    }

    @Schema(description = "OHLCV 데이터")
    public record OhlcvDataDto(
            @Schema(description = "타임스탬프 (Unix 밀리초)", example = "1709395200000")
            Long timestamp,

            @Schema(description = "시가", example = "61942.00")
            BigDecimal open,

            @Schema(description = "고가", example = "62211.00")
            BigDecimal high,

            @Schema(description = "저가", example = "61721.00")
            BigDecimal low,

            @Schema(description = "종가", example = "61845.00")
            BigDecimal close
    ) {
        public static OhlcvDataDto from(OhlcData data) {
            return new OhlcvDataDto(
                    data.timestamp(),
                    data.open(),
                    data.high(),
                    data.low(),
                    data.close()
            );
        }
    }
}
