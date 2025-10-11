/**
 * Advanced Semantic Analyzer for Natural Language Processing
 * Lightweight NLP without ML dependencies
 * Now with BILINGUAL support (English + Spanish)
 */

import {
  ALL_COLOR_MAPPINGS,
  ColorMapping,
  INTENSITY_MODIFIERS,
  TEMPERATURE_WORDS,
  SATURATION_MODIFIERS,
  LIGHTNESS_MODIFIERS,
} from '../data/colorKnowledge';

import { SPANISH_COLOR_MAPPINGS } from '../data/spanishColorKnowledge';
import { LanguageDetector, SupportedLanguage } from './languageDetector';
import { AdvancedMatcher, MatchResult } from './advancedMatching';

export interface WeightedColor extends ColorMapping {
  weight: number; // 0-1 confidence score
  matchType: 'exact' | 'fuzzy' | 'synonym' | 'stemmed' | 'compound';
  originalTerm: string;
}

export interface PromptAnalysis {
  keywords: string[];
  emotions: string[];
  industries: string[];
  objects: string[];
  colors: WeightedColor[]; // Changed from ColorMapping[] to WeightedColor[]
  intensity: number; // -1 to 1
  temperature: number; // -1 (cool) to 1 (warm)
  saturation: number; // -1 to 1
  lightness: number; // -1 to 1
  harmony: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary';
  mood: 'energetic' | 'calm' | 'professional' | 'playful' | 'elegant' | 'bold' | 'natural' | 'modern';
  context: string[];
  language: SupportedLanguage; // Detected language
  brandPersonality?: string[]; // Brand personality traits
  useCase?: string; // Specific use case detected
  compoundConcepts?: string[]; // Multi-word concepts detected
  confidence: number; // Overall confidence in analysis (0-1)
}

export class SemanticAnalyzer {
  /**
   * Analyze a prompt and extract semantic information
   * Enhanced with advanced matching and scoring
   */
  static analyze(prompt: string): PromptAnalysis {
    // Detect language first
    const languageDetection = LanguageDetector.detect(prompt);
    const detectedLanguage = languageDetection.primary;

    const normalizedPrompt = this.normalizeText(prompt);
    const tokens = this.tokenize(normalizedPrompt);
    const stemmedTokens = tokens.map(t => this.stem(t, detectedLanguage));

    // Detect compound concepts FIRST (before tokenization breaks them)
    const compoundConcepts = AdvancedMatcher.detectCompoundConcepts(tokens);

    // Extract all data
    const keywords = this.extractKeywords(tokens, stemmedTokens, detectedLanguage);
    const emotions = this.extractEmotions(tokens, stemmedTokens, detectedLanguage);
    const industries = this.extractIndustries(tokens, stemmedTokens, detectedLanguage);
    const objects = this.extractObjects(tokens, stemmedTokens, detectedLanguage);
    const colors = this.extractColorsEnhanced(tokens, stemmedTokens, detectedLanguage, compoundConcepts);
    const brandPersonality = this.extractBrandPersonality(tokens, stemmedTokens, detectedLanguage);
    const useCase = this.extractUseCase(tokens, stemmedTokens, detectedLanguage);

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence({
      languageConfidence: languageDetection.confidence,
      keywordCount: keywords.length,
      colorCount: colors.length,
      emotionCount: emotions.length,
      hasIndustry: industries.length > 0,
      hasUseCase: useCase !== undefined,
      hasBrandPersonality: brandPersonality !== undefined && brandPersonality.length > 0,
      hasCompoundConcepts: compoundConcepts.length > 0,
    });

    return {
      keywords,
      emotions,
      industries,
      objects,
      colors,
      intensity: this.calculateIntensity(tokens, detectedLanguage),
      temperature: this.calculateTemperature(tokens, detectedLanguage),
      saturation: this.calculateSaturation(tokens, detectedLanguage),
      lightness: this.calculateLightness(tokens, detectedLanguage),
      harmony: this.detectHarmony(tokens, normalizedPrompt, detectedLanguage),
      mood: this.detectMood(tokens, normalizedPrompt, detectedLanguage),
      context: this.extractContext(tokens, normalizedPrompt, detectedLanguage),
      language: detectedLanguage,
      brandPersonality,
      useCase,
      compoundConcepts: compoundConcepts.length > 0 ? compoundConcepts : undefined,
      confidence,
    };
  }

