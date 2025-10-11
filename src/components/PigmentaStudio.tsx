import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Palette, Eye, Download, History, Images, Pencil, Menu, X } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { AIPromptGenerator } from './AIPromptGenerator';
import { SemanticPaletteEditor } from './SemanticPaletteEditor';
import { UITemplatePreview } from './UITemplatePreview';
import { PaletteGallery } from './PaletteGallery';
import { StudioExportSystem } from './StudioExportSystem';
import { StudioModeSwitch } from './StudioModeSwitch';
import { Footer } from './Footer';
import { cn } from "../lib/utils";

// Helper function to create semantic palette structure
const createSemanticPalette = (
  id: string,
  name: string,
  prompt: string,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  },
  style: 'modern' | 'classic' | 'vibrant' | 'minimal',
  tags: string[]
) => ({
  id,
  name,
  prompt,
  colors: {
    primary: { 
      name: `${name} Primary`,
      base: colors.primary,
      variations: { 200: colors.primary + '80', 300: colors.primary + '60' },
      description: `Primary color for ${name}`
    },
    secondary: { 
      name: `${name} Secondary`,
      base: colors.secondary,
      variations: { 200: colors.secondary + '80', 300: colors.secondary + '60' },
      description: `Secondary color for ${name}`
    },
    accent: { 
      name: `${name} Accent`,
      base: colors.accent,
      variations: { 200: colors.accent + '80', 300: colors.accent + '60' },
      description: `Accent color for ${name}`
    },
    text: { 
      name: `${name} Text`,
      base: colors.text,
      variations: { 200: colors.text + '80', 300: colors.text + '60' },
      description: `Text color for ${name}`
    },
    background: { 
      name: `${name} Background`,
      base: colors.background,
      variations: { 200: colors.background + '80', 300: colors.background + '60' },
      description: `Background color for ${name}`
    }
  },
  metadata: {
    style,
    createdAt: new Date().toISOString(),
    tags,
    harmony: 'complementary' as const,
    accessibility: {
      wcagAA: true,
      contrastRatios: {}
    },
    isAIGenerated: false
  }
});

