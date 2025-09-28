import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Sliders, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CustomSlider } from '@/components/ui/custom-slider';
import { CustomSelect, CustomSelectContent, CustomSelectItem, CustomSelectTrigger, CustomSelectValue } from '@/components/ui/custom-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '../stores/useAppStore';
import type { ColorAlgorithm } from '../types';

interface AdjustmentControlsProps {
  className?: string;
}

const algorithmInfo: Record<ColorAlgorithm, { description: string; icon: React.ReactNode; badge?: string }> = {
  tailwind: {
    description: 'Paleta estilo Tailwind CSS con progresión equilibrada',
    icon: <Hash className="w-4 h-4" />,
    badge: 'Popular'
  },
  radix: {
    description: 'Paleta basada en Radix UI con excelente contraste',
    icon: <Palette className="w-4 h-4" />,
    badge: 'Contraste'
  },
  ant: {
    description: 'Paleta estilo Ant Design con tonos suaves',
    icon: <Palette className="w-4 h-4" />,
    badge: 'Suave'
  },
  lightness: {
    description: 'Basado en variaciones de luminosidad',
    icon: <Sliders className="w-4 h-4" />
  },
  saturation: {
    description: 'Basado en variaciones de saturación',
    icon: <Sliders className="w-4 h-4" />
  },
  hue: {
    description: 'Basado en variaciones de matiz',
    icon: <Sliders className="w-4 h-4" />
  },
  monochromatic: {
    description: 'Paleta monocromática con un solo matiz',
    icon: <Palette className="w-4 h-4" />
  },
  analogous: {
    description: 'Colores análogos en el círculo cromático',
    icon: <Palette className="w-4 h-4" />
  },
  complementary: {
    description: 'Algoritmo personalizado con distribución avanzada de luminosidad',
    icon: <Sliders className="w-4 h-4" />,
    badge: 'Avanzado'
  }
};

const shadeCountOptions = [
  { value: 5, label: '5 tonos', description: 'Paleta minimalista' },
  { value: 7, label: '7 tonos', description: 'Paleta compacta' },
  { value: 9, label: '9 tonos', description: 'Paleta estándar' },
  { value: 11, label: '11 tonos', description: 'Paleta extendida' },
  { value: 13, label: '13 tonos', description: 'Paleta completa' }
];

export const AdjustmentControls: React.FC<AdjustmentControlsProps> = ({ className = '' }) => {
  const {
    currentPalette,
    settings,
    contrastShift,
    updateAlgorithm,
    updateContrastShift,
    updateShadeCount
  } = useAppStore();
  
  // Extract stable values to prevent re-renders
  const shadeCount = currentPalette?.shades?.length ?? settings.defaultShadeCount;
  const algorithm = currentPalette?.algorithm;

  const handleAlgorithmChange = useCallback((newAlgorithm: ColorAlgorithm) => {
    updateAlgorithm(newAlgorithm);
  }, [updateAlgorithm]);

  const handleContrastChange = useCallback((value: number[]) => {
    const newValue = value[0];
    updateContrastShift(newValue);
  }, [updateContrastShift]);

  const handleShadeCountChange = useCallback((count: string) => {
    const newCount = parseInt(count, 10);
    updateShadeCount(newCount);
  }, [updateShadeCount]);

  const resetToDefaults = useCallback(() => {
    updateAlgorithm('tailwind');
    updateContrastShift(0);
    updateShadeCount(9);
  }, [updateAlgorithm, updateContrastShift, updateShadeCount]);

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Algorithm Selection */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Algoritmo de Generación</CardTitle>
            </div>
            {algorithm && (
              <Badge variant="outline" className="text-xs">
                {algorithm}
              </Badge>
            )}
          </div>
          <CardDescription>
            Selecciona el método para generar los tonos de color
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {(Object.keys(algorithmInfo) as ColorAlgorithm[]).map((algoKey) => {
              const info = algorithmInfo[algoKey];
              const isSelected = algorithm === algoKey;
              
              return (
                  <motion.div
                    key={algoKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full h-auto p-4 justify-start text-left ${
                        isSelected 
                          ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleAlgorithmChange(algoKey)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                            {info.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold capitalize">
                              {algoKey === 'tailwind' ? 'Tailwind CSS' : 
                               algoKey === 'radix' ? 'Radix UI' :
                               algoKey === 'ant' ? 'Ant Design' : 
                               algoKey.charAt(0).toUpperCase() + algoKey.slice(1)}
                            </span>
                            {info.badge && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  isSelected ? 'bg-blue-400 text-white' : ''
                                }`}
                              >
                                {info.badge}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isSelected ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contrast Adjustment */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Ajuste de Contraste</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {contrastShift > 0 ? '+' : ''}{contrastShift}
            </Badge>
          </div>
          <CardDescription>
            Ajusta el contraste general de la paleta (-50 a +50)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Menos contraste</span>
              <span className="font-mono text-gray-700">
                {contrastShift}
              </span>
              <span className="text-gray-500">Más contraste</span>
            </div>
            
            <CustomSlider
                  value={[contrastShift]}
                  onValueChange={handleContrastChange}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>-50</span>
              <span>0</span>
              <span>+50</span>
            </div>
          </div>
          
          {/* Contrast preview */}
          {currentPalette && (
            <div className="mt-4">
              <Label className="text-sm text-gray-600 mb-2 block">Vista previa del contraste</Label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {currentPalette.shades.slice(0, 5).map((shade, index) => (
                  <div
                    key={index}
                    className="flex-1 h-8"
                    style={{ backgroundColor: shade.color.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shade Count */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Número de Tonos</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {shadeCount} tonos
            </Badge>
          </div>
          <CardDescription>
            Define cuántos tonos generar en la paleta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomSelect
            value={String(shadeCount)}
            onValueChange={handleShadeCountChange}
          >
            <CustomSelectTrigger className="w-full">
              <CustomSelectValue placeholder="Selecciona el número de tonos" />
            </CustomSelectTrigger>
            <CustomSelectContent>
              {shadeCountOptions.map((option) => (
                <CustomSelectItem key={option.value} value={String(option.value)}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500 ml-2">{option.description}</span>
                  </div>
                </CustomSelectItem>
              ))}
            </CustomSelectContent>
          </CustomSelect>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Restaurar valores por defecto
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};