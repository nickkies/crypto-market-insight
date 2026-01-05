import { beforeEach, describe, expect, it } from 'vitest';
import { useFavoritesStore } from './useFavoritesStore';

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [] });
  });

  describe('addFavorite', () => {
    it('즐겨찾기에 코인을 추가한다', () => {
      useFavoritesStore.getState().addFavorite('bitcoin');

      expect(useFavoritesStore.getState().favorites).toContain('bitcoin');
    });

    it('중복된 코인은 추가하지 않는다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });

      useFavoritesStore.getState().addFavorite('bitcoin');

      expect(useFavoritesStore.getState().favorites).toEqual(['bitcoin']);
    });
  });

  describe('removeFavorite', () => {
    it('즐겨찾기에서 코인을 제거한다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin', 'ethereum'] });

      useFavoritesStore.getState().removeFavorite('bitcoin');

      expect(useFavoritesStore.getState().favorites).toEqual(['ethereum']);
    });

    it('존재하지 않는 코인 제거 시 상태가 유지된다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });

      useFavoritesStore.getState().removeFavorite('ethereum');

      expect(useFavoritesStore.getState().favorites).toEqual(['bitcoin']);
    });
  });

  describe('toggleFavorite', () => {
    it('즐겨찾기에 없으면 추가한다', () => {
      useFavoritesStore.getState().toggleFavorite('bitcoin');

      expect(useFavoritesStore.getState().favorites).toContain('bitcoin');
    });

    it('즐겨찾기에 있으면 제거한다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });

      useFavoritesStore.getState().toggleFavorite('bitcoin');

      expect(useFavoritesStore.getState().favorites).not.toContain('bitcoin');
    });
  });

  describe('isFavorite', () => {
    it('즐겨찾기에 있으면 true를 반환한다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });

      expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(true);
    });

    it('즐겨찾기에 없으면 false를 반환한다', () => {
      expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(false);
    });
  });
});
