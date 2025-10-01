import type {
  CustomPalette,
  CustomColor,
  ColorValue,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types';
import { CustomColorUtils } from './customColorUtils';

/**
 * Validador completo para paletas personalizadas
 */
export class PaletteValidator {
  private static readonly MIN_NAME_LENGTH = 1;
  private static readonly MAX_NAME_LENGTH = 50;
  private static readonly MIN_COLORS = 2;
  private static readonly MAX_COLORS = 50;
  private static readonly MIN_CONTRAST_WARNING = 3;
  private static readonly SIMILAR_COLOR_THRESHOLD = 15;

  /**
   * Valida el nombre de una paleta
   */
  static validateName(name: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar longitud
    if (!name || name.trim().length < this.MIN_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: 'El nombre es requerido',
        code: 'NAME_REQUIRED'
      });
    } else if (name.trim().length > this.MAX_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: `El nombre no puede exceder ${this.MAX_NAME_LENGTH} caracteres`,
        code: 'NAME_TOO_LONG'
      });
    }

    // Verificar caracteres especiales problemáticos
    if (name && /[<>:"/\\|?*]/.test(name)) {
      errors.push({
        field: 'name',
        message: 'El nombre contiene caracteres no permitidos',
        code: 'NAME_INVALID_CHARS'
      });
    }

    // Advertencias
    if (name && name.trim() !== name) {
      warnings.push({
        field: 'name',
        message: 'El nombre tiene espacios al inicio o final',
        code: 'NAME_WHITESPACE'
      });
    }

    if (name && /^\d+$/.test(name.trim())) {
      warnings.push({
        field: 'name',
        message: 'Se recomienda usar un nombre más descriptivo',
        code: 'NAME_ONLY_NUMBERS'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida un array de colores
   */
  static validateColors(colors: CustomColor[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar cantidad de colores
    if (colors.length < this.MIN_COLORS) {
      errors.push({
        field: 'colors',
        message: `Se requieren al menos ${this.MIN_COLORS} colores`,
        code: 'COLORS_TOO_FEW'
      });
    }

    if (colors.length > this.MAX_COLORS) {
      errors.push({
        field: 'colors',
        message: `No se pueden tener más de ${this.MAX_COLORS} colores`,
        code: 'COLORS_TOO_MANY'
      });
    }

    // Validar cada color individualmente
    colors.forEach((color, index) => {
      const colorValidation = this.validateColorValue(color.value);
      if (!colorValidation.isValid) {
        errors.push({
          field: `colors[${index}]`,
          message: `Color ${index + 1}: ${colorValidation.errors[0]?.message || 'Inválido'}`,
          code: 'COLOR_INVALID'
        });
      }

      // Validar nombre del color
      if (color.name && color.name.length > 30) {
        warnings.push({
          field: `colors[${index}]`,
          message: `Color ${index + 1}: Nombre muy largo`,
          code: 'COLOR_NAME_LONG'
        });
      }
    });

    // Verificar colores duplicados
    const duplicates = this.findDuplicateColors(colors);
    if (duplicates.length > 0) {
      warnings.push({
        field: 'colors',
        message: `Se encontraron ${duplicates.length} colores muy similares`,
        code: 'COLORS_SIMILAR'
      });
    }

    // Verificar contraste
    const lowContrastPairs = this.findLowContrastPairs(colors);
    if (lowContrastPairs.length > 0) {
      warnings.push({
        field: 'colors',
        message: `${lowContrastPairs.length} pares de colores tienen bajo contraste`,
        code: 'COLORS_LOW_CONTRAST'
      });
    }

    // Verificar posiciones
    const positionErrors = this.validatePositions(colors);
    errors.push(...positionErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida una paleta completa
   */
  static validatePalette(palette: CustomPalette): ValidationResult {
    const nameValidation = this.validateName(palette.name);
    const colorsValidation = this.validateColors(palette.colors);
    
    const allErrors = [...nameValidation.errors, ...colorsValidation.errors];
    const allWarnings = [...nameValidation.warnings, ...colorsValidation.warnings];

    // Validaciones adicionales de la paleta
    if (palette.description && palette.description.length > 200) {
      allWarnings.push({
        field: 'description',
        message: 'La descripción es muy larga',
        code: 'DESCRIPTION_LONG'
      });
    }

    if (palette.tags && palette.tags.length > 10) {
      allWarnings.push({
        field: 'tags',
        message: 'Demasiadas etiquetas',
        code: 'TOO_MANY_TAGS'
      });
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Valida un valor de color individual
   */
  static validateColorValue(color: ColorValue): ValidationResult {
    const errors: ValidationError[] = [];

    if (!CustomColorUtils.validateColor(color)) {
      errors.push({
        field: 'color',
        message: 'Formato de color inválido',
        code: 'COLOR_FORMAT_INVALID'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Encuentra colores duplicados o muy similares
   */
  private static findDuplicateColors(colors: CustomColor[]): Array<{ index1: number; index2: number }> {
    const duplicates: Array<{ index1: number; index2: number }> = [];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const distance = this.calculateColorDistance(colors[i].value, colors[j].value);
        if (distance < this.SIMILAR_COLOR_THRESHOLD) {
          duplicates.push({ index1: i, index2: j });
        }
      }
    }

    return duplicates;
  }

  /**
   * Encuentra pares de colores con bajo contraste
   */
  private static findLowContrastPairs(colors: CustomColor[]): Array<{ index1: number; index2: number }> {
    const lowContrastPairs: Array<{ index1: number; index2: number }> = [];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrast = CustomColorUtils.calculateContrast(colors[i].value, colors[j].value);
        if (contrast < this.MIN_CONTRAST_WARNING) {
          lowContrastPairs.push({ index1: i, index2: j });
        }
      }
    }

    return lowContrastPairs;
  }

  /**
   * Valida las posiciones de los colores
   */
  private static validatePositions(colors: CustomColor[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const positions = colors.map(c => c.position);
    const uniquePositions = new Set(positions);

    // Verificar posiciones duplicadas
    if (uniquePositions.size !== positions.length) {
      errors.push({
        field: 'colors',
        message: 'Posiciones de colores duplicadas',
        code: 'POSITIONS_DUPLICATE'
      });
    }

    // Verificar posiciones negativas
    if (positions.some(p => p < 0)) {
      errors.push({
        field: 'colors',
        message: 'Las posiciones no pueden ser negativas',
        code: 'POSITIONS_NEGATIVE'
      });
    }

    return errors;
  }

  /**
   * Calcula la distancia entre dos colores
   */
  private static calculateColorDistance(color1: ColorValue, color2: ColorValue): number {
    const deltaR = color1.rgb.r - color2.rgb.r;
    const deltaG = color1.rgb.g - color2.rgb.g;
    const deltaB = color1.rgb.b - color2.rgb.b;
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
  }

  /**
   * Valida un nombre de paleta contra una lista existente
   */
  static validateUniqueNameInList(name: string, existingPalettes: CustomPalette[], excludeId?: string): ValidationResult {
    const baseValidation = this.validateName(name);
    
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const trimmedName = name.trim().toLowerCase();
    const isDuplicate = existingPalettes.some(palette => 
      palette.id !== excludeId && 
      palette.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      return {
        isValid: false,
        errors: [{
          field: 'name',
          message: 'Ya existe una paleta con este nombre',
          code: 'NAME_DUPLICATE'
        }],
        warnings: baseValidation.warnings
      };
    }

    return baseValidation;
  }

  /**
   * Sugiere correcciones para errores comunes
   */
  static suggestFixes(validationResult: ValidationResult): string[] {
    const suggestions: string[] = [];

    validationResult.errors.forEach(error => {
      switch (error.code) {
        case 'NAME_REQUIRED':
          suggestions.push('Ingresa un nombre para la paleta');
          break;
        case 'NAME_TOO_LONG':
          suggestions.push('Acorta el nombre de la paleta');
          break;
        case 'COLORS_TOO_FEW':
          suggestions.push('Agrega más colores a la paleta');
          break;
        case 'COLORS_TOO_MANY':
          suggestions.push('Elimina algunos colores de la paleta');
          break;
        case 'NAME_DUPLICATE':
          suggestions.push('Elige un nombre diferente para la paleta');
          break;
        default:
          suggestions.push('Revisa y corrige los errores indicados');
      }
    });

    return [...new Set(suggestions)]; // Eliminar duplicados
  }
}