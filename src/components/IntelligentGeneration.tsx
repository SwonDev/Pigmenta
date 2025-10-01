import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Heart,
  Leaf,
  Sun,
  Snowflake,
  Flower,
  Monitor,
  Stethoscope,
  Utensils,
  Gamepad2,
  Shirt,
  Palette,
  Dice6,
  Zap,
  Moon,
  Coffee,
  Building,
  type LucideIcon
} from 'lucide-react';
// Removed Collapsible import - using custom implementation
import { useAppStore } from '../stores/useAppStore';
import { parseColorInput, generatePalette } from '../utils/colorUtils';
import { generatePaletteName } from '../utils/paletteNaming';
import { DESIGN_TOKENS } from '../constants/designTokens';
import type { ColorValue, ColorAlgorithm, ColorPalette, ColorShade } from '../types';

// Algoritmos de generación inteligente de paletas con variaciones
const generateEmotionPalette = (emotion: string): ColorValue => {
  // Rangos de colores para cada emoción con variaciones aleatorias
  const emotionRanges: Record<string, { hueRange: [number, number], satRange: [number, number], lightRange: [number, number] }> = {
    energetica: { hueRange: [10, 30], satRange: [70, 95], lightRange: [45, 65] }, // Naranjas/rojos vibrantes
    relajante: { hueRange: [200, 240], satRange: [40, 70], lightRange: [50, 75] }, // Azules calmantes
    profesional: { hueRange: [210, 250], satRange: [30, 60], lightRange: [25, 45] }, // Azules oscuros corporativos
    creativa: { hueRange: [270, 320], satRange: [60, 85], lightRange: [40, 65] }, // Púrpuras inspiradores
    alegre: { hueRange: [45, 65], satRange: [75, 95], lightRange: [55, 75] }, // Amarillos brillantes
    elegante: { hueRange: [200, 220], satRange: [15, 35], lightRange: [30, 50] }, // Grises sofisticados
  };
  
  const range = emotionRanges[emotion] || { hueRange: [200, 240], satRange: [50, 80], lightRange: [40, 70] };
  
  // Generar valores aleatorios dentro del rango
  const hue = range.hueRange[0] + Math.random() * (range.hueRange[1] - range.hueRange[0]);
  const saturation = range.satRange[0] + Math.random() * (range.satRange[1] - range.satRange[0]);
  const lightness = range.lightRange[0] + Math.random() * (range.lightRange[1] - range.lightRange[0]);
  
  const colorHex = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  return parseColorInput(colorHex) || generateRandomColorValue();
};

const generateSeasonalPalette = (season: string): ColorValue => {
  // Rangos de colores estacionales con variaciones naturales
  const seasonalRanges: Record<string, { hueRange: [number, number], satRange: [number, number], lightRange: [number, number] }> = {
    primavera: { hueRange: [80, 140], satRange: [50, 80], lightRange: [50, 75] }, // Verdes frescos y amarillos suaves
    verano: { hueRange: [40, 70], satRange: [70, 95], lightRange: [60, 85] }, // Amarillos y naranjas solares
    otono: { hueRange: [15, 45], satRange: [60, 90], lightRange: [35, 60] }, // Naranjas, rojos y marrones otoñales
    invierno: { hueRange: [180, 240], satRange: [30, 70], lightRange: [30, 60] }, // Azules fríos y grises invernales
  };
  
  const range = seasonalRanges[season] || { hueRange: [180, 240], satRange: [40, 70], lightRange: [40, 70] };
  
  // Generar valores aleatorios dentro del rango estacional
  const hue = range.hueRange[0] + Math.random() * (range.hueRange[1] - range.hueRange[0]);
  const saturation = range.satRange[0] + Math.random() * (range.satRange[1] - range.satRange[0]);
  const lightness = range.lightRange[0] + Math.random() * (range.lightRange[1] - range.lightRange[0]);
  
  const colorHex = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  return parseColorInput(colorHex) || generateRandomColorValue();
};

