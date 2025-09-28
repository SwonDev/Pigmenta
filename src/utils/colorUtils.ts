import chroma from 'chroma-js';
import { rgb, oklch } from 'culori';
import type {
  ColorValue,
  ColorShade,
  ColorPalette,
  ColorAlgorithm,
  ColorFormat,
  NamingPattern
} from '../types';

/**
 * Validate if a string is a valid color format
 */
const isValidColorFormat = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  // Check for hex format
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(input)) return true;
  
  // Check for rgb format
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(input)) return true;
  
  // Check for rgba format
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/.test(input)) return true;
  
  // Check for hsl format
  if (/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(input)) return true;
  
  // Check for named colors (basic validation)
  const namedColors = ['red', 'green', 'blue', 'black', 'white', 'yellow', 'cyan', 'magenta'];
  if (namedColors.includes(input.toLowerCase())) return true;
  
  return false;
};

/**
 * Parse color input from various formats
 */
export const parseColorInput = (input: string): ColorValue | null => {
  try {
    // Validate input format first
    if (!isValidColorFormat(input)) {
      console.warn('Invalid color format:', input);
      return null;
    }
    
    const chromaColor = chroma(input);
    
    // Validate that chroma successfully parsed the color
    if (!chromaColor || !chromaColor.hex) {
      console.warn('Chroma failed to parse color:', input);
      return null;
    }
    
    const [r, g, b] = chromaColor.rgb();
    const [h, s, l] = chromaColor.hsl();
    
    // Validate RGB values
    if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      console.warn('Invalid RGB values:', { r, g, b });
      return null;
    }
    
    // Convert to OKLCH using culori
    const rgbColor = rgb({ r: r / 255, g: g / 255, b: b / 255 });
    const oklchColor = oklch(rgbColor);
    
    return {
      hex: chromaColor.hex(),
      rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
      hsl: { 
        h: Math.round(h || 0), 
        s: Math.round((s || 0) * 100), 
        l: Math.round((l || 0) * 100) 
      },
      oklch: {
        l: Math.round((oklchColor?.l || 0) * 100) / 100,
        c: Math.round((oklchColor?.c || 0) * 100) / 100,
        h: Math.round(oklchColor?.h || 0)
      }
    };
  } catch (error) {
    console.error('Failed to parse color:', input, error);
    return null;
  }
};

/**
 * Convert ColorValue to string format
 */
export const convertColor = (color: ColorValue, format: ColorFormat): string => {
  switch (format) {
    case 'rgb':
      return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case 'hsl':
      return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    case 'oklch':
      return `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})`;
    default:
      return color.hex;
  }
};

/**
 * Generate shade names based on naming pattern
 */
const generateShadeNames = (pattern: NamingPattern, count: number): string[] => {
  switch (pattern) {
    case '50-950':
      return ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].slice(0, count);
    case '100-900':
      return ['100', '200', '300', '400', '500', '600', '700', '800', '900'].slice(0, count);
    case 'custom':
      return Array.from({ length: count }, (_, i) => `${(i + 1) * 100}`);
    default:
      return Array.from({ length: count }, (_, i) => `${i + 1}`);
  }
};

/**
 * Generate shade values based on count
 */
const generateShadeValues = (count: number): number[] => {
  if (count <= 1) return [500];
  
  const values: number[] = [];
  const step = 1000 / (count - 1);
  
  for (let i = 0; i < count; i++) {
    values.push(Math.round(50 + (i * step)));
  }
  
  return values;
};

/**
 * Validate color value before passing to chroma
 */
const validateColorForChroma = (color: ColorValue): boolean => {
  if (!color || !color.hex) return false;
  if (typeof color.hex !== 'string') return false;
  if (!isValidHexColor(color.hex)) return false;
  return true;
};

/**
 * Tailwind CSS color algorithm
 */
const generateTailwindShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Tailwind shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  
  const [h, s, l] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  const baseIndex = Math.floor(count / 2);
  
  for (let i = 0; i < count; i++) {
    let lightness: number;
    
    if (i < baseIndex) {
      // Lighter shades
      const factor = (baseIndex - i) / baseIndex;
      lightness = l + (0.95 - l) * factor;
    } else if (i > baseIndex) {
      // Darker shades
      const factor = (i - baseIndex) / (count - baseIndex - 1);
      lightness = l * (1 - factor * 0.9);
    } else {
      // Base color
      lightness = l;
    }
    
    // Apply contrast shift
    lightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(h || 0, s, lightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};





/**
 * Radix UI color algorithm
 */
const generateRadixShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Radix shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  // Radix uses specific lightness values optimized for accessibility
  const radixLightness = [0.99, 0.97, 0.94, 0.89, 0.82, 0.71, 0.58, 0.45, 0.32, 0.20, 0.09];
  const selectedLightness = radixLightness.slice(0, count);
  
  selectedLightness.forEach(lightness => {
    const adjustedLightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    const shadeColor = chroma.hsl(h || 0, s * 0.9, adjustedLightness); // Slightly reduce saturation
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  });
  
  return shades;
};

