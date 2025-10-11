/**
 * Emotional Context Engine
 * Maps emotional states and contexts to intelligent color decisions
 */

import { HSLColor } from './colorHarmony';
import { PromptAnalysis } from './semanticAnalyzer';

export interface EmotionalColorProfile {
  dominantEmotion: string;
  energyLevel: number; // 0-1 (calm to energetic)
  warmth: number; // 0-1 (cool to warm)
  sophistication: number; // 0-1 (casual to elegant)
  playfulness: number; // 0-1 (serious to playful)
  saturationBias: number; // -1 to 1 (muted to vibrant)
  lightnessBias: number; // -1 to 1 (dark to light)
  recommendedHarmony: string;
}

export class EmotionalColorEngine {
  /**
   * Generate emotional color profile from prompt analysis
   */
  static generateProfile(analysis: PromptAnalysis): EmotionalColorProfile {
    return {
      dominantEmotion: this.identifyDominantEmotion(analysis),
      energyLevel: this.calculateEnergyLevel(analysis),
      warmth: this.calculateWarmth(analysis),
      sophistication: this.calculateSophistication(analysis),
      playfulness: this.calculatePlayfulness(analysis),
      saturationBias: analysis.saturation,
      lightnessBias: analysis.lightness,
      recommendedHarmony: analysis.harmony,
    };
  }

  /**
   * Identify the dominant emotion from analysis
   */
  private static identifyDominantEmotion(analysis: PromptAnalysis): string {
    if (analysis.emotions.length > 0) {
      return analysis.emotions[0];
    }

    // Infer from mood
    const moodEmotionMap: Record<string, string> = {
      energetic: 'excited',
      calm: 'peaceful',
      professional: 'confident',
      playful: 'happy',
      elegant: 'sophisticated',
      bold: 'powerful',
      natural: 'content',
      modern: 'innovative',
    };

    return moodEmotionMap[analysis.mood] || 'neutral';
  }

