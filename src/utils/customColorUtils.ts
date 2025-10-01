import type { CustomColor, ColorValue } from '../types';

/**
 * Convierte un string hex a un objeto ColorValue completo
 */
function hexToColorValue(hex: string): ColorValue {
  // Asegurar que el hex tenga el formato correcto
  const cleanHex = hex.replace('#', '');
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  // Convertir a RGB
  const r = parseInt(fullHex.substr(0, 2), 16);
  const g = parseInt(fullHex.substr(2, 2), 16);
  const b = parseInt(fullHex.substr(4, 2), 16);
  
  // Convertir RGB a HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / diff + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / diff + 4) / 6;
        break;
    }
  }
  
  // Convertir a OKLCH (aproximación simple)
  const oklchL = l;
  const oklchC = s * l * (1 - l);
  const oklchH = h * 360;
  
  return {
    hex: `#${fullHex.toUpperCase()}`,
    rgb: { r, g, b },
    hsl: { 
      h: Math.round(h * 360), 
      s: Math.round(s * 100), 
      l: Math.round(l * 100) 
    },
    oklch: { 
      l: Math.round(oklchL * 100) / 100, 
      c: Math.round(oklchC * 100) / 100, 
      h: Math.round(oklchH) 
    }
  };
}

/**
 * Utilidades para manejo de colores personalizados
 */
export class CustomColorUtils {
  /**
   * Genera un ID único para colores
   */
  static generateColorId(): string {
    return generateId();
  }

  /**
   * Convierte un string hex a ColorValue
   */
  static hexToColorValue(hex: string): ColorValue {
    return hexToColorValue(hex);
  }

  /**
   * Crea un nuevo color personalizado
   */
  static createCustomColor(
    value: ColorValue | string,
    position: number,
    name?: string
  ): CustomColor {
    // Si es un string, convertirlo a ColorValue
    const colorValue = typeof value === 'string' ? this.hexToColorValue(value) : value;
    
    return {
      id: this.generateColorId(),
      value: colorValue,
      position,
      name: name || this.generateColorName(colorValue),
      locked: false,
    };
  }

  /**
   * Ordena colores por posición
   */
  static sortColorsByPosition(colors: CustomColor[]): CustomColor[] {
    return [...colors].sort((a, b) => a.position - b.position);
  }

  /**
   * Reordena colores moviendo uno de una posición a otra
   */
  static reorderColors(
    colors: CustomColor[],
    fromIndex: number,
    toIndex: number
  ): CustomColor[] {
    const result = [...colors];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);