const generateIndustryPalette = (industry: string): ColorValue => {
  // Rangos de colores por industria con variaciones profesionales
  const industryRanges: Record<string, { hueRange: [number, number], satRange: [number, number], lightRange: [number, number] }> = {
    tech: { hueRange: [200, 250], satRange: [60, 90], lightRange: [35, 65] }, // Azules tecnológicos
    salud: { hueRange: [120, 180], satRange: [40, 75], lightRange: [40, 70] }, // Verdes y azules médicos
    food: { hueRange: [0, 40], satRange: [70, 95], lightRange: [45, 75] }, // Rojos, naranjas apetitosos
    gaming: { hueRange: [260, 320], satRange: [70, 95], lightRange: [35, 65] }, // Púrpuras y magentas gaming
    fashion: { hueRange: [300, 360], satRange: [60, 90], lightRange: [40, 70] }, // Rosas y púrpuras fashion
    finanzas: { hueRange: [140, 200], satRange: [30, 60], lightRange: [25, 50] }, // Verdes y azules financieros
  };
  
  const range = industryRanges[industry] || { hueRange: [200, 240], satRange: [50, 80], lightRange: [40, 70] };
  
  // Generar valores aleatorios dentro del rango de la industria
  const hue = range.hueRange[0] + Math.random() * (range.hueRange[1] - range.hueRange[0]);
  const saturation = range.satRange[0] + Math.random() * (range.satRange[1] - range.satRange[0]);
  const lightness = range.lightRange[0] + Math.random() * (range.lightRange[1] - range.lightRange[0]);
  
  const colorHex = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  return parseColorInput(colorHex) || generateRandomColorValue();
};





const generateRandomColorValue = (): ColorValue => {
  // Definir diferentes tipos de paletas aleatorias
  const paletteTypes = [
    'vibrant',      // Colores vibrantes y saturados
    'pastel',       // Colores suaves y claros
    'deep',         // Colores profundos y oscuros
    'neon',         // Colores neón brillantes
    'earth',        // Tonos tierra naturales
    'ocean',        // Tonos azules y verdes
    'sunset',       // Tonos cálidos naranjas/rojos
    'forest',       // Verdes naturales
    'cosmic',       // Púrpuras y azules profundos
    'warm',         // Paleta cálida
    'cool',         // Paleta fría
    'monochrome',   // Variaciones de un solo hue
    'complementary', // Colores complementarios
    'triadic',      // Armonía triádica
    'analogous'     // Colores análogos
  ];
  
  // Seleccionar tipo de paleta aleatoriamente
  const selectedType = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
  
  let hue: number;
  let saturation: number;
  let lightness: number;
  
  switch (selectedType) {
    case 'vibrant':
      hue = Math.random() * 360;
      saturation = 70 + Math.random() * 30; // 70-100%
      lightness = 45 + Math.random() * 25; // 45-70%
      break;
      
    case 'pastel':
      hue = Math.random() * 360;
      saturation = 20 + Math.random() * 40; // 20-60%
      lightness = 70 + Math.random() * 25; // 70-95%
      break;
      
    case 'deep':
      hue = Math.random() * 360;
      saturation = 50 + Math.random() * 50; // 50-100%
      lightness = 15 + Math.random() * 30; // 15-45%
      break;
      
    case 'neon':
      hue = Math.random() * 360;
      saturation = 85 + Math.random() * 15; // 85-100%
      lightness = 50 + Math.random() * 20; // 50-70%
      break;
      
    case 'earth': {
      const earthHues = [25, 35, 45, 60, 120, 30]; // Marrones, ocres, verdes
      hue = earthHues[Math.floor(Math.random() * earthHues.length)] + (Math.random() - 0.5) * 20;
      saturation = 30 + Math.random() * 40; // 30-70%
      lightness = 25 + Math.random() * 40; // 25-65%
      break;
    }
      
    case 'ocean':
      hue = 180 + (Math.random() - 0.5) * 120; // Azules y verdes
      saturation = 40 + Math.random() * 50; // 40-90%
      lightness = 35 + Math.random() * 40; // 35-75%
      break;
      
    case 'sunset':
      hue = Math.random() < 0.5 ? 15 + Math.random() * 30 : 330 + Math.random() * 30; // Naranjas y rojos
      saturation = 60 + Math.random() * 40; // 60-100%
      lightness = 40 + Math.random() * 35; // 40-75%
      break;
      
    case 'forest':
      hue = 90 + Math.random() * 60; // Verdes
      saturation = 35 + Math.random() * 45; // 35-80%
      lightness = 25 + Math.random() * 45; // 25-70%
      break;
      
    case 'cosmic':
      hue = 240 + Math.random() * 60; // Púrpuras y azules
      saturation = 50 + Math.random() * 50; // 50-100%
      lightness = 20 + Math.random() * 50; // 20-70%
      break;
      
    case 'warm':
      hue = Math.random() < 0.33 ? Math.random() * 60 : // Rojos-naranjas
            Math.random() < 0.5 ? 300 + Math.random() * 60 : // Magentas
            45 + Math.random() * 15; // Amarillos
      saturation = 50 + Math.random() * 50; // 50-100%
      lightness = 35 + Math.random() * 40; // 35-75%
      break;
      
    case 'cool':
      hue = 180 + Math.random() * 120; // Azules, verdes, púrpuras
      saturation = 40 + Math.random() * 50; // 40-90%
      lightness = 30 + Math.random() * 50; // 30-80%
      break;
      
    case 'monochrome':
      hue = Math.random() * 360;
      saturation = 20 + Math.random() * 60; // 20-80%
      lightness = 30 + Math.random() * 50; // 30-80%
      break;
      
    case 'complementary':
      hue = Math.random() * 360;
      saturation = 50 + Math.random() * 40; // 50-90%
      lightness = 40 + Math.random() * 35; // 40-75%
      break;
      
    case 'triadic': {
      const baseHue = Math.random() * 360;
      const triadicOffsets = [0, 120, 240];
      const selectedOffset = triadicOffsets[Math.floor(Math.random() * triadicOffsets.length)];
      hue = (baseHue + selectedOffset) % 360;
      saturation = 45 + Math.random() * 45; // 45-90%
      lightness = 35 + Math.random() * 40; // 35-75%
      break;
    }
      
    case 'analogous': {
      const analogousBase = Math.random() * 360;
      hue = analogousBase + (Math.random() - 0.5) * 60; // ±30° del base
      saturation = 40 + Math.random() * 50; // 40-90%
      lightness = 35 + Math.random() * 45; // 35-80%
      break;
    }
      
    default:
      // Fallback completamente aleatorio
      hue = Math.random() * 360;
      saturation = 30 + Math.random() * 60; // 30-90%
      lightness = 25 + Math.random() * 60; // 25-85%
  }
  
  // Asegurar que los valores estén en rangos válidos
  hue = Math.max(0, Math.min(360, hue));
  saturation = Math.max(0, Math.min(100, saturation));
  lightness = Math.max(0, Math.min(100, lightness));
  
  const colorHex = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  return parseColorInput(colorHex) || {
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    oklch: { l: 0.6, c: 0.15, h: 250 }
  };
};

