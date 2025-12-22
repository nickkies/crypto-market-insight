package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.math.BigDecimal;

/**
 * CoinGecko OHLC 응답 배열을 OhlcData record로 변환하는 디시리얼라이저
 * <p>
 * API 응답 형식: [timestamp, open, high, low, close]
 */
public class OhlcDataDeserializer extends JsonDeserializer<OhlcData> {

    @Override
    public OhlcData deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);

        if (!node.isArray() || node.size() < 5) {
            return null;
        }

        return new OhlcData(
                node.get(0).asLong(),
                new BigDecimal(node.get(1).asText()),
                new BigDecimal(node.get(2).asText()),
                new BigDecimal(node.get(3).asText()),
                new BigDecimal(node.get(4).asText())
        );
    }
}
