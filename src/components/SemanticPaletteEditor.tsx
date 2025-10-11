import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Copy, Check, RefreshCw, Eye, EyeOff, Info } from 'lucide-react';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { AIColorEngine } from '../utils/aiColorEngine';
import { cn } from '../lib/utils';

export const SemanticPaletteEditor: React.FC = () => {
  const { currentPalette, updatePaletteColor, savePalette } = useAIPaletteStore();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showContrastInfo, setShowContrastInfo] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [invalidColors, setInvalidColors] = useState<Set<string>>(new Set());

  if (!currentPalette) return null;

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleColorChange = (colorGroup: string, variation: string, newColor: string) => {
    const colorKey = `${colorGroup}-${variation}`;

    if (isValidHexColor(newColor)) {
      updatePaletteColor(colorGroup, variation, newColor);
      setInvalidColors(prev => {
        const next = new Set(prev);
        next.delete(colorKey);
        return next;
      });
    } else {
      setInvalidColors(prev => new Set(prev).add(colorKey));
    }
  };

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const getContrastRatio = (color1: string, color2: string) => {
    return AIColorEngine.validateContrast(color1, color2);
  };

  const getContrastLevel = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', color: 'text-green-400' };
    if (ratio >= 4.5) return { level: 'AA', color: 'text-yellow-400' };
    if (ratio >= 3) return { level: 'AA Large', color: 'text-orange-400' };
    return { level: 'Fail', color: 'text-red-400' };
  };

  const handleSave = () => {
    savePalette(currentPalette);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-6">
          <Palette className="w-10 h-10" style={{ color: '#23AAD7' }} />
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">{currentPalette.name}</h2>
            <p className="text-xl text-white/70 leading-relaxed">{currentPalette.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setShowContrastInfo(!showContrastInfo)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all text-lg",
              "focus:outline-none focus:ring-2",
              showContrastInfo
                ? "text-white border"
                : "bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20"
            )}
            style={{
              ...(showContrastInfo && {
                backgroundColor: 'rgba(35, 170, 215, 0.2)',
                borderColor: 'rgba(35, 170, 215, 0.3)',
                boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
              }),
              ...(!showContrastInfo && {
                boxShadow: 'transparent'
              })
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showContrastInfo ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            <span>Contrast Info</span>
          </motion.button>
          
          <motion.button
            onClick={() => savePalette(currentPalette)}
            className="px-8 py-4 text-white rounded-xl font-semibold transition-colors text-lg"
            style={{
              backgroundColor: '#23AAD7'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#20A0CB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#23AAD7';
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Palette
          </motion.button>
        </div>
      </motion.div>

      {/* Color Groups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {Object.entries(currentPalette?.colors || {}).map(([groupKey, colorGroup], index) => (
          <motion.div
            key={groupKey}
            className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="space-y-8">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white capitalize mb-3">
                    {colorGroup?.name || 'Unnamed Group'}
                  </h3>
                  <p className="text-lg text-white/70 leading-relaxed">{colorGroup?.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: colorGroup?.base || '#ffffff' }}
                  />
                </div>
              </div>

              {/* Base Color */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-white">
                  Base Color
                </label>
                <div className="flex items-center gap-6">
                  <div
                    className="w-24 h-20 rounded-xl border border-white/20 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: colorGroup?.base || '#ffffff' }}
                    onClick={() => setEditingColor(`${groupKey}-base`)}
                  >
                    {editingColor === `${groupKey}-base` && (
                      <input
                        type="color"
                        value={colorGroup?.base || '#ffffff'}
                        onChange={(e) => handleColorChange(groupKey, 'base', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onBlur={() => setEditingColor(null)}
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={colorGroup?.base || '#ffffff'}
                      onChange={(e) => handleColorChange(groupKey, 'base', e.target.value)}
                      className={cn(
                        "w-full px-6 py-4 bg-white/10 border rounded-xl text-white font-mono text-lg focus:outline-none focus:ring-2",
                        invalidColors.has(`${groupKey}-base`)
                          ? "border-red-500/50 focus:ring-red-500/50"
                          : "border-white/20 focus:ring-blue-500/50"
                      )}
                    />
                    {invalidColors.has(`${groupKey}-base`) && (
                      <p className="text-red-400 text-sm mt-2">Invalid HEX format (e.g., #RRGGBB)</p>
                    )}
                  </div>
                  
                  <motion.button
                    onClick={() => copyToClipboard(colorGroup?.base || '#ffffff')}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedColor === (colorGroup?.base || '#ffffff') ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <Copy className="w-6 h-6 text-white/60" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Variations */}
              <div className="space-y-6">
                <label className="block text-xl font-semibold text-white">
                  Variations
                </label>
                
                <div className="space-y-5">
                  {Object.entries(colorGroup?.variations || {}).map(([variation, color]) => (
                    <div key={variation} className="space-y-2">
                      <div className="flex items-center gap-6">
                        <div className="w-16 text-lg text-white/70 font-medium">
                          {variation}
                        </div>

                        <div
                          className="w-20 h-12 rounded-lg border border-white/20 cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: color }}
                          onClick={() => setEditingColor(`${groupKey}-${variation}`)}
                        >
                          {editingColor === `${groupKey}-${variation}` && (
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => handleColorChange(groupKey, variation, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onBlur={() => setEditingColor(null)}
                              autoFocus
                            />
                          )}
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => handleColorChange(groupKey, variation, e.target.value)}
                            className={cn(
                              "w-full px-5 py-3 bg-white/10 border rounded-lg text-white font-mono text-base focus:outline-none focus:ring-2",
                              invalidColors.has(`${groupKey}-${variation}`)
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : "border-white/20 focus:ring-blue-500/50"
                            )}
                          />
                        </div>
                      
                        <motion.button
                          onClick={() => copyToClipboard(color)}
                          className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copiedColor === color ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-white/60" />
                          )}
                        </motion.button>
                      </div>
                      {invalidColors.has(`${groupKey}-${variation}`) && (
                        <p className="text-red-400 text-sm ml-20">Invalid HEX format (e.g., #RRGGBB)</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contrast Information */}
              <AnimatePresence>
                {showContrastInfo && (
                  <motion.div
                    className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="w-5 h-5 text-blue-400" />
                      <span className="text-lg font-medium text-white/80">
                        Contrast Ratios vs Background
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-base">
                      {groupKey !== 'background' && (
                        <>
                          {[colorGroup?.base || '#ffffff', ...Object.values(colorGroup?.variations || {})].map((color, idx) => {
                            const ratio = getContrastRatio(color, currentPalette?.colors?.background?.base || '#ffffff');
                            const { level, color: levelColor } = getContrastLevel(ratio);
                            const label = idx === 0 ? 'base' : Object.keys(colorGroup?.variations || {})[idx - 1];
                            
                            return (
                              <div key={idx} className="flex items-center justify-between py-2">
                                <span className="text-white/60 font-medium">{label}:</span>
                                <span className={cn("font-semibold", levelColor)}>
                                  {ratio.toFixed(1)}:1 ({level})
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Palette Metadata */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-2xl font-semibold text-white mb-8">Palette Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-medium text-white/80 mb-4">
              Style
            </label>
            <div className="px-6 py-4 bg-white/10 rounded-xl text-white/70 capitalize text-lg">
              {currentPalette?.metadata?.style || 'Not specified'}
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-medium text-white/80 mb-4">
              Created
            </label>
            <div className="px-6 py-4 bg-white/10 rounded-xl text-white/70 text-lg">
              {currentPalette?.metadata?.createdAt 
                ? new Date(currentPalette.metadata.createdAt).toLocaleDateString()
                : 'Unknown date'
              }
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-white/80 mb-4">
              Tags
            </label>
            <div className="flex flex-wrap gap-3">
              {(currentPalette?.metadata?.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-lg text-base font-medium"
                  style={{
                    backgroundColor: 'rgba(35, 170, 215, 0.2)',
                    color: '#23AAD7'
                  }}
                >
                  {tag}
                </span>
              ))}
              {(!currentPalette?.metadata?.tags || currentPalette?.metadata?.tags?.length === 0) && (
                <span className="px-4 py-2 rounded-lg text-base font-medium text-white/50 italic">
                  No tags available
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};