export const PigmentaStudio: React.FC = () => {
  const { isStudioMode, toggleStudioMode, activeView, setActiveView } = useStudioStore();
  const { loadPredefinedPalettes, currentPalette, savedPalettes, setCurrentPalette } = useAIPaletteStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Load predefined palettes on mount
    loadPredefinedPalettes();
  }, [loadPredefinedPalettes]);

  // Paletas adicionales para Studio (las 3 originales ya están en el store)
  const additionalPalettes = [
    createSemanticPalette(
      'sunset-paradise',
      'Sunset Paradise',
      'Warm sunset colors with orange and pink tones',
      {
        primary: '#F97316',
        secondary: '#FB7185',
        accent: '#FBBF24',
        text: '#78716C',
        background: '#FEF7ED'
      },
      'modern',
      ['sunset', 'warm', 'orange']
    ),
    createSemanticPalette(
      'ocean-depths',
      'Ocean Depths',
      'Deep ocean blues with aqua accents',
      {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#10B981',
        text: '#64748B',
        background: '#F0F9FF'
      },
      'minimal',
      ['ocean', 'blue', 'aqua']
    ),
    createSemanticPalette(
      'forest-whisper',
      'Forest Whisper',
      'Natural forest greens with earthy tones',
      {
        primary: '#16A34A',
        secondary: '#059669',
        accent: '#84CC16',
        text: '#78716C',
        background: '#F0FDF4'
      },
      'classic',
      ['forest', 'green', 'natural']
    ),
    createSemanticPalette(
      'cherry-blossom',
      'Cherry Blossom',
      'Soft pink cherry blossom with spring accents',
      {
        primary: '#F472B6',
        secondary: '#FB7185',
        accent: '#34D399',
        text: '#9CA3AF',
        background: '#FDF2F8'
      },
      'minimal',
      ['cherry', 'pink', 'spring']
    ),
    createSemanticPalette(
      'midnight-galaxy',
      'Midnight Galaxy',
      'Dark cosmic theme with purple and indigo',
      {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#C0C7D0',
        text: '#4B5563',
        background: '#111827'
      },
      'minimal',
      ['galaxy', 'dark', 'cosmic']
    ),
    createSemanticPalette(
      'golden-hour',
      'Golden Hour',
      'Warm golden sunset with amber tones',
      {
        primary: '#F59E0B',
        secondary: '#F97316',
        accent: '#FBBF24',
        text: '#92400E',
        background: '#FFFBEB'
      },
      'vibrant',
      ['golden', 'warm', 'sunset']
    ),
    createSemanticPalette(
      'arctic-frost',
      'Arctic Frost',
      'Cool arctic blues with icy whites',
      {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#E5E7EB',
        text: '#6B7280',
        background: '#F8FAFC'
      },
      'minimal',
      ['arctic', 'frost', 'cool']
    ),
    createSemanticPalette(
      'tropical-vibes',
      'Tropical Vibes',
      'Vibrant tropical colors with lime and orange',
      {
        primary: '#84CC16',
        secondary: '#F97316',
        accent: '#06B6D4',
        text: '#65A30D',
        background: '#F7FEE7'
      },
      'vibrant',
      ['tropical', 'vibrant', 'lime']
    ),
    createSemanticPalette(
      'autumn-leaves',
      'Autumn Leaves',
      'Warm autumn colors with orange and red leaves',
      {
        primary: '#EA580C',
        secondary: '#DC2626',
        accent: '#F59E0B',
        text: '#92400E',
        background: '#FEF7ED'
      },
      'classic',
      ['autumn', 'leaves', 'warm']
    ),
    createSemanticPalette(
      'neon-dreams',
      'Neon Dreams',
      'Electric neon colors with cyberpunk vibes',
      {
        primary: '#FF0080',
        secondary: '#00FFFF',
        accent: '#FF6B35',
        text: '#1F2937',
        background: '#0F172A'
      },
      'vibrant',
      ['neon', 'cyberpunk', 'electric']
    ),
    createSemanticPalette(
      'minimalist-mono',
      'Minimalist Mono',
      'Clean minimalist grayscale palette',
      {
        primary: '#374151',
        secondary: '#6B7280',
        accent: '#9CA3AF',
        text: '#D1D5DB',
        background: '#F9FAFB'
      },
      'minimal',
      ['minimalist', 'mono', 'clean']
    ),
    createSemanticPalette(
      'retro-gaming',
      'Retro Gaming',
      'Nostalgic retro gaming colors with green and blue',
      {
        primary: '#22C55E',
        secondary: '#3B82F6',
        accent: '#EF4444',
        text: '#1F2937',
        background: '#111827'
      },
      'classic',
      ['retro', 'gaming', 'green']
    ),
    createSemanticPalette(
      'pastel-heaven',
      'Pastel Heaven',
      'Soft pastel colors with yellow and purple',
      {
        primary: '#FBBF24',
        secondary: '#A78BFA',
        accent: '#FB7185',
        text: '#D1D5DB',
        background: '#FEFEFE'
      },
      'minimal',
      ['pastel', 'soft', 'heaven']
    ),
    createSemanticPalette(
      'corporate-blue',
      'Corporate Blue',
      'Professional corporate blue palette',
      {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        text: '#6B7280',
        background: '#F8FAFC'
      },
      'modern',
      ['corporate', 'blue', 'professional']
    ),
    createSemanticPalette(
      'earthy-tones',
      'Earthy Tones',
      'Natural earthy brown and green tones',
      {
        primary: '#92400E',
        secondary: '#A16207',
        accent: '#65A30D',
        text: '#78716C',
        background: '#FEFDF8'
      },
      'classic',
      ['earthy', 'brown', 'natural']
    ),
    createSemanticPalette(
      'cyberpunk',
      'Cyberpunk',
      'Electric cyberpunk colors with neon accents',
      {
        primary: '#FF00FF',
        secondary: '#00FFFF',
        accent: '#FFFF00',
        text: '#1F2937',
        background: '#0F0F0F'
      },
      'vibrant',
      ['cyberpunk', 'neon', 'electric']
    ),
    createSemanticPalette(
      'vintage-film',
      'Vintage Film',
      'Classic vintage film colors with amber and green',
      {
        primary: '#A16207',
        secondary: '#059669',
        accent: '#DC2626',
        text: '#78716C',
        background: '#F5F5DC'
      },
      'classic',
      ['vintage', 'film', 'classic']
    ),
    createSemanticPalette(
      'spring-garden',
      'Spring Garden',
      'Fresh spring garden colors with green and pink',
      {
        primary: '#22C55E',
        secondary: '#FB7185',
        accent: '#FBBF24',
        text: '#65A30D',
        background: '#F0FDF4'
      },
      'modern',
      ['spring', 'garden', 'fresh']
    ),
    createSemanticPalette(
      'desert-sand',
      'Desert Sand',
      'Warm desert sand colors with orange and amber',
      {
        primary: '#F59E0B',
        secondary: '#EA580C',
        accent: '#92400E',
        text: '#78716C',
        background: '#FEF3C7'
      },
      'modern',
      ['desert', 'sand', 'warm']
    ),
    createSemanticPalette(
      'royal-purple',
      'Royal Purple',
      'Elegant royal purple with gold accents',
      {
        primary: '#7C3AED',
        secondary: '#F59E0B',
        accent: '#C0C7D0',
        text: '#6B7280',
        background: '#FAF5FF'
      },
      'classic',
      ['royal', 'purple', 'elegant']
    ),
    createSemanticPalette(
      'fresh-mint',
      'Fresh Mint',
      'Cool fresh mint colors with cyan',
      {
        primary: '#10B981',
        secondary: '#06B6D4',
        accent: '#E5E7EB',
        text: '#6B7280',
        background: '#F0FDF4'
      },
      'modern',
      ['fresh', 'mint', 'cool']
    ),
    createSemanticPalette(
      'fire-ice',
      'Fire & Ice',
      'Contrasting fire red and ice blue',
      {
        primary: '#DC2626',
        secondary: '#0EA5E9',
        accent: '#F3F4F6',
        text: '#374151',
        background: '#FEFEFE'
      },
      'vibrant',
      ['fire', 'ice', 'contrast']
    )
  ];

  // Combine predefined palettes with additional ones
  const allPalettes = [...savedPalettes, ...additionalPalettes];

  const navigationItems = [
    {
      id: 'generator' as const,
      label: 'New',
      icon: Sparkles,
      description: 'Generate palettes with AI'
    },
    {
      id: 'gallery' as const,
      label: 'Gallery',
      icon: Images,
      description: 'Browse saved palettes'
    },
    {
      id: 'preview' as const,
      label: 'Views',
      icon: Eye,
      description: 'Preview in real UIs',
      disabled: !currentPalette
    },
    {
      id: 'editor' as const,
      label: 'Edit',
      icon: Pencil,
      description: 'Edit semantic colors',
      disabled: !currentPalette
    },
    {
      id: 'export' as const,
      label: 'Download',
      icon: Download,
      description: 'Export your palette',
      disabled: !currentPalette
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'generator':
        return <AIPromptGenerator />;
      case 'editor':
        return currentPalette ? <SemanticPaletteEditor /> : <EmptyState type="editor" />;
      case 'preview':
        return currentPalette ? <UITemplatePreview /> : <EmptyState type="preview" />;
      case 'gallery':
        return <PaletteGallery />;
      case 'export':
        return currentPalette ? <StudioExportSystem /> : <EmptyState type="export" />;
      default:
        return <AIPromptGenerator />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ backgroundColor: '#07090B' }}>
      {/* Header - Estilo BairesDev con colores Pigmenta */}
      <motion.header
        className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50"
        style={{ backgroundColor: '#071019' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Mobile Layout - 2 rows */}
        <div className="lg:hidden">
          {/* Primera fila: Menu + Logo + Toggle */}
          <div className="flex items-center justify-between px-3 py-2 h-14">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 active:bg-white/20 transition-all duration-200 min-w-[44px] min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>

            {/* Logo */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, duration: 0.3 }}
            >
              <img
                src="/logo_studio.png"
                alt="Pigmenta Studio"
                className="w-7 h-7 rounded-lg object-contain"
              />
            </motion.div>

            {/* Toggle único móvil */}
            <motion.button
              onClick={toggleStudioMode}
              className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 active:bg-white/20 transition-all duration-200 min-w-[44px] min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {isStudioMode ? (
                <Palette className="w-6 h-6 text-white/80" />
              ) : (
                <Sparkles className="w-6 h-6 text-[#23AAD7]" />
              )}
            </motion.button>
          </div>

          {/* Segunda fila: Navigation completa */}
          <div className="px-2 py-2 border-t border-white/10">
            <div className="grid grid-cols-5 gap-1">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isDisabled = item.disabled;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => !isDisabled && setActiveView(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[#23AAD7]/50 active:scale-95",
                      "min-h-[48px]",
                      isActive
                        ? "text-white bg-[#23AAD7]/20 border border-[#23AAD7]/50 shadow-lg shadow-[#23AAD7]/20"
                        : isDisabled
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white/80 hover:text-white hover:bg-white/15 active:bg-white/20"
                    )}
                    disabled={isDisabled}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-[#23AAD7]" : isDisabled ? "text-white/30" : "text-white/80"
                    )} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Layout - mantener actual */}
        <div className="hidden lg:block px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16 gap-4">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, duration: 0.3 }}
              >
                <img
                  src="/logo_studio.png"
                  alt="Pigmenta Studio"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">Pigmenta Studio</h1>
                </div>
              </motion.div>
            </div>

            {/* Center Section - Navigation Options */}
            <div className="flex items-center justify-center gap-1.5">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isDisabled = item.disabled;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => !isDisabled && setActiveView(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[#23AAD7]/50 active:scale-95",
                      isActive
                        ? "text-white bg-[#23AAD7]/20 border border-[#23AAD7]/50 shadow-lg shadow-[#23AAD7]/20"
                        : isDisabled
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white/80 hover:text-white hover:bg-white/15 active:bg-white/20"
                    )}
                    disabled={isDisabled}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  >
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-[#23AAD7]" : isDisabled ? "text-white/30" : "text-white/80"
                    )} />
                    <span>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right Section - StudioModeSwitch */}
            <div className="flex justify-end">
              <StudioModeSwitch />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Solo para paletas predefinidas */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.div
              className={cn(
                "bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col",
                "lg:w-48 w-64 lg:relative absolute inset-y-0 left-0 z-40"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
          {/* Header del sidebar */}
          <div className="p-3 md:p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 md:w-4 md:h-4 text-[#23AAD7]" />
              <h3 className="text-base md:text-sm font-medium text-white">Palettes</h3>
            </div>
          </div>

          {/* Lista completa de paletas - 70% del espacio */}
          <div className="flex-1 p-2.5 md:p-2 overflow-y-auto">
            <div className="space-y-2.5 md:space-y-2">
              {/* Combine additional palettes with saved palettes */}
              {[...additionalPalettes, ...savedPalettes].map((palette, index) => {
                const isSelected = currentPalette?.id === palette.id;

                // Extraer los colores principales de la paleta
                const mainColors = [
                  palette.colors?.primary?.base || '#3B82F6',
                  palette.colors?.accent?.base || '#F59E0B',
                  palette.colors?.text?.base || '#6B7280',
                  palette.colors?.background?.base || '#F3F4F6'
                ].filter(Boolean);

                return (
                  <motion.button
                    key={palette.id}
                    onClick={() => setCurrentPalette(palette)}
                    className={cn(
                      "w-full bg-white/10 rounded-xl p-3 md:p-2 border transition-all duration-200 text-left",
                      "hover:bg-white/15 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#23AAD7]/50",
                      "active:scale-[0.98] active:bg-white/20 min-h-[60px] md:min-h-0",
                      isSelected
                        ? "border-[#23AAD7] bg-[#23AAD7]/15 ring-2 ring-[#23AAD7]/40 shadow-lg shadow-[#23AAD7]/20"
                        : "border-white/20 hover:border-white/40"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.03, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Círculos de colores como en la referencia */}
                    <div className="flex gap-1.5 md:gap-1 mb-2 md:mb-1.5 justify-center">
                      {mainColors.slice(0, 5).map((color, colorIndex) => (
                        <motion.div
                          key={colorIndex}
                          className="w-6 h-6 md:w-4 md:h-4 rounded-full border border-white/30 shadow-md"
                          style={{ backgroundColor: color }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.03 + colorIndex * 0.02, duration: 0.2 }}
                        />
                      ))}
                    </div>

                    {/* Nombre de la paleta */}
                    <p className={cn(
                      "text-xs md:text-[10px] font-medium text-center truncate",
                      isSelected ? "text-white" : "text-white/80"
                    )}>
                      {palette.name}
                    </p>

                    {/* Indicador de selección */}
                    {isSelected && (
                      <motion.div
                        className="mt-1.5 md:mt-1 w-full h-0.5 bg-[#23AAD7] rounded-full shadow-md shadow-[#23AAD7]/50"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                );
              })}
              
              {/* Mensaje si no hay paletas */}
              {[...additionalPalettes, ...savedPalettes].length === 0 && (
                <motion.div
                  className="text-center py-8 md:py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <p className="text-white/60 text-sm md:text-xs mb-1.5 md:mb-1">No palettes yet</p>
                  <p className="text-white/40 text-xs md:text-[10px]">Generate your first palette</p>
                </motion.div>
              )}
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay para cerrar sidebar en mobile */}
        {isSidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - Estilo BairesDev con colores Pigmenta */}
        <motion.div
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* Content Area */}
          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ type: string }> = ({ type }) => {
  const messages = {
    editor: {
      title: "No Palette Selected",
      description: "Generate or select a palette to start editing semantic colors",
      action: "Go to AI Generator"
    },
    preview: {
      title: "No Palette to Preview",
      description: "Create a palette first to see how it looks in real UI templates",
      action: "Generate Palette"
    },
    export: {
      title: "No Palette to Export",
      description: "Select or generate a palette to export in various formats",
      action: "Browse Gallery"
    }
  };

  const message = messages[type as keyof typeof messages];
  const { setActiveView } = useStudioStore();

  return (
    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
      <motion.div
        className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, duration: 0.3 }}
      >
        <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
      </motion.div>
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">{message.title}</h3>
      <p className="text-white/60 mb-6 sm:mb-8 max-w-md text-base sm:text-lg">{message.description}</p>
      <motion.button
        onClick={() => setActiveView('generator')}
        className="px-6 py-2.5 sm:px-8 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 text-base sm:text-lg active:scale-95 min-h-[44px]"
        style={{
          backgroundColor: '#23AAD7'
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#20A0CB'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#23AAD7'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {message.action}
      </motion.button>
    </div>
  );
};