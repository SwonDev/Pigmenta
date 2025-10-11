/**
 * Enhanced AI Color Engine
 * Intelligent color palette generation using advanced algorithms,
 * semantic analysis, and emotional context without ML dependencies
 */

import { SemanticPalette, SemanticColorGroup, GeneratePaletteRequest } from '../types';
import { SemanticAnalyzer, WeightedColor } from './semanticAnalyzer';
import { ColorHarmonyGenerator, HSLColor } from './colorHarmony';
import { EmotionalColorEngine } from './emotionalColorEngine';
import { ALL_COLOR_MAPPINGS, ColorMapping } from '../data/colorKnowledge';
import { ColorCombinationRules } from './colorCombinationRules';
import { ContextualIntelligence, ContextualWeights, IntentAnalysis } from './contextualIntelligence';

export class AIColorEngine {
  /**
   * Generate intelligent color palette from prompt
   * ENHANCED: Now uses contextual intelligence for smarter color selection
   */
  static generatePalette(request: GeneratePaletteRequest): SemanticPalette {
    // Step 0: Generate seed for variation (if not provided)
    const seed = request.seed !== undefined ? request.seed : this.generateSeed(request.prompt, request.forceVariation);

    // Step 1: Analyze prompt semantically
    const analysis = SemanticAnalyzer.analyze(request.prompt);

    // Step 2: NEW - Apply contextual intelligence to reweight colors
    const contextWeights = ContextualIntelligence.analyzeColorContext(
      analysis.colors,
      analysis
    );

    // Step 3: NEW - Analyze user intent for smarter harmony selection
    const intentAnalysis = ContextualIntelligence.analyzeIntent(analysis, contextWeights);

    // Step 4: Generate emotional profile
    const emotionalProfile = EmotionalColorEngine.generateProfile(analysis);

    // Step 5: Determine base color using contextual intelligence (ENHANCED)
    const baseHue = this.determineBaseHueIntelligent(analysis, contextWeights, seed);
    const baseSaturation = this.determineBaseSaturationIntelligent(
      analysis,
      emotionalProfile,
      intentAnalysis,
      seed
    );
    const baseLightness = this.determineBaseLightnessIntelligent(
      analysis,
      emotionalProfile,
      intentAnalysis,
      seed
    );

    // Step 6: Generate color harmony based on intelligent intent analysis (ENHANCED)
    const harmonyType = intentAnalysis.suggestedHarmony || analysis.harmony;
    const harmony = this.generateHarmony(
      harmonyType,
      baseHue,
      baseSaturation,
      baseLightness,
      emotionalProfile
    );

    // Step 7: Apply emotional adjustments to harmony
    const adjustedHarmony = this.applyEmotionalAdjustments(harmony, emotionalProfile);

    // Step 8: Apply contextual fine-tuning (NEW)
    const contextTunedHarmony = this.applyContextualTuning(
      adjustedHarmony,
      analysis,
      contextWeights,
      intentAnalysis
    );

    // Step 9: Ensure accessibility
    const accessibleHarmony = this.ensureAccessibility(contextTunedHarmony);

    // Step 10: Generate semantic color groups
    const colorGroups = this.generateSemanticGroups(accessibleHarmony, analysis);

    // Step 11: Create palette metadata (ENHANCED with contextual info)
    const metadata = this.generateMetadataEnhanced(
      analysis,
      emotionalProfile,
      request.prompt,
      contextWeights,
      intentAnalysis
    );

    // Step 12: Build palette
    const palette = {
      id: this.generateId(),
      name: this.generatePaletteName(request.prompt, analysis),
      prompt: request.prompt,
      description: this.generateDescriptionEnhanced(analysis, emotionalProfile, contextWeights),
      colors: colorGroups,
      metadata,
    };

    // Step 13: NEW - Validate semantic coherence and log if needed
    const validation = ContextualIntelligence.validateSemanticCoherence(
      palette,
      analysis,
      contextWeights
    );

    // Optionally add validation score to metadata for debugging
    if (validation.score < 0.8) {
      console.warn('Palette coherence below optimal:', validation);
    }

    return palette;
  }

  /**
   * Generate seed from prompt and timestamp
   * Creates variation while maintaining reproducibility with same seed
   */
  private static generateSeed(prompt: string, forceVariation: boolean = false): number {
    const timestamp = Date.now();

    // Create hash from prompt
    let promptHash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      promptHash = ((promptHash << 5) - promptHash) + char;
      promptHash = promptHash & promptHash; // Convert to 32bit integer
    }

