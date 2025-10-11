/**
 * Advanced Matching System for Enhanced Color Detection
 * Implements fuzzy matching, synonym expansion, and weighted scoring
 */

import { SupportedLanguage } from './languageDetector';
import { ColorMapping } from '../data/colorKnowledge';

export interface MatchResult {
  keyword: string;
  score: number; // 0-1, where 1 is perfect match
  matchType: 'exact' | 'fuzzy' | 'synonym' | 'stemmed' | 'compound';
  originalTerm: string;
}

export class AdvancedMatcher {
  /**
   * Fuzzy match using Jaro-Winkler distance
   * More sophisticated than Levenshtein for short strings
   */
  static jaroWinklerDistance(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    const len1 = s1.length;
    const len2 = s2.length;

    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, len2);

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    // Find transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

    // Winkler modification
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }

    return jaro + prefix * 0.1 * (1 - jaro);
  }

  /**
   * Find best fuzzy matches for a term
   */
  static findFuzzyMatches(
    term: string,
    candidates: string[],
    threshold: number = 0.75
  ): MatchResult[] {
    const results: MatchResult[] = [];

    candidates.forEach(candidate => {
      const score = this.jaroWinklerDistance(term, candidate);
      if (score >= threshold) {
        results.push({
          keyword: candidate,
          score,
          matchType: score === 1.0 ? 'exact' : 'fuzzy',
          originalTerm: term,
        });
      }
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Enhanced synonym system with context awareness
   */
  static getSynonyms(term: string, language: SupportedLanguage): string[] {
    const synonymMap: Record<string, Record<string, string[]>> = {
      en: {
        // Colors
        'red': ['crimson', 'scarlet', 'ruby', 'burgundy', 'maroon', 'vermillion'],
        'blue': ['azure', 'navy', 'cobalt', 'sapphire', 'cerulean', 'indigo'],
        'green': ['emerald', 'jade', 'lime', 'olive', 'mint', 'forest'],
        'yellow': ['gold', 'amber', 'lemon', 'canary', 'mustard', 'saffron'],
        'orange': ['tangerine', 'coral', 'peach', 'apricot', 'amber'],
        'purple': ['violet', 'lavender', 'plum', 'mauve', 'orchid', 'amethyst'],
        'pink': ['rose', 'fuchsia', 'magenta', 'blush', 'salmon'],
        'brown': ['tan', 'beige', 'chocolate', 'coffee', 'mocha', 'sepia'],
        'gray': ['grey', 'silver', 'charcoal', 'slate', 'ash', 'pewter'],
        'black': ['ebony', 'jet', 'onyx', 'coal', 'charcoal'],
        'white': ['ivory', 'cream', 'pearl', 'snow', 'alabaster'],

        // Emotions
        'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'glad'],
        'sad': ['melancholy', 'sorrowful', 'gloomy', 'depressed', 'blue'],
        'calm': ['peaceful', 'serene', 'tranquil', 'relaxed', 'quiet'],
        'energetic': ['dynamic', 'vibrant', 'lively', 'active', 'spirited'],
        'elegant': ['sophisticated', 'refined', 'graceful', 'classy', 'stylish'],
        'bold': ['daring', 'confident', 'striking', 'powerful', 'strong'],

        // Nature
        'ocean': ['sea', 'marine', 'aquatic', 'nautical', 'coastal'],
        'forest': ['woods', 'woodland', 'jungle', 'wilderness'],
        'sky': ['heaven', 'celestial', 'aerial', 'atmosphere'],
        'sunset': ['dusk', 'twilight', 'evening', 'sundown'],
        'sunrise': ['dawn', 'daybreak', 'morning', 'sunup'],

        // Abstract
        'modern': ['contemporary', 'current', 'up-to-date', 'new', 'recent'],
        'vintage': ['retro', 'classic', 'antique', 'old-fashioned'],
        'luxury': ['premium', 'exclusive', 'high-end', 'upscale', 'deluxe'],
        'professional': ['business', 'corporate', 'formal', 'official'],
      },
      es: {
        // Colores
        'rojo': ['carmesí', 'escarlata', 'rubí', 'burdeos', 'granate', 'bermellón'],
        'azul': ['celeste', 'marino', 'cobalto', 'zafiro', 'cerúleo', 'índigo'],
        'verde': ['esmeralda', 'jade', 'lima', 'oliva', 'menta', 'bosque'],
        'amarillo': ['dorado', 'ámbar', 'limón', 'canario', 'mostaza', 'azafrán'],
        'naranja': ['mandarina', 'coral', 'durazno', 'albaricoque', 'ámbar'],
        'morado': ['violeta', 'lavanda', 'ciruela', 'malva', 'orquídea', 'amatista'],
        'rosa': ['rosado', 'fucsia', 'magenta', 'rubor', 'salmón'],
        'marrón': ['café', 'beige', 'chocolate', 'moka', 'sepia'],
        'gris': ['plata', 'carbón', 'pizarra', 'ceniza', 'peltre'],
        'negro': ['ébano', 'azabache', 'ónix', 'carbón'],
        'blanco': ['marfil', 'crema', 'perla', 'nieve', 'alabastro'],

        // Emociones
        'feliz': ['alegre', 'contento', 'gozoso', 'satisfecho'],
        'triste': ['melancólico', 'afligido', 'sombrío', 'deprimido'],
        'tranquilo': ['calmado', 'sereno', 'pacífico', 'relajado'],
        'energético': ['dinámico', 'vibrante', 'animado', 'activo'],
        'elegante': ['sofisticado', 'refinado', 'gracioso', 'distinguido'],
        'audaz': ['atrevido', 'confiado', 'llamativo', 'poderoso'],

        // Naturaleza
        'océano': ['mar', 'marino', 'acuático', 'náutico', 'costero'],
        'bosque': ['selva', 'floresta', 'arboleda'],
        'cielo': ['celestial', 'aéreo', 'atmósfera'],
        'atardecer': ['crepúsculo', 'ocaso', 'puesta de sol'],
        'amanecer': ['alba', 'madrugada', 'aurora'],

        // Abstracto
        'moderno': ['contemporáneo', 'actual', 'nuevo', 'reciente'],
        'vintage': ['retro', 'clásico', 'antiguo'],
        'lujo': ['premium', 'exclusivo', 'lujoso', 'deluxe'],
        'profesional': ['negocio', 'corporativo', 'formal', 'oficial'],
      },
    };

    const langSynonyms = synonymMap[language] || {};
    const normalized = term.toLowerCase();

    // Direct lookup
    if (langSynonyms[normalized]) {
      return langSynonyms[normalized];
    }

    // Reverse lookup (if term is a synonym, find the main term)
    for (const [mainTerm, synonyms] of Object.entries(langSynonyms)) {
      if (synonyms.includes(normalized)) {
        return [mainTerm, ...synonyms.filter(s => s !== normalized)];
      }
    }

    return [];
  }

  /**
   * Detect compound concepts (multi-word combinations)
   */
  static detectCompoundConcepts(tokens: string[]): string[] {
    const compounds: string[] = [];
    const text = tokens.join(' ');

    // English compounds
    const englishCompounds = [
      'ocean blue', 'sky blue', 'forest green', 'sunset orange', 'sunrise yellow',
      'midnight blue', 'ocean waves', 'mountain peaks', 'autumn leaves', 'spring flowers',
      'corporate professional', 'tech startup', 'luxury brand', 'modern minimalist',
      'vintage retro', 'bold energetic', 'calm peaceful', 'warm cozy', 'cool fresh',
      'dark mode', 'light theme', 'pastel colors', 'vibrant tones', 'muted palette',
      'earth tones', 'neon colors', 'metallic shades', 'natural organic',
    ];

    // Spanish compounds
    const spanishCompounds = [
      'azul océano', 'azul cielo', 'verde bosque', 'naranja atardecer', 'amarillo amanecer',
      'azul medianoche', 'olas del océano', 'picos montañosos', 'hojas otoñales', 'flores primaverales',
      'profesional corporativo', 'startup tecnológica', 'marca de lujo', 'minimalista moderno',
      'retro vintage', 'audaz energético', 'tranquilo pacífico', 'cálido acogedor', 'fresco refrescante',
      'modo oscuro', 'tema claro', 'colores pastel', 'tonos vibrantes', 'paleta apagada',
      'tonos tierra', 'colores neón', 'tonos metálicos', 'natural orgánico',
    ];

    const allCompounds = [...englishCompounds, ...spanishCompounds];

    allCompounds.forEach(compound => {
      if (text.includes(compound)) {
        compounds.push(compound);
      }
    });

    return compounds;
  }

  /**
   * Calculate weighted score based on multiple factors
   */
  static calculateWeightedScore(
    matchType: MatchResult['matchType'],
    similarity: number,
    contextRelevance: number = 0.5,
    frequency: number = 1
  ): number {
    const typeWeights = {
      exact: 1.0,
      compound: 0.95,
      synonym: 0.85,
      fuzzy: 0.7,
      stemmed: 0.6,
    };

    const baseWeight = typeWeights[matchType] || 0.5;
    const similarityWeight = similarity * 0.4;
    const contextWeight = contextRelevance * 0.3;
    const frequencyWeight = Math.min(frequency / 3, 0.3); // Cap at 0.3

    return baseWeight * 0.4 + similarityWeight + contextWeight + frequencyWeight;
  }

  /**
   * Enhanced keyword expansion with all techniques
   */
  static expandKeyword(
    keyword: string,
    allKeywords: string[],
    language: SupportedLanguage
  ): MatchResult[] {
    const results: MatchResult[] = [];
    const normalized = keyword.toLowerCase().trim();

    // 1. Exact match
    if (allKeywords.includes(normalized)) {
      results.push({
        keyword: normalized,
        score: 1.0,
        matchType: 'exact',
        originalTerm: keyword,
      });
    }

    // 2. Synonym expansion
    const synonyms = this.getSynonyms(normalized, language);
    synonyms.forEach(syn => {
      if (allKeywords.includes(syn)) {
        results.push({
          keyword: syn,
          score: 0.9,
          matchType: 'synonym',
          originalTerm: keyword,
        });
      }
    });

    // 3. Fuzzy matching (only if no exact or synonym match)
    if (results.length === 0) {
      const fuzzyMatches = this.findFuzzyMatches(normalized, allKeywords, 0.8);
      results.push(...fuzzyMatches.slice(0, 3)); // Top 3 fuzzy matches
    }

    return results;
  }
}
