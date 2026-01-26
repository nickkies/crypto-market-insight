package com.crypto.market.insight.domain.strategy.service;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import com.crypto.market.insight.domain.market.service.MarketService;
import com.crypto.market.insight.domain.strategy.dto.BacktestDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Facade Service - strategy와 market 도메인 연결
 * Controller → Facade → 개별 Service 구조 유지
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BacktestFacadeService {

    private final BacktestService backtestService;
    private final MarketService marketService;

    public BacktestDto.Response runBacktest(BacktestDto.Request request, Long userId) {
        // 1. Timeframe 파싱 (market 도메인)
        Timeframe timeframe = marketService.parseTimeframe(request.getTimeframe());

        // 2. OHLCV 데이터 조회 (market 도메인)
        List<OhlcvData> candles = marketService.getOhlcv(request.getCoinId(), timeframe.getDays());

        // 3. 백테스트 실행 (strategy 도메인)
        return backtestService.runBacktest(request, userId, candles, timeframe);
    }

    public BacktestDto.Response getBacktest(Long id) {
        return backtestService.getBacktest(id);
    }

    public List<BacktestDto.Response> getBacktestsByUserId(Long userId) {
        return backtestService.getBacktestsByUserId(userId);
    }

    public void deleteBacktest(Long userId, Long id) {
        backtestService.deleteBacktest(userId, id);
    }
}
