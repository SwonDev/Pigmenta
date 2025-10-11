import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Copy, 
  FileText, 
  Image, 
  Code, 
  Palette,
  Check,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { StudioExportFormat, StudioExportConfig } from '../types';
import { cn } from "../lib/utils";

const EXPORT_FORMATS: { 
  id: StudioExportFormat; 
  label: string; 
  description: string;
  icon: React.ComponentType<any>;
  extension: string;
}[] = [
  { 
    id: 'json', 
    label: 'JSON', 
    description: 'Structured data format for developers',
    icon: Code,
    extension: '.json'
  },
  { 
    id: 'css', 
    label: 'CSS Variables', 
    description: 'CSS custom properties ready to use',
    icon: FileText,
    extension: '.css'
  },
  { 
    id: 'scss', 
    label: 'SCSS Variables', 
    description: 'Sass variables for preprocessing',
    icon: FileText,
    extension: '.scss'
  },
  { 
    id: 'tailwind', 
    label: 'Tailwind Config', 
    description: 'Tailwind CSS configuration object',
    icon: Code,
    extension: '.js'
  },
  { 
    id: 'hex', 
    label: 'HEX List', 
    description: 'Simple list of hex color codes',
    icon: Palette,
    extension: '.txt'
  },
  { 
    id: 'png', 
    label: 'PNG Swatch', 
    description: 'Visual color swatch image',
    icon: Image,
    extension: '.png'
  }
];