// NUEVA FUNCIÓN: Generar paleta completa con múltiples colores complementarios
const generateCompleteAIHarmonyPalette = (): ColorPalette => {
  // 1. Definir armonías cromáticas con múltiples colores
  const colorHarmonies = [
    {
      name: 'complementary',
      angles: [0, 180],
      colorCount: 2,
      description: 'Máximo contraste y equilibrio visual'
    },
    {
      name: 'triadic',
      angles: [0, 120, 240],
      colorCount: 3,
      description: 'Equilibrio dinámico y vibrante'
    },
    {
      name: 'tetradic',
      angles: [0, 90, 180, 270],
      colorCount: 4,
      description: 'Máxima riqueza cromática balanceada'
    },
    {
      name: 'analogous',
      angles: [0, 30, 60],
      colorCount: 3,
      description: 'Armonía natural y suave'
    },
    {
      name: 'splitComplementary',
      angles: [0, 150, 210],
      colorCount: 3,
      description: 'Contraste suave pero dinámico'
    }
  ];

  // 2. Seleccionar armonía con distribución ponderada
  const harmonyWeights = [0.30, 0.25, 0.20, 0.15, 0.10]; // Favorece complementarios y triádicos
  let random = Math.random();
  let selectedHarmony = colorHarmonies[0];
  
  for (let i = 0; i < harmonyWeights.length; i++) {
    if (random < harmonyWeights[i]) {
      selectedHarmony = colorHarmonies[i];
      break;
    }
    random -= harmonyWeights[i];
  }

  // 3. Calcular hue base usando proporción áurea
  const goldenAngle = 137.508;
  const baseHue = (Math.random() * goldenAngle) % 360;

  // 4. Generar todos los colores de la armonía
  const harmonyColors: ColorValue[] = [];
  
  for (let i = 0; i < selectedHarmony.angles.length; i++) {
    const angle = selectedHarmony.angles[i];
    const finalHue = (baseHue + angle) % 360;
    
    // Calcular saturación y luminosidad específicas para cada color
    let saturation: number;
    let lightness: number;
    
    // Variaciones sutiles para cada color en la armonía
    const variation = i * 0.05; // Pequeña variación entre colores
    
    switch (selectedHarmony.name) {
      case 'complementary':
        saturation = 70 + (Math.random() * 20) + (variation * 10);
        lightness = 50 + (Math.random() * 15) + (variation * 5);
        break;
        
      case 'triadic':
        saturation = 65 + (Math.random() * 25) + (variation * 8);
        lightness = 55 + (Math.random() * 20) + (variation * 6);
        break;
        
      case 'tetradic':
        saturation = 60 + (Math.random() * 20) + (variation * 6);
        lightness = 45 + (Math.random() * 25) + (variation * 4);
        break;
        
      case 'analogous':
        saturation = 55 + (Math.random() * 30) + (variation * 5);
        lightness = 60 + (Math.random() * 20) + (variation * 3);
        break;
        
      case 'splitComplementary':
        saturation = 62 + (Math.random() * 23) + (variation * 7);
        lightness = 52 + (Math.random() * 18) + (variation * 4);
        break;
        
      default:
        saturation = 65 + (Math.random() * 20);
        lightness = 55 + (Math.random() * 15);
    }

    // Aplicar corrección de contraste
    if (lightness < 25) lightness += 15;
    if (lightness > 85) lightness -= 15;
    if (saturation < 35) saturation += 20;

    // Generar color con precisión matemática
    const colorHsl = `hsl(${Math.round(finalHue * 10) / 10}, ${Math.round(saturation * 10) / 10}%, ${Math.round(lightness * 10) / 10}%)`;
    const colorValue = parseColorInput(colorHsl);
    
    if (colorValue) {
      harmonyColors.push(colorValue);
    }
  }

  // 5. Seleccionar el color base (el primero de la armonía)
  const baseColor = harmonyColors[0] || generateRandomColorValue();

  // 6. Crear shades personalizados distribuyendo los colores de armonía inteligentemente
  const customShades: ColorShade[] = [];
  const shadeValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const totalShades = shadeValues.length;
  const harmonyCount = harmonyColors.length;
  
  // Validar que tenemos colores de armonía válidos
  if (harmonyCount === 0) {
    // Fallback: generar al menos un color aleatorio
    harmonyColors.push(generateRandomColorValue());
  }
  
  // Distribuir colores de armonía a lo largo de toda la paleta
  for (let i = 0; i < totalShades; i++) {
    const shadeValue = shadeValues[i];
    let shadeColor: ColorValue;
    
    // Determinar qué color de armonía usar para este shade
    const harmonyIndex = Math.floor((i * harmonyColors.length) / totalShades);
    const baseHarmonyColor = harmonyColors[harmonyIndex % harmonyColors.length];
    
    // Validar que baseHarmonyColor es válido y tiene propiedades hsl
    if (!baseHarmonyColor || !baseHarmonyColor.hsl || 
        typeof baseHarmonyColor.hsl.h !== 'number' || 
        typeof baseHarmonyColor.hsl.s !== 'number') {
      // Fallback: usar un color aleatorio válido
      shadeColor = generateRandomColorValue();
    } else {
      try {
        // Crear variaciones de luminosidad para cada color de armonía
        // Mapear el índice del shade a un rango de luminosidad (20% a 85%)
        const lightnessRange = 65; // 85 - 20
        const minLightness = 20;
        const targetLightness = minLightness + (lightnessRange * i) / (totalShades - 1);
        
        // Ajustar la saturación según la posición en la paleta
        let adjustedSaturation = baseHarmonyColor.hsl.s;
        if (i < 2) {
          // Shades más claros: reducir saturación ligeramente
          adjustedSaturation = Math.max(30, baseHarmonyColor.hsl.s - 15);
        } else if (i > totalShades - 3) {
          // Shades más oscuros: aumentar saturación ligeramente
          adjustedSaturation = Math.min(90, baseHarmonyColor.hsl.s + 10);
        }
        
        // Generar el color final con el hue de armonía y luminosidad ajustada
        const finalHsl = `hsl(${baseHarmonyColor.hsl.h}, ${Math.round(adjustedSaturation)}%, ${Math.round(targetLightness)}%)`;
        const parsedColor = parseColorInput(finalHsl);
        shadeColor = parsedColor || baseHarmonyColor;
      } catch {
        // En caso de cualquier error, usar el color base o generar uno aleatorio
        shadeColor = baseHarmonyColor || generateRandomColorValue();
      }
    }
    
    customShades.push({
      name: shadeValue.toString(),
      value: shadeValue,
      color: shadeColor,
      contrast: 1,
      isActive: shadeValue === 500
    });
  }

  // 7. Crear la paleta completa
  const completePalette: ColorPalette = {
    name: `Armonía ${selectedHarmony.name}`,
    baseColor: baseColor,
    algorithm: 'complementary' as ColorAlgorithm,
    shades: customShades
  };

  return completePalette;
};

