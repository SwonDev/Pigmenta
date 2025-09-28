import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Check, Code, FileText, Palette, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '../stores/useAppStore';
import { DESIGN_TOKENS } from '../constants/designTokens';
import type { ExportConfig, ColorPalette, ExportFormat } from '../types';

interface ExportSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

// Solo incluir los formatos que están definidos en types/index.ts
const formatInfo: Partial<Record<ExportFormat, { name: string; description: string; icon: React.ReactNode; extension: string }>> = {
  css: {
    name: 'CSS Variables',
    description: 'Variables CSS personalizadas para usar en cualquier proyecto',
    icon: <Code className="w-4 h-4" />,
    extension: '.css'
  },
  tailwind: {
    name: 'Tailwind Config',
    description: 'Configuración para Tailwind CSS con clases personalizadas',
    icon: <FileText className="w-4 h-4" />,
    extension: '.js'
  },
  tailwind4: {
    name: 'Tailwind v4',
    description: 'Configuración para Tailwind CSS v4',
    icon: <FileText className="w-4 h-4" />,
    extension: '.js'
  },
  tokens: {
    name: 'Design Tokens',
    description: 'Tokens de diseño para sistemas de diseño',
    icon: <Palette className="w-4 h-4" />,
    extension: '.json'
  },
  svg: {
    name: 'SVG Palette',
    description: 'Paleta de colores en formato SVG',
    icon: <Palette className="w-4 h-4" />,
    extension: '.svg'
  }
};

const generateExportCode = (palette: ColorPalette, format: ExportFormat): string => {
  const paletteName = 'palette';
  
  switch (format) {
    case 'css': {
      const cssVars = palette.shades.map(shade => 
        `  --color-${paletteName}-${shade.name}: ${shade.color.hex};`
      ).join('\n');
      
      return `:root {\n${cssVars}\n}\n\n/* Uso: */\n/* background-color: var(--color-${paletteName}-500); */\n/* color: rgb(var(--color-${paletteName}-600)); */`;
    }
    
    case 'tailwind': {
      const tailwindColors = palette.shades.reduce((acc, shade) => {
        acc[shade.name] = shade.color.hex;
        return acc;
      }, {} as Record<string, string>);
      
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${paletteName}': ${JSON.stringify(tailwindColors, null, 8).replace(/"/g, "'")},\n      }\n    }\n  }\n}\n\n// Uso:\n// bg-${paletteName}-500\n// text-${paletteName}-600\n// border-${paletteName}-300`;
    }
    
    case 'tokens': {
      const jsonData = {
        name: palette.name,
        baseColor: palette.baseColor,
        algorithm: palette.algorithm,
        createdAt: new Date().toISOString(),
        shades: palette.shades.map(shade => ({
          name: shade.name,
          value: shade.value,
          color: shade.color
        }))
      };
      
      return JSON.stringify(jsonData, null, 2);
    }
    
    case 'tailwind4': {
      const tw4Colors = palette.shades.reduce((acc, shade) => {
        acc[shade.name] = shade.color.hex;
        return acc;
      }, {} as Record<string, string>);
      
      return `@import "tailwindcss";

@theme {
  --color-${paletteName}-*: ${JSON.stringify(tw4Colors, null, 4).replace(/"/g, '')};
}`;
    }
    
    case 'svg': {
      const svgColors = palette.shades.map((shade, index) => 
        `<rect x="${index * 40}" y="0" width="40" height="40" fill="${shade.color.hex}" />`
      ).join('\n  ');
      
      return `<svg width="${palette.shades.length * 40}" height="40" xmlns="http://www.w3.org/2000/svg">\n  ${svgColors}\n</svg>`;
    }
    
    default:
      return '';
  }
};

export const ExportSystem: React.FC<ExportSystemProps> = ({ isOpen, onClose }) => {
  const { currentPalette, addToExportHistory } = useAppStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('css');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'css',
    namingPattern: '50-900',
    prefix: '',
    suffix: ''
  });
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  const exportCode = useMemo(() => {
    if (!currentPalette) return '';
    return generateExportCode(currentPalette, selectedFormat);
  }, [currentPalette, selectedFormat]);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };
  
  const handleDownload = () => {
    if (!currentPalette) return;
    
    const blob = new Blob([exportCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette${formatInfo[selectedFormat]?.extension || '.txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Add to export history
    addToExportHistory({
      palette: currentPalette,
      format: selectedFormat,
      exportedAt: new Date().toISOString()
    });
  };
  
  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
    setExportConfig(prev => ({ ...prev, format }));
  };
  
  if (!isOpen || !currentPalette) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.card,
          border: `1px solid ${DESIGN_TOKENS.colors.border.subtle}`
        }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: DESIGN_TOKENS.colors.accent.accentMuted }}
              >
                <Download className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.accent.primary }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Exportar Paleta</h2>
                <p className="text-sm text-gray-500">Paleta de colores • {currentPalette.shades.length} tonos</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Panel - Format Selection & Options */}
            <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Formato de Exportación</Label>
                  <div className="grid gap-2">
                    {(Object.keys(formatInfo) as ExportFormat[]).map((format) => {
                      const info = formatInfo[format];
                      if (!info) return null;
                      const isSelected = selectedFormat === format;
                      
                      return (
                        <Button
                          key={format}
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full h-auto p-3 justify-start text-left ${
                            isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                          onClick={() => handleFormatChange(format)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-100'
                            }`}>
                              <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                                {info.icon}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium mb-1">{info.name}</div>
                              <p className={`text-xs ${
                                isSelected ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {info.description}
                              </p>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Export Options */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Opciones de Exportación</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Patrón de nombres</Label>
                        <p className="text-xs text-gray-500">Formato de nomenclatura</p>
                      </div>
                      <Select
                        value={exportConfig.namingPattern}
                        onValueChange={(value: '50-900' | 'alphabetic' | 'custom') => 
                          setExportConfig(prev => ({ ...prev, namingPattern: value }))
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50-900">50-900</SelectItem>
                          <SelectItem value="alphabetic">A-Z</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCopy}
                    className="w-full"
                    disabled={!exportCode}
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>¡Copiado!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copiar código</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="w-full"
                    disabled={!exportCode}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar archivo
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Code Preview */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Vista previa del código</span>
                  <Badge variant="outline" className="text-xs">
                    {formatInfo[selectedFormat]?.name || selectedFormat}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
              
              {showPreview && (
                <div className="flex-1 p-4">
                  <Textarea
                    value={exportCode}
                    readOnly
                    className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0"
                    placeholder="El código generado aparecerá aquí..."
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};