// Utility functions for extracting colors from images using Canvas API and k-means clustering

/**
 * Convert RGB values to HEX format
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Convert HEX to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Convert RGB to HSL for better color manipulation
 */
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convert HSL back to RGB
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

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
 * Calculate Euclidean distance between two RGB colors
 */
const colorDistance = (color1: number[], color2: number[]): number => {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
};

/**
 * K-means clustering algorithm for color extraction
 */
const kMeansColors = (pixels: number[][], k: number, maxIterations: number = 20): number[][] => {
  if (pixels.length === 0) return [];
  if (k >= pixels.length) return pixels;

  // Initialize centroids randomly
  let centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * pixels.length);
    centroids.push([...pixels[randomIndex]]);
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign pixels to closest centroid
    const clusters: number[][][] = Array(k).fill(null).map(() => []);
    
    pixels.forEach(pixel => {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = colorDistance(pixel, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      
      clusters[closestCentroid].push(pixel);
    });

    // Update centroids
    const newCentroids: number[][] = [];
    clusters.forEach(cluster => {
      if (cluster.length === 0) {
        newCentroids.push([0, 0, 0]);
        return;
      }
      
      const avgColor = cluster.reduce(
        (acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]],
        [0, 0, 0]
      ).map(sum => Math.round(sum / cluster.length));
      
      newCentroids.push(avgColor);
    });

    // Check for convergence
    const converged = centroids.every((centroid, index) => 
      colorDistance(centroid, newCentroids[index]) < 1
    );
    
    centroids = newCentroids;
    
    if (converged) break;
  }

  return centroids;
};

/**
 * Extract dominant colors from an image using k-means clustering
 */
export const extractColorsFromImage = async (imageUrl: string, colorCount: number = 8): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Resize image for faster processing (max 200x200)
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels: number[][] = [];
        
        // Sample pixels (every 4th pixel for performance)
        for (let i = 0; i < imageData.data.length; i += 16) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];
          
          // Skip transparent pixels
          if (a > 128) {
            pixels.push([r, g, b]);
          }
        }
        
        if (pixels.length === 0) {
          reject(new Error('No valid pixels found'));
          return;
        }
        
        // Apply k-means clustering
        const dominantColors = kMeansColors(pixels, Math.min(colorCount, pixels.length));
        
        // Convert to hex and sort by brightness
        const hexColors = dominantColors
          .map(([r, g, b]) => rgbToHex(r, g, b))
          .filter(color => color !== '#000000') // Remove pure black
          .sort((a, b) => {
            const rgbA = hexToRgb(a);
            const rgbB = hexToRgb(b);
            const brightnessA = (rgbA.r * 299 + rgbA.g * 587 + rgbA.b * 114) / 1000;
            const brightnessB = (rgbB.r * 299 + rgbB.g * 587 + rgbB.b * 114) / 1000;
            return brightnessB - brightnessA;
          });
        
        resolve(hexColors.slice(0, colorCount));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Generate a monochromatic palette from a base color
 */