export const IntelligentGeneration = () => {
  const { updateBaseColor, updatePalette, algorithm, shadeCount, contrastShift, namingPattern } = useAppStore();

  const generateAndApplyPalette = (baseColor: ColorValue, generationType: string) => {
    try {
      // Generar la paleta completa de forma instantánea
      generatePalette(
        baseColor,
        algorithm,
        shadeCount,
        contrastShift,
        namingPattern,
        generatePaletteName([]) || generationType
      );
      
      // Aplicar la nueva paleta inmediatamente
      updateBaseColor(baseColor, true);
      
    } catch (error) {
      console.error('Error generating palette:', error);
    }
  };

  const emotionOptions = [
    { key: 'energetica', label: 'Energética', icon: Zap },
    { key: 'relajante', label: 'Relajante', icon: Moon },
    { key: 'profesional', label: 'Profesional', icon: Building },
    { key: 'creativa', label: 'Creativa', icon: Palette },
    { key: 'alegre', label: 'Alegre', icon: Sun },
    { key: 'elegante', label: 'Elegante', icon: Coffee },
  ];

  const seasonalOptions = [
    { key: 'primavera', label: 'Primavera', icon: Flower },
    { key: 'verano', label: 'Verano', icon: Sun },
    { key: 'otono', label: 'Otoño', icon: Leaf },
    { key: 'invierno', label: 'Invierno', icon: Snowflake },
  ];

  const industryOptions = [
    { key: 'tech', label: 'Tecnología', icon: Monitor },
    { key: 'salud', label: 'Salud', icon: Stethoscope },
    { key: 'food', label: 'Alimentación', icon: Utensils },
    { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { key: 'fashion', label: 'Moda', icon: Shirt },
    { key: 'finanzas', label: 'Finanzas', icon: Building },
  ];

  const OptionButton = ({ 
    option, 
    onClick 
  }: { 
    option: { key: string; label: string; icon: LucideIcon }; 
    onClick: () => void;
  }) => {
    const Icon = option.icon;
    
    return (
      <motion.button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
          color: DESIGN_TOKENS.colors.text.primary,
          border: `1px solid ${DESIGN_TOKENS.colors.border.subtle}`,
        }}
        whileHover={{ 
          scale: 1.02,
          backgroundColor: DESIGN_TOKENS.colors.surface.card 
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
        <span className="text-sm font-medium">{option.label}</span>
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
                {/* Paletas por Emoción */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                    <Heart size={16} />
                    Paletas por Emoción
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {emotionOptions.map((option) => (
                      <OptionButton
                        key={option.key}
                        option={option}
                        onClick={() => {
                          const baseColor = generateEmotionPalette(option.key);
                          generateAndApplyPalette(baseColor, `Paleta ${option.label}`);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Paletas Estacionales */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <Leaf size={16} />
                    Paletas Estacionales
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {seasonalOptions.map((option) => (
                      <OptionButton
                        key={option.key}
                        option={option}
                        onClick={() => {
                          const baseColor = generateSeasonalPalette(option.key);
                          generateAndApplyPalette(baseColor, `Paleta ${option.label}`);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Generador por Industria */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Building size={16} />
                    Generador por Industria
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {industryOptions.map((option) => (
                      <OptionButton
                        key={option.key}
                        option={option}
                        onClick={() => {
                          const baseColor = generateIndustryPalette(option.key);
                          generateAndApplyPalette(baseColor, `Paleta ${option.label}`);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* AI Color Harmony */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                    <Sparkles size={16} />
                    AI Color Harmony
                  </h4>
                  <OptionButton
                    option={{ key: 'ai-harmony', label: 'Generar Armonía IA', icon: Sparkles }}
                    onClick={() => {
                      // Generar paleta completa con múltiples colores complementarios
                      const harmonyPalette = generateCompleteAIHarmonyPalette();
                      updatePalette(harmonyPalette);
                    }}
                  />
                </div>

                {/* Generación Aleatoria */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                    <Dice6 size={16} />
                    Generación Aleatoria
                  </h4>
                  <OptionButton
                    option={{ key: 'random', label: 'Paleta Aleatoria', icon: Dice6 }}
                    onClick={() => {
                      const baseColor = generateRandomColorValue();
                      generateAndApplyPalette(baseColor, 'Paleta Aleatoria');
                    }}
                  />
                </div>
    </div>
  );
};