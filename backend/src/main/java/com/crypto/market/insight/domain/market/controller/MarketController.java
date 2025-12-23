package com.crypto.market.insight.domain.market.controller;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.MarketDto.CoinListResponse;
import com.crypto.market.insight.domain.market.dto.MarketDto.CoinSummary;
import com.crypto.market.insight.domain.market.dto.MarketDto.OhlcvDataDto;
import com.crypto.market.insight.domain.market.dto.MarketDto.OhlcvResponse;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.service.MarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/market")
@Tag(name = "Market", description = "암호화폐 시장 데이터 API")
public class MarketController {

    private final MarketService marketService;

    @Operation(
            summary = "코인 목록 조회",
            description = "암호화폐 시장 데이터 목록을 페이지네이션으로 조회합니다."
    )
    @GetMapping("/coins")
    public ResponseEntity<CoinListResponse> getCoins(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지당 개수 (최대 250)", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "검색 키워드 (symbol, name)", example = "btc")
            @RequestParam(required = false) String keyword
    ) {
        List<CoinMarketData> coins = marketService.getCoins(page, size, keyword);
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
        List<OhlcData> ohlcData = marketService.getOhlcv(coinId, timeframe);
        List<OhlcvDataDto> ohlcvDataDtos = ohlcData.stream()
                .map(OhlcvDataDto::from)
                .toList();
        return ResponseEntity.ok(OhlcvResponse.of(coinId, timeframe, ohlcvDataDtos));
    }
}
