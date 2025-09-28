import type { ColorShade, ColorValue } from '../types';

// Base de datos de nombres creativos categorizados
const PALETTE_NAMES = {
  // Nombres basados en hue (matiz) - Ampliado significativamente
  hue: {
    red: [
      'Crimson Dreams', 'Ruby Whispers', 'Scarlet Symphony', 'Cherry Blossom', 'Sunset Ember', 'Rose Garden', 'Burgundy Velvet', 'Coral Reef',
      'Cardinal Fire', 'Strawberry Fields', 'Pomegranate Burst', 'Brick Harmony', 'Wine Cellar', 'Poppy Meadow', 'Cranberry Crush', 'Mahogany Depths',
      'Russet Autumn', 'Garnet Glow', 'Vermillion Waves', 'Chili Pepper', 'Tomato Vine', 'Raspberry Ripple', 'Cinnamon Spice', 'Paprika Dreams',
      'Blood Orange', 'Maroon Mystery', 'Carmine Canvas', 'Cerise Celebration', 'Claret Elegance', 'Oxblood Vintage'
    ],
    orange: [
      'Autumn Harvest', 'Tangerine Sunset', 'Copper Glow', 'Amber Waves', 'Pumpkin Spice', 'Citrus Burst', 'Terracotta Dreams', 'Marigold Fields',
      'Peach Cobbler', 'Apricot Blush', 'Mandarin Magic', 'Persimmon Grove', 'Burnt Sienna', 'Papaya Paradise', 'Cantaloupe Cream', 'Tiger Lily',
      'Saffron Sunset', 'Coral Cascade', 'Flame Flower', 'Honey Amber', 'Rust Revival', 'Ginger Spice', 'Turmeric Gold', 'Mango Tango',
      'Sandstone Serenity', 'Caramel Swirl', 'Bronze Brilliance', 'Ochre Earth', 'Cadmium Burst', 'Tangerine Dream'
    ],
    yellow: [
      'Golden Hour', 'Sunflower Meadow', 'Honey Drizzle', 'Lemon Zest', 'Canary Song', 'Buttercup Valley', 'Saffron Spice', 'Banana Cream',
      'Daffodil Dance', 'Mustard Seed', 'Corn Silk', 'Champagne Bubbles', 'Citrine Sparkle', 'Vanilla Bean', 'Wheat Field', 'Goldenrod Glory',
      'Amber Honey', 'Sunshine Burst', 'Maize Maze', 'Topaz Treasure', 'Custard Cloud', 'Pineapple Paradise', 'Dandelion Drift', 'Mimosa Morning',
      'Butter Biscuit', 'Lemonade Stand', 'Jonquil Joy', 'Primrose Path', 'Blonde Bombshell', 'Flax Flower'
    ],
    green: [
      'Forest Whispers', 'Emerald Isle', 'Mint Breeze', 'Sage Garden', 'Jungle Canopy', 'Lime Splash', 'Olive Grove', 'Moss Carpet',
      'Jade Temple', 'Fern Frond', 'Pine Needle', 'Basil Leaf', 'Eucalyptus Mist', 'Shamrock Luck', 'Avocado Toast', 'Kiwi Kiss',
      'Seaweed Sway', 'Bamboo Forest', 'Chartreuse Charm', 'Malachite Magic', 'Pickle Jar', 'Spinach Smoothie', 'Celery Stick', 'Lettuce Leaf',
      'Pistachio Dream', 'Artichoke Heart', 'Cucumber Cool', 'Pea Pod', 'Ivy League', 'Clover Field', 'Verdant Valley', 'Celadon Serenity'
    ],
    blue: [
      'Ocean Depths', 'Sky Canvas', 'Midnight Blues', 'Sapphire Dreams', 'Arctic Frost', 'Denim Waves', 'Cobalt Storm', 'Teal Lagoon',
      'Navy Nights', 'Cerulean Sky', 'Turquoise Tide', 'Periwinkle Peace', 'Powder Blue', 'Steel Storm', 'Indigo Ink', 'Aquamarine Aura',
      'Cornflower Crown', 'Prussian Pride', 'Baby Blue', 'Electric Blue', 'Royal Reign', 'Ice Crystal', 'Peacock Plume', 'Blueberry Burst',
      'Slate Sophistication', 'Azure Adventure', 'Cyan Celebration', 'Ultramarine Universe', 'Cadet Corps', 'Glacier Glow'
    ],
    purple: [
      'Lavender Fields', 'Violet Storm', 'Plum Twilight', 'Amethyst Cave', 'Grape Harvest', 'Orchid Garden', 'Indigo Night', 'Lilac Mist',
      'Eggplant Elegance', 'Mauve Magic', 'Periwinkle Paradise', 'Wisteria Wonder', 'Mulberry Moon', 'Thistle Thought', 'Heather Hill', 'Iris Inspiration',
      'Byzantium Beauty', 'Magenta Mystique', 'Fuchsia Fantasy', 'Aubergine Autumn', 'Pansy Patch', 'Clematis Climb', 'Hyacinth Heaven', 'Petunia Party',
      'Royal Purple', 'Deep Violet', 'Plum Perfect', 'Grape Vine', 'Lavender Love', 'Purple Rain'
    ],
    pink: [
      'Rose Quartz', 'Blush Paradise', 'Flamingo Dance', 'Cotton Candy', 'Peach Blossom', 'Magenta Magic', 'Fuchsia Fantasy', 'Salmon Sunset',
      'Bubblegum Burst', 'Carnation Celebration', 'Hibiscus Heaven', 'Watermelon Wave', 'Strawberry Shake', 'Cherry Cheek', 'Dusty Rose', 'Hot Pink',
      'Ballet Slipper', 'Powder Puff', 'Tickled Pink', 'Rosy Glow', 'Coral Crush', 'Peony Perfection', 'Azalea Bloom', 'Camellia Kiss',
      'Begonia Beauty', 'Tulip Time', 'Geranium Joy', 'Impatiens Impression', 'Cyclamen Cycle', 'Oleander Oasis'
    ]
  },

  // Nuevas categorías temáticas para mayor variedad
  themes: {
    nature: [
      'Botanical', 'Floral', 'Garden', 'Wilderness', 'Forest', 'Jungle', 'Desert', 'Mountain',
      'Ocean', 'River', 'Lake', 'Meadow', 'Prairie', 'Savanna', 'Tundra', 'Rainforest',
      'Coral Reef', 'Tropical', 'Arctic', 'Alpine', 'Coastal', 'Woodland', 'Grove', 'Valley'
    ],
    seasons: [
      'Spring Awakening', 'Summer Solstice', 'Autumn Harvest', 'Winter Wonderland',
      'Vernal Equinox', 'Midsummer Night', 'Fall Foliage', 'Frozen Landscape',
      'Cherry Blossom', 'Beach Vacation', 'Pumpkin Patch', 'Snow Globe',
      'Easter Morning', 'Tropical Paradise', 'Thanksgiving', 'Christmas Magic'
    ],
    emotions: [
      'Joyful', 'Melancholic', 'Energetic', 'Peaceful', 'Passionate', 'Mysterious',
      'Optimistic', 'Nostalgic', 'Dramatic', 'Romantic', 'Playful', 'Sophisticated',
      'Rebellious', 'Elegant', 'Bold', 'Gentle', 'Fierce', 'Serene',
      'Whimsical', 'Intense', 'Dreamy', 'Powerful', 'Delicate', 'Dynamic'
    ],
    art_movements: [
      'Impressionist', 'Cubist', 'Surreal', 'Abstract', 'Minimalist', 'Pop Art',
      'Art Deco', 'Bauhaus', 'Renaissance', 'Baroque', 'Rococo', 'Neoclassical',
      'Romantic', 'Expressionist', 'Fauvism', 'Dadaist', 'Futurist', 'Constructivist',
      'Pointillist', 'Post-Modern', 'Contemporary', 'Avant-garde', 'Neo-Gothic', 'Art Nouveau'
    ],
    textures: [
      'Velvet', 'Silk', 'Satin', 'Linen', 'Cotton', 'Wool', 'Cashmere', 'Leather',
      'Marble', 'Granite', 'Wood', 'Metal', 'Glass', 'Crystal', 'Pearl', 'Diamond',
      'Rough', 'Smooth', 'Textured', 'Polished', 'Matte', 'Glossy', 'Brushed', 'Hammered'
    ],
    time_periods: [
      'Ancient', 'Medieval', 'Renaissance', 'Victorian', 'Art Deco', 'Mid-Century',
      'Retro', 'Vintage', 'Modern', 'Contemporary', 'Futuristic', 'Timeless',
      'Classic', 'Traditional', 'Progressive', 'Revolutionary', 'Nostalgic', 'Historic',
      'Prehistoric', 'Primordial', 'Eternal', 'Ephemeral', 'Momentary', 'Lasting'
    ],
    cultural: [
      'Mediterranean', 'Scandinavian', 'Asian', 'African', 'Latin', 'Nordic',
      'Bohemian', 'Industrial', 'Urban', 'Rural', 'Cosmopolitan', 'Provincial',
      'Exotic', 'Familiar', 'Foreign', 'Domestic', 'International', 'Local',
      'Global', 'Regional', 'Tribal', 'Modern', 'Traditional', 'Fusion'
    ]
  },
  
  // Nombres basados en saturación - Ampliado significativamente
  saturation: {
    high: [
      'Vibrant', 'Electric', 'Neon', 'Intense', 'Bold', 'Vivid', 'Brilliant', 'Radiant',
      'Explosive', 'Dynamic', 'Energetic', 'Powerful', 'Striking', 'Dramatic', 'Fierce', 'Blazing',
      'Dazzling', 'Luminous', 'Spectacular', 'Magnificent', 'Electrifying', 'Pulsating', 'Sizzling', 'Scorching',
      'Thunderous', 'Volcanic', 'Cosmic', 'Supersonic', 'Hypnotic', 'Mesmerizing'
    ],
    medium: [
      'Balanced', 'Harmonious', 'Refined', 'Elegant', 'Sophisticated', 'Classic', 'Timeless', 'Graceful',
      'Polished', 'Cultured', 'Composed', 'Measured', 'Thoughtful', 'Considered', 'Curated', 'Artisanal',
      'Crafted', 'Tailored', 'Bespoke', 'Premium', 'Distinguished', 'Noble', 'Dignified', 'Majestic',
      'Regal', 'Aristocratic', 'Luxurious', 'Opulent', 'Sumptuous', 'Lavish'
    ],
    low: [
      'Muted', 'Subtle', 'Soft', 'Gentle', 'Pastel', 'Whispered', 'Delicate', 'Understated',
      'Tender', 'Peaceful', 'Serene', 'Tranquil', 'Calm', 'Soothing', 'Relaxing', 'Meditative',
      'Zen', 'Minimalist', 'Pure', 'Clean', 'Fresh', 'Airy', 'Light', 'Ethereal',
      'Dreamy', 'Misty', 'Cloudy', 'Hazy', 'Foggy', 'Gossamer'
    ]
  },
  
  // Nombres basados en luminosidad - Ampliado significativamente
  lightness: {
    dark: [
      'Shadow', 'Midnight', 'Deep', 'Rich', 'Moody', 'Mysterious', 'Dramatic', 'Intense',
      'Shadowy', 'Enigmatic', 'Cryptic', 'Secretive', 'Hidden', 'Veiled', 'Obscure', 'Twilight',
      'Nocturnal', 'Lunar', 'Eclipse', 'Abyssal', 'Cavernous', 'Subterranean', 'Underground', 'Gothic',
      'Victorian', 'Vintage', 'Antique', 'Ancient', 'Timeless', 'Eternal'
    ],
    medium: [
      'Balanced', 'Natural', 'Earthy', 'Warm', 'Cozy', 'Comfortable', 'Inviting', 'Serene',
      'Homey', 'Familiar', 'Intimate', 'Personal', 'Heartwarming', 'Embracing', 'Nurturing', 'Caring',
      'Loving', 'Affectionate', 'Tender', 'Sweet', 'Charming', 'Endearing', 'Delightful', 'Cheerful',
      'Uplifting', 'Inspiring', 'Encouraging', 'Motivating', 'Empowering', 'Energizing'
    ],
    light: [
      'Bright', 'Airy', 'Fresh', 'Clean', 'Luminous', 'Radiant', 'Glowing', 'Celestial',
      'Incandescent', 'Effulgent', 'Resplendent', 'Scintillating', 'Coruscating', 'Blazing', 'Flashing', 'Twinkling',
      'Shimmering', 'Glittering', 'Iridescent', 'Opalescent', 'Pearlescent', 'Crystalline', 'Diamond', 'Solar',
      'Stellar', 'Angelic', 'Heavenly', 'Divine', 'Ethereal', 'Transcendent'
    ]
  },
  
  // Nombres basados en tipo de paleta - Ampliado significativamente
  type: {
    monochromatic: [
      'Monochrome', 'Single Hue', 'Tonal', 'Gradient', 'Spectrum', 'Fade', 'Ombre', 'Cascade',
      'Unified', 'Cohesive', 'Singular', 'Pure', 'Focused', 'Concentrated', 'Distilled', 'Essential',
      'Minimalist', 'Streamlined', 'Simplified', 'Refined', 'Elegant', 'Sophisticated', 'Classic', 'Timeless',
      'Monotone', 'Grayscale', 'Sepia', 'Vintage', 'Retro', 'Nostalgic'
    ],
    complementary: [
      'Contrast', 'Opposition', 'Balance', 'Harmony', 'Duality', 'Tension', 'Dynamic Duo', 'Perfect Pair',
      'Dramatic', 'Powerful', 'Intense', 'Electric', 'Magnetic', 'Explosive', 'Fierce', 'Strong',
      'Polarized', 'Dualistic', 'Binary', 'Opposing', 'Conflicting', 'Equilibrium', 'Bold', 'Striking',
      'Yin Yang', 'Day Night', 'Fire Ice', 'Hot Cold', 'Light Dark', 'Thunder Lightning'
    ],
    analogous: [
      'Neighbors', 'Flow', 'Transition', 'Blend', 'Smooth', 'Adjacent', 'Continuous', 'Seamless',
      'Harmonious', 'Melodic', 'Rhythmic', 'Fluid', 'Organic', 'Natural', 'Gentle', 'Soft',
      'Transitional', 'Progressive', 'Evolutionary', 'Gradual', 'Subtle', 'Nuanced', 'Delicate', 'Tender',
      'Peaceful', 'Serene', 'Calming', 'Soothing', 'Relaxing', 'Meditative'
    ],
    triadic: [
      'Triangle', 'Trinity', 'Triple', 'Triad', 'Three-Way', 'Triangular', 'Tri-Color', 'Triple Harmony',
      'Trio', 'Triumvirate', 'Tripod', 'Geometric', 'Structured', 'Balanced', 'Stable', 'Rhythmic',
      'Mathematical', 'Precise', 'Calculated', 'Measured', 'Proportional', 'Symmetrical', 'Ordered', 'Systematic',
      'Primary', 'Secondary', 'Tertiary', 'Foundation', 'Core', 'Essential'
    ],
    tetradic: [
      'Square', 'Quad', 'Four-Way', 'Rectangle', 'Quadrant', 'Four Corners', 'Tetrad', 'Quartet',
      'Quadruple', 'Fourfold', 'Quaternary', 'Cardinal', 'Compass', 'Directional', 'Cross', 'Complex',
      'Sophisticated', 'Advanced', 'Intricate', 'Elaborate', 'Comprehensive', 'Complete', 'Full', 'Whole',
      'Seasonal', 'Elemental', 'Universal', 'Cosmic', 'Infinite', 'Eternal'
    ]
  },
  
  // Sufijos creativos
  suffixes: ['Collection', 'Palette', 'Series', 'Ensemble', 'Symphony', 'Harmony', 'Spectrum', 'Range', 'Blend', 'Mix', 'Fusion', 'Composition']
};

