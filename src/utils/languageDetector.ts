/**
 * Multi-Language Detection System
 * Automatically detects language (English/Spanish) and adapts processing
 */

export type SupportedLanguage = 'en' | 'es' | 'mixed';

export interface LanguageDetectionResult {
  primary: SupportedLanguage;
  confidence: number; // 0-1
  hasSpanish: boolean;
  hasEnglish: boolean;
  isMixed: boolean;
}

export class LanguageDetector {
  // Common Spanish words and characters
  private static readonly SPANISH_INDICATORS = [
    // Articles
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    // Prepositions
    'de', 'del', 'en', 'con', 'por', 'para', 'sin', 'sobre',
    // Pronouns
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos',
    // Common verbs
    'es', 'está', 'son', 'están', 'ser', 'estar', 'hay',
    // Common adjectives
    'muy', 'más', 'menos', 'mejor', 'peor', 'grande', 'pequeño',
    // Question words
    'qué', 'cómo', 'cuándo', 'dónde', 'quién', 'cuál',
  ];

  // Spanish-specific characters
  private static readonly SPANISH_CHARS = ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡'];

  // Common English words that don't exist in Spanish
  private static readonly ENGLISH_INDICATORS = [
    'the', 'is', 'are', 'and', 'or', 'but', 'with', 'from',
    'this', 'that', 'these', 'those', 'have', 'has', 'had',
    'will', 'would', 'should', 'could', 'what', 'when', 'where',
  ];

  /**
   * Detect the primary language of a text prompt
   */
  static detect(text: string): LanguageDetectionResult {
    const normalized = text.toLowerCase();
    const tokens = normalized.split(/\s+/);

    let spanishScore = 0;
    let englishScore = 0;

    // Check for Spanish-specific characters
    for (const char of this.SPANISH_CHARS) {
      if (normalized.includes(char)) {
        spanishScore += 3; // High weight for special characters
      }
    }

    // Check for Spanish indicator words
    tokens.forEach(token => {
      if (this.SPANISH_INDICATORS.includes(token)) {
        spanishScore += 2;
      }
    });

    // Check for English indicator words
    tokens.forEach(token => {
      if (this.ENGLISH_INDICATORS.includes(token)) {
        englishScore += 2;
      }
    });

    // Additional Spanish patterns
    if (normalized.match(/ción\b/g)) spanishScore += 1; // -ción ending
    if (normalized.match(/dad\b/g)) spanishScore += 1; // -dad ending
    if (normalized.match(/oso\b|osa\b/g)) spanishScore += 1; // -oso/-osa ending

    // Additional English patterns
    if (normalized.match(/ing\b/g)) englishScore += 1; // -ing ending
    if (normalized.match(/tion\b/g)) englishScore += 1; // -tion ending
    if (normalized.match(/ly\b/g)) englishScore += 1; // -ly ending

    const totalScore = spanishScore + englishScore;
    const hasSpanish = spanishScore > 0;
    const hasEnglish = englishScore > 0;
    const isMixed = hasSpanish && hasEnglish;

    let primary: SupportedLanguage;
    let confidence: number;

    if (totalScore === 0) {
      // No clear indicators, default to English
      primary = 'en';
      confidence = 0.5;
    } else if (isMixed) {
      // Mixed language
      if (spanishScore > englishScore * 1.5) {
        primary = 'es';
        confidence = spanishScore / totalScore;
      } else if (englishScore > spanishScore * 1.5) {
        primary = 'en';
        confidence = englishScore / totalScore;
      } else {
        primary = 'mixed';
        confidence = Math.min(spanishScore, englishScore) / totalScore;
      }
    } else {
      // Single language
      primary = spanishScore > englishScore ? 'es' : 'en';
      confidence = Math.max(spanishScore, englishScore) / totalScore;
    }

    return {
      primary,
      confidence: Math.min(confidence, 1),
      hasSpanish,
      hasEnglish,
      isMixed,
    };
  }

  /**
   * Get language-specific stop words
   */
  static getStopWords(language: SupportedLanguage): string[] {
    const spanishStopWords = [
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
      'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener',
      'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir',
      'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque',
      'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué',
      'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año',
      'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso',
      'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno',
      'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre',
      'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida',
    ];

    const englishStopWords = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
      'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all',
      'each', 'she', 'do', 'does', 'did', 'their', 'if', 'or', 'an', 'as',
      'been', 'being', 'can', 'could', 'should', 'would', 'may', 'might',
      'must', 'shall', 'will', 'am', 'some', 'any', 'no', 'not', 'my', 'your',
    ];

