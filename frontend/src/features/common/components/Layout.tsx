import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <div>
      <header>
        <nav>
          <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/market">Market</Link>
            </li>
            <li>
              <Link to="/backtest">Backtest</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
