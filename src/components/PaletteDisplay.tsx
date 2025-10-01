import { useState, useCallback, forwardRef, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, Heart, Grid3X3, List, Minus, PieChart, ChevronDown, ChevronUp, Network, Fan, Palette } from 'lucide-react';
import * as THREE from 'three';
import { NodeCanvas } from './NodeCanvas';
import { useAppStore } from '../stores/useAppStore';
import { NotesPanel } from './NotesPanel';
import { convertColor, getContrastRatio, isLightColor } from '../utils/colorUtils';
import { getConsistentPaletteName } from '../utils/paletteNaming';
import { generateFanPalette } from '../utils/colorTheory';
import type { ColorFormat, ColorPalette, ColorValue } from '../types';
import type { ColorShade } from '../types';
import { DESIGN_TOKENS, DARK_THEME_COLORS } from '../constants/designTokens';

type ViewMode = 'grid' | 'list' | 'gradient' | 'donut' | 'nodes' | 'fan';







// Componente principal de Esfera 3D con Three.js puro
interface Sphere3DProps {
  size?: number;
  palette: ColorPalette | null;
}

const Sphere3D: React.FC<Sphere3DProps> = ({ size = 20, palette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Usar colores intermedios específicos: del 5º al 9º color (índices 4-8)
  const intermediateColors = useMemo(() => {
    if (!palette || palette.shades.length < 9) {
      // Fallback si no hay suficientes colores
      return ['#4f46e5', '#7c3aed', '#2563eb', '#1d4ed8', '#1e40af'];
    }
    return palette.shades.slice(4, 9).map(shade => shade.color.hex);
  }, [palette]);
  
  // Brillo neón del color base actual del Color Picker
  const neonColor = palette?.baseColor?.hex || '#4f46e5';

  // Inicializar Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    // Crear escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Crear cámara
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 2;

    // Crear renderer con shadowMap para mejor volumen
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Crear geometría de la esfera
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);

    // Crear textura simple con gradiente radial
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Gradiente radial uniforme con los 5 colores intermedios (5º-9º)
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    
    // Distribución uniforme de los 5 colores intermedios
    intermediateColors.forEach((color, index) => {
      const stop = index / (intermediateColors.length - 1); // 0, 0.25, 0.5, 0.75, 1
      gradient.addColorStop(stop, color);
    });
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Material estándar fijo para consistencia
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.9,
      roughness: 0.4,
      metalness: 0.1
    });

    // Crear mesh
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Iluminación fija y consistente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Función de animación - rotación lateral suave solo en eje Y
    const animate = () => {
      if (sphereRef.current) {
        sphereRef.current.rotation.y += 0.008; // Rotación lateral suave solo en Y
      }
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [size, intermediateColors]);

  const containerStyle = useMemo(() => ({
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative' as const,
    cursor: 'pointer',
    filter: `
      drop-shadow(0 0 ${size * 0.15}px ${neonColor}90) 
      drop-shadow(0 0 ${size * 0.3}px ${neonColor}70) 
      drop-shadow(0 0 ${size * 0.5}px ${neonColor}50)
      drop-shadow(0 0 ${size * 0.8}px ${neonColor}30)
    `,
    borderRadius: '50%',
  }), [size, neonColor]);

  return (
    <div style={containerStyle}>
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

interface ShadeCardProps {
  shade: ColorShade;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onCopy: (shade: ColorShade) => void;
  isMobile?: boolean;
  palette?: ColorPalette;
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
    shouldAnimatePalette,
    updateBaseColor
  } = useAppStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredShade, setHoveredShade] = useState<number | null>(null);
  const [showDonutLegend, setShowDonutLegend] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fanPalette, setFanPalette] = useState<ColorValue[]>([]);
  const [localActiveShade, setLocalActiveShade] = useState<number | null>(null);
  
  const colorFormat = settings.exportPreferences.format === 'css' ? 'hsl' : 'rgb';
  const isDark = theme === 'dark';
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generar paleta fan cuando cambie el color base o se active la vista fan
  useEffect(() => {
    if (viewMode === 'fan' && palette?.baseColor) {
      const fanColors = generateFanPalette(palette.baseColor);
      setFanPalette(fanColors);
    }
  }, [viewMode, palette?.baseColor]);
  
  // Generar nombre dinámico de la paleta
  const paletteName = useMemo(() => {
    if (!palette || palette.shades.length === 0) return 'Color Palette';
    return getConsistentPaletteName(palette.shades);
  }, [palette]);

  const handleShadeClick = useCallback((shade: ColorShade, index: number) => {
    updateBaseColor(shade.color, true);
    setLocalActiveShade(index);
  }, [updateBaseColor]);

  const handleCopyShade = useCallback(async (shade: ColorShade, index: number) => {
    try {
      // Siempre copiar el valor hexadecimal
      await navigator.clipboard.writeText(shade.color.hex);
      setLocalActiveShade(index);
      setTimeout(() => setLocalActiveShade(null), 1000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Función para manejar clicks en colores del fan
  const handleFanColorClick = useCallback(async (color: ColorValue, index: number) => {
    try {
      // Copiar el color al clipboard
      await navigator.clipboard.writeText(color.hex);
      
      // Actualizar el color base con el color seleccionado del fan
      updateBaseColor(color, true);
      
      // Marcar como activo temporalmente
      setLocalActiveShade(index);
      setTimeout(() => setLocalActiveShade(null), 1000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [updateBaseColor]);

  // Calcular columnas del grid según el tamaño de pantalla
  const getGridColumns = () => {
    if (isMobile) {
      return Math.min(palette?.shades.length || 3, 3); // Máximo 3 columnas en móvil
    }
    return Math.min(palette?.shades.length || 6, 6); // Máximo 6 columnas en desktop
  };

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
      className={`rounded-2xl shadow-lg border overflow-hidden ${isMobile ? 'mobile-palette-display' : ''}`}
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.primary
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div 
        className={`${isMobile ? 'px-3 py-3 mobile-palette-header' : 'px-6 py-4'} border-b`}
        style={{ borderColor: DESIGN_TOKENS.colors.border.primary }}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center space-x-3">
            <Sphere3D 
              size={isMobile ? 16 : 20}
              palette={palette}
            />
            <h2 
              className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold italic`}
              style={{ 
                color: isDark ? DARK_THEME_COLORS.text.primary : '#111827',
                fontStyle: 'italic'
              }}
            >
              {paletteName}
            </h2>
          </div>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2 w-full' : 'space-x-4'}`}>
            {/* View Mode Selector */}
            <div className={`flex items-center ${isMobile ? 'w-full mobile-view-mode-selector' : 'space-x-1 p-1 rounded-lg'}`} style={{ backgroundColor: isMobile ? 'transparent' : DESIGN_TOKENS.colors.surface.mutedCard }}>
              {[
                { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
                { mode: 'list' as ViewMode, icon: List, label: 'List' },
                { mode: 'gradient' as ViewMode, icon: Minus, label: 'Gradient' },
                { mode: 'donut' as ViewMode, icon: PieChart, label: 'Donut' },
                { mode: 'nodes' as ViewMode, icon: Network, label: 'Nodes' },
                { mode: 'fan' as ViewMode, icon: Fan, label: 'Fan' }
              ].map(({ mode, icon: Icon, label }) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`${isMobile ? 'p-3 mobile-view-mode-button mobile-touch-target' : 'p-2'} rounded-md transition-all duration-200 relative touch-manipulation`}
                  style={{
                    color: viewMode === mode 
                      ? (isDark ? DARK_THEME_COLORS.text.primary : '#111827')
                      : (isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280'),
                    backgroundColor: viewMode === mode 
                      ? (isDark ? DARK_THEME_COLORS.accent.primary : '#ffffff')
                      : 'transparent',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={label}
                >
                  {viewMode === mode && (
                    <motion.div
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: isDark ? DARK_THEME_COLORS.accent.primary : DESIGN_TOKENS.colors.accent.primary }}
                      layoutId="activeViewMode"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} relative z-10`} />
                </motion.button>
              ))}
            </div>
            <div className={`flex items-center ${isMobile ? 'justify-center w-full' : 'space-x-2'}`}>
              <span 
                className={`px-3 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-xs'} font-medium`}
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
                  color: DESIGN_TOKENS.colors.text.muted
                }}
              >
                {palette.shades.length} shades
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span 
                className={`${isMobile ? 'text-xs' : 'text-sm'} capitalize`}
                style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}
              >
                {palette.algorithm}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'px-3 py-4' : 'p-6'}`}>
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
                className={`grid ${isMobile ? 'gap-4 mobile-palette-grid' : 'gap-3'}`}
                style={{
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${getGridColumns()}, 1fr)`
                }}
              >
                {palette.shades.map((shade, index) => (
                  <motion.div
                    key={`shade-${shade.name}-${shade.value}`}
                    className="group relative cursor-pointer"
                    initial={shouldAnimatePalette ? { opacity: 0, y: 20 } : false}
                    animate={shouldAnimatePalette ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={shouldAnimatePalette ? { 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    } : { duration: 0 }}
                    whileHover={{ scale: isMobile ? 1.02 : 1.05, y: isMobile ? 0 : -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShadeCard
                      shade={shade}
                      index={index}
                      isActive={localActiveShade === index}
                      onClick={() => handleShadeClick(shade, index)}
                      onCopy={(shade) => handleCopyShade(shade, index)}
                      isMobile={isMobile}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className={`space-y-${isMobile ? '4' : '3'} ${isMobile ? 'mobile-palette-list' : ''}`}>
                {palette.shades.map((shade, index) => {
                  const textColor = isLightColor(shade.color) ? '#000000' : '#ffffff';
                  const contrastRatio = getContrastRatio(shade.color, { hex: textColor, rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 }, oklch: { l: 0, c: 0, h: 0 } });
                  const isHovered = hoveredShade === index;
                  
                  return (
                    <motion.div
                      key={`list-${shade.name}-${shade.value}`}
                      className={`flex items-center ${isMobile ? 'space-x-3 p-3 mobile-list-item mobile-touch-target' : 'space-x-4 p-4'} rounded-xl cursor-pointer transition-all duration-200 touch-manipulation`}
                      style={{
                        backgroundColor: isHovered 
                          ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                          : 'transparent',
                        border: `1px solid ${isHovered 
                          ? (isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0')
                          : 'transparent'}`
                      }}
                      onClick={() => handleCopyShade(shade, index)}
                      onHoverStart={() => !isMobile && setHoveredShade(index)}
                      onHoverEnd={() => !isMobile && setHoveredShade(null)}
                      onTouchStart={() => isMobile && setHoveredShade(index)}
                      onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 2000)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`${isMobile ? 'w-12 h-12 mobile-list-item-color' : 'w-16 h-16'} rounded-lg shadow-sm border-2`}
                        style={{ 
                          backgroundColor: shade.color.hex,
                          borderColor: isDark ? DARK_THEME_COLORS.border.subtle : '#ffffff'
                        }}
                      />
                      <div className={`flex-1 ${isMobile ? 'mobile-list-item-info' : ''}`}>
                        <div className={`flex items-center ${isMobile ? 'flex-col items-start space-y-1' : 'space-x-3'}`}>
                          <span 
                            className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}
                            style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                          >
                            {shade.name}
                          </span>
                          <span 
                            className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono px-2 py-1 rounded`}
                            style={{ 
                              backgroundColor: isDark ? DARK_THEME_COLORS.surface.tertiary : '#f1f5f9',
                              color: isDark ? DARK_THEME_COLORS.text.secondary : '#475569'
                            }}
                          >
                            {shade.color.hex.toUpperCase()}
                          </span>
                        </div>
                        <div className={`flex items-center ${isMobile ? 'flex-col items-start space-y-1 mt-1' : 'space-x-4 mt-2'}`}>
                          <span 
                            className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono`}
                            style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                          >
                            {convertColor(shade.color, colorFormat)}
                          </span>
                          <span 
                            className={`${isMobile ? 'text-xs' : 'text-sm'} flex items-center space-x-1`}
                            style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Contrast: {contrastRatio.toFixed(1)}</span>
                            {contrastRatio >= 4.5 && <span className="text-green-500">✓</span>}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        className={`${isMobile ? 'p-3' : 'p-2'} rounded-lg touch-manipulation`}
                        style={{
                          backgroundColor: isHovered 
                            ? (isDark ? DARK_THEME_COLORS.accent.primary : '#e2e8f0')
                            : 'transparent',
                          color: isDark ? DARK_THEME_COLORS.text.secondary : '#475569',
                          minWidth: isMobile ? '44px' : 'auto',
                          minHeight: isMobile ? '44px' : 'auto'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {viewMode === 'gradient' && (
              <div className={`space-y-${isMobile ? '6' : '4'} ${isMobile ? 'mobile-gradient-view' : ''}`}>
                <div 
                  className={`${isMobile ? 'h-32 mobile-gradient-bar' : 'h-24'} rounded-xl overflow-hidden shadow-lg relative cursor-pointer`}
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
                        className="absolute inset-y-0 cursor-pointer group touch-manipulation"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`
                        }}
                        onClick={() => handleCopyShade(shade, index)}
                        onHoverStart={() => !isMobile && setHoveredShade(index)}
                        onHoverEnd={() => !isMobile && setHoveredShade(null)}
                        onTouchStart={() => isMobile && setHoveredShade(index)}
                        onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 2000)}
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
                                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold`}>{shade.name}</div>
                                <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-mono`}>{shade.color.hex}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
                <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'}`}>
                  {palette.shades.map((shade, index) => (
                    <motion.div
                      key={`gradient-info-${shade.name}`}
                      className={`text-center ${isMobile ? 'p-3' : 'p-2'} rounded-lg cursor-pointer transition-all duration-200 touch-manipulation`}
                      style={{
                        backgroundColor: hoveredShade === index 
                          ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                          : 'transparent',
                        minHeight: isMobile ? '60px' : 'auto'
                      }}
                      onClick={() => handleCopyShade(shade, index)}
                      onHoverStart={() => !isMobile && setHoveredShade(index)}
                      onHoverEnd={() => !isMobile && setHoveredShade(null)}
                      onTouchStart={() => isMobile && setHoveredShade(index)}
                      onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 1000)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div 
                        className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}
                        style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                      >
                        {shade.name}
                      </div>
                      <div 
                        className={`${isMobile ? 'text-xs' : 'text-xs'} font-mono mt-1`}
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
              <div className={`flex flex-col items-center space-y-6 ${isMobile ? 'mobile-donut-view' : ''}`}>
                <div className="relative">
                  <svg width={isMobile ? "250" : "300"} height={isMobile ? "250" : "300"} className="transform -rotate-90">
                    {palette.shades.map((shade, index) => {
                      const total = palette.shades.length;
                      const angle = (360 / total) * index;
                      const nextAngle = (360 / total) * (index + 1);
                      const radius = isMobile ? 100 : 120;
                      const innerRadius = isMobile ? 50 : 60;
                      const center = isMobile ? 125 : 150;
                      
                      const startAngleRad = (angle * Math.PI) / 180;
                      const endAngleRad = (nextAngle * Math.PI) / 180;
                      
                      const x1 = center + radius * Math.cos(startAngleRad);
                      const y1 = center + radius * Math.sin(startAngleRad);
                      const x2 = center + radius * Math.cos(endAngleRad);
                      const y2 = center + radius * Math.sin(endAngleRad);
                      
                      const x3 = center + innerRadius * Math.cos(endAngleRad);
                      const y3 = center + innerRadius * Math.sin(endAngleRad);
                      const x4 = center + innerRadius * Math.cos(startAngleRad);
                      const y4 = center + innerRadius * Math.sin(startAngleRad);
                      
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
                          onClick={() => handleCopyShade(shade, index)}
                          onMouseEnter={() => !isMobile && setHoveredShade(index)}
                          onMouseLeave={() => !isMobile && setHoveredShade(null)}
                          onTouchStart={() => isMobile && setHoveredShade(index)}
                          onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 2000)}
                          style={{
                            filter: isHovered ? 'brightness(1.1)' : 'none',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: `${center}px ${center}px`
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center Info */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ 
                      top: isMobile ? '25%' : '30%', 
                      bottom: isMobile ? '25%' : '30%',
                      left: isMobile ? '25%' : '30%',
                      right: isMobile ? '25%' : '30%'
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}
                        style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                      >
                        {palette.shades.length}
                      </div>
                      <div 
                        className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-60`}
                        style={{ color: isDark ? DARK_THEME_COLORS.text.secondary : '#6b7280' }}
                      >
                        Colors
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <motion.button
                  onClick={() => setShowDonutLegend(!showDonutLegend)}
                  className={`flex items-center space-x-2 ${isMobile ? 'px-4 py-3 mobile-donut-legend-toggle' : 'px-3 py-2'} rounded-lg transition-all duration-200 touch-manipulation`}
                  style={{
                    backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
                    color: DESIGN_TOKENS.colors.text.secondary,
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
                    {showDonutLegend ? 'Hide' : 'Show'} Legend
                  </span>
                  {showDonutLegend ? (
                    <ChevronUp className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  ) : (
                    <ChevronDown className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  )}
                </motion.button>

                {/* Collapsible color legend */}
                <AnimatePresence>
                  {showDonutLegend && (
                    <motion.div
                      className={`grid ${isMobile ? 'grid-cols-1 gap-3 mobile-donut-legend' : 'grid-cols-2 gap-2'} w-full max-w-md`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {palette.shades.map((shade, index) => (
                        <motion.div
                          key={`donut-legend-${shade.name}`}
                          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation`}
                          style={{
                            backgroundColor: hoveredShade === index 
                              ? (isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc')
                              : 'transparent'
                          }}
                          onClick={() => handleCopyShade(shade, index)}
                          onHoverStart={() => !isMobile && setHoveredShade(index)}
                          onHoverEnd={() => !isMobile && setHoveredShade(null)}
                          onTouchStart={() => isMobile && setHoveredShade(index)}
                          onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 1000)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div
                            className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} rounded-full`}
                            style={{ backgroundColor: shade.color.hex }}
                          />
                          <div className="flex-1">
                            <div 
                              className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}
                              style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                            >
                              {shade.name}
                            </div>
                            <div 
                              className={`${isMobile ? 'text-xs' : 'text-xs'} font-mono`}
                              style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                            >
                              {shade.color.hex}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {viewMode === 'nodes' && (
              <div className={`${isMobile ? 'h-96 mobile-nodes-view' : 'h-96'} rounded-xl overflow-hidden`}>
                <NodeCanvas 
                  palette={palette} 
                  onShadeClick={handleShadeClick}
                  isMobile={isMobile}
                />
              </div>
            )}

            {viewMode === 'fan' && (
              <FanView
                palette={palette}
                fanPalette={fanPalette}
                activeShade={activeShade}
                hoveredShade={hoveredShade}
                setHoveredShade={setHoveredShade}
                handleFanColorClick={handleFanColorClick}
                colorFormat={colorFormat}
                isDark={isDark}
                isMobile={isMobile}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className={`mt-6 p-4 rounded-xl ${isMobile ? 'mobile-statistics-panel' : ''}`}
          style={{ backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4 mobile-statistics-grid' : 'grid-cols-2 md:grid-cols-4 gap-4'} text-center`}>
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

// Componente separado para la vista Fan
const FanView = ({ 
  palette, 
  fanPalette,
  activeShade, 
  hoveredShade, 
  setHoveredShade, 
  handleFanColorClick,
  colorFormat,
  isDark, 
  isMobile 
}: {
  palette: ColorPalette;
  fanPalette: ColorValue[];
  activeShade: number | null;
  hoveredShade: number | null;
  setHoveredShade: (index: number | null) => void;
  handleFanColorClick: (color: ColorValue, index: number) => void;
  colorFormat: ColorFormat;
  isDark: boolean;
  isMobile: boolean;
}) => {
  return (
    <div className={`flex flex-col items-center space-y-6 ${isMobile ? 'mobile-fan-view' : ''}`}>
      {/* Fan Color Visualization */}
      <div className="relative">
        <svg 
          width={isMobile ? "280" : "360"} 
          height={isMobile ? "200" : "240"} 
          className="overflow-visible"
          viewBox={`0 0 ${isMobile ? 280 : 360} ${isMobile ? 200 : 240}`}
        >
           {(() => {
             // Usar la paleta fan generada o generar una nueva basada en el color base
             const baseColor = palette?.baseColor || palette.shades[0]?.color;
             
             if (!baseColor) return null;
             
             const fanColors = fanPalette.length > 0 ? fanPalette : generateFanPalette(baseColor);
             const centerX = isMobile ? 140 : 180;
             const centerY = isMobile ? 180 : 220;
             const radius = isMobile ? 120 : 150;
             const angleSpan = 180; // Semicírculo
             const angleStep = angleSpan / (fanColors.length - 1);
             
             return fanColors.map((color, index) => {
              const angle = -90 - (angleSpan / 2) + (index * angleStep); // Empezar desde arriba
              const angleRad = (angle * Math.PI) / 180;
              const x = centerX + radius * Math.cos(angleRad);
              const y = centerY + radius * Math.sin(angleRad);
              const isHovered = hoveredShade === index;
              
              return (
                <g key={`fan-color-${index}`}>
                  {/* Línea conectora */}
                  <motion.line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0'}
                    strokeWidth={isHovered ? 3 : 1}
                    strokeDasharray={isHovered ? "none" : "2,2"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  
                  {/* Círculo de color */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isHovered ? (isMobile ? 18 : 22) : (isMobile ? 15 : 18)}
                    fill={color.hex}
                    stroke={isDark ? DARK_THEME_COLORS.border.primary : '#ffffff'}
                    strokeWidth={isHovered ? 3 : 2}
                    className="cursor-pointer transition-all duration-200"
                     onClick={() => handleFanColorClick(color, index)}
                    onMouseEnter={() => !isMobile && setHoveredShade(index)}
                    onMouseLeave={() => !isMobile && setHoveredShade(null)}
                    onTouchStart={() => isMobile && setHoveredShade(index)}
                    onTouchEnd={() => isMobile && setTimeout(() => setHoveredShade(null), 2000)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      filter: isHovered ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none'
                    }}
                  />
                  
                  {/* Etiqueta de color */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <rect
                          x={x - 30}
                          y={y - 45}
                          width={60}
                          height={25}
                          rx={4}
                          fill={isDark ? DARK_THEME_COLORS.background.secondary : '#ffffff'}
                          stroke={isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0'}
                          strokeWidth={1}
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                        <text
                          x={x}
                          y={y - 30}
                          textAnchor="middle"
                          className="text-xs font-mono"
                          fill={isDark ? DARK_THEME_COLORS.text.primary : '#111827'}
                        >
                          {color.hex.toUpperCase()}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              );
            });
          })()}
          
          {/* Color central (base) */}
           {(() => {
             const baseColor = palette?.baseColor || palette.shades[0]?.color;
             
             if (!baseColor) return null;
             
             const centerX = isMobile ? 140 : 180;
             const centerY = isMobile ? 180 : 220;
             
             return (
               <motion.g>
                 <motion.circle
                   cx={centerX}
                   cy={centerY}
                   r={isMobile ? 25 : 30}
                   fill={baseColor.hex}
                   stroke={isDark ? DARK_THEME_COLORS.border.primary : '#ffffff'}
                   strokeWidth={4}
                   className="cursor-pointer"
                   onClick={() => handleFanColorClick(baseColor, -1)}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ 
                     duration: 0.5,
                     type: 'spring',
                     stiffness: 200
                   }}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.95 }}
                   style={{
                     filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                   }}
                 />
                 <text
                   x={centerX}
                   y={centerY + (isMobile ? 45 : 55)}
                   textAnchor="middle"
                   className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold`}
                   fill={isDark ? DARK_THEME_COLORS.text.primary : '#111827'}
                 >
                   Base Color
                 </text>
               </motion.g>
             );
           })()}
        </svg>
      </div>
      
      {/* Color Theory Information */}
      <motion.div
        className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'} w-full max-w-4xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {(() => {
           const baseColor = palette?.baseColor || palette.shades[0]?.color;
           
           if (!baseColor) return null;
           
           const fanColors = fanPalette.length > 0 ? fanPalette : generateFanPalette(baseColor);
           const colorTypes = [
             { name: 'Complementary', colors: fanColors.slice(0, 2), description: 'Opposite colors on the color wheel' },
             { name: 'Analogous', colors: fanColors.slice(2, 5), description: 'Adjacent colors on the color wheel' },
             { name: 'Triadic', colors: fanColors.slice(5, 8), description: 'Colors equally spaced on the wheel' },
             { name: 'Variations', colors: fanColors.slice(8), description: 'Saturation and lightness variations' }
           ];
           
           return colorTypes.map((type, typeIndex) => (
            <motion.div
              key={type.name}
              className={`p-4 rounded-xl ${isMobile ? 'mobile-color-theory-card' : ''}`}
              style={{ backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + typeIndex * 0.1 }}
            >
              <h3 
                className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-2`}
                style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
              >
                {type.name}
              </h3>
              <p 
                className={`${isMobile ? 'text-xs' : 'text-sm'} mb-3 opacity-70`}
                style={{ color: isDark ? DARK_THEME_COLORS.text.secondary : '#6b7280' }}
              >
                {type.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {type.colors.map((color, colorIndex) => (
                  <motion.div
                    key={`${type.name}-${colorIndex}`}
                    className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg cursor-pointer border-2 touch-manipulation`}
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: isDark ? DARK_THEME_COLORS.border.primary : '#ffffff'
                    }}
                    onClick={() => handleFanColorClick(color, colorIndex)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={color.hex.toUpperCase()}
                  />
                ))}
              </div>
            </motion.div>
          ));
        })()}
       </motion.div>
       
       {/* Dynamic Color Codes Display */}
       <motion.div
         className={`w-full max-w-4xl ${isMobile ? 'px-4' : 'px-6'}`}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.8 }}
       >
         <div 
           className={`p-4 rounded-xl ${isMobile ? 'mobile-fan-codes' : ''}`}
           style={{ backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard }}
         >
           <h3 
             className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-3`}
             style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
           >
             Color Codes
           </h3>
           <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-3'}`}>
             {(() => {
               const baseColor = palette?.baseColor || palette.shades[0]?.color;
               if (!baseColor) return null;
               
               const fanColors = fanPalette.length > 0 ? fanPalette : generateFanPalette(baseColor);
               
               return fanColors.slice(0, 6).map((color, index) => (
                 <motion.div
                   key={`fan-code-${index}`}
                   className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation`}
                   style={{
                     backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : '#f8fafc',
                     border: `1px solid ${isDark ? DARK_THEME_COLORS.border.primary : '#e2e8f0'}`
                   }}
                   onClick={() => handleFanColorClick(color, index)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.9 + index * 0.05 }}
                 >
                   <div className="flex items-center space-x-3">
                     <div
                       className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg border-2`}
                       style={{ 
                         backgroundColor: color.hex,
                         borderColor: isDark ? DARK_THEME_COLORS.border.primary : '#ffffff'
                       }}
                     />
                     <div>
                       <div 
                         className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono font-semibold`}
                         style={{ color: isDark ? DARK_THEME_COLORS.text.primary : '#111827' }}
                       >
                         {color.hex.toUpperCase()}
                       </div>
                       <div 
                         className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono opacity-70`}
                         style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#64748b' }}
                       >
                         {convertColor(color, colorFormat)}
                       </div>
                     </div>
                   </div>
                   <Copy className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} opacity-50`} />
                 </motion.div>
               ));
             })()}
           </div>
         </div>
       </motion.div>
       
       {/* Instructions */}
      <motion.div
        className={`text-center ${isMobile ? 'px-4' : 'px-6'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p 
          className={`${isMobile ? 'text-sm' : 'text-base'} opacity-70`}
          style={{ color: isDark ? DARK_THEME_COLORS.text.secondary : '#6b7280' }}
        >
          Click on any color in the fan to copy it to your clipboard. 
          {activeShade !== null ? ' Colors are based on your selected shade.' : ' Select a shade to see its color relationships.'}
        </p>
      </motion.div>
    </div>
  );
};