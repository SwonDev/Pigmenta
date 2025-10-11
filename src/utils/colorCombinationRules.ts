/**
 * Color Combination Rules & Incompatibility Detection
 * Ensures generated palettes follow design best practices
 */

import { HSLColor } from './colorHarmony';

export interface ColorCompatibility {
  isCompatible: boolean;
  score: number; // 0-1, where 1 is highly compatible
  warnings: string[];
  suggestions: string[];
}

export class ColorCombinationRules {
  /**
   * Check if two colors are compatible
   */
  static checkCompatibility(color1: HSLColor, color2: HSLColor): ColorCompatibility {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // 1. Check hue difference
    const hueDiff = Math.abs(color1.h - color2.h);
    const minHueDiff = Math.min(hueDiff, 360 - hueDiff);

    // Too similar hues (muddy palette)
    if (minHueDiff < 15 && minHueDiff > 0) {
      warnings.push('Colors are too similar in hue');
      score -= 0.2;
      suggestions.push('Increase hue difference to at least 30°');
    }

    // Clashing hues (not complementary but close)
    if (minHueDiff > 150 && minHueDiff < 170) {
      warnings.push('Hues may clash visually');
      score -= 0.15;
      suggestions.push('Use true complementary colors (180°) or harmonious angles');
    }

    // 2. Check saturation compatibility
    const satDiff = Math.abs(color1.s - color2.s);

    // Extreme saturation difference
    if (satDiff > 70) {
      warnings.push('Extreme saturation difference may feel disjointed');
      score -= 0.1;
      suggestions.push('Balance saturation levels for cohesion');
    }

    // Both highly saturated
    if (color1.s > 80 && color2.s > 80) {
      warnings.push('Both colors highly saturated - may be overwhelming');
      score -= 0.1;
      suggestions.push('Reduce saturation of one color for balance');
    }

    // 3. Check lightness compatibility
    const lightDiff = Math.abs(color1.l - color2.l);

    // Too similar lightness
    if (lightDiff < 10) {
      warnings.push('Colors have similar lightness - low contrast');
      score -= 0.25;
      suggestions.push('Increase lightness difference for better contrast');
    }

    // 4. Check for accessibility (if used as text/background pair)
    const contrastRatio = this.calculateContrastRatio(color1, color2);
    if (contrastRatio < 3) {
      warnings.push('Low contrast ratio - not suitable for text/background');
      score -= 0.3;
      suggestions.push('Ensure 4.5:1 contrast ratio for WCAG AA compliance');
    }

    // 5. Check for vibrating colors (complementary high saturation)
    if (minHueDiff > 170 && minHueDiff < 190 && color1.s > 70 && color2.s > 70) {
      warnings.push('High saturation complementary colors may vibrate');
      score -= 0.15;
      suggestions.push('Reduce saturation or adjust hue slightly');
    }

    return {
      isCompatible: score >= 0.6,
      score: Math.max(0, score),
      warnings,
      suggestions,
    };
  }