/**
 * Ant Design color algorithm
 */
const generateAntShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Ant shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s, l] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  const baseIndex = Math.floor(count / 2);
  
  for (let i = 0; i < count; i++) {
    let lightness: number;
    let saturation = s;
    
    if (i < baseIndex) {
      // Lighter shades with reduced saturation
      const factor = (baseIndex - i) / baseIndex;
      lightness = l + (0.98 - l) * factor;
      saturation = s * (1 - factor * 0.3);
    } else if (i > baseIndex) {
      // Darker shades with increased saturation
      const factor = (i - baseIndex) / (count - baseIndex - 1);
      lightness = l * (1 - factor * 0.85);
      saturation = Math.min(1, s * (1 + factor * 0.2));
    } else {
      // Base color
      lightness = l;
    }
    
    lightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(h || 0, saturation, lightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};

/**
 * Lightness Scale algorithm
 */
const generateLightnessShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Lightness shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  
  for (let i = 0; i < count; i++) {
    const lightness = (i / (count - 1)) * 0.9 + 0.05; // Range from 5% to 95%
    const adjustedLightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(h || 0, s, adjustedLightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades.reverse(); // Lightest first
};

/**
 * Saturation Scale algorithm
 */
const generateSaturationShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Saturation shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s, l] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  
  for (let i = 0; i < count; i++) {
    const saturation = (i / (count - 1)) * s; // Range from 0% to base saturation
    let lightness = l;
    
    // Adjust lightness slightly based on saturation for better visual balance
    if (saturation < s * 0.3) {
      lightness = Math.min(0.95, l + (1 - saturation / s) * 0.2);
    }
    
    lightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(h || 0, saturation, lightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades.reverse(); // Most saturated first
};

/**
 * Hue Shift Scale algorithm
 */
const generateHueShiftShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Hue Shift shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s, l] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  const hueRange = 60; // Total hue shift range
  const baseIndex = Math.floor(count / 2);
  
  for (let i = 0; i < count; i++) {
    const hueShift = ((i - baseIndex) / (count - 1)) * hueRange;
    const newHue = (h + hueShift + 360) % 360;
    
    let lightness = l;
    // Vary lightness slightly for better distinction
    if (i < baseIndex) {
      lightness = l + (baseIndex - i) * 0.05;
    } else if (i > baseIndex) {
      lightness = l - (i - baseIndex) * 0.05;
    }
    
    lightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(newHue, s, lightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};

/**
 * Monochromatic algorithm
 */
const generateMonochromaticShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Monochromatic shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1);
    
    // Vary both lightness and saturation for monochromatic effect
    const lightness = 0.95 - (factor * 0.85); // From 95% to 10%
    const saturation = s * (0.3 + factor * 0.7); // From 30% to 100% of base saturation
    
    const adjustedLightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(h || 0, saturation, adjustedLightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};

/**
 * Analogous algorithm
 */
const generateAnalogousShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Analogous shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s, l] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  const hueStep = 30; // 30 degrees for analogous colors
  
  for (let i = 0; i < count; i++) {
    const hueOffset = (i - Math.floor(count / 2)) * hueStep;
    const newHue = (h + hueOffset + 360) % 360;
    
    // Vary lightness for better distinction
    const lightnessFactor = Math.sin((i / (count - 1)) * Math.PI);
    const lightness = l + lightnessFactor * 0.2 - 0.1;
    
    const adjustedLightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(newHue, s, adjustedLightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};

/**
 * Complementary algorithm
 */
const generateComplementaryShades = (
  baseColor: ColorValue,
  count: number,
  contrastShift: number
): ColorValue[] => {
  // Validate base color before processing
  if (!validateColorForChroma(baseColor)) {
    console.warn('Invalid base color for Complementary shades:', baseColor);
    return [];
  }
  
  let chromaBase;
  try {
    chromaBase = chroma(baseColor.hex);
  } catch (error) {
    console.error('Error creating chroma color from hex:', baseColor.hex, error);
    return [];
  }
  const [h, s] = chromaBase.hsl();
  
  const shades: ColorValue[] = [];
  const complementaryHue = (h + 180) % 360;
  
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1);
    
    // Interpolate between base color and complementary color
    const currentHue = factor < 0.5 ? h : complementaryHue;
    const lightness = 0.9 - (factor * 0.8); // From light to dark
    
    // Adjust saturation based on position
    const saturation = s * (0.5 + Math.abs(factor - 0.5));
    
    const adjustedLightness = Math.max(0, Math.min(1, lightness + contrastShift * 0.1));
    
    const shadeColor = chroma.hsl(currentHue, saturation, adjustedLightness);
    const parsedShade = parseColorInput(shadeColor.hex());
    
    if (parsedShade) {
      shades.push(parsedShade);
    }
  }
  
  return shades;
};

