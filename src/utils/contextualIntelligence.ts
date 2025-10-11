/**
 * Contextual Intelligence System
 * Advanced analysis and weighting for intelligent palette generation
 */

import { WeightedColor } from './semanticAnalyzer';
import { ColorMapping } from '../data/colorKnowledge';

export interface ContextualWeights {
  primaryColor: WeightedColor | null;
  secondaryColors: WeightedColor[];
  dominantTheme: string;
  intentionScore: number;
  coherenceFactors: {
    temporal?: number; // Time-based concepts (dawn, sunset, etc.)
    emotional?: number; // Emotional content
    environmental?: number; // Nature, urban, etc.
    purposeful?: number; // Business use case
  };
}

export interface IntentAnalysis {
  primaryIntent: 'branding' | 'web' | 'app' | 'presentation' | 'creative' | 'general';
  confidence: number;
  suggestedHarmony: string;
  requiresContrast: boolean;
  preferredSaturation: 'low' | 'medium' | 'high';
  preferredLightness: 'dark' | 'medium' | 'light';
}

export class ContextualIntelligence {
  /**
   * Analyze the context and assign intelligent weights to detected colors
   * This considers the entire semantic context, not just individual matches
   */
  static analyzeColorContext(
    colors: WeightedColor[],
    analysis: any
  ): ContextualWeights {
    if (colors.length === 0) {
      return {
        primaryColor: null,
        secondaryColors: [],
        dominantTheme: 'neutral',
        intentionScore: 0.5,
        coherenceFactors: {},
      };
    }

    // Analyze coherence factors
    const coherenceFactors = this.calculateCoherenceFactors(analysis);

    // Reweight colors based on contextual relevance
    const reweightedColors = this.reweightByContext(colors, analysis, coherenceFactors);

    // Sort by final weight
    reweightedColors.sort((a, b) => b.weight - a.weight);

    // Determine dominant theme
    const dominantTheme = this.determineDominantTheme(analysis, reweightedColors);

    // Calculate overall intention score
    const intentionScore = this.calculateIntentionScore(analysis, coherenceFactors);

    return {
      primaryColor: reweightedColors[0] || null,
      secondaryColors: reweightedColors.slice(1, 4),
      dominantTheme,
      intentionScore,
      coherenceFactors,
    };
  }

  /**
   * Calculate coherence factors based on semantic analysis
   */
  private static calculateCoherenceFactors(analysis: any): ContextualWeights['coherenceFactors'] {
    const factors: ContextualWeights['coherenceFactors'] = {};

    // Temporal coherence (time-related concepts)
    const temporalKeywords = ['dawn', 'dusk', 'sunset', 'sunrise', 'morning', 'evening', 'night', 'midnight', 'twilight', 'noon'];
    const temporalCount = analysis.keywords.filter((kw: string) =>
      temporalKeywords.some(tk => kw.includes(tk))
    ).length;
    if (temporalCount > 0) {
      factors.temporal = Math.min(temporalCount / 3, 1);
    }

    // Emotional coherence
    if (analysis.emotions.length > 0) {
      factors.emotional = Math.min(analysis.emotions.length / 4, 1);
    }

    // Environmental coherence (nature, urban, etc.)
    const environmentalKeywords = ['ocean', 'forest', 'mountain', 'desert', 'city', 'urban', 'nature', 'sky', 'sea'];
    const envCount = analysis.keywords.filter((kw: string) =>
      environmentalKeywords.some(ek => kw.includes(ek))
    ).length;
    if (envCount > 0) {
      factors.environmental = Math.min(envCount / 3, 1);
    }

    // Purposeful coherence (business/use case)
    if (analysis.industries.length > 0 || analysis.useCase) {
      factors.purposeful = analysis.industries.length > 0 ? 0.8 : 0.6;
    }

    return factors;
  }

  /**
   * Reweight colors based on contextual relevance
   * Colors that fit better with the overall context get higher weights
   */
  private static reweightByContext(
    colors: WeightedColor[],
    analysis: any,
    coherenceFactors: ContextualWeights['coherenceFactors']
  ): WeightedColor[] {
    return colors.map(color => {
      let contextualBonus = 0;

      // Bonus for compound concept matches (highest priority)
      if (color.matchType === 'compound') {
        contextualBonus += 0.15;
      }

      // Bonus for temporal coherence
      if (coherenceFactors.temporal && this.isTemporalColor(color)) {
        contextualBonus += coherenceFactors.temporal * 0.1;
      }

      // Bonus for emotional coherence
      if (coherenceFactors.emotional && this.isEmotionalColor(color, analysis)) {
        contextualBonus += coherenceFactors.emotional * 0.08;
      }

      // Bonus for environmental coherence
      if (coherenceFactors.environmental && this.isEnvironmentalColor(color)) {
        contextualBonus += coherenceFactors.environmental * 0.1;
      }

      // Bonus for purposeful coherence
      if (coherenceFactors.purposeful && this.isPurposefulColor(color, analysis)) {
        contextualBonus += coherenceFactors.purposeful * 0.12;
      }

      // Penalty for colors that don't fit the dominant mood
      if (!this.fitsWithMood(color, analysis.mood)) {
        contextualBonus -= 0.15;
      }

      return {
        ...color,
        weight: Math.max(0, Math.min(1, color.weight + contextualBonus)),
      };
    });
  }