  /**
   * Calculate WCAG contrast ratio between two colors
   */
  static calculateContrastRatio(color1: HSLColor, color2: HSLColor): number {
    const rgb1 = this.hslToRgb(color1);
    const rgb2 = this.hslToRgb(color2);

    const l1 = this.relativeLuminance(rgb1);
    const l2 = this.relativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert HSL to RGB
   */
  private static hslToRgb(hsl: HSLColor): [number, number, number] {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

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
   * Calculate relative luminance
   */
  private static relativeLuminance(rgb: [number, number, number]): number {
    const [r, g, b] = rgb.map(val => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Validate entire color palette
   */
  static validatePalette(colors: HSLColor[]): {
    isValid: boolean;
    overallScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const scores: number[] = [];

    // Check each color pair
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const compat = this.checkCompatibility(colors[i], colors[j]);
        scores.push(compat.score);

        if (!compat.isCompatible) {
          issues.push(`Color ${i + 1} and Color ${j + 1}: ${compat.warnings.join(', ')}`);
          recommendations.push(...compat.suggestions);
        }
      }
    }

    // Check for overall palette balance
    const avgSaturation = colors.reduce((sum, c) => sum + c.s, 0) / colors.length;
    const avgLightness = colors.reduce((sum, c) => sum + c.l, 0) / colors.length;

    if (avgSaturation > 80) {
      issues.push('Overall palette is overly saturated');
      recommendations.push('Include some muted tones for balance');
      scores.push(0.7);
    }

    if (avgSaturation < 20) {
      issues.push('Overall palette lacks vibrancy');
      recommendations.push('Add more saturated accent colors');
      scores.push(0.7);
    }

    if (avgLightness > 80 || avgLightness < 20) {
      issues.push('Palette lightness is extreme');
      recommendations.push('Balance with mid-range lightness values');
      scores.push(0.6);
    }

    // Check for color variety
    const hues = colors.map(c => c.h);
    const uniqueHueRanges = new Set(hues.map(h => Math.floor(h / 30)));
    if (uniqueHueRanges.size < 2) {
      issues.push('Limited hue variety');
      recommendations.push('Consider adding colors from different hue families');
      scores.push(0.8);
    }

    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;

    return {
      isValid: overallScore >= 0.7 && issues.length < 3,
      overallScore,
      issues: [...new Set(issues)],
      recommendations: [...new Set(recommendations)],
    };
  }

  /**
   * Auto-fix common palette issues
   */
  static autoFixPalette(colors: HSLColor[]): HSLColor[] {
    const fixed = [...colors];

    // Fix low contrast issues
    for (let i = 0; i < fixed.length - 1; i++) {
      const lightDiff = Math.abs(fixed[i].l - fixed[i + 1].l);
      if (lightDiff < 15) {
        // Increase contrast
        if (fixed[i].l < 50) {
          fixed[i].l = Math.max(10, fixed[i].l - 10);
          fixed[i + 1].l = Math.min(90, fixed[i + 1].l + 10);
        } else {
          fixed[i].l = Math.min(90, fixed[i].l + 10);
          fixed[i + 1].l = Math.max(10, fixed[i + 1].l - 10);
        }
      }
    }

    // Fix over-saturation
    const avgSat = fixed.reduce((sum, c) => sum + c.s, 0) / fixed.length;
    if (avgSat > 80) {
      fixed.forEach((color, i) => {
        if (i > 0) { // Keep first color saturated
          color.s = Math.max(30, color.s - 20);
        }
      });
    }

    // Ensure at least one light and one dark color
    const hasLight = fixed.some(c => c.l > 70);
    const hasDark = fixed.some(c => c.l < 30);

    if (!hasLight && fixed.length > 2) {
      fixed[fixed.length - 1].l = 85;
    }

    if (!hasDark && fixed.length > 2) {
      fixed[fixed.length - 2].l = 25;
    }

    return fixed;
  }

  /**
   * Suggest optimal color for a given context
   */
  static suggestContextColor(
    existingColors: HSLColor[],
    context: 'primary' | 'secondary' | 'accent' | 'background' | 'text'
  ): HSLColor {
    const avgHue = existingColors.reduce((sum, c) => sum + c.h, 0) / existingColors.length;
    const avgSat = existingColors.reduce((sum, c) => sum + c.s, 0) / existingColors.length;
    const avgLight = existingColors.reduce((sum, c) => sum + c.l, 0) / existingColors.length;

    switch (context) {
      case 'primary':
        return { h: avgHue, s: Math.max(60, avgSat), l: 50 };

      case 'secondary':
        return { h: (avgHue + 30) % 360, s: avgSat * 0.8, l: avgLight + 10 };

      case 'accent':
        return { h: (avgHue + 180) % 360, s: Math.min(90, avgSat + 20), l: 55 };

      case 'background':
        return { h: avgHue, s: Math.max(5, avgSat - 50), l: 95 };

      case 'text':
        return avgLight > 50
          ? { h: avgHue, s: 10, l: 15 } // Dark text for light palette
          : { h: avgHue, s: 5, l: 90 }; // Light text for dark palette

      default:
        return { h: avgHue, s: avgSat, l: avgLight };
    }
  }
}
