import type { ColorValue } from '../types';

/**
 * Convierte HSL a RGB
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Convierte RGB a HSL
 */
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

/**
 * Convierte RGB a HEX
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Normaliza el ángulo de matiz entre 0-360
 */
export const normalizeHue = (hue: number): number => {
  while (hue < 0) hue += 360;
  while (hue >= 360) hue -= 360;
  return hue;
};

/**
 * Crea un ColorValue a partir de HSL
 */
export const createColorFromHsl = (h: number, s: number, l: number): ColorValue => {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  return {
    hex,
    rgb,
    hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
    oklch: { l: l / 100, c: s / 100, h: h } // Aproximación simple para oklch
  };
};

/**
 * Genera colores complementarios (opuestos en el círculo cromático)
 */
export const getComplementaryColors = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  const complementaryHue = normalizeHue(h + 180);
  
  return [
    createColorFromHsl(complementaryHue, s, l),
    createColorFromHsl(complementaryHue, Math.max(20, s - 20), l),
    createColorFromHsl(complementaryHue, Math.min(100, s + 20), l)
  ];
};

/**
 * Genera colores análogos (adyacentes en el círculo cromático)
 */
export const getAnalogousColors = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  
  return [
    createColorFromHsl(normalizeHue(h - 30), s, l),
    createColorFromHsl(normalizeHue(h - 15), s, l),
    createColorFromHsl(normalizeHue(h + 15), s, l),
    createColorFromHsl(normalizeHue(h + 30), s, l)
  ];
};

/**
 * Genera colores triádicos (separados por 120°)
 */
export const getTriadicColors = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  
  return [
    createColorFromHsl(normalizeHue(h + 120), s, l),
    createColorFromHsl(normalizeHue(h + 240), s, l)
  ];
};

/**
 * Genera colores tetrádicos (separados por 90°)
 */
export const getTetradicColors = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  
  return [
    createColorFromHsl(normalizeHue(h + 90), s, l),
    createColorFromHsl(normalizeHue(h + 180), s, l),
    createColorFromHsl(normalizeHue(h + 270), s, l)
  ];
};

/**
 * Genera variaciones de saturación
 */
export const getSaturationVariations = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  
  return [
    createColorFromHsl(h, Math.max(10, s - 40), l),
    createColorFromHsl(h, Math.max(10, s - 20), l),
    createColorFromHsl(h, Math.min(100, s + 20), l),
    createColorFromHsl(h, Math.min(100, s + 40), l)
  ];
};

/**
 * Genera variaciones de luminosidad
 */
export const getLightnessVariations = (baseColor: ColorValue): ColorValue[] => {
  const { h, s, l } = baseColor.hsl;
  
  return [
    createColorFromHsl(h, s, Math.max(10, l - 30)),
    createColorFromHsl(h, s, Math.max(10, l - 15)),
    createColorFromHsl(h, s, Math.min(90, l + 15)),
    createColorFromHsl(h, s, Math.min(90, l + 30))
  ];
};

/**
 * Genera una paleta completa de abanico basada en teoría del color
 */
export const generateFanPalette = (baseColor: ColorValue): ColorValue[] => {
  const colors: ColorValue[] = [];
  
  // Color base
  colors.push(baseColor);
  
  // Colores complementarios
  colors.push(...getComplementaryColors(baseColor));
  
  // Colores análogos
  colors.push(...getAnalogousColors(baseColor));
  
  // Colores triádicos
  colors.push(...getTriadicColors(baseColor));
  
  // Variaciones de saturación del color base
  colors.push(...getSaturationVariations(baseColor));
  
  // Variaciones de luminosidad del color base
  colors.push(...getLightnessVariations(baseColor));
  
  // Eliminar duplicados basados en hex
  const uniqueColors = colors.filter((color, index, self) => 
    index === self.findIndex(c => c.hex === color.hex)
  );
  
  return uniqueColors.slice(0, 16); // Limitar a 16 colores para el abanico
};

/**
 * Calcula la posición en el abanico para un color dado
 */
export const getFanPosition = (index: number, total: number, radius: number = 120): { x: number; y: number; angle: number } => {
  // Distribuir los colores en un semicírculo (180 grados)
  const angle = (index / (total - 1)) * 180 - 90; // De -90 a +90 grados
  const radian = (angle * Math.PI) / 180;
  
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
    angle
  };
};