# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-06

### Added

#### Frontend

- Category filter for market page
- Progressive Web App (PWA) support
- Error handling for CoinSelect component
- ErrorState for Market page indicator cards
- Rate limit handling in hooks

#### Backend

- Category API endpoint

### Changed

- Navigation UI improvements
- Mobile UX enhancements
- Frontend route test performance
- Backend cache test self-invocation fix

### Fixed

- Layout fixes (#185)

---

## [1.0.0] - 2026-01-16

### Added

#### Frontend

- Home dashboard with Top Movers (gainers/losers)
- Market page with OHLCV candlestick charts (ECharts)
- Technical indicators: MA, RSI, MACD, Bollinger Bands
- Trading signal summary with strength indicators
- Coin detail page with price history
- Backtest page with strategy simulation
- GitHub OAuth login
- Favorites synchronization for logged-in users
- Rate limit handling with countdown timer
- Responsive UI with Styled Components
- E2E tests with Playwright and API mocking

#### Backend

- CoinGecko API integration for market data
- Technical indicator calculation engine
- Strategy backtest simulation (RSI, MACD, Bollinger Bands, Moving Average)
- Performance metrics: ROI, MDD, Win Rate, Sharpe Ratio
- JWT authentication with GitHub OAuth2
- User favorites management
- Caffeine caching for API optimization
- Rate limiting (anonymous: 5/min, authenticated: 10/min)
- Swagger/OpenAPI documentation

#### Infrastructure

- Docker support (development and production)
- GitHub Actions CI/CD (frontend and backend)
- Vercel deployment (frontend)
- Render deployment (backend)
- Supabase PostgreSQL database

### Security

- OAuth2 authentication flow
- JWT token-based authorization
- CORS configuration for cross-origin requests

---

## Links

- [Frontend](https://crypto-market-insight.vercel.app)
- [Backend API](https://crypto-market-insight.onrender.com)
- [API Documentation](https://crypto-market-insight.onrender.com/swagger-ui/index.html)
