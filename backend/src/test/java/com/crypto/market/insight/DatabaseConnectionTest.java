package com.crypto.market.insight;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("데이터베이스 연결 테스트")
    void shouldConnectToDatabase() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection).isNotNull();
            assertThat(connection.isValid(1)).isTrue();

            String dbName = connection.getCatalog();
            assertThat(dbName).isEqualTo("crypto_market_insight");

            System.out.println("✅ Database connection successful: " + dbName);
        }
    }

    @Test
    @DisplayName("데이터베이스 쿼리 실행 테스트")
    void shouldExecuteQuery() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        assertThat(result).isEqualTo(1);
        System.out.println("✅ Database query execution successful");
    }

    @Test
    @DisplayName("PostgreSQL 버전 확인")
    void shouldGetPostgresVersion() {
        String version = jdbcTemplate.queryForObject("SELECT version()", String.class);

        assertThat(version).contains("PostgreSQL");
        System.out.println("✅ PostgreSQL version: " + version);
    }
}