export const StudioExportSystem: React.FC = () => {
  const { currentPalette } = useAIPaletteStore();
  const [selectedFormats, setSelectedFormats] = useState<StudioExportFormat[]>(['json']);
  const [exportConfig, setExportConfig] = useState<StudioExportConfig>({
    includeVariations: true,
    includeMetadata: true,
    customPrefix: '',
    compressionLevel: 'medium'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!currentPalette) {
    return (
      <motion.div
        className="text-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Download className="w-20 h-20 text-white/20 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-white/60 mb-3">No palette selected</h3>
        <p className="text-lg text-white/40">Generate or select a palette to export</p>
      </motion.div>
    );
  }

  const handleFormatToggle = (format: StudioExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const generateExportData = (format: StudioExportFormat): string => {
    const colors = currentPalette.colors;
    const prefix = exportConfig.customPrefix || 'color';

    switch (format) {
      case 'json':
        return JSON.stringify({
          name: currentPalette.name,
          description: currentPalette.description,
          ...(exportConfig.includeMetadata && {
            metadata: {
              createdAt: currentPalette.metadata.createdAt,
              tags: currentPalette.metadata.tags,
              author: 'Pigmenta Studio'
            }
          }),
          colors: exportConfig.includeVariations ? colors : {
            background: colors.background.base,
            primary: colors.primary.base,
            accent: colors.accent.base,
            text: colors.text.base
          }
        }, null, 2);

      case 'css':
        const cssVars = [
          `:root {`,
          `  /* ${currentPalette.name} */`
        ];

        if (exportConfig.includeVariations) {
          cssVars.push(
            `  --primary-100: ${colors.primary.variations[200]};`,
            `  --primary-200: ${colors.primary.variations[300]};`,
            `  --primary-300: ${colors.primary.base};`,
            `  --accent-100: ${colors.accent.variations[200]};`,
            `  --accent-200: ${colors.accent.base};`,
            `  --text-100: ${colors.text.base};`,
            `  --text-200: ${colors.text.variations[200]};`,
            `  --bg-100: ${colors.background.base};`,
            `  --bg-200: ${colors.background.variations[200]};`,
            `  --bg-300: ${colors.background.variations[300]};`
          );
        } else {
          cssVars.push(
            `  --primary: ${colors.primary.base};`,
            `  --accent: ${colors.accent.base};`,
            `  --text: ${colors.text.base};`,
            `  --bg: ${colors.background.base};`
          );
        }

        cssVars.push(`}`);
        return cssVars.join('\n');

      case 'scss':
        const scssVars = [
          `// ${currentPalette.name}`
        ];

        if (exportConfig.includeVariations) {
          scssVars.push(
            `$primary-100: ${colors.primary.variations[200]};`,
            `$primary-200: ${colors.primary.variations[300]};`,
            `$primary-300: ${colors.primary.base};`,
            `$accent-100: ${colors.accent.variations[200]};`,
            `$accent-200: ${colors.accent.base};`,
            `$text-100: ${colors.text.base};`,
            `$text-200: ${colors.text.variations[200]};`,
            `$bg-100: ${colors.background.base};`,
            `$bg-200: ${colors.background.variations[200]};`,
            `$bg-300: ${colors.background.variations[300]};`
          );
        } else {
          scssVars.push(
            `$primary: ${colors.primary.base};`,
            `$accent: ${colors.accent.base};`,
            `$text: ${colors.text.base};`,
            `$bg: ${colors.background.base};`
          );
        }

        return scssVars.join('\n');

      case 'tailwind':
        const tailwindConfig = {
          theme: {
            extend: {
              colors: exportConfig.includeVariations ? {
                primary: {
                  100: colors.primary.variations[200],
                  200: colors.primary.variations[300],
                  300: colors.primary.base
                },
                accent: {
                  100: colors.accent.variations[200],
                  200: colors.accent.base
                },
                text: {
                  100: colors.text.base,
                  200: colors.text.variations[200]
                },
                bg: {
                  100: colors.background.base,
                  200: colors.background.variations[200],
                  300: colors.background.variations[300]
                }
              } : {
                primary: colors.primary.base,
                accent: colors.accent.base,
                text: colors.text.base,
                bg: colors.background.base
              }
            }
          }
        };
        return `module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;

      case 'hex':
        const hexList = [
          `# ${currentPalette.name}`,
          ``
        ];

        if (exportConfig.includeVariations) {
          hexList.push(
            `# Primary Colors`,
            `primary-100: ${colors.primary.variations[200]}`,
            `primary-200: ${colors.primary.variations[300]}`,
            `primary-300: ${colors.primary.base}`,
            ``,
            `# Accent Colors`,
            `accent-100: ${colors.accent.variations[200]}`,
            `accent-200: ${colors.accent.base}`,
            ``,
            `# Text Colors`,
            `text-100: ${colors.text.base}`,
            `text-200: ${colors.text.variations[200]}`,
            ``,
            `# Background Colors`,
            `bg-100: ${colors.background.base}`,
            `bg-200: ${colors.background.variations[200]}`,
            `bg-300: ${colors.background.variations[300]}`
          );
        } else {
          hexList.push(
            `Primary: ${colors.primary.base}`,
            `Accent: ${colors.accent.base}`,
            `Text: ${colors.text.base}`,
            `Background: ${colors.background.base}`
          );
        }

        return hexList.join('\n');

      default:
        return '';
    }
  };

  const handleCopyToClipboard = async (format: StudioExportFormat) => {
    try {
      const data = generateExportData(format);
      await navigator.clipboard.writeText(data);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generatePNG = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Canvas dimensions
        const swatchSize = 120;
        const padding = 20;
        const headerHeight = 80;
        const colors = currentPalette.colors;
        const colorGroups = Object.entries(colors);

        canvas.width = (swatchSize + padding) * 4 + padding;
        canvas.height = headerHeight + (swatchSize + padding) * 3 + padding;

        // Background
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(currentPalette.name, padding, 40);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText('Generated by Pigmenta Studio', padding, 65);

        // Draw color swatches
        colorGroups.forEach(([key, colorGroup], groupIndex) => {
          const x = padding + (groupIndex % 4) * (swatchSize + padding);
          const y = headerHeight + Math.floor(groupIndex / 4) * (swatchSize + padding) + padding;

          // Base color swatch
          ctx.fillStyle = colorGroup.base;
          ctx.fillRect(x, y, swatchSize, swatchSize);

          // Label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(key.toUpperCase(), x, y + swatchSize + 18);

          // Hex code
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '10px monospace';
          ctx.fillText(colorGroup.base, x, y + swatchSize + 32);
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentPalette.name.toLowerCase().replace(/\s+/g, '-')}-palette.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDownload = async (format: StudioExportFormat) => {
    if (format === 'png') {
      await generatePNG();
      return;
    }

    const data = generateExportData(format);
    const formatConfig = EXPORT_FORMATS.find(f => f.id === format);
    const filename = `${currentPalette.name.toLowerCase().replace(/\s+/g, '-')}-palette${formatConfig?.extension || '.txt'}`;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = async () => {
    setIsExporting(true);

    try {
      for (const format of selectedFormats) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate processing
        await handleDownload(format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/10 rounded-xl">
            <Download className="w-10 h-10" style={{ color: '#23AAD7' }} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">Export Palette</h2>
            <p className="text-xl text-white/70">Export your palette in various formats</p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-4 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-6 h-6 text-white/70" />
          <span className="text-white/70 font-medium">Advanced Settings</span>
        </motion.button>
      </motion.div>

      {/* Current Palette Preview */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-2xl font-bold text-white mb-8">Current Palette</h3>
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-white">{currentPalette.name}</h4>
            <p className="text-lg text-white/70 mt-3">{currentPalette.description}</p>
          </div>
          
          <div className="flex gap-4">
            <div 
              className="w-16 h-16 rounded-xl border border-white/20"
              style={{ backgroundColor: currentPalette?.colors?.background?.base || '#ffffff' }}
            />
            <div 
              className="w-16 h-16 rounded-xl border border-white/20"
              style={{ backgroundColor: currentPalette?.colors?.primary?.base || '#007bff' }}
            />
            <div 
              className="w-16 h-16 rounded-xl border border-white/20"
              style={{ backgroundColor: currentPalette?.colors?.accent?.base || '#28a745' }}
            />
            <div 
              className="w-16 h-16 rounded-xl border border-white/20"
              style={{ backgroundColor: currentPalette?.colors?.text?.base || '#212529' }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-8">
          <motion.button
            onClick={handleBulkExport}
            disabled={selectedFormats.length === 0 || isExporting}
            className={cn(
              "flex items-center gap-4 px-8 py-4 rounded-xl font-semibold transition-all duration-200 text-lg",
              "focus:outline-none focus:ring-2",
              selectedFormats.length > 0 && !isExporting
                ? "text-white"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
            style={{
              ...(selectedFormats.length > 0 && !isExporting && {
                backgroundColor: '#23AAD7',
                boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
              }),
              ...((selectedFormats.length === 0 || isExporting) && {
                boxShadow: 'transparent'
              })
            }}
            onMouseEnter={(e) => {
              if (selectedFormats.length > 0 && !isExporting) {
                e.currentTarget.style.backgroundColor = '#20A0CB';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFormats.length > 0 && !isExporting) {
                e.currentTarget.style.backgroundColor = '#23AAD7';
              }
            }}
            whileHover={selectedFormats.length > 0 && !isExporting ? { scale: 1.02 } : {}}
            whileTap={selectedFormats.length > 0 && !isExporting ? { scale: 0.98 } : {}}
          >
            {isExporting ? (
              <>
                <motion.div
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Export Selected ({selectedFormats.length})</span>
              </>
            )}
          </motion.button>

          <span className="text-white/50 text-lg">
            or choose individual formats below
          </span>
        </div>
      </motion.div>

      {/* Advanced Configuration */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Export Configuration</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <label className="flex items-start gap-5">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeVariations}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeVariations: e.target.checked }))}
                    className="mt-1 rounded border-white/20 bg-white/10 w-5 h-5"
                    style={{
                      accentColor: '#23AAD7'
                    } as React.CSSProperties}
                  />
                  <div>
                    <span className="text-white font-semibold text-lg">Include Variations</span>
                    <p className="text-white/60 text-lg mt-2">Export 200/300 color variations for more flexibility</p>
                  </div>
                </label>

                <label className="flex items-start gap-5">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeMetadata}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="mt-1 rounded border-white/20 bg-white/10 w-5 h-5"
                    style={{
                      accentColor: '#23AAD7'
                    } as React.CSSProperties}
                  />
                  <div>
                    <span className="text-white font-semibold text-lg">Include Metadata</span>
                    <p className="text-white/60 text-lg mt-2">Add creation date, tags, and author information</p>
                  </div>
                </label>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-white font-semibold text-lg mb-4">Custom Prefix</label>
                  <input
                    type="text"
                    value={exportConfig.customPrefix}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, customPrefix: e.target.value }))}
                    placeholder="color (default)"
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-white/20 text-lg focus:ring-blue-500/50"
                  />
                  <p className="text-white/60 text-lg mt-3">Used for CSS variables and class names</p>
                </div>

                <div>
                  <label className="block text-white font-semibold text-lg mb-4">Compression Level</label>
                  <select
                    value={exportConfig.compressionLevel}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, compressionLevel: e.target.value as any }))}
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-white/20 text-lg focus:ring-blue-500/50"
                  >
                    <option value="low">Low (Readable)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Compact)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Formats */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-8">Export Formats</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormats.includes(format.id);
            
            return (
              <motion.div
                key={format.id}
                className={cn(
                  "relative p-8 rounded-xl border cursor-pointer transition-all duration-200",
                  "focus:outline-none focus:ring-2",
                  isSelected
                    ? "border-white/30 text-white"
                    : "border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                )}
                style={{
                  ...(isSelected && {
                    backgroundColor: 'rgba(35, 170, 215, 0.1)',
                    borderColor: 'rgba(35, 170, 215, 0.3)',
                    boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
                  }),
                  ...(!isSelected && {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: 'transparent'
                  })
                }}
                onClick={() => handleFormatToggle(format.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-5">
                  <Icon className="w-8 h-8 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold">{format.label}</h4>
                    <p className="text-lg opacity-70 mt-3">{format.description}</p>
                    <span className="text-base opacity-50 mt-4 block font-mono">{format.extension}</span>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#23AAD7' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Individual Export Actions */}
      {selectedFormats.length > 0 && (
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-8">Individual Export Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {selectedFormats.map((formatId) => {
              const format = EXPORT_FORMATS.find(f => f.id === formatId);
              if (!format) return null;
              
              const Icon = format.icon;
              const isCopied = copiedFormat === format.id;
              
              return (
                <motion.div
                  key={format.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: 'rgba(35, 170, 215, 0.2)' }}
                    >
                      <Icon className="w-8 h-8" style={{ color: '#23AAD7' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white">{format.label}</h4>
                      <p className="text-white/60 text-base mt-2">{format.extension}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleCopyToClipboard(format.id)}
                      className="flex items-center gap-3 px-5 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-base text-white/80 transition-colors flex-1 justify-center font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDownload(format.id)}
                      className="flex items-center gap-3 px-5 py-4 rounded-xl text-base transition-colors flex-1 justify-center font-medium"
                      style={{
                        backgroundColor: 'rgba(35, 170, 215, 0.2)',
                        color: '#23AAD7'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(35, 170, 215, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(35, 170, 215, 0.2)';
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Export Tips */}
      <motion.div
        className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-start gap-6">
          <ExternalLink className="w-8 h-8 text-blue-400 mt-1" />
          <div>
            <h3 className="text-2xl font-bold text-blue-300 mb-8">Export Tips & Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-3"></div>
                  <div>
                    <strong className="text-blue-200 text-lg">JSON:</strong>
                    <p className="text-blue-200/80 text-lg mt-2">Perfect for storing palette data and importing into other design tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-3"></div>
                  <div>
                    <strong className="text-blue-200 text-lg">CSS/SCSS:</strong>
                    <p className="text-blue-200/80 text-lg mt-2">Ready-to-use variables for web development projects</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-3"></div>
                  <div>
                    <strong className="text-blue-200 text-lg">Tailwind:</strong>
                    <p className="text-blue-200/80 text-lg mt-2">Drop into your tailwind.config.js for instant integration</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-3"></div>
                  <div>
                    <strong className="text-blue-200 text-lg">PNG:</strong>
                    <p className="text-blue-200/80 text-lg mt-2">Visual swatches for presentations and design handoffs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};