    if (language === 'es') {
      return spanishStopWords;
    } else if (language === 'en') {
      return englishStopWords;
    } else {
      // Mixed: combine both
      return [...new Set([...spanishStopWords, ...englishStopWords])];
    }
  }

  /**
   * Get language-specific stemming rules
   */
  static getStemRules(language: SupportedLanguage): { suffixes: string[]; minLength: number } {
    if (language === 'es') {
      return {
        suffixes: [
          'amiento', 'imiento', 'amente', 'mente',
          'ación', 'ición', 'ador', 'edor', 'idor',
          'ante', 'ente', 'ible', 'able', 'oso', 'osa',
          'ivo', 'iva', 'ado', 'ada', 'ido', 'ida',
          'ar', 'er', 'ir', 'ía', 'ías', 'ío', 'ían',
          'es', 'os', 'as', 'a', 'o', 's',
        ],
        minLength: 4,
      };
    } else {
      return {
        suffixes: [
          'ational', 'tional', 'enci', 'anci', 'izer', 'alli', 'entli',
          'eli', 'ousli', 'ization', 'ation', 'ator', 'alism', 'iveness',
          'fulness', 'ousness', 'aliti', 'iviti', 'biliti', 'logi',
          'ing', 'ed', 'er', 'est', 'ly', 'ness', 'ment', 'tion', 'sion',
          'ful', 'less', 'ous', 'ive', 'able', 'ible', 'al', 'ial', 'ic',
          's', 'es', 'ies',
        ],
        minLength: 3,
      };
    }
  }

  /**
   * Translate common color terms between languages
   */
  static translateColorTerm(term: string, fromLang: SupportedLanguage, toLang: SupportedLanguage): string {
    if (fromLang === toLang) return term;

    const translations: Record<string, Record<string, string>> = {
      // English to Spanish
      'en_to_es': {
        'red': 'rojo',
        'blue': 'azul',
        'green': 'verde',
        'yellow': 'amarillo',
        'orange': 'naranja',
        'purple': 'morado',
        'pink': 'rosa',
        'brown': 'marrón',
        'black': 'negro',
        'white': 'blanco',
        'gray': 'gris',
        'grey': 'gris',
        'gold': 'dorado',
        'silver': 'plateado',
        'ocean': 'océano',
        'sky': 'cielo',
        'sunset': 'atardecer',
        'forest': 'bosque',
        'fire': 'fuego',
        'water': 'agua',
        'earth': 'tierra',
        'nature': 'naturaleza',
        'vibrant': 'vibrante',
        'calm': 'tranquilo',
        'dark': 'oscuro',
        'light': 'claro',
        'bright': 'brillante',
        'soft': 'suave',
        'warm': 'cálido',
        'cool': 'fresco',
        'professional': 'profesional',
        'elegant': 'elegante',
        'modern': 'moderno',
        'classic': 'clásico',
      },
      // Spanish to English
      'es_to_en': {
        'rojo': 'red',
        'azul': 'blue',
        'verde': 'green',
        'amarillo': 'yellow',
        'naranja': 'orange',
        'morado': 'purple',
        'rosa': 'pink',
        'marrón': 'brown',
        'negro': 'black',
        'blanco': 'white',
        'gris': 'gray',
        'dorado': 'gold',
        'plateado': 'silver',
        'océano': 'ocean',
        'cielo': 'sky',
        'atardecer': 'sunset',
        'bosque': 'forest',
        'fuego': 'fire',
        'agua': 'water',
        'tierra': 'earth',
        'naturaleza': 'nature',
        'vibrante': 'vibrant',
        'tranquilo': 'calm',
        'oscuro': 'dark',
        'claro': 'light',
        'brillante': 'bright',
        'suave': 'soft',
        'cálido': 'warm',
        'fresco': 'cool',
        'profesional': 'professional',
        'elegante': 'elegant',
        'moderno': 'modern',
        'clásico': 'classic',
      },
    };

    const key = fromLang === 'en' ? 'en_to_es' : 'es_to_en';
    return translations[key][term.toLowerCase()] || term;
  }

  /**
   * Normalize text for language processing
   */
  static normalize(text: string, language: SupportedLanguage): string {
    let normalized = text.toLowerCase().trim();

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    // Language-specific normalization
    if (language === 'es') {
      // Normalize Spanish accents for search (optional)
      // Keep accents for display but normalize for matching
      normalized = normalized
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')
        .replace(/ñ/g, 'n');
    }

    return normalized;
  }

  /**
   * Get language-specific synonyms for a term
   */
  static getSynonyms(term: string, language: SupportedLanguage): string[] {
    const synonyms: Record<string, Record<string, string[]>> = {
      'en': {
        'happy': ['joyful', 'cheerful', 'glad', 'pleased'],
        'sad': ['unhappy', 'sorrowful', 'melancholy', 'blue'],
        'angry': ['mad', 'furious', 'enraged', 'irate'],
        'calm': ['peaceful', 'serene', 'tranquil', 'quiet'],
        'vibrant': ['vivid', 'bright', 'colorful', 'brilliant'],
        'elegant': ['refined', 'sophisticated', 'classy', 'stylish'],
        'modern': ['contemporary', 'current', 'up-to-date', 'new'],
        'professional': ['business', 'corporate', 'formal', 'serious'],
      },
      'es': {
        'feliz': ['alegre', 'contento', 'gozoso', 'jubiloso'],
        'triste': ['melancólico', 'apesadumbrado', 'afligido'],
        'enojado': ['enfadado', 'furioso', 'airado', 'molesto'],
        'tranquilo': ['calmado', 'sereno', 'pacífico', 'sosegado'],
        'vibrante': ['vívido', 'brillante', 'colorido', 'intenso'],
        'elegante': ['refinado', 'sofisticado', 'distinguido', 'estilizado'],
        'moderno': ['contemporáneo', 'actual', 'nuevo', 'reciente'],
        'profesional': ['ejecutivo', 'corporativo', 'formal', 'serio'],
      },
    };

    const langSynonyms = synonyms[language] || {};
    return langSynonyms[term.toLowerCase()] || [];
  }
}
