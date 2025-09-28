import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, History, ChevronDown, Pipette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '../stores/useAppStore';
import { parseColorInput, isValidHexColor } from '../utils/colorUtils';
import { PREDEFINED_COLORS } from '../types';
import { DARK_THEME_COLORS, DESIGN_TOKENS } from '../constants/designTokens';

interface ColorPickerProps {
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ className = '' }) => {
  const { currentPalette, settings, theme, updateBaseColor, addToColorHistory } = useAppStore();
  const isDark = theme === 'dark';
  const [localColor, setLocalColor] = useState<string>(currentPalette?.baseColor?.hex || '#1E96BE');
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [rgbValues, setRgbValues] = useState({ r: 30, g: 150, b: 190 });
  const [hslValues, setHslValues] = useState({ h: 195, s: 73, l: 43 });
  const [showCanvasSelector, setShowCanvasSelector] = useState(false);
  const [showPredefinedColors, setShowPredefinedColors] = useState(false);
  const [showSliders] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  // Actualizar valores cuando cambia el color
  useEffect(() => {
    if (isValidHexColor(localColor)) {
      const colorValue = parseColorInput(localColor);
      
      if (colorValue) {
        setRgbValues({
          r: colorValue.rgb.r,
          g: colorValue.rgb.g,
          b: colorValue.rgb.b
        });
        
        setHslValues({
          h: colorValue.hsl.h,
          s: colorValue.hsl.s,
          l: colorValue.hsl.l
        });
      }
    }
  }, [localColor]);

  // Dibujar el selector de color en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showCanvasSelector) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Crear gradiente de matiz horizontal
    const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
    hueGradient.addColorStop(0, 'hsl(0, 100%, 50%)');
    hueGradient.addColorStop(0.17, 'hsl(60, 100%, 50%)');
    hueGradient.addColorStop(0.33, 'hsl(120, 100%, 50%)');
    hueGradient.addColorStop(0.5, 'hsl(180, 100%, 50%)');
    hueGradient.addColorStop(0.67, 'hsl(240, 100%, 50%)');
    hueGradient.addColorStop(0.83, 'hsl(300, 100%, 50%)');
    hueGradient.addColorStop(1, 'hsl(360, 100%, 50%)');
    
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Crear gradiente de saturación vertical (blanco a transparente)
    const satGradient = ctx.createLinearGradient(0, 0, 0, height);
    satGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    satGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Crear gradiente de luminosidad vertical (transparente a negro)
    const lightGradient = ctx.createLinearGradient(0, 0, 0, height);
    lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, width, height);
  }, [showCanvasSelector]);

  const handleColorChange = (newColor: string, shouldAnimate: boolean = true) => {
    const colorValue = parseColorInput(newColor);
    if (colorValue) {
      setLocalColor(newColor);
      updateBaseColor(colorValue, shouldAnimate);
      
      // Add to history only if it's a new color selection (not from history)
      if (shouldAnimate && isValidHexColor(colorValue.hex)) {
        addToColorHistory(colorValue.hex);
      }
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValues, [component]: Math.max(0, Math.min(255, value)) };
    setRgbValues(newRgb);
    
    const newColor = `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`;
    const colorValue = parseColorInput(newColor);
    if (colorValue) {
      handleColorChange(colorValue.hex, false);
    }
  };

  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hslValues };
    
    if (component === 'h') {
      newHsl.h = Math.max(0, Math.min(360, value));
    } else {
      newHsl[component] = Math.max(0, Math.min(100, value));
    }
    
    setHslValues(newHsl);
    
    const newColor = `hsl(${newHsl.h}, ${newHsl.s}%, ${newHsl.l}%)`;
    const colorValue = parseColorInput(newColor);
    if (colorValue) {
      handleColorChange(colorValue.hex, false);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b] = imageData.data;
      
      if (r !== undefined && g !== undefined && b !== undefined) {
        const newColor = `rgb(${r}, ${g}, ${b})`;
        const colorValue = parseColorInput(newColor);
        if (colorValue) {
          handleColorChange(colorValue.hex, true);
        }
      }
    } catch (error) {
      console.warn('Error al obtener color del canvas:', error);
    }
  };

  const selectPredefinedColor = (color: string) => {
    handleColorChange(color, true);
  };

  const selectFromHistory = (color: string) => {
    // Don't add to history when selecting from history to avoid duplicates
    handleColorChange(color, false);
  };

  return (
    <motion.div 
      className={`rounded-xl shadow-lg border p-6 transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: isDark ? DARK_THEME_COLORS.border.primary : '#e5e7eb',
        color: isDark ? DARK_THEME_COLORS.text.primary : '#111827'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{
            backgroundColor: isDark ? DARK_THEME_COLORS.background.secondary : '#dbeafe'
          }}
        >
          <Palette 
            className="w-5 h-5" 
            style={{
              color: isDark ? DARK_THEME_COLORS.text.tertiary : '#2563eb'
            }}
          />
        </div>
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{
              color: isDark ? DARK_THEME_COLORS.text.primary : '#111827'
            }}
          >
            Color Picker
          </h3>
          <p 
            className="text-sm"
            style={{
              color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280'
            }}
          >
            Selecciona tu color base
          </p>
        </div>
      </div>

      {/* Preview del color actual - Clickeable */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Pipette 
            className="w-4 h-4" 
            style={{
              color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
            }}
          />
          <Label 
            className="text-sm font-medium"
            style={{
              color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
            }}
          >
            Color Actual
          </Label>
        </div>
        <div 
          className="w-full h-16 rounded-lg border-2 shadow-inner cursor-pointer transition-all duration-200 hover:shadow-lg"
          style={{ 
            backgroundColor: localColor,
            borderColor: showCanvasSelector 
              ? (isDark ? DARK_THEME_COLORS.accent.primary : '#3b82f6')
              : (isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb')
          }}
          onClick={() => setShowCanvasSelector(!showCanvasSelector)}
        />
        <p 
          className="text-center text-sm mt-2 font-mono"
          style={{
            color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
          }}
        >
          {localColor}
        </p>
      </div>

      {/* Selector visual - Dropdown */}
      <AnimatePresence>
        {showCanvasSelector && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Label 
              className="text-sm font-medium mb-2 block"
              style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
              }}
            >
              Selector Visual
            </Label>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={280}
                height={120}
                className="w-full h-30 rounded-lg border cursor-crosshair transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb',
                  display: 'block'
                }}
                onClick={handleCanvasClick}
                onMouseMove={(e) => {
                  const canvas = e.currentTarget;
                  const rect = canvas.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  canvas.title = `Posición: ${Math.round(x)}, ${Math.round(y)}`;
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliders adaptativos RGB/HSL */}
      {showSliders && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label 
              className="text-sm font-medium"
              style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
              }}
            >
              Controles Adaptativos
            </Label>
          </div>
          
          {colorFormat === 'rgb' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>R</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{rgbValues.r}</span>
                </div>
                <Slider
                  value={[rgbValues.r]}
                  onValueChange={(value) => handleRgbChange('r', value[0])}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>G</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{rgbValues.g}</span>
                </div>
                <Slider
                  value={[rgbValues.g]}
                  onValueChange={(value) => handleRgbChange('g', value[0])}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>B</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{rgbValues.b}</span>
                </div>
                <Slider
                  value={[rgbValues.b]}
                  onValueChange={(value) => handleRgbChange('b', value[0])}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          {colorFormat === 'hsl' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>H</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{hslValues.h}°</span>
                </div>
                <Slider
                  value={[hslValues.h]}
                  onValueChange={(value) => handleHslChange('h', value[0])}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>S</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{hslValues.s}%</span>
                </div>
                <Slider
                  value={[hslValues.s]}
                  onValueChange={(value) => handleHslChange('s', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>L</Label>
                  <span className="text-xs font-mono" style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#6b7280' }}>{hslValues.l}%</span>
                </div>
                <Slider
                  value={[hslValues.l]}
                  onValueChange={(value) => handleHslChange('l', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inputs de color */}
      <Tabs value={colorFormat} onValueChange={(value) => setColorFormat(value as 'hex' | 'rgb' | 'hsl')} className="mb-6">
        <TabsList 
          className="grid w-full grid-cols-3"
          style={{
            backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : undefined,
            borderColor: isDark ? DARK_THEME_COLORS.border.secondary : undefined
          }}
        >
          <TabsTrigger value="hex">HEX</TabsTrigger>
          <TabsTrigger value="rgb">RGB</TabsTrigger>
          <TabsTrigger value="hsl">HSL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hex" className="mt-4">
          <div className="space-y-2">
            <Label 
              htmlFor="hex-input" 
              className="text-sm font-medium"
              style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
              }}
            >
              Código Hexadecimal
            </Label>
            <Input
              id="hex-input"
              type="text"
              value={localColor}
              onChange={(e) => handleColorChange(e.target.value, true)}
              placeholder="#1E96BE"
              className="font-mono"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="rgb" className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label 
                htmlFor="r-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                R
              </Label>
              <Input
                id="r-input"
                type="number"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Label 
                htmlFor="g-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                G
              </Label>
              <Input
                id="g-input"
                type="number"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Label 
                htmlFor="b-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                B
              </Label>
              <Input
                id="b-input"
                type="number"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="hsl" className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label 
                htmlFor="h-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                H
              </Label>
              <Input
                id="h-input"
                type="number"
                min="0"
                max="360"
                value={hslValues.h}
                onChange={(e) => handleHslChange('h', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Label 
                htmlFor="s-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                S%
              </Label>
              <Input
                id="s-input"
                type="number"
                min="0"
                max="100"
                value={hslValues.s}
                onChange={(e) => handleHslChange('s', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Label 
                htmlFor="l-input" 
                className="text-sm font-medium"
                style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
              >
                L%
              </Label>
              <Input
                id="l-input"
                type="number"
                min="0"
                max="100"
                value={hslValues.l}
                onChange={(e) => handleHslChange('l', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Colores predefinidos - Dropdown */}
      <div className="mb-6">
        <button
          className="w-full flex items-center justify-between p-3 rounded-lg border transition-colors"
          style={{
            backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : '#f9fafb',
            borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb'
          }}
          onClick={() => setShowPredefinedColors(!showPredefinedColors)}
        >
          <div className="flex items-center gap-2">
            <Palette 
              className="w-4 h-4" 
              style={{
                color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
              }}
            />
            <Label 
              className="text-sm font-medium"
              style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
              }}
            >
              Colores Predefinidos
            </Label>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              showPredefinedColors ? 'rotate-180' : ''
            }`}
            style={{
              color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
            }}
          />
        </button>
        
        <AnimatePresence>
          {showPredefinedColors && (
            <motion.div
              className="mt-3 p-3 rounded-lg border"
              style={{
                backgroundColor: isDark ? DARK_THEME_COLORS.surface.secondary : '#f9fafb',
                borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb'
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-6 gap-2">
                {PREDEFINED_COLORS.map((color, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 rounded-lg border-2 transition-colors shadow-sm hover:shadow-md"
                    style={{ 
                      backgroundColor: color,
                      borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = isDark ? DARK_THEME_COLORS.text.tertiary : '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb';
                    }}
                    onClick={() => selectPredefinedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Historial de colores */}
      {settings.colorHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History 
              className="w-4 h-4" 
              style={{
                color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
              }}
            />
            <Label 
              className="text-sm font-medium"
              style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
              }}
            >
              Historial Reciente
            </Label>
          </div>
          <div className="flex gap-2 flex-wrap">
            {settings.colorHistory.slice(0, 8).map((color, index) => (
              <button
                key={index}
                className="w-8 h-8 rounded-md border transition-colors shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: color,
                  borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? DARK_THEME_COLORS.text.tertiary : '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb';
                }}
                onClick={() => selectFromHistory(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};