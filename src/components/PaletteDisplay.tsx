import { useState, useCallback, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, Palette, Heart, Grid3X3, List, Minus, PieChart, ChevronDown, ChevronUp, Network } from 'lucide-react';
import { NodeCanvas } from './NodeCanvas';
import { useAppStore } from '../stores/useAppStore';
import { NotesPanel } from './NotesPanel';
import { convertColor, getContrastRatio, isLightColor } from '../utils/colorUtils';
import { getConsistentPaletteName } from '../utils/paletteNaming';
import type { ColorFormat } from '../types';
import type { ColorShade } from '../types';
import { DESIGN_TOKENS, DARK_THEME_COLORS } from '../constants/designTokens';

type ViewMode = 'grid' | 'list' | 'gradient' | 'donut' | 'nodes';

interface ShadeCardProps {
  shade: ColorShade;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onCopy: (shade: ColorShade) => void;
}

const ShadeCard = forwardRef<HTMLDivElement, ShadeCardProps>(({ shade, index, isActive, onClick, onCopy }, ref) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colorFormat: ColorFormat = 'rgb'; // Default to rgb format for display
  
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onCopy(shade);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shade, onCopy]);

  const textColor = isLightColor(shade.color) ? '#000000' : '#ffffff';
  const contrastRatio = getContrastRatio(shade.color, { hex: textColor, rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 }, oklch: { l: 0, c: 0, h: 0 } });
  const isAccessible = contrastRatio >= 4.5;

  return (
    <motion.div
      ref={ref}
      className={`relative group cursor-pointer overflow-hidden ${
        isActive ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
      }`}
      style={{
        backgroundColor: shade.color.hex,
        borderRadius: '12px',
        aspectRatio: '1'
      }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {isLightColor(shade.color) && (
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      )}

      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              className="text-xs font-medium opacity-80"
              style={{ color: textColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              {shade.name}
            </motion.div>
            <motion.div
              className="text-xs font-mono mt-1 opacity-60"
              style={{ color: textColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.8 : 0.6 }}
            >
              {convertColor(shade.color, colorFormat)}
            </motion.div>
          </div>
          
          <AnimatePresence>
            {isHovered && (
              <motion.button
                className="p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200"
                style={{
                  backgroundColor: `${textColor}20`,
                  color: textColor
                }}
                onClick={handleCopy}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <motion.div
              className="text-xs font-mono opacity-60"
              style={{ color: textColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.8 : 0.6 }}
            >
              {shade.color.hex.toUpperCase()}
            </motion.div>
            {isHovered && (
              <motion.div
                className="text-xs mt-1 flex items-center space-x-1"
                style={{ color: textColor }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Eye className="w-3 h-3" />
                <span>{contrastRatio.toFixed(1)}</span>
                {isAccessible && <span className="text-green-400">✓</span>}
              </motion.div>
            )}
          </div>
          
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="p-1.5 rounded-full"
                style={{
                  backgroundColor: `${textColor}20`,
                  color: textColor
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <Heart className="w-3 h-3 fill-current" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${textColor}10, transparent 50%, ${textColor}05)`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
});

ShadeCard.displayName = 'ShadeCard';

export const PaletteDisplay = () => {
  const { 
    currentPalette: palette, 
    settings, 
    theme,
    activeShade,
    setActiveShade,
    shouldAnimatePalette
  } = useAppStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredShade, setHoveredShade] = useState<number | null>(null);
  const [showDonutLegend, setShowDonutLegend] = useState(false);
  
  const colorFormat = settings.exportPreferences.format === 'css' ? 'hsl' : 'rgb';
  const isDark = theme === 'dark';
  
  // Generar nombre dinámico de la paleta
  const paletteName = useMemo(() => {
    if (!palette || palette.shades.length === 0) return 'Color Palette';
    return getConsistentPaletteName(palette.shades);
  }, [palette]);

  const handleShadeClick = useCallback((shade: ColorShade, index: number) => {
    setActiveShade(index);
  }, [setActiveShade]);

  const handleCopyShade = useCallback(async (shade: ColorShade, index: number) => {
    try {
      // Siempre copiar el valor hexadecimal
      await navigator.clipboard.writeText(shade.color.hex);
      setActiveShade(index);
      setTimeout(() => setActiveShade(null), 1000);
    } catch (error) {
      console.error('Error copying color:', error);
    }
  }, [setActiveShade]);

  if (!palette || palette.shades.length === 0) {
    return (
      <motion.div
        className="rounded-2xl shadow-lg border p-12"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.primary
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-center">
          <Palette 
            className="w-12 h-12 mx-auto mb-4" 
            style={{ color: isDark ? DARK_THEME_COLORS.surface.tertiary : '#9ca3af' }}
          />
          <h3 
            className="text-lg font-medium"
            style={{ color: DESIGN_TOKENS.colors.text.primary }}
          >
            No Palette Generated
          </h3>
          <p 
            className="mt-2"
            style={{ color: DESIGN_TOKENS.colors.text.muted }}
          >
            Select a base color to generate your color palette.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl shadow-lg border overflow-hidden"
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.primary
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div 
        className="px-6 py-4 border-b"
        style={{ borderColor: DESIGN_TOKENS.colors.border.primary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette 
              className="w-5 h-5" 
              style={{ color: isDark ? DARK_THEME_COLORS.surface.tertiary : '#4b5563' }}
            />
            <h2 
              className="text-lg font-semibold italic"
              style={{ 
                color: isDark ? DARK_THEME_COLORS.text.primary : '#111827',
                fontStyle: 'italic'
              }}
            >
              {paletteName}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 p-1 rounded-lg" style={{ backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard }}>
              {[
                { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
                { mode: 'list' as ViewMode, icon: List, label: 'List' },
                { mode: 'gradient' as ViewMode, icon: Minus, label: 'Gradient' },
                { mode: 'donut' as ViewMode, icon: PieChart, label: 'Donut' },
                { mode: 'nodes' as ViewMode, icon: Network, label: 'Nodes' }
              ].map(({ mode, icon: Icon, label }) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-2 rounded-md transition-all duration-200 relative"
                  style={{
                    color: viewMode === mode 
                      ? (isDark ? DARK_THEME_COLORS.text.primary : '#111827')
                      : (isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280'),
                    backgroundColor: viewMode === mode 
                      ? (isDark ? DARK_THEME_COLORS.accent.primary : '#ffffff')
                      : 'transparent'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={label}
                >
                  {viewMode === mode && (
                    <motion.div
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: isDark ? DARK_THEME_COLORS.accent.primary : '#ffffff' }}
                      layoutId="activeViewMode"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                </motion.button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
                  color: DESIGN_TOKENS.colors.text.muted
                }}
              >
                {palette.shades.length} shades
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span 
                className="text-sm capitalize"
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                {palette.algorithm}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${palette.name}-${palette.shades.length}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {viewMode === 'grid' && (
              <div 
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(palette.shades.length, 6)}, 1fr)`
                }}
              >
                {palette.shades.map((shade, index) => (
                  <motion.div
                    key={`shade-${shade.name}-${shade.value}`}
                    className="group relative cursor-pointer"
                    onClick={() => setActiveShade(index)}
                    initial={shouldAnimatePalette ? { opacity: 0, y: 20 } : false}
                    animate={shouldAnimatePalette ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={shouldAnimatePalette ? { 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    } : { duration: 0 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShadeCard
                      shade={shade}
                      index={index}
                      isActive={activeShade === index}
                      onClick={() => handleShadeClick(shade, index)}
                      onCopy={(shade) => handleCopyShade(shade, index)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {palette.shades.map((shade, index) => {
                  const textColor = isLightColor(shade.color) ? '#000000' : '#ffffff';
                  const contrastRatio = getContrastRatio(shade.color, { hex: textColor, rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 }, oklch: { l: 0, c: 0, h: 0 } });
                  const isHovered = hoveredShade === index;
                  
                  return (
                    <motion.div
                      key={`list-${shade.name}-${shade.value}`}
                      className="flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: isHovered 
                          ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                          : 'transparent',
                        border: `1px solid ${isHovered 
                          ? (isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0')
                          : 'transparent'}`
                      }}
                      onClick={() => handleCopyShade(shade, index)}
                      onHoverStart={() => setHoveredShade(index)}
                      onHoverEnd={() => setHoveredShade(null)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-16 h-16 rounded-lg shadow-sm border-2"
                        style={{ 
                          backgroundColor: shade.color.hex,
                          borderColor: isDark ? DARK_THEME_COLORS.border.subtle : '#ffffff'
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span 
                            className="text-lg font-semibold"
                            style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                          >
                            {shade.name}
                          </span>
                          <span 
                            className="text-sm font-mono px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: isDark ? DARK_THEME_COLORS.surface.tertiary : '#f1f5f9',
                              color: isDark ? DARK_THEME_COLORS.text.secondary : '#475569'
                            }}
                          >
                            {shade.color.hex.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span 
                            className="text-sm font-mono"
                            style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                          >
                            {convertColor(shade.color, colorFormat)}
                          </span>
                          <span 
                            className="text-sm flex items-center space-x-1"
                            style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Contrast: {contrastRatio.toFixed(1)}</span>
                            {contrastRatio >= 4.5 && <span className="text-green-500">✓</span>}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: isHovered 
                            ? (isDark ? DARK_THEME_COLORS.accent.primary : '#e2e8f0')
                            : 'transparent',
                          color: isDark ? DARK_THEME_COLORS.text.secondary : '#475569'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {viewMode === 'gradient' && (
              <div className="space-y-4">
                <div 
                  className="h-24 rounded-xl overflow-hidden shadow-lg relative cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${palette.shades.map(shade => shade.color.hex).join(', ')})`
                  }}
                >
                  {palette.shades.map((shade, index) => {
                    const width = 100 / palette.shades.length;
                    const left = width * index;
                    const isHovered = hoveredShade === index;
                    
                    return (
                      <motion.div
                        key={`gradient-${shade.name}`}
                        className="absolute inset-y-0 cursor-pointer group"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`
                        }}
                        onClick={() => handleCopyShade(shade, index)}
                        onHoverStart={() => setHoveredShade(index)}
                        onHoverEnd={() => setHoveredShade(null)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: '#ffffff'
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="text-center">
                                <div className="text-sm font-semibold">{shade.name}</div>
                                <div className="text-xs font-mono">{shade.color.hex}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {palette.shades.map((shade, index) => (
                    <motion.div
                      key={`gradient-info-${shade.name}`}
                      className="text-center p-2 rounded-lg cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: hoveredShade === index 
                          ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                          : 'transparent'
                      }}
                      onClick={() => handleCopyShade(shade, index)}
                      onHoverStart={() => setHoveredShade(index)}
                      onHoverEnd={() => setHoveredShade(null)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div 
                        className="text-sm font-medium"
                        style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                      >
                        {shade.name}
                      </div>
                      <div 
                        className="text-xs font-mono mt-1"
                        style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                      >
                        {shade.color.hex}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'donut' && (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <svg width="300" height="300" className="transform -rotate-90">
                    {palette.shades.map((shade, index) => {
                      const total = palette.shades.length;
                      const angle = (360 / total) * index;
                      const nextAngle = (360 / total) * (index + 1);
                      const radius = 120;
                      const innerRadius = 60;
                      
                      const startAngleRad = (angle * Math.PI) / 180;
                      const endAngleRad = (nextAngle * Math.PI) / 180;
                      
                      const x1 = 150 + radius * Math.cos(startAngleRad);
                      const y1 = 150 + radius * Math.sin(startAngleRad);
                      const x2 = 150 + radius * Math.cos(endAngleRad);
                      const y2 = 150 + radius * Math.sin(endAngleRad);
                      
                      const x3 = 150 + innerRadius * Math.cos(endAngleRad);
                      const y3 = 150 + innerRadius * Math.sin(endAngleRad);
                      const x4 = 150 + innerRadius * Math.cos(startAngleRad);
                      const y4 = 150 + innerRadius * Math.sin(startAngleRad);
                      
                      const largeArcFlag = (nextAngle - angle) > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `L ${x3} ${y3}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                        'Z'
                      ].join(' ');
                      
                      const isHovered = hoveredShade === index;
                      
                      return (
                        <path
                          key={`donut-${shade.name}`}
                          d={pathData}
                          fill={shade.color.hex}
                          stroke={isDark ? DARK_THEME_COLORS.border.primary : '#ffffff'}
                          strokeWidth={isHovered ? 3 : 1}
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: '150px 150px',
                            pointerEvents: 'all'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyShade(shade, index);
                          }}
                          onMouseEnter={() => setHoveredShade(index)}
                          onMouseLeave={() => setHoveredShade(null)}
                        />
                      );
                    })}
                  </svg>
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                      >
                        {palette.shades.length}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                      >
                        Colors
                      </div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {hoveredShade && (
                    <motion.div
                      className="text-center p-4 rounded-xl"
                      style={{
                        backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc',
                        border: `1px solid ${isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0'}`
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {(() => {
                        const shade = hoveredShade !== null ? palette.shades[hoveredShade] : null;
                        if (!shade) return null;
                        
                        return (
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: shade.color.hex }}
                            />
                            <div>
                              <div 
                                className="font-semibold"
                                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                              >
                                {shade.name}
                              </div>
                              <div 
                                className="text-sm font-mono"
                                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                              >
                                {shade.color.hex} • {convertColor(shade.color, colorFormat)}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Toggle button for color legend */}
                <motion.button
                  onClick={() => setShowDonutLegend(!showDonutLegend)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc',
                    border: `1px solid ${isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0'}`,
                    color: isDark ? DARK_THEME_COLORS.text.primary : '#111827'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium">
                    {showDonutLegend ? 'Ocultar' : 'Mostrar'} leyenda de colores
                  </span>
                  {showDonutLegend ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </motion.button>

                {/* Collapsible color legend */}
                <AnimatePresence>
                  {showDonutLegend && (
                    <motion.div
                      className="w-full max-w-2xl"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {palette.shades.map((shade, index) => (
                          <motion.div
                            key={`donut-legend-${shade.name}`}
                            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200"
                            style={{
                              backgroundColor: hoveredShade === index 
                                ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                                : 'transparent'
                            }}
                            onClick={() => handleCopyShade(shade, index)}
                            onHoverStart={() => setHoveredShade(index)}
                            onHoverEnd={() => setHoveredShade(null)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: shade.color.hex }}
                            />
                            <div className="flex-1 min-w-0">
                              <div 
                                className="text-sm font-medium truncate"
                                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                              >
                                {shade.name}
                              </div>
                              <div 
                                className="text-xs font-mono truncate"
                                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                              >
                                {shade.color.hex}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {viewMode === 'nodes' && (
              <div className="w-full">
                <NodeCanvas />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-6 p-4 rounded-xl"
          style={{ backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div 
                className="text-sm font-medium"
                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
              >
                {palette.shades.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                Shades
              </div>
            </div>
            <div>
              <div 
                className="text-sm font-medium capitalize"
                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
              >
                {palette.algorithm}
              </div>
              <div 
                className="text-xs"
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                Algorithm
              </div>
            </div>
            <div>
              <div 
                className="text-sm font-medium uppercase"
                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
              >
                {colorFormat}
              </div>
              <div 
                className="text-xs"
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                Format
              </div>
            </div>
            <div>
              <div 
                className="text-sm font-medium"
                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
              >
                {palette.shades.filter(shade => 
                  getContrastRatio(shade.color, { hex: isLightColor(shade.color) ? '#000000' : '#ffffff', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 }, oklch: { l: 0, c: 0, h: 0 } }) >= 4.5
                ).length}
              </div>
              <div 
                className="text-xs"
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                Accessible
              </div>
            </div>
          </div>
        </motion.div>

        <NotesPanel />


      </div>
    </motion.div>
  );
};