// Design tokens extracted from design_app.json
export const DESIGN_TOKENS = {
  colors: {
    background: {
      app: '#07090B',
      canvas: '#0B0F12',
      panel: '#0F161A',
      elevated: '#11161A'
    },
    surface: {
      card: '#0F1620',
      mutedCard: '#0B1116',
      glass: 'rgba(255,255,255,0.03)',
      primary: '#0B0F12'
    },
    text: {
      primary: '#E7EEF6',
      secondary: '#B6C6D3',
      muted: '#8D9AA6',
      placeholder: '#64707A',
      inverse: '#061014'
    },
    border: {
    primary: 'rgba(255,255,255,0.06)',
    strong: 'rgba(255,255,255,0.06)',
    subtle: 'rgba(255,255,255,0.03)',
    secondary: 'rgba(255,255,255,0.04)'
  },
    shadow: {
      low: '0 4px 10px rgba(2,6,10,0.6)',
      medium: '0 8px 24px rgba(2,6,10,0.7)',
      high: '0 16px 48px rgba(2,6,10,0.75)'
    },
    accent: {
      primary: '#23AAD7',
      primaryContrast: '#061A22',
      accentStrong: '#20A0CB',
      accentMuted: '#157696',
      success: '#2ECC71',
      warning: '#F1C40F',
      danger: '#E74C3C',
      hover: '#20A0CB'
    },
    glassCrystal: {
      glow: 'linear-gradient(135deg, rgba(35,170,215,0.16), rgba(138,95,255,0.08))',
      specular: 'rgba(255,255,255,0.02)'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16
  },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial',
    sizes: {
      h1: 28,
      h2: 20,
      h3: 16,
      body: 14,
      small: 12
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700
    },
    lineHeights: {
      h1: 36,
      h2: 28,
      body: 20
    }
  },
  elevation: {
    level0: 'none',
    level1: '0 2px 6px rgba(2,6,10,0.45)',
    level2: '0 8px 20px rgba(2,6,10,0.55)'
  },
  layout: {
    viewport: {
      maxWidth: 1200,
      gutter: 24
    },
    header: {
      height: 72,
      background: 'transparent',
      borderBottom: '1px solid rgba(255,255,255,0.03)'
    },
    main: {
      padding: 24,
      grid: {
        columns: 12,
        gap: 16
      }
    },
    sidebar: {
      width: 320,
      background: '#0B1116',
      borderRight: '1px solid rgba(255,255,255,0.03)'
    }
  },
  components: {
    colorPickerPanel: {
      background: '#0F1620',
      border: '1px solid rgba(255,255,255,0.04)',
      radius: 10,
      padding: 16,
      controls: {
        sliders: {
          track: 'rgba(255,255,255,0.03)',
          thumb: '#23AAD7',
          thumbShadow: '0 2px 8px rgba(35,170,215,0.22)'
        },
        inputs: {
          background: '#071017',
          border: '1px solid rgba(255,255,255,0.04)',
          text: '#E7EEF6',
          placeholder: '#64707A'
        }
      }
    },
    swatchesGrid: {
      background: 'transparent',
      item: {
        size: 84,
        radius: 8,
        label: {
          color: '#E7EEF6',
          weight: 500,
          size: 12
        },
        hexBadge: {
          background: 'rgba(0,0,0,0.36)',
          text: '#E7EEF6',
          padding: '4px 6px',
          radius: 6
        },
        selectedOutline: '2px solid rgba(35,170,215,0.24)',
        shadow: '0 6px 18px rgba(2,6,10,0.6)'
      }
    },
    codeBlock: {
      background: '#071019',
      border: '1px solid rgba(255,255,255,0.03)',
      text: '#A6C0D6',
      padding: 16,
      radius: 10,
      copyButton: {
        background: 'rgba(255,255,255,0.03)',
        iconColor: '#B6C6D3'
      }
    },
    buttons: {
      primary: {
        background: '#23AAD7',
        text: '#06141A',
        hover: {
          background: '#20A0CB',
          elevation: '0 2px 6px rgba(2,6,10,0.45)'
        },
        active: {
          background: '#1985a9',
          transform: 'translateY(1px)'
        }
      }
    }
  }
};

// Backward compatibility mapping
export const DARK_THEME_COLORS = {
  background: {
    primary: DESIGN_TOKENS.colors.background.canvas,
    secondary: DESIGN_TOKENS.colors.surface.mutedCard,
    tertiary: DESIGN_TOKENS.colors.surface.card
  },
  text: {
    primary: DESIGN_TOKENS.colors.text.primary,
    secondary: DESIGN_TOKENS.colors.text.secondary,
    tertiary: DESIGN_TOKENS.colors.text.muted
  },
  border: {
    primary: DESIGN_TOKENS.colors.border.strong,
    secondary: DESIGN_TOKENS.colors.border.subtle,
    subtle: DESIGN_TOKENS.colors.border.subtle
  },
  accent: {
    primary: DESIGN_TOKENS.colors.accent.primary,
    hover: DESIGN_TOKENS.colors.accent.accentStrong
  },
  surface: {
    primary: DESIGN_TOKENS.colors.surface.card,
    secondary: DESIGN_TOKENS.colors.surface.mutedCard,
    tertiary: DESIGN_TOKENS.colors.surface.mutedCard
  }
};