  /**
   * Check if color is temporal (time-related)
   */
  private static isTemporalColor(color: WeightedColor): boolean {
    const term = color.originalTerm.toLowerCase();
    const temporalTerms = ['dawn', 'dusk', 'sunset', 'sunrise', 'morning', 'evening', 'night', 'midnight', 'twilight', 'noon', 'golden', 'blue hour'];
    return temporalTerms.some(t => term.includes(t));
  }

  /**
   * Check if color is emotional
   */
  private static isEmotionalColor(color: WeightedColor, analysis: any): boolean {
    const term = color.originalTerm.toLowerCase();
    return analysis.emotions.some((emotion: string) => term.includes(emotion.toLowerCase()));
  }

  /**
   * Check if color is environmental
   */
  private static isEnvironmentalColor(color: WeightedColor): boolean {
    const term = color.originalTerm.toLowerCase();
    const envTerms = ['ocean', 'sea', 'forest', 'mountain', 'sky', 'earth', 'sand', 'stone', 'water', 'fire', 'ice', 'snow'];
    return envTerms.some(t => term.includes(t));
  }

  /**
   * Check if color fits with business/purposeful context
   */
  private static isPurposefulColor(color: WeightedColor, analysis: any): boolean {
    if (!analysis.useCase && analysis.industries.length === 0) return false;

    // Professional contexts prefer blues, grays, neutrals
    if (analysis.industries.includes('corporate') || analysis.industries.includes('business')) {
      return color.h >= 200 && color.h <= 240 || color.s < 30;
    }

    // Creative contexts are more flexible
    if (analysis.industries.includes('creative') || analysis.industries.includes('art')) {
      return true;
    }

    return false;
  }

  /**
   * Check if color fits with the detected mood
   */
  private static fitsWithMood(color: WeightedColor, mood: string): boolean {
    const moodColorRanges: Record<string, { h?: [number, number], s?: [number, number] }> = {
      energetic: { h: [0, 60], s: [60, 100] }, // Warm, saturated
      calm: { h: [180, 240], s: [20, 60] }, // Cool, desaturated
      professional: { h: [200, 240], s: [30, 70] }, // Blue range
      playful: { h: [280, 360], s: [60, 100] }, // Pinks, purples, saturated
      elegant: { s: [0, 40] }, // Low saturation
      bold: { s: [70, 100] }, // High saturation
      natural: { h: [80, 160], s: [40, 80] }, // Green range
      modern: { s: [40, 80] }, // Medium saturation
    };

    const range = moodColorRanges[mood];
    if (!range) return true; // If no specific range, accept

    let fits = true;
    if (range.h) {
      const [hMin, hMax] = range.h;
      fits = fits && (color.h >= hMin && color.h <= hMax);
    }
    if (range.s) {
      const [sMin, sMax] = range.s;
      fits = fits && (color.s >= sMin && color.s <= sMax);
    }

    return fits;
  }

  /**
   * Determine the dominant theme from analysis
   */
  private static determineDominantTheme(analysis: any, colors: WeightedColor[]): string {
    // Priority 1: Compound concepts indicate strong theme
    if (analysis.compoundConcepts && analysis.compoundConcepts.length > 0) {
      return analysis.compoundConcepts[0];
    }

    // Priority 2: Primary color's original term
    if (colors.length > 0 && colors[0].weight > 0.8) {
      return colors[0].originalTerm;
    }

    // Priority 3: Use case or industry
    if (analysis.useCase) {
      return analysis.useCase;
    }
    if (analysis.industries.length > 0) {
      return analysis.industries[0];
    }

    // Priority 4: Dominant emotion
    if (analysis.emotions.length > 0) {
      return analysis.emotions[0];
    }

    // Priority 5: Mood
    return analysis.mood;
  }