  /**
   * Calculate energy level (0 = calm, 1 = energetic)
   */
  private static calculateEnergyLevel(analysis: PromptAnalysis): number {
    const energyKeywords = ['energetic', 'vibrant', 'dynamic', 'exciting', 'active', 'lively'];
    const calmKeywords = ['calm', 'peaceful', 'serene', 'quiet', 'gentle', 'tranquil'];

    let score = 0.5; // Neutral

    analysis.keywords.forEach(keyword => {
      if (energyKeywords.some(k => keyword.includes(k))) score += 0.15;
      if (calmKeywords.some(k => keyword.includes(k))) score -= 0.15;
    });

    analysis.emotions.forEach(emotion => {
      if (energyKeywords.includes(emotion)) score += 0.2;
      if (calmKeywords.includes(emotion)) score -= 0.2;
    });

    // Mood influence
    if (analysis.mood === 'energetic') score += 0.3;
    if (analysis.mood === 'calm') score -= 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate warmth (0 = cool, 1 = warm)
   */
  private static calculateWarmth(analysis: PromptAnalysis): number {
    // Temperature from analysis is -1 to 1, convert to 0 to 1
    return (analysis.temperature + 1) / 2;
  }

  /**
   * Calculate sophistication level (0 = casual, 1 = elegant)
   */
  private static calculateSophistication(analysis: PromptAnalysis): number {
    const elegantKeywords = ['elegant', 'sophisticated', 'luxury', 'premium', 'refined', 'classy'];
    const casualKeywords = ['casual', 'relaxed', 'simple', 'basic', 'everyday'];

    let score = 0.5;

    analysis.keywords.forEach(keyword => {
      if (elegantKeywords.some(k => keyword.includes(k))) score += 0.15;
      if (casualKeywords.some(k => keyword.includes(k))) score -= 0.15;
    });

    if (analysis.mood === 'elegant') score += 0.3;
    if (analysis.mood === 'playful') score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate playfulness (0 = serious, 1 = playful)
   */
  private static calculatePlayfulness(analysis: PromptAnalysis): number {
    const playfulKeywords = ['playful', 'fun', 'cheerful', 'whimsical', 'quirky', 'happy'];
    const seriousKeywords = ['serious', 'professional', 'formal', 'corporate', 'business'];

    let score = 0.5;

    analysis.keywords.forEach(keyword => {
      if (playfulKeywords.some(k => keyword.includes(k))) score += 0.15;
      if (seriousKeywords.some(k => keyword.includes(k))) score -= 0.15;
    });

    if (analysis.mood === 'playful') score += 0.3;
    if (analysis.mood === 'professional') score -= 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Apply emotional profile to base colors
   */
  static applyEmotionalAdjustments(
    baseColor: HSLColor,
    profile: EmotionalColorProfile
  ): HSLColor {
    let { h, s, l } = baseColor;

    // Energy level affects saturation and lightness
    if (profile.energyLevel > 0.6) {
      s = Math.min(100, s + (profile.energyLevel - 0.5) * 30);
      l = Math.min(85, l + (profile.energyLevel - 0.5) * 15);
    } else if (profile.energyLevel < 0.4) {
      s = Math.max(20, s - (0.5 - profile.energyLevel) * 20);
    }

    // Warmth affects hue
    if (profile.warmth > 0.6) {
      // Shift towards warm hues (red, orange, yellow)
      if (h > 180 && h < 300) {
        h = h - (profile.warmth - 0.5) * 40;
      }
    } else if (profile.warmth < 0.4) {
      // Shift towards cool hues (blue, green, purple)
      if (h < 60 || h > 300) {
        h = (h + (0.5 - profile.warmth) * 40) % 360;
      }
    }

    // Sophistication affects saturation and lightness
    if (profile.sophistication > 0.6) {
      s = Math.max(25, s - (profile.sophistication - 0.5) * 25); // More muted
      l = Math.max(35, Math.min(65, l - (profile.sophistication - 0.5) * 10)); // Mid-range
    }

    // Playfulness affects saturation and lightness
    if (profile.playfulness > 0.6) {
      s = Math.min(95, s + (profile.playfulness - 0.5) * 35); // More saturated
      l = Math.min(80, l + (profile.playfulness - 0.5) * 25); // Lighter
    }

    // Apply saturation bias
    s = Math.max(5, Math.min(100, s + profile.saturationBias * 30));

    // Apply lightness bias
    l = Math.max(10, Math.min(95, l + profile.lightnessBias * 25));

    return { h, s, l };
  }

  /**
   * Generate context-aware color recommendations
   */
  static getContextualRecommendations(profile: EmotionalColorProfile): {
    primarySuggestions: string[];
    accentSuggestions: string[];
    backgroundSuggestions: string[];
  } {
    const recommendations = {
      primarySuggestions: [] as string[],
      accentSuggestions: [] as string[],
      backgroundSuggestions: [] as string[],
    };

    // Energy-based recommendations
    if (profile.energyLevel > 0.7) {
      recommendations.primarySuggestions.push(
        'Use vibrant, saturated colors to match high energy',
        'Consider bright accent colors for emphasis'
      );
    } else if (profile.energyLevel < 0.3) {
      recommendations.primarySuggestions.push(
        'Use muted, calming colors',
        'Keep saturation moderate for a serene feel'
      );
    }

    // Warmth-based recommendations
    if (profile.warmth > 0.7) {
      recommendations.primarySuggestions.push(
        'Emphasize warm hues (reds, oranges, yellows)',
        'Create a cozy, inviting atmosphere'
      );
    } else if (profile.warmth < 0.3) {
      recommendations.primarySuggestions.push(
        'Emphasize cool hues (blues, greens, purples)',
        'Create a fresh, calm atmosphere'
      );
    }

    // Sophistication-based recommendations
    if (profile.sophistication > 0.7) {
      recommendations.accentSuggestions.push(
        'Use subtle accent colors with lower saturation',
        'Consider metallic accents (gold, silver) for elegance'
      );
      recommendations.backgroundSuggestions.push(
        'Use neutral, understated backgrounds',
        'Consider off-white or light gray for sophistication'
      );
    } else {
      recommendations.backgroundSuggestions.push(
        'Light, neutral backgrounds work well',
        'White or very light tones enhance readability'
      );
    }

    // Playfulness-based recommendations
    if (profile.playfulness > 0.7) {
      recommendations.accentSuggestions.push(
        'Use bold, contrasting accent colors',
        'Don\'t be afraid of unexpected color combinations'
      );
    }

    return recommendations;
  }

  /**
   * Validate emotional coherence of color palette
   */
  static validateEmotionalCoherence(
    colors: HSLColor[],
    profile: EmotionalColorProfile
  ): {
    isCoherent: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check saturation coherence
    const saturations = colors.map(c => c.s);
    const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;

    if (profile.energyLevel > 0.7 && avgSaturation < 50) {
      issues.push('Low saturation doesn\'t match high energy profile');
      suggestions.push('Increase saturation to reflect energetic mood');
      score -= 20;
    }

    if (profile.sophistication > 0.7 && avgSaturation > 70) {
      issues.push('High saturation may be too bold for sophisticated theme');
      suggestions.push('Reduce saturation for more refined palette');
      score -= 15;
    }

    // Check lightness coherence
    const lightnesses = colors.map(c => c.l);
    const avgLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

    if (profile.playfulness > 0.7 && avgLightness < 40) {
      issues.push('Dark palette doesn\'t match playful mood');
      suggestions.push('Increase lightness for a more cheerful feel');
      score -= 20;
    }

    // Check warmth coherence
    const warmHues = colors.filter(c => c.h < 60 || c.h > 300).length;
    const coolHues = colors.filter(c => c.h >= 120 && c.h <= 240).length;

    if (profile.warmth > 0.7 && coolHues > warmHues) {
      issues.push('Palette leans cool but warm colors were expected');
      suggestions.push('Shift hues towards warmer tones');
      score -= 15;
    }

    if (profile.warmth < 0.3 && warmHues > coolHues) {
      issues.push('Palette leans warm but cool colors were expected');
      suggestions.push('Shift hues towards cooler tones');
      score -= 15;
    }

    return {
      isCoherent: score >= 70,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Get emotion-specific color adjustments
   */
  static getEmotionColorAdjustments(emotion: string): Partial<HSLColor> {
    const emotionAdjustments: Record<string, Partial<HSLColor>> = {
      // Positive emotions
      happy: { s: 75, l: 65 },
      joyful: { s: 85, l: 70 },
      excited: { s: 90, l: 60 },
      peaceful: { s: 45, l: 70 },
      calm: { s: 40, l: 65 },
      serene: { s: 35, l: 75 },
      confident: { s: 65, l: 50 },
      powerful: { s: 80, l: 45 },
      elegant: { s: 35, l: 45 },
      romantic: { s: 70, l: 60 },

      // Negative emotions
      sad: { s: 30, l: 40 },
      angry: { s: 85, l: 45 },
      anxious: { s: 50, l: 50 },
      fearful: { s: 40, l: 35 },

      // Complex emotions
      mysterious: { s: 50, l: 30 },
      nostalgic: { s: 40, l: 55 },
      sophisticated: { s: 30, l: 45 },
    };

    return emotionAdjustments[emotion.toLowerCase()] || {};
  }

  /**
   * Generate mood-specific palette adjustments
   */
  static getMoodAdjustments(mood: string): {
    saturationMultiplier: number;
    lightnessOffset: number;
    hueShift: number;
  } {
    const moodAdjustments: Record<string, {
      saturationMultiplier: number;
      lightnessOffset: number;
      hueShift: number;
    }> = {
      energetic: { saturationMultiplier: 1.2, lightnessOffset: 5, hueShift: 0 },
      calm: { saturationMultiplier: 0.7, lightnessOffset: 10, hueShift: 0 },
      professional: { saturationMultiplier: 0.85, lightnessOffset: -5, hueShift: 0 },
      playful: { saturationMultiplier: 1.15, lightnessOffset: 15, hueShift: 10 },
      elegant: { saturationMultiplier: 0.65, lightnessOffset: -8, hueShift: -5 },
      bold: { saturationMultiplier: 1.25, lightnessOffset: -10, hueShift: 0 },
      natural: { saturationMultiplier: 0.75, lightnessOffset: 5, hueShift: 5 },
      modern: { saturationMultiplier: 0.9, lightnessOffset: 0, hueShift: 0 },
    };

    return moodAdjustments[mood] || { saturationMultiplier: 1, lightnessOffset: 0, hueShift: 0 };
  }

  /**
   * Calculate emotional resonance score
   * How well colors match the intended emotion
   */
  static calculateEmotionalResonance(
    colors: HSLColor[],
    targetEmotion: string,
    profile: EmotionalColorProfile
  ): number {
    const targetAdjustments = this.getEmotionColorAdjustments(targetEmotion);
    if (Object.keys(targetAdjustments).length === 0) return 0.7; // Default neutral score

    let totalScore = 0;
    let count = 0;

    colors.forEach(color => {
      let colorScore = 1;

      // Check saturation match
      if (targetAdjustments.s !== undefined) {
        const satDiff = Math.abs(color.s - targetAdjustments.s);
        colorScore *= Math.max(0, 1 - satDiff / 100);
      }

      // Check lightness match
      if (targetAdjustments.l !== undefined) {
        const lightDiff = Math.abs(color.l - targetAdjustments.l);
        colorScore *= Math.max(0, 1 - lightDiff / 100);
      }

      // Check hue match (if specified)
      if (targetAdjustments.h !== undefined) {
        const hueDiff = Math.min(
          Math.abs(color.h - targetAdjustments.h),
          360 - Math.abs(color.h - targetAdjustments.h)
        );
        colorScore *= Math.max(0, 1 - hueDiff / 180);
      }

      totalScore += colorScore;
      count++;
    });

    return count > 0 ? totalScore / count : 0;
  }
}
