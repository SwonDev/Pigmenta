/**
 * Advanced Color Harmony Generators
 * Based on color theory and mathematical relationships
 */

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorHarmony {
  primary: HSLColor;
  secondary: HSLColor;
  accent: HSLColor;
  background: HSLColor;
  text: HSLColor;
}

export class ColorHarmonyGenerator {
  /**
   * Generate complementary color scheme (opposite on color wheel)
   */
  static generateComplementary(baseHue: number, saturation = 70, lightness = 50): ColorHarmony {
    const complementaryHue = (baseHue + 180) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: complementaryHue, s: saturation * 0.8, l: lightness + 10 },
      accent: { h: complementaryHue, s: saturation * 1.1, l: lightness - 5 },
      background: { h: baseHue, s: saturation * 0.15, l: 95 },
      text: { h: baseHue, s: saturation * 0.2, l: 20 },
    };
  }

  /**
   * Generate analogous color scheme (adjacent colors on wheel)
   */
  static generateAnalogous(baseHue: number, saturation = 65, lightness = 55): ColorHarmony {
    const analogous1 = (baseHue + 30) % 360;
    const analogous2 = (baseHue - 30 + 360) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: analogous1, s: saturation * 0.85, l: lightness + 8 },
      accent: { h: analogous2, s: saturation * 0.9, l: lightness - 5 },
      background: { h: baseHue, s: saturation * 0.2, l: 96 },
      text: { h: baseHue, s: saturation * 0.25, l: 18 },
    };
  }

  /**
   * Generate triadic color scheme (120° apart)
   */
  static generateTriadic(baseHue: number, saturation = 70, lightness = 52): ColorHarmony {
    const triadic1 = (baseHue + 120) % 360;
    const triadic2 = (baseHue + 240) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: triadic1, s: saturation * 0.75, l: lightness + 10 },
      accent: { h: triadic2, s: saturation * 0.85, l: lightness - 3 },
      background: { h: baseHue, s: saturation * 0.12, l: 97 },
      text: { h: baseHue, s: saturation * 0.18, l: 22 },
    };
  }

  /**
   * Generate tetradic color scheme (90° apart, square)
   */
  static generateTetradic(baseHue: number, saturation = 68, lightness = 50): ColorHarmony {
    const tetradic1 = (baseHue + 90) % 360;
    const tetradic2 = (baseHue + 180) % 360;
    const tetradic3 = (baseHue + 270) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: tetradic1, s: saturation * 0.8, l: lightness + 8 },
      accent: { h: tetradic2, s: saturation * 0.9, l: lightness - 5 },
      background: { h: tetradic3, s: saturation * 0.15, l: 96 },
      text: { h: baseHue, s: saturation * 0.2, l: 20 },
    };
  }

  /**
   * Generate monochromatic color scheme (same hue, different saturation/lightness)
   */
  static generateMonochromatic(baseHue: number, saturation = 65, lightness = 50): ColorHarmony {
    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: baseHue, s: saturation * 0.7, l: lightness + 15 },
      accent: { h: baseHue, s: saturation * 1.15, l: lightness - 8 },
      background: { h: baseHue, s: saturation * 0.18, l: 97 },
      text: { h: baseHue, s: saturation * 0.22, l: 18 },
    };
  }

  /**
   * Generate split-complementary color scheme
   */
  static generateSplitComplementary(baseHue: number, saturation = 70, lightness = 52): ColorHarmony {
    const complementary = (baseHue + 180) % 360;
    const split1 = (complementary + 30) % 360;
    const split2 = (complementary - 30 + 360) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: split1, s: saturation * 0.85, l: lightness + 8 },
      accent: { h: split2, s: saturation * 0.9, l: lightness - 5 },
      background: { h: baseHue, s: saturation * 0.15, l: 96 },
      text: { h: baseHue, s: saturation * 0.2, l: 20 },
    };
  }

  /**
   * Generate harmony based on golden ratio (1.618)
   */
  static generateGoldenRatio(baseHue: number, saturation = 68, lightness = 52): ColorHarmony {
    const goldenAngle = 137.5; // 360 / φ²
    const secondary = (baseHue + goldenAngle) % 360;
    const accent = (baseHue + goldenAngle * 2) % 360;

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: secondary, s: saturation * 0.82, l: lightness + 10 },
      accent: { h: accent, s: saturation * 0.88, l: lightness - 6 },
      background: { h: baseHue, s: saturation * 0.14, l: 96 },
      text: { h: baseHue, s: saturation * 0.18, l: 21 },
    };
  }

  /**
   * Generate harmony based on Fibonacci sequence
   */
  static generateFibonacci(baseHue: number, saturation = 70, lightness = 50): ColorHarmony {
    const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
    const angle1 = (baseHue + fib[8] * 2) % 360; // 21 * 2 = 42°
    const angle2 = (baseHue + fib[9] * 2) % 360; // 34 * 2 = 68°

    return {
      primary: { h: baseHue, s: saturation, l: lightness },
      secondary: { h: angle1, s: saturation * 0.85, l: lightness + 10 },
      accent: { h: angle2, s: saturation * 0.92, l: lightness - 5 },
      background: { h: baseHue, s: saturation * 0.16, l: 96 },
      text: { h: baseHue, s: saturation * 0.2, l: 20 },
    };
  }

  /**
   * Generate warm color harmony
   */
  static generateWarmHarmony(baseHue: number, saturation = 75, lightness = 55): ColorHarmony {
    // Shift towards warm colors (reds, oranges, yellows)
    const warmBase = this.shiftTowardsWarm(baseHue);

    return {
      primary: { h: warmBase, s: saturation, l: lightness },
      secondary: { h: (warmBase + 25) % 360, s: saturation * 0.85, l: lightness + 8 },
      accent: { h: (warmBase - 20 + 360) % 360, s: saturation * 0.95, l: lightness - 5 },
      background: { h: warmBase, s: saturation * 0.2, l: 96 },
      text: { h: warmBase, s: saturation * 0.25, l: 18 },
    };
  }

  /**
   * Generate cool color harmony
   */
  static generateCoolHarmony(baseHue: number, saturation = 70, lightness = 55): ColorHarmony {
    // Shift towards cool colors (blues, greens, purples)
    const coolBase = this.shiftTowardsCool(baseHue);

    return {
      primary: { h: coolBase, s: saturation, l: lightness },
      secondary: { h: (coolBase + 30) % 360, s: saturation * 0.8, l: lightness + 10 },
      accent: { h: (coolBase - 25 + 360) % 360, s: saturation * 0.9, l: lightness - 5 },
      background: { h: coolBase, s: saturation * 0.18, l: 97 },
      text: { h: coolBase, s: saturation * 0.22, l: 20 },
    };
  }

  /**
   * Generate natural/earthy harmony
   */
  static generateNaturalHarmony(saturation = 50, lightness = 50): ColorHarmony {
    return {
      primary: { h: 120, s: saturation, l: lightness }, // Green
      secondary: { h: 35, s: saturation * 0.8, l: lightness - 5 }, // Brown
      accent: { h: 200, s: saturation * 0.7, l: lightness + 8 }, // Sky blue
      background: { h: 45, s: saturation * 0.2, l: 96 }, // Cream
      text: { h: 30, s: saturation * 0.4, l: 20 }, // Dark brown
    };
  }

  /**
   * Generate pastel harmony (low saturation, high lightness)
   */
  static generatePastelHarmony(baseHue: number): ColorHarmony {
    const analogous = (baseHue + 35) % 360;

    return {
      primary: { h: baseHue, s: 40, l: 75 },
      secondary: { h: analogous, s: 35, l: 80 },
      accent: { h: (baseHue + 180) % 360, s: 45, l: 70 },
      background: { h: baseHue, s: 15, l: 97 },
      text: { h: baseHue, s: 30, l: 25 },
    };
  }

  /**
   * Generate vibrant/neon harmony (high saturation)
   */
  static generateVibrantHarmony(baseHue: number): ColorHarmony {
    return {
      primary: { h: baseHue, s: 95, l: 55 },
      secondary: { h: (baseHue + 120) % 360, s: 90, l: 58 },
      accent: { h: (baseHue + 240) % 360, s: 92, l: 52 },
      background: { h: baseHue, s: 10, l: 8 }, // Dark for contrast
      text: { h: baseHue, s: 5, l: 98 }, // Light text on dark
    };
  }

  /**
   * Generate elegant/sophisticated harmony (muted colors)
   */
  static generateElegantHarmony(baseHue: number): ColorHarmony {
    return {
      primary: { h: baseHue, s: 35, l: 45 },
      secondary: { h: (baseHue + 30) % 360, s: 28, l: 55 },
      accent: { h: 45, s: 60, l: 55 }, // Gold accent
      background: { h: baseHue, s: 8, l: 96 },
      text: { h: baseHue, s: 20, l: 18 },
    };
  }

  /**
   * Generate corporate/professional harmony
   */
  static generateCorporateHarmony(baseHue: number): ColorHarmony {
    return {
      primary: { h: baseHue, s: 65, l: 45 },
      secondary: { h: baseHue, s: 45, l: 60 },
      accent: { h: (baseHue + 180) % 360, s: 70, l: 50 },
      background: { h: 0, s: 0, l: 97 },
      text: { h: 0, s: 0, l: 15 },
    };
  }

  /**
   * Shift hue towards warm colors
   */
  private static shiftTowardsWarm(hue: number): number {
    // Warm range: 0-60 (red to yellow)
    if (hue >= 0 && hue <= 60) return hue;
    if (hue > 60 && hue <= 180) return 60 - (hue - 60) * 0.3;
    if (hue > 180 && hue <= 300) return 360 - (300 - hue) * 0.3;
    return hue;
  }

  /**
   * Shift hue towards cool colors
   */
  private static shiftTowardsCool(hue: number): number {
    // Cool range: 180-300 (cyan to purple)
    if (hue >= 180 && hue <= 300) return hue;
    if (hue > 300 || hue < 60) return 240;
    return 180 + (hue - 60) * 0.5;
  }

  /**
   * Apply saturation and lightness adjustments
   */
  static adjustColor(
    color: HSLColor,
    saturationDelta: number,
    lightnessDelta: number
  ): HSLColor {
    return {
      h: color.h,
      s: Math.max(0, Math.min(100, color.s + saturationDelta * 100)),
      l: Math.max(0, Math.min(100, color.l + lightnessDelta * 100)),
    };
  }

  /**
   * Generate color variations (lighter and darker versions)
   */
  static generateVariations(color: HSLColor): {
    base: HSLColor;
    light: HSLColor;
    lighter: HSLColor;
    dark: HSLColor;
    darker: HSLColor;
  } {
    return {
      base: color,
      light: { ...color, l: Math.min(100, color.l + 15) },
      lighter: { ...color, l: Math.min(100, color.l + 25) },
      dark: { ...color, l: Math.max(0, color.l - 15) },
      darker: { ...color, l: Math.max(0, color.l - 25) },
    };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static calculateContrastRatio(color1: HSLColor, color2: HSLColor): number {
    const l1 = this.relativeLuminance(color1);
    const l2 = this.relativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance (for WCAG contrast)
   */
  private static relativeLuminance(color: HSLColor): number {
    // Convert HSL to RGB first
    const rgb = this.hslToRgb(color);

    // Apply gamma correction
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert HSL to RGB
   */
  private static hslToRgb(hsl: HSLColor): [number, number, number] {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Ensure WCAG AA compliance (4.5:1 for text)
   */
  static ensureAccessibility(foreground: HSLColor, background: HSLColor): HSLColor {
    let adjusted = { ...foreground };
    let contrast = this.calculateContrastRatio(adjusted, background);

    // Target 4.5:1 for AA compliance
    const targetContrast = 4.5;

    if (contrast < targetContrast) {
      // Adjust lightness to improve contrast
      const step = background.l > 50 ? -2 : 2;

      while (contrast < targetContrast && adjusted.l > 0 && adjusted.l < 100) {
        adjusted.l = Math.max(0, Math.min(100, adjusted.l + step));
        contrast = this.calculateContrastRatio(adjusted, background);

        // Prevent infinite loop
        if ((step < 0 && adjusted.l === 0) || (step > 0 && adjusted.l === 100)) {
          break;
        }
      }
    }

    return adjusted;
  }
}
