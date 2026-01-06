import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useIntersectionObserver } from './useIntersectionObserver';

function TestComponent({
  threshold,
  rootMargin,
  enabled,
}: {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    enabled,
  });
  return (
    <div>
      <div ref={ref} data-testid="target" />
      <span data-testid="status">{isIntersecting ? 'visible' : 'hidden'}</span>
    </div>
  );
}

describe('useIntersectionObserver', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
      root = null;
      rootMargin = '';
      thresholds = [];
      takeRecords = vi.fn(() => []);
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('컴포넌트 마운트 시 observer가 생성되고 observe가 호출된다', () => {
    render(<TestComponent />);

    expect(mockObserve).toHaveBeenCalledWith(screen.getByTestId('target'));
  });

  it('enabled가 false이면 observer를 생성하지 않는다', () => {
    render(<TestComponent enabled={false} />);

    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('교차 상태 변경 시 callback이 호출된다', () => {
    render(<TestComponent />);

    expect(mockObserve).toHaveBeenCalled();
  });

  it('교차 상태가 변경되면 isIntersecting이 업데이트된다', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('hidden');

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId('status')).toHaveTextContent('visible');
  });

  it('unmount 시 observer가 disconnect된다', () => {
    const { unmount } = render(<TestComponent />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
