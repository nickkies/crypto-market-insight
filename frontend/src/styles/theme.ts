import { MARKET_COLORS } from './marketColors';

export interface Theme {
  colors: {
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // Brand colors
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    // Status colors
    success: string;
    error: string;
    warning: string;
    info: string;
    // Market colors (crypto specific)
    market: {
      up: string;
      down: string;
      neutral: string;
    };
    // Border colors
    border: {
      primary: string;
      secondary: string;
    };
  };
  fonts: {
    family: {
      primary: string;
      mono: string;
    };
    size: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    weight: {
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const baseTheme = {
  fonts: {
    family: {
      primary:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const lightTheme: Theme = {
  ...baseTheme,
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
    },
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    market: MARKET_COLORS,
    border: {
      primary: '#E2E8F0',
      secondary: '#CBD5E1',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme: Theme = {
  ...baseTheme,
  colors: {
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      tertiary: '#64748B',
      inverse: '#0F172A',
    },
    primary: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
    },
    success: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#38BDF8',
    market: MARKET_COLORS,
    border: {
      primary: '#334155',
      secondary: '#475569',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  },
};
