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
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-3 md:gap-6 flex-1">
          <Palette className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0" style={{ color: '#23AAD7' }} />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-3">{currentPalette.name}</h2>
            <p className="text-sm md:text-xl text-white/70 leading-relaxed">{currentPalette.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <motion.button
            onClick={() => setShowContrastInfo(!showContrastInfo)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 md:px-6 md:py-4 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-lg",
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
            {showContrastInfo ? <EyeOff className="w-4 h-4 md:w-6 md:h-6" /> : <Eye className="w-4 h-4 md:w-6 md:h-6" />}
            <span className="hidden sm:inline">Contrast Info</span>
          </motion.button>

          <motion.button
            onClick={() => savePalette(currentPalette)}
            className="px-4 py-2 md:px-8 md:py-4 text-white rounded-lg md:rounded-xl font-semibold transition-colors text-sm md:text-lg"
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
            <span className="hidden sm:inline">Save Palette</span>
            <span className="sm:hidden">Save</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Color Groups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
        {Object.entries(currentPalette?.colors || {}).map(([groupKey, colorGroup], index) => (
          <motion.div
            key={groupKey}
            className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/10 p-5 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="space-y-5 md:space-y-8">
              {/* Group Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-2xl font-bold text-white capitalize mb-1 md:mb-3">
                    {colorGroup?.name || 'Unnamed Group'}
                  </h3>
                  <p className="text-sm md:text-lg text-white/70 leading-relaxed">{colorGroup?.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: colorGroup?.base || '#ffffff' }}
                  />
                </div>
              </div>

              {/* Base Color */}
              <div className="space-y-3 md:space-y-4">
                <label className="block text-base md:text-xl font-semibold text-white">
                  Base Color
                </label>
                <div className="flex items-center gap-3 md:gap-6">
                  <div
                    className="w-16 h-14 md:w-24 md:h-20 rounded-lg md:rounded-xl border border-white/20 cursor-pointer relative overflow-hidden flex-shrink-0"
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

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={colorGroup?.base || '#ffffff'}
                      onChange={(e) => handleColorChange(groupKey, 'base', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 md:px-6 md:py-4 bg-white/10 border rounded-lg md:rounded-xl text-white font-mono text-sm md:text-lg focus:outline-none focus:ring-2 touch-manipulation",
                        invalidColors.has(`${groupKey}-base`)
                          ? "border-red-500/50 focus:ring-red-500/50"
                          : "border-white/20 focus:ring-blue-500/50"
                      )}
                      style={{
                        WebkitAppearance: 'none',
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    {invalidColors.has(`${groupKey}-base`) && (
                      <p className="text-red-400 text-xs md:text-sm mt-1 md:mt-2">Invalid HEX format (e.g., #RRGGBB)</p>
                    )}
                  </div>

                  <motion.button
                    onClick={() => copyToClipboard(colorGroup?.base || '#ffffff')}
                    className="p-2 md:p-4 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedColor === (colorGroup?.base || '#ffffff') ? (
                      <Check className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 md:w-6 md:h-6 text-white/60" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Variations */}
              <div className="space-y-4 md:space-y-6">
                <label className="block text-base md:text-xl font-semibold text-white">
                  Variations
                </label>

                <div className="space-y-4 md:space-y-5">
                  {Object.entries(colorGroup?.variations || {}).map(([variation, color]) => (
                    <div key={variation} className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-2 md:gap-6">
                        <div className="w-12 md:w-16 text-sm md:text-lg text-white/70 font-medium flex-shrink-0">
                          {variation}
                        </div>

                        <div
                          className="w-14 h-10 md:w-20 md:h-12 rounded-md md:rounded-lg border border-white/20 cursor-pointer relative overflow-hidden flex-shrink-0"
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

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => handleColorChange(groupKey, variation, e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 md:px-5 md:py-3 bg-white/10 border rounded-md md:rounded-lg text-white font-mono text-sm md:text-base focus:outline-none focus:ring-2 touch-manipulation",
                              invalidColors.has(`${groupKey}-${variation}`)
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : "border-white/20 focus:ring-blue-500/50"
                            )}
                            style={{
                              WebkitAppearance: 'none',
                              fontSize: '16px' // Prevents zoom on iOS
                            }}
                            inputMode="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                          />
                        </div>

                        <motion.button
                          onClick={() => copyToClipboard(color)}
                          className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-md md:rounded-lg transition-colors flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copiedColor === color ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 md:w-5 md:h-5 text-white/60" />
                          )}
                        </motion.button>
                      </div>
                      {invalidColors.has(`${groupKey}-${variation}`) && (
                        <p className="text-red-400 text-xs md:text-sm ml-14 md:ml-20">Invalid HEX format (e.g., #RRGGBB)</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contrast Information */}
              <AnimatePresence>
                {showContrastInfo && (
                  <motion.div
                    className="mt-4 md:mt-6 p-4 md:p-6 bg-white/5 rounded-lg md:rounded-xl border border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm md:text-lg font-medium text-white/80">
                        Contrast Ratios vs Background
                      </span>
                    </div>

                    <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                      {groupKey !== 'background' && (
                        <>
                          {[colorGroup?.base || '#ffffff', ...Object.values(colorGroup?.variations || {})].map((color, idx) => {
                            const ratio = getContrastRatio(color, currentPalette?.colors?.background?.base || '#ffffff');
                            const { level, color: levelColor } = getContrastLevel(ratio);
                            const label = idx === 0 ? 'base' : Object.keys(colorGroup?.variations || {})[idx - 1];

                            return (
                              <div key={idx} className="flex items-center justify-between py-1 md:py-2">
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
        className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/10 p-5 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-6 md:mb-8">Palette Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          <div>
            <label className="block text-sm md:text-lg font-medium text-white/80 mb-2 md:mb-4">
              Style
            </label>
            <div className="px-4 py-3 md:px-6 md:py-4 bg-white/10 rounded-lg md:rounded-xl text-white/70 capitalize text-sm md:text-lg">
              {currentPalette?.metadata?.style || 'Not specified'}
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-lg font-medium text-white/80 mb-2 md:mb-4">
              Created
            </label>
            <div className="px-4 py-3 md:px-6 md:py-4 bg-white/10 rounded-lg md:rounded-xl text-white/70 text-sm md:text-lg">
              {currentPalette?.metadata?.createdAt
                ? new Date(currentPalette.metadata.createdAt).toLocaleDateString()
                : 'Unknown date'
              }
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm md:text-lg font-medium text-white/80 mb-2 md:mb-4">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {(currentPalette?.metadata?.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-base font-medium"
                  style={{
                    backgroundColor: 'rgba(35, 170, 215, 0.2)',
                    color: '#23AAD7'
                  }}
                >
                  {tag}
                </span>
              ))}
              {(!currentPalette?.metadata?.tags || currentPalette?.metadata?.tags?.length === 0) && (
                <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-base font-medium text-white/50 italic">
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