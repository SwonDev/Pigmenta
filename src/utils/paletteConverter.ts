import type {
  ColorValue,
  ColorPalette,
  CustomPalette,
  CustomColor,
  PaletteMetadata,
} from '../types';
import { generateId } from './customColorUtils';

/**
 * Utilidades para conversión entre paletas automáticas y personalizadas
 */
export class PaletteConverter {
  /**
   * Convierte una paleta automática a paleta personalizada
   */
  static toCustomPalette(palette: ColorPalette): CustomPalette {
    const now = new Date().toISOString();
    const id = generateId();
    
    const customColors: CustomColor[] = palette.shades.map((shade, index) => ({
      id: generateId(),
      value: shade.color,
      position: index,
      name: shade.name,
      locked: false,
    }));

    const metadata: PaletteMetadata = {
      source: 'generated',
      version: '1.0.0',
      exportCount: 0,
    };

    return {
      id,
      name: palette.name,
      description: `Paleta generada con algoritmo ${palette.algorithm}`,
      colors: customColors,
      tags: [
        { id: generateId(), name: palette.algorithm, color: palette.baseColor.hex },
        { id: generateId(), name: 'generada', color: '#6366F1' },
      ],
      createdAt: now,
      updatedAt: now,
      colorCount: customColors.length,
      isActive: false,
      metadata,
    };
  }

  /**
   * Convierte una paleta personalizada a paleta automática
   */
  static toStandardPalette(customPalette: CustomPalette): ColorPalette {
    // Ordenar colores por posición
    const sortedColors = [...customPalette.colors].sort((a, b) => a.position - b.position);
    
    // Crear shades a partir de los colores personalizados
    const shades = sortedColors.map((color, index) => ({
      name: color.name || `shade-${index + 1}`,
      value: (index + 1) * 100, // Valores incrementales
      color: color.value,
      contrast: 1,
      isActive: false,
    }));

    // Usar el primer color como base o el color del medio si hay muchos
    const baseColorIndex = Math.floor(sortedColors.length / 2);
    const baseColor = sortedColors[baseColorIndex]?.value || sortedColors[0]?.value;

    return {
      name: customPalette.name,
      baseColor,
      shades,
      algorithm: 'custom', // Marcamos como personalizada
    };
  }

  /**
   * Combina una paleta personalizada con una automática
   */
  static mergeWithStandard(custom: CustomPalette, standard: ColorPalette): ColorPalette {
    const customAsStandard = this.toStandardPalette(custom);
    
    return {
      ...standard,
      name: `${custom.name} (merged)`,
      shades: [
        ...customAsStandard.shades,
        ...standard.shades,
      ],
    };
  }

  /**
   * Extrae el color base más representativo de una paleta personalizada
   */
  static extractBaseColor(palette: CustomPalette): ColorValue {
    if (palette.colors.length === 0) {
      // Color por defecto si no hay colores
      return {
        hex: '#1E96BE',
        rgb: { r: 30, g: 150, b: 190 },
        hsl: { h: 194, s: 73, l: 43 },
        oklch: { l: 0.43, c: 0.14, h: 194 }
      };
    }

    // Ordenar por posición y tomar el del medio
    const sortedColors = [...palette.colors].sort((a, b) => a.position - b.position);
    const middleIndex = Math.floor(sortedColors.length / 2);
    
    return sortedColors[middleIndex].value;
  }

  /**
   * Sugiere un algoritmo basado en los colores de la paleta
   */
  static suggestAlgorithm(palette: CustomPalette): string {
    if (palette.colors.length < 2) return 'monochromatic';
    
    const colors = palette.colors.map(c => c.value);
    
    // Analizar diferencias de matiz
    const hues = colors.map(c => c.hsl.h);
    const hueRange = Math.max(...hues) - Math.min(...hues);
    
    // Analizar diferencias de saturación
    const saturations = colors.map(c => c.hsl.s);
    const saturationRange = Math.max(...saturations) - Math.min(...saturations);
    
    // Analizar diferencias de luminosidad
    const lightnesses = colors.map(c => c.hsl.l);
    const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
    
    // Lógica de sugerencia
    if (hueRange < 30 && lightnessRange > 50) {
      return 'lightness';
    } else if (hueRange < 30 && saturationRange > 30) {
      return 'saturation';
    } else if (hueRange > 150) {
      return 'complementary';
    } else if (hueRange > 60) {
      return 'analogous';
    } else {
      return 'monochromatic';
    }
  }

  /**
   * Crea una paleta personalizada desde un array de colores
   */
  static fromColorArray(
    colors: ColorValue[],
    name: string,
    description?: string
  ): CustomPalette {
    const now = new Date().toISOString();
    const id = generateId();
    
    const customColors: CustomColor[] = colors.map((color, index) => ({
      id: generateId(),
      value: color,
      position: index,
      name: `Color ${index + 1}`,
      locked: false,
    }));

    const metadata: PaletteMetadata = {
      source: 'manual',
      version: '1.0.0',
      exportCount: 0,
    };

    return {
      id,
      name,
      description,
      colors: customColors,
      tags: [
        { id: generateId(), name: 'manual', color: '#10B981' },
      ],
      createdAt: now,
      updatedAt: now,
      colorCount: customColors.length,
      isActive: false,
      metadata,
    };
  }

  /**
   * Optimiza una paleta eliminando colores muy similares
   */
  static optimizePalette(palette: CustomPalette, threshold: number = 10): CustomPalette {
    const optimizedColors: CustomColor[] = [];
    
    for (const color of palette.colors) {
      const isSimilar = optimizedColors.some(existing => {
        const deltaE = this.calculateColorDistance(color.value, existing.value);
        return deltaE < threshold;
      });
      
      if (!isSimilar) {
        optimizedColors.push(color);
      }
    }

    return {
      ...palette,
      colors: optimizedColors.map((color, index) => ({
        ...color,
        position: index,
      })),
      colorCount: optimizedColors.length,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calcula la distancia entre dos colores (Delta E simplificado)
   */
  private static calculateColorDistance(color1: ColorValue, color2: ColorValue): number {
    const deltaR = color1.rgb.r - color2.rgb.r;
    const deltaG = color1.rgb.g - color2.rgb.g;
    const deltaB = color1.rgb.b - color2.rgb.b;
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
  }
}