// Función para obtener el hue dominante
function getDominantHue(color: ColorValue): string {
  const hue = color.hsl.h;
  
  if (hue >= 0 && hue < 30) return 'red';
  if (hue >= 30 && hue < 60) return 'orange';
  if (hue >= 60 && hue < 90) return 'yellow';
  if (hue >= 90 && hue < 150) return 'green';
  if (hue >= 150 && hue < 210) return 'blue';
  if (hue >= 210 && hue < 270) return 'blue';
  if (hue >= 270 && hue < 330) return 'purple';
  return 'pink';
}

// Función para categorizar saturación
function getSaturationLevel(saturation: number): 'high' | 'medium' | 'low' {
  if (saturation > 70) return 'high';
  if (saturation > 30) return 'medium';
  return 'low';
}

// Función para categorizar luminosidad
function getLightnessLevel(lightness: number): 'dark' | 'medium' | 'light' {
  if (lightness < 30) return 'dark';
  if (lightness < 70) return 'medium';
  return 'light';
}

// Función para detectar tipo de paleta
function detectPaletteType(shades: ColorShade[]): string {
  if (shades.length < 2) return 'single';
  
  const hues = shades.map(shade => shade.color.hsl.h);
  const uniqueHues = [...new Set(hues.map(h => Math.round(h / 30) * 30))];
  
  if (uniqueHues.length === 1) return 'monochromatic';
  if (uniqueHues.length === 2) {
    const diff = Math.abs(uniqueHues[0] - uniqueHues[1]);
    if (diff > 150 && diff < 210) return 'complementary';
  }
  if (uniqueHues.length === 3) return 'triadic';
  if (uniqueHues.length === 4) return 'tetradic';
  
  // Verificar si son colores análogos (cercanos en el círculo cromático)
  const sortedHues = uniqueHues.sort((a, b) => a - b);
  let isAnalogous = true;
  for (let i = 1; i < sortedHues.length; i++) {
    const diff = sortedHues[i] - sortedHues[i - 1];
    if (diff > 60) {
      isAnalogous = false;
      break;
    }
  }
  
  return isAnalogous ? 'analogous' : 'custom';
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función principal para generar nombres de paleta - Mejorada significativamente
export function generatePaletteName(shades: ColorShade[]): string {
  if (!shades || shades.length === 0) return 'Empty Palette';
  
  // Analizar el color dominante (primer color o el más saturado)
  const dominantShade = shades.reduce((prev, current) => 
    current.color.hsl.s > prev.color.hsl.s ? current : prev
  );
  
  const dominantHue = getDominantHue(dominantShade.color);
  const saturationLevel = getSaturationLevel(dominantShade.color.hsl.s);
  const lightnessLevel = getLightnessLevel(dominantShade.color.hsl.l);
  const paletteType = detectPaletteType(shades);
  
  // Calcular saturación y luminosidad promedio
  const avgSaturation = shades.reduce((sum, shade) => sum + shade.color.hsl.s, 0) / shades.length;
  const avgLightness = shades.reduce((sum, shade) => sum + shade.color.hsl.l, 0) / shades.length;
  
  // Obtener elementos aleatorios de las nuevas categorías temáticas
  const getThemeElement = (category: keyof typeof PALETTE_NAMES.themes) => {
    return getRandomElement(PALETTE_NAMES.themes[category] || []);
  };
  
  // Función auxiliar para nombres de respaldo
  const generateFallbackName = (): string => {
    const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
    const satNames = PALETTE_NAMES.saturation[saturationLevel];
    const hueName = getRandomElement(hueNames);
    const satName = getRandomElement(satNames);
    return `${satName} ${hueName}`;
  };
  
  // Generar nombre basado en diferentes estrategias ampliadas
  const strategies = [
    // Estrategias originales mejoradas
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      return `${getRandomElement(satNames)} ${getRandomElement(hueNames)}`;
    },
    
    () => {
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${getRandomElement(lightNames)} ${getRandomElement(hueNames)}`;
    },
    
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${getRandomElement(hueNames)} ${suffix}`;
    },
    
    // Nuevas estrategias temáticas
    () => {
      const nature = getThemeElement('nature');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${nature} ${hueName}`;
    },
    
    () => {
      const emotion = getThemeElement('emotions');
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const satName = getRandomElement(satNames);
      return `${emotion} ${satName}`;
    },
    
    () => {
      const artMovement = getThemeElement('art_movements');
      const typeNames = PALETTE_NAMES.type[paletteType as keyof typeof PALETTE_NAMES.type] || ['Custom'];
      const typeName = getRandomElement(typeNames);
      return `${artMovement} ${typeName}`;
    },
    
    () => {
      const texture = getThemeElement('textures');
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      const lightName = getRandomElement(lightNames);
      return `${texture} ${lightName}`;
    },
    
    () => {
      const timePeriod = getThemeElement('time_periods');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${timePeriod} ${hueName}`;
    },
    
    () => {
      const cultural = getThemeElement('cultural');
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const satName = getRandomElement(satNames);
      return `${cultural} ${satName}`;
    },
    
    // Estrategias estacionales específicas
    () => {
      const season = getThemeElement('seasons');
      return season;
    },
    
    // Combinaciones complejas de 3 elementos
    () => {
      const emotion = getThemeElement('emotions');
      const texture = getThemeElement('textures');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${emotion} ${texture} ${hueName}`;
    },
    
    () => {
      const nature = getThemeElement('nature');
      const artMovement = getThemeElement('art_movements');
      return `${nature} ${artMovement}`;
    },
    
    () => {
      const cultural = getThemeElement('cultural');
      const timePeriod = getThemeElement('time_periods');
      const typeNames = PALETTE_NAMES.type[paletteType as keyof typeof PALETTE_NAMES.type] || ['Custom'];
      const typeName = getRandomElement(typeNames);
      return `${cultural} ${timePeriod} ${typeName}`;
    },
    
    // Estrategia 4: Combinación compleja
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      
      if (avgSaturation > 60 && avgLightness < 40) {
        return `${getRandomElement(lightNames)} ${getRandomElement(hueNames)}`;
      } else if (avgSaturation < 30) {
        return `${getRandomElement(satNames)} ${getRandomElement(hueNames)}`;
      } else {
        return `${getRandomElement(hueNames)}`;
      }
    },
    
    // Estrategias específicas por tipo de paleta
    () => {
      if (paletteType === 'monochromatic') {
        const texture = getThemeElement('textures');
        const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
        const lightName = getRandomElement(lightNames);
        return `${texture} ${lightName} Monochrome`;
      }
      return generateFallbackName();
    },
    
    () => {
      if (paletteType === 'complementary') {
        const emotion = getThemeElement('emotions');
        return `${emotion} Contrast`;
      }
      return generateFallbackName();
    },
    
    // Estrategia 5: Nombres únicos basados en combinaciones específicas
    () => {
      if (paletteType === 'monochromatic' && avgLightness > 70) {
        return `Soft ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])} Gradient`;
      }
      if (paletteType === 'complementary') {
        return `${getRandomElement(['Dynamic', 'Bold', 'Striking'])} Contrast`;
      }
      if (avgSaturation > 80) {
        return `${getRandomElement(['Electric', 'Neon', 'Vibrant'])} ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])}`;
      }
      if (avgLightness < 25) {
        return `${getRandomElement(['Midnight', 'Shadow', 'Deep'])} ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])}`;
      }
      
      return `${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])} ${getRandomElement(PALETTE_NAMES.suffixes)}`;
    },
    
    // Estrategia simple con solo hue
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return getRandomElement(hueNames);
    }
  ];
  
  // Seleccionar estrategia basada en características de la paleta
  let selectedStrategy;
  if (shades.length === 1) {
    selectedStrategy = strategies[0]; // Simple para un solo color
  } else if (paletteType === 'monochromatic') {
    selectedStrategy = strategies[Math.random() > 0.5 ? 0 : 3]; // Enfoque en saturación/luminosidad
  } else if (paletteType === 'complementary') {
    selectedStrategy = strategies[4]; // Estrategia especial para complementarios
  } else {
    selectedStrategy = getRandomElement(strategies); // Aleatorio para otros casos
  }
  
  const result = selectedStrategy();
  
  // Verificar que el resultado no esté vacío
  return result && result.trim() !== '' ? result : generateFallbackName();
}

// Función para generar múltiples opciones de nombres
export function generateMultiplePaletteNames(shades: ColorShade[], count: number = 3): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 3;
  
  while (names.size < count && attempts < maxAttempts) {
    names.add(generatePaletteName(shades));
    attempts++;
  }
  
  return Array.from(names);
}

// Función para obtener un nombre consistente basado en hash de colores
export function getConsistentPaletteName(shades: ColorShade[]): string {
  if (!shades || shades.length === 0) return 'Empty Palette';
  
  // Crear un hash simple basado en los colores
  const colorString = shades.map(shade => shade.color.hex).join('');
  let hash = 0;
  for (let i = 0; i < colorString.length; i++) {
    const char = colorString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Usar el hash para seleccionar elementos de manera consistente
  const absHash = Math.abs(hash);
  const dominantShade = shades[0];
  const dominantHue = getDominantHue(dominantShade.color);
  const saturationLevel = getSaturationLevel(dominantShade.color.hsl.s);
  const lightnessLevel = getLightnessLevel(dominantShade.color.hsl.l);
  
  const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
  const satNames = PALETTE_NAMES.saturation[saturationLevel];
  const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
  const suffixes = PALETTE_NAMES.suffixes;
  
  const selectedHue = hueNames[absHash % hueNames.length];
  const selectedSat = satNames[absHash % satNames.length];
  const selectedLight = lightNames[absHash % lightNames.length];
  const selectedSuffix = suffixes[absHash % suffixes.length];
  
  // Seleccionar formato basado en hash
  const formatIndex = absHash % 4;
  switch (formatIndex) {
    case 0:
      return `${selectedSat} ${selectedHue}`;
    case 1:
      return `${selectedLight} ${selectedHue}`;
    case 2:
      return `${selectedHue} ${selectedSuffix}`;
    default:
      return selectedHue;
  }
}