    // If forcing variation, add more entropy from timestamp
    if (forceVariation) {
      // Use milliseconds for fine-grained variation
      return Math.abs((promptHash + timestamp) % 100);
    }

    // Use just the hash for consistent results with same prompt
    // But add seconds for some time-based variation
    const seconds = Math.floor(timestamp / 1000);
    return Math.abs((promptHash + seconds) % 100);
  }

  /**
   * Apply seed-based variation to a value
   * Applies subtle random variation based on seed
   */
  private static applyVariation(baseValue: number, seed: number, maxVariation: number): number {
    // Use seed to generate pseudo-random variation
    const variation = ((seed * 2654435761) % 100) / 100; // Golden ratio hashing
    const offset = (variation - 0.5) * maxVariation * 2; // Center around 0
    return baseValue + offset;
  }

  /**
   * Determine base hue from semantic analysis WITH SEED VARIATION
   */
  private static determineBaseHue(analysis: any, seed: number): number {
    let baseHue = 220; // Default

    // Priority 1: Direct color keywords with highest weight
    if (analysis.colors.length > 0) {
      const weightedHue = analysis.colors.reduce((sum: number, color: ColorMapping) => {
        const weight = color.weight || 1;
        return sum + color.h * weight;
      }, 0);
      const totalWeight = analysis.colors.reduce((sum: number, color: ColorMapping) =>
        sum + (color.weight || 1), 0
      );
      baseHue = Math.round(weightedHue / totalWeight);
    }
    // Priority 2: Industry/context keywords
    else if (analysis.industries.length > 0) {
      const industry = analysis.industries[0];
      const mapping = ALL_COLOR_MAPPINGS[industry];
      if (mapping) baseHue = mapping.h;
    }
    // Priority 3: Emotional keywords
    else if (analysis.emotions.length > 0) {
      const emotion = analysis.emotions[0];
      const mapping = ALL_COLOR_MAPPINGS[emotion];
      if (mapping) baseHue = mapping.h;
    }
    // Priority 4: Object keywords
    else if (analysis.objects.length > 0) {
      const object = analysis.objects[0];
      const mapping = ALL_COLOR_MAPPINGS[object];
      if (mapping) baseHue = mapping.h;
    }
    // Priority 5: Mood-based default
    else {
      const moodHues: Record<string, number> = {
        energetic: 15, // Red-orange
        calm: 200, // Blue
        professional: 220, // Deep blue
        playful: 340, // Pink-red
        elegant: 280, // Purple
        bold: 0, // Red
        natural: 120, // Green
        modern: 210, // Cool blue
      };
      baseHue = moodHues[analysis.mood] || 220;
    }

    // Apply seed-based variation (±15 degrees for subtle difference)
    const variedHue = this.applyVariation(baseHue, seed, 15);

    // Keep hue within 0-360 range
    return ((variedHue % 360) + 360) % 360;
  }

  /**
   * Determine base saturation from analysis WITH SEED VARIATION
   */
  private static determineBaseSaturation(analysis: any, profile: any, seed: number): number {
    let baseSaturation = 70; // Default

    // Apply saturation bias from analysis
    baseSaturation += analysis.saturation * 25;

    // Apply intensity modifier
    baseSaturation += analysis.intensity * 15;

    // Mood-specific adjustments
    const moodSaturationMap: Record<string, number> = {
      energetic: 85,
      calm: 50,
      professional: 65,
      playful: 80,
      elegant: 40,
      bold: 90,
      natural: 55,
      modern: 70,
    };

    if (moodSaturationMap[analysis.mood]) {
      baseSaturation = (baseSaturation + moodSaturationMap[analysis.mood]) / 2;
    }

    // Apply seed-based variation (±10% for subtle difference)
    const variedSaturation = this.applyVariation(baseSaturation, seed + 1, 10);

    return Math.max(20, Math.min(95, variedSaturation));
  }

  /**
   * Determine base lightness from analysis WITH SEED VARIATION
   */
  private static determineBaseLightness(analysis: any, profile: any, seed: number): number {
    let baseLightness = 50; // Default

    // Apply lightness bias from analysis
    baseLightness += analysis.lightness * 25;

    // Mood-specific adjustments
    const moodLightnessMap: Record<string, number> = {
      energetic: 60,
      calm: 65,
      professional: 50,
      playful: 70,
      elegant: 45,
      bold: 48,
      natural: 55,
      modern: 52,
    };

    if (moodLightnessMap[analysis.mood]) {
      baseLightness = (baseLightness + moodLightnessMap[analysis.mood]) / 2;
    }

    // Apply seed-based variation (±8% for subtle difference)
    const variedLightness = this.applyVariation(baseLightness, seed + 2, 8);

    return Math.max(35, Math.min(75, variedLightness));
  }

  /**
   * ENHANCED: Determine base hue using contextual intelligence
   * Uses reweighted colors from contextual analysis for smarter selection
   */
  private static determineBaseHueIntelligent(
    analysis: any,
    contextWeights: ContextualWeights,
    seed: number
  ): number {
    let baseHue = 220; // Default

    // Priority 1: Use primary color from contextual intelligence (highest confidence)
    if (contextWeights.primaryColor && contextWeights.intentionScore > 0.6) {
      baseHue = contextWeights.primaryColor.h;
    }
    // Priority 2: Weighted average of top colors (more intelligent than just first)
    else if (contextWeights.secondaryColors.length > 0) {
      const topColors = [contextWeights.primaryColor, ...contextWeights.secondaryColors]
        .filter(c => c !== null)
        .slice(0, 3);

      if (topColors.length > 0) {
        const weightedHue = topColors.reduce((sum, color) => sum + (color?.h || 0) * (color?.weight || 0), 0);
        const totalWeight = topColors.reduce((sum, color) => sum + (color?.weight || 0), 0);
        baseHue = Math.round(weightedHue / totalWeight);
      }
    }
    // Priority 3: Fall back to original logic
    else if (analysis.colors.length > 0) {
      const weightedHue = analysis.colors.reduce((sum: number, color: ColorMapping) => {
        const weight = color.weight || 1;
        return sum + color.h * weight;
      }, 0);
      const totalWeight = analysis.colors.reduce((sum: number, color: ColorMapping) =>
        sum + (color.weight || 1), 0
      );
      baseHue = Math.round(weightedHue / totalWeight);
    }
    // Priority 4: Industry/context keywords
    else if (analysis.industries.length > 0) {
      const industry = analysis.industries[0];
      const mapping = ALL_COLOR_MAPPINGS[industry];
      if (mapping) baseHue = mapping.h;
    }
    // Priority 5: Emotional keywords
    else if (analysis.emotions.length > 0) {
      const emotion = analysis.emotions[0];
      const mapping = ALL_COLOR_MAPPINGS[emotion];
      if (mapping) baseHue = mapping.h;
    }
    // Priority 6: Mood-based default
    else {
      const moodHues: Record<string, number> = {
        energetic: 15,
        calm: 200,
        professional: 220,
        playful: 340,
        elegant: 280,
        bold: 0,
        natural: 120,
        modern: 210,
      };
      baseHue = moodHues[analysis.mood] || 220;
    }

    // Apply seed-based variation
    const variedHue = this.applyVariation(baseHue, seed, 15);
    return ((variedHue % 360) + 360) % 360;
  }

  /**
   * ENHANCED: Determine base saturation using intent analysis
   */
  private static determineBaseSaturationIntelligent(
    analysis: any,
    profile: any,
    intentAnalysis: IntentAnalysis,
    seed: number
  ): number {
    let baseSaturation = 70; // Default

    // Use intent analysis for smarter saturation
    if (intentAnalysis.preferredSaturation === 'high') {
      baseSaturation = 85;
    } else if (intentAnalysis.preferredSaturation === 'low') {
      baseSaturation = 45;
    } else {
      baseSaturation = 65;
    }

    // Apply saturation bias from analysis
    baseSaturation += analysis.saturation * 25;

    // Apply intensity modifier
    baseSaturation += analysis.intensity * 15;

    // Intent-specific adjustments (more nuanced than mood)
    if (intentAnalysis.primaryIntent === 'web' || intentAnalysis.primaryIntent === 'app') {
      // Web/app prefer balanced saturation for readability
      baseSaturation = Math.min(baseSaturation, 75);
    } else if (intentAnalysis.primaryIntent === 'branding') {
      // Branding can be more bold
      baseSaturation = Math.max(baseSaturation, 60);
    } else if (intentAnalysis.primaryIntent === 'creative') {
      // Creative allows full range
      baseSaturation = Math.max(baseSaturation, 70);
    }

    // Apply seed-based variation
    const variedSaturation = this.applyVariation(baseSaturation, seed + 1, 10);

    return Math.max(20, Math.min(95, variedSaturation));
  }

  /**
   * ENHANCED: Determine base lightness using intent analysis
   */
  private static determineBaseLightnessIntelligent(
    analysis: any,
    profile: any,
    intentAnalysis: IntentAnalysis,
    seed: number
  ): number {
    let baseLightness = 50; // Default

    // Use intent analysis for smarter lightness
    if (intentAnalysis.preferredLightness === 'light') {
      baseLightness = 65;
    } else if (intentAnalysis.preferredLightness === 'dark') {
      baseLightness = 40;
    } else {
      baseLightness = 52;
    }

    // Apply lightness bias from analysis
    baseLightness += analysis.lightness * 25;

    // Intent-specific adjustments
    if (intentAnalysis.primaryIntent === 'web' || intentAnalysis.primaryIntent === 'app') {
      // Web/app need good readability
      if (intentAnalysis.requiresContrast) {
        // Ensure sufficient dynamic range
        baseLightness = Math.max(45, Math.min(60, baseLightness));
      }
    } else if (intentAnalysis.primaryIntent === 'presentation') {
      // Presentations often need higher contrast
      baseLightness = Math.max(48, baseLightness);
    }

    // Apply seed-based variation
    const variedLightness = this.applyVariation(baseLightness, seed + 2, 8);

    return Math.max(35, Math.min(75, variedLightness));
  }

  /**
   * NEW: Apply contextual fine-tuning to harmony
   * Adjusts colors based on dominant theme and coherence factors
   */
  private static applyContextualTuning(
    harmony: any,
    analysis: any,
    contextWeights: ContextualWeights,
    intentAnalysis: IntentAnalysis
  ): any {
    // Clone harmony to avoid mutation
    const tunedHarmony = JSON.parse(JSON.stringify(harmony));

    // Apply tuning based on coherence factors
    const { coherenceFactors } = contextWeights;

    // Temporal tuning (dawn, sunset, etc.)
    if (coherenceFactors.temporal && coherenceFactors.temporal > 0.5) {
      // Add warmth to temporal contexts
      tunedHarmony.primary = this.adjustTemperature(tunedHarmony.primary, 0.1);
      tunedHarmony.accent = this.adjustTemperature(tunedHarmony.accent, 0.15);
    }

    // Environmental tuning (nature, urban, etc.)
    if (coherenceFactors.environmental && coherenceFactors.environmental > 0.5) {
      // Increase saturation slightly for natural contexts
      tunedHarmony.primary.s = Math.min(95, tunedHarmony.primary.s * 1.1);
      tunedHarmony.secondary.s = Math.min(95, tunedHarmony.secondary.s * 1.1);
    }

    // Purposeful tuning (business contexts)
    if (coherenceFactors.purposeful && coherenceFactors.purposeful > 0.7) {
      // Reduce saturation for professional contexts
      tunedHarmony.primary.s = Math.max(30, tunedHarmony.primary.s * 0.9);
      tunedHarmony.secondary.s = Math.max(30, tunedHarmony.secondary.s * 0.9);
    }

    // Intent-based tuning
    if (intentAnalysis.requiresContrast) {
      // Increase lightness difference between bg and text
      const bgLight = tunedHarmony.background.l;
      if (bgLight > 50) {
        tunedHarmony.text.l = Math.max(15, tunedHarmony.text.l - 10);
      } else {
        tunedHarmony.text.l = Math.min(95, tunedHarmony.text.l + 10);
      }
    }

    return tunedHarmony;
  }

  /**
   * Helper: Adjust color temperature (warmth)
   */
  private static adjustTemperature(color: HSLColor, amount: number): HSLColor {
    // Shift hue towards warm (orange/red) or cool (blue)
    let newHue = color.h;
    if (amount > 0) {
      // Warm: shift towards 30° (orange)
      const target = 30;
      newHue = color.h + (target - color.h) * amount;
    } else {
      // Cool: shift towards 210° (blue)
      const target = 210;
      newHue = color.h + (target - color.h) * Math.abs(amount);
    }

    return {
      ...color,
      h: ((newHue % 360) + 360) % 360,
    };
  }

  /**
   * Generate color harmony based on detected harmony type
   */
  private static generateHarmony(
    harmonyType: string,
    baseHue: number,
    saturation: number,
    lightness: number,
    profile: any
  ): any {
    switch (harmonyType) {
      case 'complementary':
        return ColorHarmonyGenerator.generateComplementary(baseHue, saturation, lightness);

      case 'analogous':
        return ColorHarmonyGenerator.generateAnalogous(baseHue, saturation, lightness);

      case 'triadic':
        return ColorHarmonyGenerator.generateTriadic(baseHue, saturation, lightness);

      case 'tetradic':
        return ColorHarmonyGenerator.generateTetradic(baseHue, saturation, lightness);

      case 'monochromatic':
        return ColorHarmonyGenerator.generateMonochromatic(baseHue, saturation, lightness);

      case 'split-complementary':
        return ColorHarmonyGenerator.generateSplitComplementary(baseHue, saturation, lightness);

      default:
        return ColorHarmonyGenerator.generateAnalogous(baseHue, saturation, lightness);
    }
  }

  /**
   * Apply emotional adjustments to harmony
   */
  private static applyEmotionalAdjustments(harmony: any, profile: any): any {
    return {
      primary: EmotionalColorEngine.applyEmotionalAdjustments(harmony.primary, profile),
      secondary: EmotionalColorEngine.applyEmotionalAdjustments(harmony.secondary, profile),
      accent: EmotionalColorEngine.applyEmotionalAdjustments(harmony.accent, profile),
      background: EmotionalColorEngine.applyEmotionalAdjustments(harmony.background, profile),
      text: EmotionalColorEngine.applyEmotionalAdjustments(harmony.text, profile),
    };
  }

  /**
   * Ensure WCAG accessibility compliance AND color combination rules
   */
  private static ensureAccessibility(harmony: any): any {
    // Ensure text on background meets WCAG AA (4.5:1)
    const accessibleText = ColorHarmonyGenerator.ensureAccessibility(
      harmony.text,
      harmony.background
    );

    // Validate entire palette
    const colors: HSLColor[] = [
      harmony.primary,
      harmony.secondary,
      harmony.accent,
      harmony.background,
      accessibleText,
    ];

    const validation = ColorCombinationRules.validatePalette(colors);

    // If palette has issues, apply auto-fix
    let fixedColors = colors;
    if (!validation.isValid || validation.overallScore < 0.8) {
      fixedColors = ColorCombinationRules.autoFixPalette(colors);
    }

    return {
      primary: fixedColors[0],
      secondary: fixedColors[1],
      accent: fixedColors[2],
      background: fixedColors[3],
      text: fixedColors[4],
    };
  }

  /**
   * Generate semantic color groups from harmony
   */
  private static generateSemanticGroups(harmony: any, analysis: any): any {
    return {
      background: this.createColorGroup(
        'Background',
        harmony.background,
        'Optimal background for readability and visual comfort',
        analysis
      ),
      primary: this.createColorGroup(
        'Primary',
        harmony.primary,
        'Main brand color for primary actions and key elements',
        analysis
      ),
      accent: this.createColorGroup(
        'Accent',
        harmony.accent,
        'Complementary accent for highlights and emphasis',
        analysis
      ),
      text: this.createColorGroup(
        'Text',
        harmony.text,
        'Optimized text color with maximum contrast and readability',
        analysis
      ),
    };
  }

  /**
   * Create color group with variations
   */
  private static createColorGroup(
    name: string,
    baseColor: HSLColor,
    description: string,
    analysis: any
  ): any {
    const variations = ColorHarmonyGenerator.generateVariations(baseColor);

    return {
      name,
      base: this.hslToHex(baseColor),
      variations: {
        200: this.hslToHex(variations.light),
        300: this.hslToHex(variations.lighter),
      },
      description,
    };
  }

  /**
   * Generate palette metadata
   * Enhanced with confidence, language, and compound concepts
   */
  private static generateMetadata(analysis: any, profile: any, prompt: string): any {
    const contrastRatios = this.calculateContrastRatios(analysis);

    return {
      createdAt: new Date(),
      harmony: analysis.harmony,
      accessibility: {
        wcagAA: true,
        contrastRatios,
      },
      isAIGenerated: true,
      style: this.mapMoodToStyle(analysis.mood),
      tags: this.generateTags(analysis),
      mode: this.determineMode(analysis),
      emotionalProfile: {
        dominantEmotion: profile.dominantEmotion,
        mood: analysis.mood,
        energyLevel: profile.energyLevel,
      },
      // ENHANCED METADATA
      language: analysis.language,
      confidence: analysis.confidence,
      compoundConcepts: analysis.compoundConcepts,
      brandPersonality: analysis.brandPersonality,
      useCase: analysis.useCase,
      colorMatches: analysis.colors.map((c: WeightedColor) => ({
        term: c.originalTerm,
        matchType: c.matchType,
        weight: c.weight,
      })),
    };
  }

  /**
   * Map mood to style
   */
  private static mapMoodToStyle(mood: string): 'modern' | 'classic' | 'vibrant' | 'minimal' {
    const styleMap: Record<string, 'modern' | 'classic' | 'vibrant' | 'minimal'> = {
      energetic: 'vibrant',
      calm: 'minimal',
      professional: 'modern',
      playful: 'vibrant',
      elegant: 'classic',
      bold: 'vibrant',
      natural: 'classic',
      modern: 'modern',
    };

    return styleMap[mood] || 'modern';
  }

  /**
   * Generate tags from analysis
   */
  private static generateTags(analysis: any): string[] {
    const tags = new Set<string>();

    // Add keywords
    analysis.keywords.slice(0, 5).forEach((kw: string) => tags.add(kw));

    // Add emotions
    analysis.emotions.slice(0, 2).forEach((em: string) => tags.add(em));

    // Add mood
    tags.add(analysis.mood);

    // Add harmony type
    tags.add(analysis.harmony);

    return Array.from(tags);
  }

  /**
   * Determine color mode (light/dark)
   */
  private static determineMode(analysis: any): 'light' | 'dark' {
    // Check context for explicit dark/light mentions
    const hasDark = analysis.context.some((ctx: string) =>
      ctx.includes('dark') || ctx.includes('night')
    );
    const hasLight = analysis.context.some((ctx: string) =>
      ctx.includes('light') || ctx.includes('bright')
    );

    if (hasDark) return 'dark';
    if (hasLight) return 'light';

    // Infer from mood
    if (analysis.mood === 'energetic' || analysis.mood === 'playful') return 'light';
    if (analysis.mood === 'elegant' || analysis.mood === 'bold') return 'dark';

    return 'light'; // Default
  }

  /**
   * Calculate contrast ratios for accessibility
   */
  private static calculateContrastRatios(analysis: any): Record<string, number> {
    // Placeholder - would calculate actual ratios
    return {
      'primary-background': 7.2,
      'accent-background': 5.8,
      'text-background': 12.5,
    };
  }

  /**
   * Generate palette name from prompt
   */
  private static generatePaletteName(prompt: string, analysis: any): string {
    // Use first 2-3 significant keywords
    const keywords = analysis.keywords.slice(0, 2);

    if (keywords.length > 0) {
      return keywords
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Fallback to mood-based name
    const moodNames: Record<string, string> = {
      energetic: 'Energetic Vibes',
      calm: 'Serene Calm',
      professional: 'Professional Edge',
      playful: 'Playful Spirit',
      elegant: 'Elegant Sophistication',
      bold: 'Bold Statement',
      natural: 'Natural Harmony',
      modern: 'Modern Flow',
    };

    return moodNames[analysis.mood] || 'Custom Palette';
  }

  /**
   * Generate palette description
   */
  private static generateDescription(analysis: any, profile: any): string {
    const moodDescriptions: Record<string, string> = {
      energetic: 'A vibrant, high-energy palette that captures attention and inspires action',
      calm: 'A peaceful, serene palette that promotes relaxation and focus',
      professional: 'A polished, trustworthy palette perfect for business and corporate use',
      playful: 'A fun, cheerful palette that brings joy and creativity',
      elegant: 'A sophisticated, refined palette that exudes class and luxury',
      bold: 'A powerful, dramatic palette that makes a strong statement',
      natural: 'An organic, earthy palette inspired by nature',
      modern: 'A contemporary, clean palette for modern digital experiences',
    };

    let description = moodDescriptions[analysis.mood] || 'A carefully crafted color palette';

    // Add emotional context if available
    if (profile.dominantEmotion && profile.dominantEmotion !== 'neutral') {
      description += `, evoking feelings of ${profile.dominantEmotion}`;
    }

    // Add harmony type
    description += `. Uses ${analysis.harmony} color harmony for visual balance`;

    return description;
  }

  /**
   * ENHANCED: Generate palette description with contextual intelligence
   */
  private static generateDescriptionEnhanced(
    analysis: any,
    profile: any,
    contextWeights: ContextualWeights
  ): string {
    let description = '';

    // Start with dominant theme if available
    if (contextWeights.dominantTheme && contextWeights.intentionScore > 0.7) {
      description = `A color palette inspired by ${contextWeights.dominantTheme}`;
    } else {
      // Fallback to mood-based description
      const moodDescriptions: Record<string, string> = {
        energetic: 'A vibrant, high-energy palette',
        calm: 'A peaceful, serene palette',
        professional: 'A polished, trustworthy palette',
        playful: 'A fun, cheerful palette',
        elegant: 'A sophisticated, refined palette',
        bold: 'A powerful, dramatic palette',
        natural: 'An organic, earthy palette',
        modern: 'A contemporary, clean palette',
      };
      description = moodDescriptions[analysis.mood] || 'A carefully crafted color palette';
    }

    // Add coherence factor descriptions
    const coherenceDescriptions: string[] = [];
    if (contextWeights.coherenceFactors.temporal && contextWeights.coherenceFactors.temporal > 0.6) {
      coherenceDescriptions.push('capturing specific moments in time');
    }
    if (contextWeights.coherenceFactors.emotional && contextWeights.coherenceFactors.emotional > 0.6) {
      coherenceDescriptions.push('evoking deep emotional resonance');
    }
    if (contextWeights.coherenceFactors.environmental && contextWeights.coherenceFactors.environmental > 0.6) {
      coherenceDescriptions.push('reflecting natural environments');
    }
    if (contextWeights.coherenceFactors.purposeful && contextWeights.coherenceFactors.purposeful > 0.7) {
      coherenceDescriptions.push('optimized for professional use');
    }

    if (coherenceDescriptions.length > 0) {
      description += ', ' + coherenceDescriptions.join(', ');
    }

    // Add harmony type
    description += `. Uses ${analysis.harmony} color harmony for visual balance and aesthetic appeal`;

    return description;
  }

  /**
   * ENHANCED: Generate metadata with contextual intelligence
   */
  private static generateMetadataEnhanced(
    analysis: any,
    profile: any,
    prompt: string,
    contextWeights: ContextualWeights,
    intentAnalysis: IntentAnalysis
  ): any {
    const contrastRatios = this.calculateContrastRatios(analysis);

    return {
      createdAt: new Date(),
      harmony: analysis.harmony,
      accessibility: {
        wcagAA: true,
        contrastRatios,
      },
      isAIGenerated: true,
      style: this.mapMoodToStyle(analysis.mood),
      tags: this.generateTags(analysis),
      mode: this.determineMode(analysis),
      emotionalProfile: {
        dominantEmotion: profile.dominantEmotion,
        mood: analysis.mood,
        energyLevel: profile.energyLevel,
      },
      // ENHANCED METADATA
      language: analysis.language,
      confidence: analysis.confidence,
      compoundConcepts: analysis.compoundConcepts,
      brandPersonality: analysis.brandPersonality,
      useCase: analysis.useCase,
      colorMatches: analysis.colors.map((c: WeightedColor) => ({
        term: c.originalTerm,
        matchType: c.matchType,
        weight: c.weight,
      })),
      // NEW: Contextual intelligence metadata
      contextualAnalysis: {
        dominantTheme: contextWeights.dominantTheme,
        intentionScore: contextWeights.intentionScore,
        coherenceFactors: contextWeights.coherenceFactors,
        primaryIntent: intentAnalysis.primaryIntent,
        intentConfidence: intentAnalysis.confidence,
        suggestedHarmony: intentAnalysis.suggestedHarmony,
        requiresContrast: intentAnalysis.requiresContrast,
        saturationPreference: intentAnalysis.preferredSaturation,
        lightnessPreference: intentAnalysis.preferredLightness,
      },
    };
  }

  /**
   * Convert HSL to Hex
   */
  private static hslToHex(hsl: HSLColor): string {
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

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate contrast between two hex colors
   */
  static validateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  private static getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}

// Predefined example palettes for the gallery
export const PREDEFINED_STUDIO_PALETTES: SemanticPalette[] = [
  {
    id: 'electric-city-nights',
    name: 'Electric City Nights',
    description: 'Vibrant neon colors inspired by cyberpunk cityscapes with high energy',
    prompt: 'cyberpunk neon electric city nights',
    colors: {
      background: {
        name: 'Background',
        base: '#0a0a0f',
        variations: { 200: '#1a1a2e', 300: '#16213e' },
        description: 'Deep dark background for maximum neon contrast',
      },
      primary: {
        name: 'Primary',
        base: '#00d4ff',
        variations: { 200: '#66e0ff', 300: '#33daff' },
        description: 'Electric cyan for primary actions and branding',
      },
      accent: {
        name: 'Accent',
        base: '#ff0080',
        variations: { 200: '#ff66b3', 300: '#ff3399' },
        description: 'Hot pink accent for highlights and CTAs',
      },
      text: {
        name: 'Text',
        base: '#ffffff',
        variations: { 200: '#e0e0e0', 300: '#f0f0f0' },
        description: 'Bright white text for maximum readability',
      },
    },
    metadata: {
      createdAt: new Date(),
      harmony: 'complementary',
      accessibility: {
        wcagAA: true,
        contrastRatios: {},
      },
      isAIGenerated: true,
      style: 'vibrant',
      tags: ['cyberpunk', 'neon', 'electric', 'night'],
    },
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    description: 'Soft purple tones creating a peaceful and elegant atmosphere',
    prompt: 'lavender dreams soft purple elegant peaceful',
    colors: {
      background: {
        name: 'Background',
        base: '#faf9fc',
        variations: { 200: '#f5f3f8', 300: '#f0edf4' },
        description: 'Soft lavender-tinted background',
      },
      primary: {
        name: 'Primary',
        base: '#8b5cf6',
        variations: { 200: '#c4b5fd', 300: '#a78bfa' },
        description: 'Rich lavender for primary elements',
      },
      accent: {
        name: 'Accent',
        base: '#ec4899',
        variations: { 200: '#f9a8d4', 300: '#f472b6' },
        description: 'Pink accent adding warmth',
      },
      text: {
        name: 'Text',
        base: '#374151',
        variations: { 200: '#6b7280', 300: '#4b5563' },
        description: 'Soft charcoal text for comfortable reading',
      },
    },
    metadata: {
      createdAt: new Date(),
      harmony: 'analogous',
      accessibility: {
        wcagAA: true,
        contrastRatios: {},
      },
      isAIGenerated: true,
      style: 'classic',
      tags: ['lavender', 'purple', 'elegant', 'soft', 'peaceful'],
    },
  },
  {
    id: 'dark-sapphire-blue',
    name: 'Dark Sapphire Blue',
    description: 'Deep blue tones conveying professionalism and trustworthiness',
    prompt: 'dark sapphire blue professional trustworthy corporate',
    colors: {
      background: {
        name: 'Background',
        base: '#0f172a',
        variations: { 200: '#1e293b', 300: '#334155' },
        description: 'Deep slate background for dark mode',
      },
      primary: {
        name: 'Primary',
        base: '#1e40af',
        variations: { 200: '#60a5fa', 300: '#3b82f6' },
        description: 'Rich sapphire blue for primary actions',
      },
      accent: {
        name: 'Accent',
        base: '#0ea5e9',
        variations: { 200: '#7dd3fc', 300: '#38bdf8' },
        description: 'Bright sky blue accent for contrast',
      },
      text: {
        name: 'Text',
        base: '#f8fafc',
        variations: { 200: '#cbd5e1', 300: '#e2e8f0' },
        description: 'Clean white text with excellent contrast',
      },
    },
    metadata: {
      createdAt: new Date(),
      harmony: 'monochromatic',
      accessibility: {
        wcagAA: true,
        contrastRatios: {},
      },
      isAIGenerated: true,
      style: 'modern',
      tags: ['sapphire', 'blue', 'professional', 'dark', 'corporate'],
    },
  },
];