/**
 * Generate complete color palette
 */
export const generatePalette = (
  baseColor: ColorValue,
  algorithm: ColorAlgorithm,
  shadeCount: number,
  contrastShift: number,
  namingPattern: NamingPattern,
  colorName: string
): ColorPalette => {
  let shadeColors: ColorValue[];
  
  switch (algorithm) {
    case 'tailwind':
      shadeColors = generateTailwindShades(baseColor, shadeCount, contrastShift);
      break;
    case 'radix':
      shadeColors = generateRadixShades(baseColor, shadeCount, contrastShift);
      break;
    case 'ant':
      shadeColors = generateAntShades(baseColor, shadeCount, contrastShift);
      break;
    case 'lightness':
      shadeColors = generateLightnessShades(baseColor, shadeCount, contrastShift);
      break;
    case 'saturation':
      shadeColors = generateSaturationShades(baseColor, shadeCount, contrastShift);
      break;
    case 'hue':
      shadeColors = generateHueShiftShades(baseColor, shadeCount, contrastShift);
      break;
    case 'monochromatic':
      shadeColors = generateMonochromaticShades(baseColor, shadeCount, contrastShift);
      break;
    case 'analogous':
      shadeColors = generateAnalogousShades(baseColor, shadeCount, contrastShift);
      break;
    case 'complementary':
      shadeColors = generateComplementaryShades(baseColor, shadeCount, contrastShift);
      break;
    default:
      shadeColors = generateTailwindShades(baseColor, shadeCount, contrastShift);
  }
  
  const shadeNames = generateShadeNames(namingPattern, shadeCount);
  const shadeValues = generateShadeValues(shadeCount);
  
  const shades: ColorShade[] = shadeColors.map((color, index) => ({
    name: shadeNames[index] || `${index + 1}`,
    value: shadeValues[index] || (index + 1) * 100,
    color
  }));
  
  return {
    name: colorName,
    baseColor,
    shades,
    algorithm
  };
};

/**
 * Get contrast ratio between two colors
 */
export const getContrastRatio = (color1: ColorValue, color2: ColorValue): number => {
  const chroma1 = chroma(color1.hex);
  const chroma2 = chroma(color2.hex);
  
  return chroma.contrast(chroma1, chroma2);
};

/**
 * Check if color is light or dark
 */
export const isLightColor = (color: ColorValue): boolean => {
  const chromaColor = chroma(color.hex);
  return chromaColor.luminance() > 0.5;
};

/**
 * Generate complementary color
 */
export const getComplementaryColor = (color: ColorValue): ColorValue => {
  const chromaColor = chroma(color.hex);
  const [h, s, l] = chromaColor.hsl();
  
  const complementaryHue = (h + 180) % 360;
  const complementaryColor = chroma.hsl(complementaryHue, s, l);
  
  const parsed = parseColorInput(complementaryColor.hex());
  return parsed || color;
};

/**
 * Generate analogous colors
 */
export const getAnalogousColors = (color: ColorValue, count: number = 3): ColorValue[] => {
  const chromaColor = chroma(color.hex);
  const [h, s, l] = chromaColor.hsl();
  
  const colors: ColorValue[] = [];
  const step = 30; // 30 degrees apart
  
  for (let i = 0; i < count; i++) {
    const newHue = (h + (i - Math.floor(count / 2)) * step) % 360;
    const analogousColor = chroma.hsl(newHue, s, l);
    const parsed = parseColorInput(analogousColor.hex());
    
    if (parsed) {
      colors.push(parsed);
    }
  }
  
  return colors;
};

/**
 * Validate hex color
 */
export const isValidHexColor = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

/**
 * Generate random color
 */
export const generateRandomColor = (): ColorValue => {
  const randomColor = chroma.random();
  const parsed = parseColorInput(randomColor.hex());
  
  return parsed || {
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    oklch: { l: 0.6, c: 0.15, h: 250 }
  };
};

/**
 * Interpolate colors between two colors
 */
export const interpolateColors = (fromColor: string, toColor: string, steps: number): string[] => {
  const scale = chroma.scale([fromColor, toColor]).mode('hsl');
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const position = i / (steps - 1);
    colors.push(scale(position).hex());
  }
  
  return colors;
};

/**
 * Generate palette between two colors
 */
export const generatePaletteBetweenColors = (fromColor: string, toColor: string, steps: number): ColorValue[] => {
  const scale = chroma.scale([fromColor, toColor]).mode('hsl');
  const colors: ColorValue[] = [];
  
  for (let i = 0; i < steps; i++) {
    const position = i / (steps - 1);
    const color = scale(position);
    const parsed = parseColorInput(color.hex());
    
    if (parsed) {
      colors.push(parsed);
    }
  }
  
  return colors;
};