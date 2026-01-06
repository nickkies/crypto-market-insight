package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * CoinGecko Market Chart API 응답 DTO
 * <p>
 * API 응답 형식:
 * {
 *   "prices": [[timestamp, price], ...],
 *   "market_caps": [[timestamp, market_cap], ...],
 *   "total_volumes": [[timestamp, volume], ...]
 * }
 */
public record MarketChartData(
        List<List<Number>> prices,
        @JsonProperty("market_caps") List<List<Number>> marketCaps,
        @JsonProperty("total_volumes") List<List<Number>> totalVolumes
) {}