export const generateMonochromaticPalette = (baseColor: string, count: number = 5): string[] => {
  try {
    // Validar el formato del color antes de procesarlo
    if (!baseColor || typeof baseColor !== 'string') {
      console.error('Color base inválido:', baseColor);
      return [baseColor || '#3b82f6']; // Fallback color
    }
    
    // Limpiar el color de espacios y caracteres extraños
    const cleanColor = baseColor.trim();
    
    // Validar formato hex básico
    if (!cleanColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      console.error('Formato de color hex inválido:', cleanColor);
      // Intentar corregir el formato si es posible
      const correctedColor = cleanColor.startsWith('#') ? cleanColor : `#${cleanColor}`;
      if (correctedColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        return generateMonochromaticPalette(correctedColor, count);
      }
      return [baseColor]; // Devolver el color original como fallback
    }
    
    const rgb = hexToRgb(cleanColor);
    
    // Validar que hexToRgb devolvió valores válidos
    if (!rgb || isNaN(rgb.r) || isNaN(rgb.g) || isNaN(rgb.b)) {
      console.error('RGB inválido para color:', cleanColor, rgb);
      return [cleanColor];
    }
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Validar que rgbToHsl devolvió valores válidos
    if (!hsl || isNaN(hsl.h) || isNaN(hsl.s) || isNaN(hsl.l)) {
      console.error('HSL inválido para color:', cleanColor, hsl);
      return [cleanColor];
    }
    
    const palette: string[] = [];
    
    // Generate variations by adjusting lightness and saturation
    for (let i = 0; i < count; i++) {
      try {
        const factor = count > 1 ? (i / (count - 1)) * 0.8 + 0.1 : 0.5; // 0.1 to 0.9, or 0.5 for single color
        
        // Vary lightness
        const newL = Math.max(10, Math.min(90, hsl.l * factor + (1 - factor) * 50));
        // Slightly vary saturation
        const newS = Math.max(10, Math.min(100, hsl.s * (0.8 + factor * 0.4)));
        
        const newRgb = hslToRgb(hsl.h, newS, newL);
        
        // Validar que hslToRgb devolvió valores válidos
        if (!newRgb || isNaN(newRgb.r) || isNaN(newRgb.g) || isNaN(newRgb.b)) {
          console.warn(`RGB inválido en iteración ${i}:`, newRgb);
          continue;
        }
        
        const hexColor = rgbToHex(Math.round(newRgb.r), Math.round(newRgb.g), Math.round(newRgb.b));
        
        // Validar que el color generado es válido
        if (hexColor && hexColor.match(/^#[0-9A-Fa-f]{6}$/)) {
          palette.push(hexColor);
        } else {
          console.warn(`Color generado inválido en iteración ${i}:`, hexColor);
          // Agregar el color base como fallback
          palette.push(cleanColor);
        }
      } catch (shadeError) {
        console.error(`Error generando shade ${i + 1}:`, shadeError);
        // Agregar el color base como fallback
        palette.push(cleanColor);
      }
    }
    
    // Asegurar que siempre devolvemos al menos un color
    if (palette.length === 0) {
      palette.push(cleanColor);
    }
    
    return palette;
  } catch (error) {
    console.error('Error generating monochromatic palette:', error, 'Color:', baseColor);
    // Devolver el color base o un color por defecto
    return [baseColor || '#3b82f6'];
  }
};

/**
 * Generate a multicolor palette from dominant colors
 */
export const generateMulticolorPalette = (dominantColors: string[], count: number = 5): string[] => {
  if (dominantColors.length === 0) return [];
  
  // If we have enough colors, return them directly
  if (dominantColors.length >= count) {
    return dominantColors.slice(0, count);
  }
  
  // If we need more colors, generate variations
  const palette: string[] = [...dominantColors];
  
  while (palette.length < count && dominantColors.length > 0) {
    const baseColor = dominantColors[palette.length % dominantColors.length];
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Create a variation by adjusting hue slightly
    const hueShift = (Math.random() - 0.5) * 60; // ±30 degrees
    const newH = (hsl.h + hueShift + 360) % 360;
    const newL = Math.max(20, Math.min(80, hsl.l + (Math.random() - 0.5) * 40));
    
    const newRgb = hslToRgb(newH, hsl.s, newL);
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    if (!palette.includes(newColor)) {
      palette.push(newColor);
    }
  }
  
  return palette.slice(0, count);
};

/**
 * Check if a color is too similar to existing colors in palette
 */
export const isColorUnique = (color: string, existingColors: string[], threshold: number = 30): boolean => {
  const rgb = hexToRgb(color);
  
  return !existingColors.some(existingColor => {
    const existingRgb = hexToRgb(existingColor);
    const distance = colorDistance([rgb.r, rgb.g, rgb.b], [existingRgb.r, existingRgb.g, existingRgb.b]);
    return distance < threshold;
  });
};

/**
 * Get the most contrasting color (black or white) for text on a given background
 */
export const getContrastColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};