  /**
   * Normalize text for processing
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Tokenize text into words
   */
  private static tokenize(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  /**
   * Simple stemming algorithm (Porter-like simplification)
   * Now supports English and Spanish
   */
  private static stem(word: string, language: SupportedLanguage = 'en'): string {
    const rules = LanguageDetector.getStemRules(language);

    for (const suffix of rules.suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + rules.minLength) {
        return word.slice(0, -suffix.length);
      }
    }

    return word;
  }

  /**
   * Extract color-related keywords from prompt
   * Now supports both English and Spanish
   */
  private static extractKeywords(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string[] {
    const keywords = new Set<string>();

    // Choose appropriate mapping based on language
    const colorMappings = language === 'es' ? SPANISH_COLOR_MAPPINGS : ALL_COLOR_MAPPINGS;

    // Direct matches
    tokens.forEach(token => {
      if (colorMappings[token]) {
        keywords.add(token);
      }
    });

    // Stemmed matches
    stemmedTokens.forEach((stem, idx) => {
      Object.keys(colorMappings).forEach(key => {
        if (this.stem(key, language) === stem) {
          keywords.add(key);
        }
      });
    });

    // Multi-word phrases
    for (let i = 0; i < tokens.length - 1; i++) {
      const phrase = `${tokens[i]} ${tokens[i + 1]}`;
      if (colorMappings[phrase]) {
        keywords.add(phrase);
      }
    }

    // For mixed language, also check the other language
    if (language === 'mixed') {
      tokens.forEach(token => {
        if (ALL_COLOR_MAPPINGS[token]) keywords.add(token);
        if (SPANISH_COLOR_MAPPINGS[token]) keywords.add(token);
      });
    }

    return Array.from(keywords);
  }

  /**
   * Extract emotional context
   * Now supports both English and Spanish
   */
  private static extractEmotions(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string[] {
    const englishEmotionKeywords = [
      'happy', 'sad', 'angry', 'calm', 'excited', 'peaceful', 'energetic',
      'relaxed', 'passionate', 'romantic', 'mysterious', 'elegant', 'playful',
      'serious', 'professional', 'casual', 'formal', 'cheerful', 'melancholy',
      'joyful', 'serene', 'tranquil', 'bold', 'confident', 'powerful', 'gentle',
      'soft', 'warm', 'cool', 'hot', 'cold', 'cozy', 'fresh', 'crisp',
    ];

    const spanishEmotionKeywords = [
      'feliz', 'triste', 'enojado', 'tranquilo', 'emocionado', 'pacífico', 'energético',
      'relajado', 'apasionado', 'romántico', 'misterioso', 'elegante', 'juguetón',
      'serio', 'profesional', 'casual', 'formal', 'alegre', 'melancólico',
      'gozoso', 'sereno', 'calmado', 'audaz', 'confiado', 'poderoso', 'gentil',
      'suave', 'cálido', 'fresco', 'caliente', 'frío', 'acogedor', 'crujiente',
    ];

    const emotionKeywords = language === 'es' ? spanishEmotionKeywords : englishEmotionKeywords;
    const emotions: string[] = [];

    tokens.forEach(token => {
      if (emotionKeywords.includes(token)) {
        emotions.push(token);
      }
    });

    // Check stemmed versions
    stemmedTokens.forEach((stem, idx) => {
      emotionKeywords.forEach(emotion => {
        if (this.stem(emotion, language) === stem && !emotions.includes(emotion)) {
          emotions.push(emotion);
        }
      });
    });

    // For mixed language, check both
    if (language === 'mixed') {
      tokens.forEach(token => {
        if (englishEmotionKeywords.includes(token) && !emotions.includes(token)) {
          emotions.push(token);
        }
        if (spanishEmotionKeywords.includes(token) && !emotions.includes(token)) {
          emotions.push(token);
        }
      });
    }

    return emotions;
  }

  /**
   * Extract industry/context keywords
   * Now supports both English and Spanish
   */
  private static extractIndustries(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string[] {
    const englishIndustryKeywords = [
      'tech', 'technology', 'finance', 'healthcare', 'medical', 'education',
      'food', 'restaurant', 'fashion', 'beauty', 'gaming', 'music', 'art',
      'design', 'corporate', 'business', 'startup', 'creative', 'luxury',
      'premium', 'modern', 'vintage', 'retro', 'minimalist', 'industrial',
      'organic', 'natural', 'eco', 'sustainable', 'digital', 'cyber',
      'futuristic', 'classic', 'traditional', 'contemporary',
    ];

    const spanishIndustryKeywords = [
      'tecnología', 'finanzas', 'salud', 'médico', 'educación',
      'comida', 'restaurante', 'moda', 'belleza', 'videojuegos', 'música', 'arte',
      'diseño', 'corporativo', 'negocio', 'empresa', 'startup', 'creativo', 'lujo',
      'premium', 'moderno', 'vintage', 'retro', 'minimalista', 'industrial',
      'orgánico', 'natural', 'eco', 'sostenible', 'digital', 'cibernético',
      'futurista', 'clásico', 'tradicional', 'contemporáneo',
    ];

    const industryKeywords = language === 'es' ? spanishIndustryKeywords : englishIndustryKeywords;
    const industries: string[] = [];

    tokens.forEach(token => {
      if (industryKeywords.includes(token)) {
        industries.push(token);
      }
    });

    // For mixed language, check both
    if (language === 'mixed') {
      tokens.forEach(token => {
        if (englishIndustryKeywords.includes(token) && !industries.includes(token)) {
          industries.push(token);
        }
        if (spanishIndustryKeywords.includes(token) && !industries.includes(token)) {
          industries.push(token);
        }
      });
    }

    return industries;
  }

  /**
   * Extract object references
   * Now supports both English and Spanish
   */
  private static extractObjects(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string[] {
    const objects: string[] = [];
    const englishObjectCategories = ['gold', 'silver', 'wood', 'stone', 'glass', 'metal', 'leather'];
    const spanishObjectCategories = ['oro', 'plata', 'madera', 'piedra', 'vidrio', 'metal', 'cuero'];

    const objectCategories = language === 'es' ? spanishObjectCategories : englishObjectCategories;

    tokens.forEach(token => {
      if (objectCategories.some(cat => token.includes(cat))) {
        objects.push(token);
      }
    });

    // For mixed language, check both
    if (language === 'mixed') {
      tokens.forEach(token => {
        if (englishObjectCategories.some(cat => token.includes(cat)) && !objects.includes(token)) {
          objects.push(token);
        }
        if (spanishObjectCategories.some(cat => token.includes(cat)) && !objects.includes(token)) {
          objects.push(token);
        }
      });
    }

    return objects;
  }

  /**
   * Extract direct color mappings from keywords
   * Now supports both English and Spanish
   */
  private static extractColors(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): ColorMapping[] {
    const colors: ColorMapping[] = [];
    const keywords = this.extractKeywords(tokens, stemmedTokens, language);

    const colorMappings = language === 'es' ? SPANISH_COLOR_MAPPINGS : ALL_COLOR_MAPPINGS;

    keywords.forEach(keyword => {
      const mapping = colorMappings[keyword];
      if (mapping) {
        colors.push({ ...mapping, weight: 1 });
      }
    });

    // For mixed language, check both mappings
    if (language === 'mixed') {
      keywords.forEach(keyword => {
        if (!colors.some(c => c.h === ALL_COLOR_MAPPINGS[keyword]?.h)) {
          const mapping = ALL_COLOR_MAPPINGS[keyword] || SPANISH_COLOR_MAPPINGS[keyword];
          if (mapping) {
            colors.push({ ...mapping, weight: 1 });
          }
        }
      });
    }

    return colors;
  }

  /**
   * ENHANCED: Extract colors with advanced matching, fuzzy search, and synonyms
   * This is the new primary color extraction method
   */
  private static extractColorsEnhanced(
    tokens: string[],
    stemmedTokens: string[],
    language: SupportedLanguage,
    compoundConcepts: string[]
  ): WeightedColor[] {
    const weightedColors: WeightedColor[] = [];
    const colorMappings = language === 'es' ? SPANISH_COLOR_MAPPINGS : ALL_COLOR_MAPPINGS;
    const allColorKeywords = Object.keys(colorMappings);

    // Track seen colors to avoid duplicates
    const seenColorKeys = new Set<string>();

    // 1. Process compound concepts FIRST (highest priority)
    compoundConcepts.forEach(concept => {
      const conceptKey = concept.toLowerCase();
      if (colorMappings[conceptKey]) {
        const colorKey = `${colorMappings[conceptKey].h}-${colorMappings[conceptKey].s}-${colorMappings[conceptKey].l}`;
        if (!seenColorKeys.has(colorKey)) {
          weightedColors.push({
            ...colorMappings[conceptKey],
            weight: 0.95,
            matchType: 'compound',
            originalTerm: concept,
          });
          seenColorKeys.add(colorKey);
        }
      }
    });

    // 2. Process each token with advanced matching
    tokens.forEach((token, index) => {
      const normalized = token.toLowerCase();

      // Exact match
      if (colorMappings[normalized]) {
        const colorKey = `${colorMappings[normalized].h}-${colorMappings[normalized].s}-${colorMappings[normalized].l}`;
        if (!seenColorKeys.has(colorKey)) {
          weightedColors.push({
            ...colorMappings[normalized],
            weight: 1.0,
            matchType: 'exact',
            originalTerm: token,
          });
          seenColorKeys.add(colorKey);
        }
        return;
      }

      // Synonym expansion
      const synonyms = AdvancedMatcher.getSynonyms(normalized, language);
      for (const syn of synonyms) {
        if (colorMappings[syn]) {
          const colorKey = `${colorMappings[syn].h}-${colorMappings[syn].s}-${colorMappings[syn].l}`;
          if (!seenColorKeys.has(colorKey)) {
            weightedColors.push({
              ...colorMappings[syn],
              weight: 0.85,
              matchType: 'synonym',
              originalTerm: token,
            });
            seenColorKeys.add(colorKey);
            return;
          }
        }
      }

      // Fuzzy matching (only if no exact or synonym match)
      const fuzzyMatches = AdvancedMatcher.findFuzzyMatches(normalized, allColorKeywords, 0.8);
      if (fuzzyMatches.length > 0) {
        const bestMatch = fuzzyMatches[0];
        if (colorMappings[bestMatch.keyword]) {
          const colorKey = `${colorMappings[bestMatch.keyword].h}-${colorMappings[bestMatch.keyword].s}-${colorMappings[bestMatch.keyword].l}`;
          if (!seenColorKeys.has(colorKey)) {
            weightedColors.push({
              ...colorMappings[bestMatch.keyword],
              weight: bestMatch.score * 0.75, // Fuzzy match penalty
              matchType: 'fuzzy',
              originalTerm: token,
            });
            seenColorKeys.add(colorKey);
          }
        }
      }

      // Stemmed matching
      const stemmed = stemmedTokens[index];
      for (const keyword of allColorKeywords) {
        const stemmedKeyword = this.stem(keyword, language);
        if (stemmed === stemmedKeyword && normalized !== keyword) {
          if (colorMappings[keyword]) {
            const colorKey = `${colorMappings[keyword].h}-${colorMappings[keyword].s}-${colorMappings[keyword].l}`;
            if (!seenColorKeys.has(colorKey)) {
              weightedColors.push({
                ...colorMappings[keyword],
                weight: 0.7,
                matchType: 'stemmed',
                originalTerm: token,
              });
              seenColorKeys.add(colorKey);
              break;
            }
          }
        }
      }
    });

    // 3. For mixed language, also check the other mapping
    if (language === 'mixed') {
      const otherMapping = SPANISH_COLOR_MAPPINGS;
      const otherKeywords = Object.keys(otherMapping);

      tokens.forEach(token => {
        const normalized = token.toLowerCase();
        if (otherMapping[normalized]) {
          const colorKey = `${otherMapping[normalized].h}-${otherMapping[normalized].s}-${otherMapping[normalized].l}`;
          if (!seenColorKeys.has(colorKey)) {
            weightedColors.push({
              ...otherMapping[normalized],
              weight: 0.9, // Slightly lower for mixed language
              matchType: 'exact',
              originalTerm: token,
            });
            seenColorKeys.add(colorKey);
          }
        }
      });

      // Also check English mappings
      const englishMapping = ALL_COLOR_MAPPINGS;
      tokens.forEach(token => {
        const normalized = token.toLowerCase();
        if (englishMapping[normalized]) {
          const colorKey = `${englishMapping[normalized].h}-${englishMapping[normalized].s}-${englishMapping[normalized].l}`;
          if (!seenColorKeys.has(colorKey)) {
            weightedColors.push({
              ...englishMapping[normalized],
              weight: 0.9,
              matchType: 'exact',
              originalTerm: token,
            });
            seenColorKeys.add(colorKey);
          }
        }
      });
    }

    // Sort by weight descending
    return weightedColors.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Calculate overall confidence in the analysis
   */
  private static calculateConfidence(factors: {
    languageConfidence: number;
    keywordCount: number;
    colorCount: number;
    emotionCount: number;
    hasIndustry: boolean;
    hasUseCase: boolean;
    hasBrandPersonality: boolean;
    hasCompoundConcepts: boolean;
  }): number {
    let confidence = 0;

    // Language detection confidence (30%)
    confidence += factors.languageConfidence * 0.3;

    // Keyword richness (20%)
    const keywordScore = Math.min(factors.keywordCount / 5, 1);
    confidence += keywordScore * 0.2;

    // Color detection (20%)
    const colorScore = Math.min(factors.colorCount / 3, 1);
    confidence += colorScore * 0.2;

    // Emotional context (10%)
    const emotionScore = Math.min(factors.emotionCount / 2, 1);
    confidence += emotionScore * 0.1;

    // Industry/Use case context (10%)
    if (factors.hasIndustry || factors.hasUseCase) {
      confidence += 0.1;
    }

    // Brand personality (5%)
    if (factors.hasBrandPersonality) {
      confidence += 0.05;
    }

    // Compound concepts (5%)
    if (factors.hasCompoundConcepts) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Calculate intensity modifier from text
   * Supports bilingual modifiers
   */
  private static calculateIntensity(tokens: string[], language: SupportedLanguage): number {
    let intensity = 0;
    let count = 0;

    tokens.forEach(token => {
      if (INTENSITY_MODIFIERS[token] !== undefined) {
        intensity += INTENSITY_MODIFIERS[token];
        count++;
      }
    });

    return count > 0 ? intensity / count : 0;
  }

  /**
   * Calculate temperature (warm/cool) bias
   * Supports bilingual temperature words
   */
  private static calculateTemperature(tokens: string[], language: SupportedLanguage): number {
    let warmCount = 0;
    let coolCount = 0;

    tokens.forEach(token => {
      if (TEMPERATURE_WORDS.warm.some(w => token.includes(w))) warmCount++;
      if (TEMPERATURE_WORDS.cool.some(w => token.includes(w))) coolCount++;
    });

    const total = warmCount + coolCount;
    if (total === 0) return 0;

    return (warmCount - coolCount) / total;
  }

  /**
   * Calculate saturation preference
   * Supports bilingual saturation modifiers
   */
  private static calculateSaturation(tokens: string[], language: SupportedLanguage): number {
    let saturation = 0;
    let count = 0;

    tokens.forEach(token => {
      if (SATURATION_MODIFIERS[token] !== undefined) {
        saturation += SATURATION_MODIFIERS[token];
        count++;
      }
    });

    return count > 0 ? saturation / count : 0;
  }

  /**
   * Calculate lightness preference
   * Supports bilingual lightness modifiers
   */
  private static calculateLightness(tokens: string[], language: SupportedLanguage): number {
    let lightness = 0;
    let count = 0;

    tokens.forEach(token => {
      if (LIGHTNESS_MODIFIERS[token] !== undefined) {
        lightness += LIGHTNESS_MODIFIERS[token];
        count++;
      }
    });

    return count > 0 ? lightness / count : 0;
  }

  /**
   * Detect color harmony preference from prompt
   * Now supports both English and Spanish
   */
  private static detectHarmony(
    tokens: string[],
    prompt: string,
    language: SupportedLanguage
  ): 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary' {
    // Explicit harmony mentions (English + Spanish)
    if (prompt.includes('complementary') || prompt.includes('contrast') ||
        prompt.includes('complementario') || prompt.includes('contraste')) {
      return 'complementary';
    }
    if (prompt.includes('analogous') || prompt.includes('similar') || prompt.includes('harmoni') ||
        prompt.includes('análogo') || prompt.includes('similar') || prompt.includes('armonioso')) {
      return 'analogous';
    }
    if (prompt.includes('triadic') || prompt.includes('three') ||
        prompt.includes('triádico') || prompt.includes('tres')) {
      return 'triadic';
    }
    if (prompt.includes('tetradic') || prompt.includes('four') || prompt.includes('square') ||
        prompt.includes('tetrádico') || prompt.includes('cuatro')) {
      return 'tetradic';
    }
    if (prompt.includes('monochromatic') || prompt.includes('single') || prompt.includes('one color') ||
        prompt.includes('monocromático') || prompt.includes('único') || prompt.includes('un color')) {
      return 'monochromatic';
    }
    if (prompt.includes('split')) {
      return 'split-complementary';
    }

    // Infer from mood/context (bilingual)
    const contrastWords = ['bold', 'vibrant', 'dynamic', 'energetic', 'exciting',
                          'audaz', 'vibrante', 'dinámico', 'energético', 'emocionante'];
    const hasContrast = tokens.some(t => contrastWords.includes(t));
    if (hasContrast) return 'complementary';

    const harmonyWords = ['calm', 'peaceful', 'serene', 'gentle', 'soft', 'subtle',
                         'tranquilo', 'pacífico', 'sereno', 'gentil', 'suave', 'sutil'];
    const hasHarmony = tokens.some(t => harmonyWords.includes(t));
    if (hasHarmony) return 'analogous';

    const balanceWords = ['balanced', 'stable', 'professional', 'corporate',
                         'equilibrado', 'estable', 'profesional', 'corporativo'];
    const hasBalance = tokens.some(t => balanceWords.includes(t));
    if (hasBalance) return 'triadic';

    // Default based on number of keywords
    const keywords = this.extractKeywords(tokens, tokens.map(t => this.stem(t, language)), language);
    if (keywords.length === 1) return 'monochromatic';
    if (keywords.length === 2) return 'complementary';
    if (keywords.length === 3) return 'triadic';

    return 'analogous'; // Default
  }

  /**
   * Detect overall mood from prompt
   * Now supports both English and Spanish
   */
  private static detectMood(
    tokens: string[],
    prompt: string,
    language: SupportedLanguage
  ): 'energetic' | 'calm' | 'professional' | 'playful' | 'elegant' | 'bold' | 'natural' | 'modern' {
    const moodScores = {
      energetic: 0,
      calm: 0,
      professional: 0,
      playful: 0,
      elegant: 0,
      bold: 0,
      natural: 0,
      modern: 0,
    };

    // Energetic indicators (English + Spanish)
    const energeticWords = ['energy', 'energetic', 'vibrant', 'dynamic', 'exciting', 'active', 'bright',
                           'energía', 'energético', 'vibrante', 'dinámico', 'emocionante', 'activo', 'brillante'];
    energeticWords.forEach(w => {
      if (tokens.includes(w)) moodScores.energetic += 2;
      if (prompt.includes(w)) moodScores.energetic += 1;
    });

    // Calm indicators (English + Spanish)
    const calmWords = ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'soothing', 'gentle',
                      'tranquilo', 'pacífico', 'sereno', 'relajado', 'calmante', 'gentil'];
    calmWords.forEach(w => {
      if (tokens.includes(w)) moodScores.calm += 2;
      if (prompt.includes(w)) moodScores.calm += 1;
    });

    // Professional indicators (English + Spanish)
    const professionalWords = ['professional', 'corporate', 'business', 'formal', 'serious', 'clean',
                              'profesional', 'corporativo', 'negocio', 'formal', 'serio', 'limpio'];
    professionalWords.forEach(w => {
      if (tokens.includes(w)) moodScores.professional += 2;
      if (prompt.includes(w)) moodScores.professional += 1;
    });

    // Playful indicators (English + Spanish)
    const playfulWords = ['playful', 'fun', 'cheerful', 'happy', 'joyful', 'whimsical', 'quirky',
                         'juguetón', 'divertido', 'alegre', 'feliz', 'gozoso', 'caprichoso'];
    playfulWords.forEach(w => {
      if (tokens.includes(w)) moodScores.playful += 2;
      if (prompt.includes(w)) moodScores.playful += 1;
    });

    // Elegant indicators (English + Spanish)
    const elegantWords = ['elegant', 'sophisticated', 'luxury', 'premium', 'refined', 'classy',
                         'elegante', 'sofisticado', 'lujo', 'premium', 'refinado', 'distinguido'];
    elegantWords.forEach(w => {
      if (tokens.includes(w)) moodScores.elegant += 2;
      if (prompt.includes(w)) moodScores.elegant += 1;
    });

    // Bold indicators (English + Spanish)
    const boldWords = ['bold', 'strong', 'powerful', 'dramatic', 'striking', 'intense',
                      'audaz', 'fuerte', 'poderoso', 'dramático', 'llamativo', 'intenso'];
    boldWords.forEach(w => {
      if (tokens.includes(w)) moodScores.bold += 2;
      if (prompt.includes(w)) moodScores.bold += 1;
    });

    // Natural indicators (English + Spanish)
    const naturalWords = ['natural', 'organic', 'earthy', 'nature', 'botanical', 'green', 'eco',
                         'natural', 'orgánico', 'terrenal', 'naturaleza', 'botánico', 'verde', 'ecológico'];
    naturalWords.forEach(w => {
      if (tokens.includes(w)) moodScores.natural += 2;
      if (prompt.includes(w)) moodScores.natural += 1;
    });

    // Modern indicators (English + Spanish)
    const modernWords = ['modern', 'contemporary', 'tech', 'digital', 'futuristic', 'minimalist',
                        'moderno', 'contemporáneo', 'tecnología', 'digital', 'futurista', 'minimalista'];
    modernWords.forEach(w => {
      if (tokens.includes(w)) moodScores.modern += 2;
      if (prompt.includes(w)) moodScores.modern += 1;
    });

    // Return mood with highest score
    const maxMood = Object.entries(moodScores).reduce((a, b) => (b[1] > a[1] ? b : a));
    return maxMood[0] as any;
  }

  /**
   * Extract contextual information
   * Now supports both English and Spanish
   */
  private static extractContext(tokens: string[], prompt: string, language: SupportedLanguage): string[] {
    const contexts: string[] = [];

    // Time-based contexts (English + Spanish)
    const timeWords = ['morning', 'noon', 'afternoon', 'evening', 'night', 'sunset', 'sunrise', 'dawn', 'dusk',
                      'mañana', 'mediodía', 'tarde', 'noche', 'atardecer', 'amanecer', 'alba', 'crepúsculo'];
    timeWords.forEach(w => {
      if (tokens.includes(w)) contexts.push(`time:${w}`);
    });

    // Season-based contexts (English + Spanish)
    const seasonWords = ['spring', 'summer', 'autumn', 'fall', 'winter',
                        'primavera', 'verano', 'otoño', 'invierno'];
    seasonWords.forEach(w => {
      if (tokens.includes(w)) contexts.push(`season:${w}`);
    });

    // Environment contexts (English + Spanish)
    const envWords = ['urban', 'rural', 'city', 'nature', 'ocean', 'mountain', 'desert', 'forest',
                     'urbano', 'rural', 'ciudad', 'naturaleza', 'océano', 'montaña', 'desierto', 'bosque'];
    envWords.forEach(w => {
      if (tokens.includes(w)) contexts.push(`environment:${w}`);
    });

    // Style contexts (English + Spanish)
    const styleWords = ['vintage', 'retro', 'modern', 'classic', 'minimalist', 'maximalist',
                       'vintage', 'retro', 'moderno', 'clásico', 'minimalista', 'maximalista'];
    styleWords.forEach(w => {
      if (tokens.includes(w)) contexts.push(`style:${w}`);
    });

    return contexts;
  }

  /**
   * Calculate similarity between two words
   */
  static calculateSimilarity(word1: string, word2: string): number {
    const stem1 = this.stem(word1.toLowerCase());
    const stem2 = this.stem(word2.toLowerCase());

    // Exact match
    if (stem1 === stem2) return 1;

    // Levenshtein distance
    const distance = this.levenshteinDistance(stem1, stem2);
    const maxLength = Math.max(stem1.length, stem2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Extract brand personality traits from prompt
   * Supports both English and Spanish
   */
  private static extractBrandPersonality(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string[] | undefined {
    const brandPersonalities: string[] = [];

    const personalityKeywords = {
      // Luxury & Premium
      luxury: ['luxury', 'premium', 'exclusive', 'elite', 'opulent', 'lavish', 'extravagant', 'prestigious', 'upscale', 'high-end',
              'lujo', 'premium', 'exclusivo', 'élite', 'opulento', 'lujoso', 'extravagante', 'prestigioso'],

      // Professional & Corporate
      professional: ['corporate', 'professional', 'executive', 'business', 'formal', 'serious', 'authoritative', 'competent', 'reliable', 'trustworthy', 'credible', 'established',
                    'corporativo', 'profesional', 'ejecutivo', 'negocio', 'formal', 'serio', 'autoritario', 'competente', 'confiable', 'establecido'],

      // Innovative & Creative
      innovative: ['innovative', 'creative', 'cutting-edge', 'pioneering', 'forward-thinking', 'visionary', 'revolutionary', 'disruptive', 'groundbreaking',
                  'innovador', 'creativo', 'vanguardia', 'pionero', 'visionario', 'revolucionario', 'disruptivo'],

      // Friendly & Approachable
      friendly: ['friendly', 'approachable', 'warm', 'welcoming', 'accessible', 'personable', 'relatable', 'down-to-earth', 'neighborly',
                'amigable', 'accesible', 'cálido', 'acogedor', 'cercano', 'personal'],

      // Bold & Energetic
      bold: ['bold', 'dynamic', 'energetic', 'vibrant', 'confident', 'daring', 'adventurous', 'fearless', 'spirited',
            'audaz', 'dinámico', 'energético', 'vibrante', 'confiado', 'atrevido', 'aventurero', 'intrépido'],

      // Calm & Soothing
      calm: ['calm', 'soothing', 'peaceful', 'tranquil', 'gentle', 'serene', 'relaxed', 'harmonious', 'balanced',
            'tranquilo', 'calmante', 'pacífico', 'gentil', 'sereno', 'relajado', 'armonioso', 'equilibrado'],

      // Playful & Fun
      playful: ['playful', 'fun', 'quirky', 'whimsical', 'lighthearted', 'cheerful', 'joyful', 'entertaining',
               'juguetón', 'divertido', 'caprichoso', 'alegre', 'entretenido'],

      // Sophisticated & Elegant
      elegant: ['sophisticated', 'elegant', 'refined', 'polished', 'graceful', 'classy', 'chic', 'stylish',
               'sofisticado', 'elegante', 'refinado', 'pulido', 'elegante', 'distinguido', 'estilizado'],
    };

    // Check each personality category
    Object.entries(personalityKeywords).forEach(([personality, keywords]) => {
      const hasMatch = tokens.some(token =>
        keywords.some(keyword => token.includes(keyword) || keyword.includes(token))
      );
      if (hasMatch && !brandPersonalities.includes(personality)) {
        brandPersonalities.push(personality);
      }
    });

    return brandPersonalities.length > 0 ? brandPersonalities : undefined;
  }

  /**
   * Extract use case from prompt
   * Supports both English and Spanish
   */
  private static extractUseCase(tokens: string[], stemmedTokens: string[], language: SupportedLanguage): string | undefined {
    const useCases = {
      // Digital Products
      'webapp': ['webapp', 'web app', 'web application', 'aplicación web'],
      'website': ['website', 'web', 'sitio web'],
      'dashboard': ['dashboard', 'panel', 'tablero'],
      'saas': ['saas', 'software as a service', 'software como servicio'],
      'ecommerce': ['ecommerce', 'e-commerce', 'online store', 'shop', 'tienda online', 'tienda'],
      'app': ['app', 'mobile app', 'aplicación móvil', 'aplicación'],
      'landing': ['landing page', 'landing', 'página de aterrizaje'],
      'portfolio': ['portfolio', 'portafolio'],
      'blog': ['blog', 'magazine', 'revista'],

      // Business Types
      'startup': ['startup', 'start-up', 'empresa emergente'],
      'corporate': ['corporate', 'enterprise', 'corporativo', 'empresa'],
      'agency': ['agency', 'agencia'],
      'freelance': ['freelance', 'freelancer', 'autónomo'],

      // Industries
      'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'salud', 'médico', 'hospital'],
      'finance': ['finance', 'banking', 'fintech', 'finanzas', 'banca'],
      'education': ['education', 'learning', 'school', 'university', 'educación', 'escuela', 'universidad'],
      'tech': ['tech', 'technology', 'software', 'tecnología'],
      'gaming': ['gaming', 'game', 'videogame', 'videojuego'],
      'fashion': ['fashion', 'clothing', 'apparel', 'moda', 'ropa'],
      'food': ['food', 'restaurant', 'cafe', 'comida', 'restaurante'],
      'travel': ['travel', 'tourism', 'viaje', 'turismo'],
      'fitness': ['fitness', 'gym', 'health', 'wellness', 'gimnasio', 'bienestar'],
      'real-estate': ['real estate', 'property', 'inmobiliaria', 'propiedad'],
    };

    // Find the first matching use case
    for (const [useCase, keywords] of Object.entries(useCases)) {
      const hasMatch = tokens.some(token =>
        keywords.some(keyword => {
          const keywordTokens = keyword.split(' ');
          if (keywordTokens.length === 1) {
            return token.includes(keyword) || keyword.includes(token);
          } else {
            // Multi-word phrase matching
            const tokenStr = tokens.join(' ');
            return tokenStr.includes(keyword);
          }
        })
      );

      if (hasMatch) {
        return useCase;
      }
    }

    return undefined;
  }
}
