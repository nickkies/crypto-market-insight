package com.crypto.market.insight.domain.market.controller;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.GlobalStatsDto.GlobalStatsResponse;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.IndicatorResponse;
import com.crypto.market.insight.domain.market.dto.MarketDto.CoinListResponse;
import com.crypto.market.insight.domain.market.dto.MarketDto.CoinSummary;
import com.crypto.market.insight.domain.market.dto.MarketDto.OhlcvDataDto;
import com.crypto.market.insight.domain.market.dto.MarketDto.OhlcvResponse;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Category;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import com.crypto.market.insight.domain.market.service.IndicatorService;
import com.crypto.market.insight.domain.market.service.MarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/market")
@Tag(name = "Market", description = "암호화폐 시장 데이터 API")
@Validated
public class MarketController {

    private final MarketService marketService;
    private final IndicatorService indicatorService;

    @Operation(
            summary = "코인 목록 조회",
            description = "암호화폐 시장 데이터 목록을 페이지네이션으로 조회합니다. 카테고리별 필터링 가능."
    )
    @GetMapping("/coins")
    public ResponseEntity<CoinListResponse> getCoins(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "페이지당 개수 (1-250)", example = "10")
            @RequestParam(defaultValue = "10") @Min(1) @Max(250) int size,
            @Parameter(description = "카테고리 ID", example = "LAYER_1")
            @RequestParam(required = false) Category category
    ) {
        List<CoinMarketData> coins = marketService.getCoins(page, size, category);
        List<CoinSummary> coinSummaries = coins.stream()
                .map(CoinSummary::from)
                .toList();
        return ResponseEntity.ok(CoinListResponse.of(coinSummaries, page, size));
    }

    @Operation(
            summary = "코인 상세 조회",
            description = "특정 코인의 상세 시장 데이터를 조회합니다."
    )
    @GetMapping("/coins/{coinId}")
    public ResponseEntity<CoinMarketData> getCoinDetail(
            @Parameter(description = "코인 ID", example = "bitcoin")
            @PathVariable String coinId
    ) {
        CoinMarketData coin = marketService.getCoinDetail(coinId);
        return ResponseEntity.ok(coin);
    }

    @Operation(
            summary = "OHLCV 차트 데이터 조회",
            description = "특정 코인의 OHLCV(시가, 고가, 저가, 종가) 차트 데이터를 조회합니다."
    )
    @GetMapping("/coins/{coinId}/ohlcv")
    public ResponseEntity<OhlcvResponse> getOhlcv(
            @Parameter(description = "코인 ID", example = "bitcoin")
            @PathVariable String coinId,
            @Parameter(description = "타임프레임 (1h, 4h, 1d, 1w)", example = "1d")
            @RequestParam(defaultValue = "1d") String timeframe
    ) {
        Timeframe tf = marketService.parseTimeframe(timeframe);
        List<OhlcvData> ohlcvData = marketService.getOhlcv(coinId, tf);
        List<OhlcvDataDto> ohlcvDataDtos = ohlcvData.stream()
                .map(OhlcvDataDto::from)
                .toList();
        return ResponseEntity.ok(OhlcvResponse.of(coinId, tf.getValue(), ohlcvDataDtos));
    }

    @Operation(
            summary = "기술적 지표 조회",
            description = "특정 코인의 기술적 지표(RSI, MACD, MA, Bollinger Bands)를 계산하여 조회합니다."
    )
    @GetMapping("/coins/{coinId}/indicators")
    public ResponseEntity<IndicatorResponse> getIndicators(
            @Parameter(description = "코인 ID", example = "bitcoin")
            @PathVariable String coinId,
            @Parameter(description = "분석 기간 (일)", example = "365")
            @RequestParam(defaultValue = "365") @Min(14) @Max(365) int period
    ) {
        IndicatorResponse indicators = indicatorService.calculateIndicators(coinId, period);
        return ResponseEntity.ok(indicators);
    }

    @Operation(
            summary = "글로벌 시장 통계 조회",
            description = "암호화폐 시장 전체의 통계 데이터(총 시가총액, 거래량, BTC 도미넌스 등)를 조회합니다."
    )
    @GetMapping("/global")
    public ResponseEntity<GlobalStatsResponse> getGlobalStats() {
        GlobalStatsResponse stats = marketService.getGlobalStats();
        return ResponseEntity.ok(stats);
    }
}