    // Actualizar posiciones
    return result.map((color, index) => ({
      ...color,
      position: index,
    }));
  }

  /**
   * Actualiza las posiciones de todos los colores secuencialmente
   */
  static updatePositions(colors: CustomColor[]): CustomColor[] {
    return colors.map((color, index) => ({
      ...color,
      position: index,
    }));
  }

  /**
   * Encuentra un color por ID
   */
  static findColorById(colors: CustomColor[], id: string): CustomColor | undefined {
    return colors.find(color => color.id === id);
  }

  /**
   * Elimina un color por ID
   */
  static removeColorById(colors: CustomColor[], id: string): CustomColor[] {
    const filtered = colors.filter(color => color.id !== id);
    return this.updatePositions(filtered);
  }

  /**
   * Actualiza un color específico
   */
  static updateColor(
    colors: CustomColor[],
    id: string,
    updates: Partial<CustomColor>
  ): CustomColor[] {
    return colors.map(color =>
      color.id === id ? { ...color, ...updates } : color
    );
  }

  /**
   * Inserta un color en una posición específica
   */
  static insertColorAtPosition(
    colors: CustomColor[],
    newColor: CustomColor,
    position: number
  ): CustomColor[] {
    const result = [...colors];
    result.splice(position, 0, newColor);
    return this.updatePositions(result);
  }

  /**
   * Genera un nombre automático para un color basado en su valor
   */
  static generateColorName(color: ColorValue): string {
    // Validar que el color tenga la estructura correcta
    if (!color || !color.hsl || typeof color.hsl.h !== 'number' || typeof color.hsl.s !== 'number' || typeof color.hsl.l !== 'number') {
      console.warn('Color inválido para generateColorName:', color);
      return 'Color';
    }

    const { h, s, l } = color.hsl;
    
    // Determinar el nombre base del color por matiz
    let baseName = 'Gray';
    
    if (s > 10) { // Solo si tiene saturación significativa
      if (h >= 0 && h < 15) baseName = 'Red';
      else if (h >= 15 && h < 45) baseName = 'Orange';
      else if (h >= 45 && h < 75) baseName = 'Yellow';
      else if (h >= 75 && h < 150) baseName = 'Green';
      else if (h >= 150 && h < 210) baseName = 'Cyan';
      else if (h >= 210 && h < 270) baseName = 'Blue';
      else if (h >= 270 && h < 330) baseName = 'Purple';
      else if (h >= 330) baseName = 'Pink';
    }
    
    // Determinar el modificador por luminosidad
    let modifier = '';
    if (l < 20) modifier = 'Very Dark ';
    else if (l < 40) modifier = 'Dark ';
    else if (l > 80) modifier = 'Light ';
    else if (l > 90) modifier = 'Very Light ';
    
    return `${modifier}${baseName}`.trim();
  }

  /**
   * Valida si un color es válido
   */
  static validateColor(color: ColorValue): boolean {
    const { rgb, hsl, oklch } = color;
    
    // Validar RGB
    if (rgb.r < 0 || rgb.r > 255 || rgb.g < 0 || rgb.g > 255 || rgb.b < 0 || rgb.b > 255) {
      return false;
    }
    
    // Validar HSL
    if (hsl.h < 0 || hsl.h > 360 || hsl.s < 0 || hsl.s > 100 || hsl.l < 0 || hsl.l > 100) {
      return false;
    }
    
    // Validar OKLCH
    if (oklch.l < 0 || oklch.l > 1 || oklch.c < 0 || oklch.h < 0 || oklch.h > 360) {
      return false;
    }
    
    // Validar HEX
    if (!/^#[0-9A-Fa-f]{6}$/.test(color.hex)) {
      return false;
    }
    
    return true;
  }

  /**
   * Calcula el contraste entre dos colores
   */
  static calculateContrast(color1: ColorValue, color2: ColorValue): number {
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1.rgb);
    const lum2 = getLuminance(color2.rgb);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Encuentra el mejor color de texto (blanco o negro) para un fondo
   */
  static getBestTextColor(backgroundColor: ColorValue): ColorValue {
    const whiteColor: ColorValue = {
      hex: '#FFFFFF',
      rgb: { r: 255, g: 255, b: 255 },
      hsl: { h: 0, s: 0, l: 100 },
      oklch: { l: 1, c: 0, h: 0 }
    };

    const blackColor: ColorValue = {
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      oklch: { l: 0, c: 0, h: 0 }
    };

    const whiteContrast = this.calculateContrast(backgroundColor, whiteColor);
    const blackContrast = this.calculateContrast(backgroundColor, blackColor);

    return whiteContrast > blackContrast ? whiteColor : blackColor;
  }

  /**
   * Duplica un color con un nuevo ID
   */
  static duplicateColor(color: CustomColor, newPosition: number): CustomColor {
    return {
      ...color,
      id: this.generateColorId(),
      position: newPosition,
      name: `${color.name} (copy)`,
    };
  }

  /**
   * Convierte un array de colores a formato de exportación
   */
  static toExportFormat(colors: CustomColor[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    
    colors.forEach((color, index) => {
      const key = color.name || `color-${index + 1}`;
      result[key] = color.value.hex;
    });
    
    return result;
  }
}

/**
 * Genera un ID único usando timestamp y random
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}