  /**
   * Calculate overall intention score (how clear is the user's intention)
   */
  private static calculateIntentionScore(
    analysis: any,
    coherenceFactors: ContextualWeights['coherenceFactors']
  ): number {
    let score = 0.5; // Base score

    // High confidence from analysis
    if (analysis.confidence > 0.8) score += 0.2;
    else if (analysis.confidence > 0.6) score += 0.1;

    // Has specific use case
    if (analysis.useCase) score += 0.15;

    // Has compound concepts (very specific)
    if (analysis.compoundConcepts && analysis.compoundConcepts.length > 0) {
      score += 0.15;
    }

    // Strong coherence in any factor
    const maxCoherence = Math.max(...Object.values(coherenceFactors).filter(v => typeof v === 'number') as number[]);
    if (maxCoherence > 0.7) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Analyze user's intent to suggest optimal harmony type
   */
  static analyzeIntent(analysis: any, contextWeights: ContextualWeights): IntentAnalysis {
    let primaryIntent: IntentAnalysis['primaryIntent'] = 'general';
    let confidence = 0.6;

    // Detect intent from use case
    if (analysis.useCase) {
      if (['webapp', 'website', 'landing', 'dashboard', 'saas'].includes(analysis.useCase)) {
        primaryIntent = 'web';
        confidence = 0.9;
      } else if (['app', 'mobile'].includes(analysis.useCase)) {
        primaryIntent = 'app';
        confidence = 0.9;
      } else if (['presentation', 'slides'].includes(analysis.useCase)) {
        primaryIntent = 'presentation';
        confidence = 0.85;
      }
    }

    // Detect from industry keywords
    if (analysis.industries.includes('corporate') || analysis.industries.includes('business')) {
      primaryIntent = 'branding';
      confidence = 0.8;
    } else if (analysis.industries.includes('creative') || analysis.industries.includes('art')) {
      primaryIntent = 'creative';
      confidence = 0.75;
    }

    // Suggest harmony based on intent and context
    const suggestedHarmony = this.suggestHarmonyType(analysis, contextWeights, primaryIntent);

    // Determine contrast requirement
    const requiresContrast = this.requiresHighContrast(analysis, primaryIntent);

    // Determine saturation preference
    const preferredSaturation = this.determineSaturationPreference(analysis, contextWeights);

    // Determine lightness preference
    const preferredLightness = this.determineLightnessPreference(analysis, contextWeights);

    return {
      primaryIntent,
      confidence,
      suggestedHarmony,
      requiresContrast,
      preferredSaturation,
      preferredLightness,
    };
  }

  /**
   * Suggest optimal harmony type based on context
   */
  private static suggestHarmonyType(
    analysis: any,
    contextWeights: ContextualWeights,
    intent: IntentAnalysis['primaryIntent']
  ): string {
    // For web/app: prefer analogous or triadic for harmony
    if (intent === 'web' || intent === 'app') {
      return contextWeights.intentionScore > 0.7 ? 'triadic' : 'analogous';
    }

    // For branding: prefer complementary for impact
    if (intent === 'branding') {
      return 'complementary';
    }

    // For creative: prefer more complex harmonies
    if (intent === 'creative') {
      return analysis.keywords.length > 3 ? 'tetradic' : 'split-complementary';
    }

    // Based on mood
    const moodHarmonyMap: Record<string, string> = {
      energetic: 'complementary',
      calm: 'analogous',
      professional: 'triadic',
      playful: 'split-complementary',
      elegant: 'monochromatic',
      bold: 'complementary',
      natural: 'analogous',
      modern: 'triadic',
    };

    return moodHarmonyMap[analysis.mood] || analysis.harmony;
  }

  /**
   * Determine if high contrast is required
   */
  private static requiresHighContrast(analysis: any, intent: IntentAnalysis['primaryIntent']): boolean {
    // Web/app always need good contrast for accessibility
    if (intent === 'web' || intent === 'app') return true;

    // Bold moods need high contrast
    if (analysis.mood === 'bold' || analysis.mood === 'energetic') return true;

    // Professional contexts need clear contrast
    if (analysis.industries.includes('corporate') || analysis.industries.includes('business')) return true;

    return false;
  }

  /**
   * Determine saturation preference
   */
  private static determineSaturationPreference(
    analysis: any,
    contextWeights: ContextualWeights
  ): 'low' | 'medium' | 'high' {
    // Check explicit saturation modifiers
    if (analysis.saturation > 0.3) return 'high';
    if (analysis.saturation < -0.3) return 'low';

    // Based on mood
    const highSaturationMoods = ['energetic', 'playful', 'bold'];
    const lowSaturationMoods = ['elegant', 'calm', 'professional'];

    if (highSaturationMoods.includes(analysis.mood)) return 'high';
    if (lowSaturationMoods.includes(analysis.mood)) return 'low';

    return 'medium';
  }

  /**
   * Determine lightness preference
   */
  private static determineLightnessPreference(
    analysis: any,
    contextWeights: ContextualWeights
  ): 'dark' | 'medium' | 'light' {
    // Check explicit lightness modifiers
    if (analysis.lightness > 0.3) return 'light';
    if (analysis.lightness < -0.3) return 'dark';

    // Check context for dark/light mentions
    const hasDark = analysis.context.some((ctx: string) => ctx.includes('dark') || ctx.includes('night'));
    const hasLight = analysis.context.some((ctx: string) => ctx.includes('light') || ctx.includes('bright'));

    if (hasDark) return 'dark';
    if (hasLight) return 'light';

    // Based on mood
    const darkMoods = ['elegant', 'bold', 'mysterious'];
    const lightMoods = ['playful', 'calm', 'energetic'];

    if (darkMoods.includes(analysis.mood)) return 'dark';
    if (lightMoods.includes(analysis.mood)) return 'light';

    return 'medium';
  }

  /**
   * Validate semantic coherence of generated palette
   * Returns a score from 0 to 1 indicating how well the palette matches the prompt
   */
  static validateSemanticCoherence(
    generatedPalette: any,
    analysis: any,
    contextWeights: ContextualWeights
  ): { score: number; issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // Check if primary color aligns with dominant theme
    if (contextWeights.primaryColor) {
      const primaryHSL = this.hexToHSL(generatedPalette.colors.primary.base);
      const expectedHue = contextWeights.primaryColor.h;
      const hueDiff = Math.abs(primaryHSL.h - expectedHue);

      if (hueDiff > 30 && hueDiff < 330) {
        score -= 0.2;
        issues.push('Primary color hue deviates significantly from expected theme');
        suggestions.push(`Consider adjusting primary color closer to ${expectedHue}° hue`);
      }
    }

    // Check saturation coherence
    const avgSaturation = this.calculateAverageSaturation(generatedPalette);
    if (analysis.saturation > 0.5 && avgSaturation < 50) {
      score -= 0.15;
      issues.push('Palette saturation is lower than expected from prompt');
      suggestions.push('Increase overall saturation to match vibrant/colorful intent');
    } else if (analysis.saturation < -0.5 && avgSaturation > 70) {
      score -= 0.15;
      issues.push('Palette saturation is higher than expected from prompt');
      suggestions.push('Decrease overall saturation to match muted/subtle intent');
    }

    // Check lightness coherence
    const avgLightness = this.calculateAverageLightness(generatedPalette);
    if (analysis.lightness > 0.5 && avgLightness < 50) {
      score -= 0.15;
      issues.push('Palette is darker than expected from prompt');
      suggestions.push('Increase overall lightness for brighter appearance');
    } else if (analysis.lightness < -0.5 && avgLightness > 60) {
      score -= 0.15;
      issues.push('Palette is lighter than expected from prompt');
      suggestions.push('Decrease overall lightness for darker appearance');
    }

    // Check emotional alignment
    if (analysis.emotions.length > 0) {
      const emotionFits = this.checkEmotionalAlignment(generatedPalette, analysis.emotions[0]);
      if (!emotionFits) {
        score -= 0.1;
        issues.push(`Palette doesn't strongly evoke the emotion: ${analysis.emotions[0]}`);
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  /**
   * Helper: Convert hex to HSL
   */
  private static hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Calculate average saturation of palette
   */
  private static calculateAverageSaturation(palette: any): number {
    const colors = [
      palette.colors.primary.base,
      palette.colors.accent.base,
      palette.colors.background.base,
    ];

    const saturations = colors.map(hex => this.hexToHSL(hex).s);
    return saturations.reduce((sum, s) => sum + s, 0) / saturations.length;
  }

  /**
   * Calculate average lightness of palette
   */
  private static calculateAverageLightness(palette: any): number {
    const colors = [
      palette.colors.primary.base,
      palette.colors.accent.base,
      palette.colors.background.base,
    ];

    const lightnesses = colors.map(hex => this.hexToHSL(hex).l);
    return lightnesses.reduce((sum, l) => sum + l, 0) / lightnesses.length;
  }

  /**
   * Check if palette aligns with emotion
   */
  private static checkEmotionalAlignment(palette: any, emotion: string): boolean {
    // Define emotional expectations
    const emotionalExpectations: Record<string, { saturation: [number, number], lightness: [number, number] }> = {
      happy: { saturation: [60, 100], lightness: [60, 85] },
      sad: { saturation: [20, 50], lightness: [30, 50] },
      calm: { saturation: [30, 60], lightness: [50, 75] },
      energetic: { saturation: [70, 100], lightness: [50, 70] },
      elegant: { saturation: [20, 50], lightness: [35, 55] },
    };

    const expectation = emotionalExpectations[emotion];
    if (!expectation) return true; // No specific expectation

    const avgSat = this.calculateAverageSaturation(palette);
    const avgLight = this.calculateAverageLightness(palette);

    const satFits = avgSat >= expectation.saturation[0] && avgSat <= expectation.saturation[1];
    const lightFits = avgLight >= expectation.lightness[0] && avgLight <= expectation.lightness[1];

    return satFits && lightFits;
  }
}
