import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Hash, Layers, Settings, ChevronDown } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { DESIGN_TOKENS, DARK_THEME_COLORS } from '../constants/designTokens';
import type { ColorAlgorithm, NamingPattern } from '../types';

export const ControlsPanel = () => {
  const {
    algorithm,
    setAlgorithm,
    contrastShift,
    setContrastShift,
    namingPattern,
    setNamingPattern,
    shadeCount,
    setShadeCount,
    controlsExpanded,
    customShadeMode,
    customShadeCount,
    setCustomShadeMode,
    setCustomShadeCount,
    toggleControls,
    theme
  } = useAppStore();
  const isDark = theme === 'dark';
  const [namingDropdownOpen, setNamingDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNamingDropdownOpen(false);
      }
    };

    if (namingDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [namingDropdownOpen]);

  const algorithmOptions: { value: ColorAlgorithm; label: string; description: string }[] = [
    {
      value: 'tailwind',
      label: 'Tailwind CSS',
      description: 'Standard Tailwind color scale with perceptual uniformity'
    },
    {
      value: 'radix',
      label: 'Radix UI',
      description: 'Radix UI color system with accessibility focus'
    },
    {
      value: 'ant',
      label: 'Ant Design',
      description: 'Ant Design color palette system'
    },
    {
      value: 'lightness',
      label: 'Lightness Scale',
      description: 'Linear lightness progression scale'
    },
    {
      value: 'saturation',
      label: 'Saturation Scale',
      description: 'Saturation-based color variations'
    },
    {
      value: 'hue',
      label: 'Hue Shift Scale',
      description: 'Hue rotation based color generation'
    },
    {
      value: 'monochromatic',
      label: 'Monochromatic',
      description: 'Single hue with varying lightness and saturation'
    },
    {
      value: 'analogous',
      label: 'Analogous',
      description: 'Adjacent hues on the color wheel'
    },
    {
      value: 'complementary',
      label: 'Complementary',
      description: 'Opposite hues on the color wheel'
    }
  ];

  const namingPatternOptions: { value: NamingPattern; label: string; example: string }[] = [
    { value: '50-950', label: 'Tailwind Scale', example: '50, 100, 200...' },
    { value: '100-900', label: 'Material Scale', example: '100, 200, 300...' },
    { value: '50-900', label: 'Tailwind Compact', example: '50, 100...900' },
    { value: '1-20', label: 'Sequential Numbers', example: '1, 2, 3...20' },
    { value: '10-200', label: 'Stepped Scale', example: '10, 20, 30...200' },
    { value: 'custom', label: 'Custom', example: 'light, base, dark...' }
  ];

  const minShadeCount = 3;
  const maxShadeCount = 20;

  return (
    <motion.div
      className="rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.subtle
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 py-4 border-b cursor-pointer transition-colors duration-200"
        style={{
          borderColor: isDark ? DARK_THEME_COLORS.border.primary : '#e5e7eb',
          backgroundColor: DESIGN_TOKENS.colors.surface.card
        }}
        whileHover={{
          backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard
        }}
        onClick={() => toggleControls()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold transition-colors duration-300" style={{
              color: DESIGN_TOKENS.colors.text.primary
            }}>Controls</h2>
          </div>
          <motion.div
            animate={{ rotate: controlsExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{
          height: controlsExpanded ? 'auto' : 0,
          opacity: controlsExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="p-6 space-y-8">
          {/* Algorithm Selector */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 transition-colors duration-300" style={{
                color: DESIGN_TOKENS.colors.text.muted
              }} />
              <label className="text-sm font-medium transition-colors duration-300" style={{
                color: DESIGN_TOKENS.colors.text.secondary
              }}>Color Algorithm</label>
            </div>
            <div className="space-y-3">
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as ColorAlgorithm)}
                className="w-full p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 appearance-none"
                style={{
                  borderColor: DESIGN_TOKENS.colors.border.subtle,
                  backgroundColor: DESIGN_TOKENS.colors.surface.card,
                  color: DESIGN_TOKENS.colors.text.primary
                }}
              >
                {algorithmOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    style={{
                      backgroundColor: DESIGN_TOKENS.colors.surface.card,
                      color: DESIGN_TOKENS.colors.text.primary
                    }}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* Algorithm Description */}
              <motion.div
                className="p-3 rounded-lg border transition-colors duration-300"
                style={{
                  backgroundColor: isDark ? DARK_THEME_COLORS.background.secondary : '#f8fafc',
                  borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e2e8f0'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={algorithm}
              >
                <p className="text-xs transition-colors duration-300" style={{
                  color: DESIGN_TOKENS.colors.text.muted
                }}>
                  {algorithmOptions.find(opt => opt.value === algorithm)?.description}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Contrast Shift Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r rounded-full" style={{
                  backgroundImage: isDark 
                    ? `linear-gradient(to right, ${DARK_THEME_COLORS.surface.secondary}, ${DARK_THEME_COLORS.text.secondary})`
                    : 'linear-gradient(to right, #d1d5db, #374151)'
                }} />
                <label className="text-sm font-medium transition-colors duration-300" style={{
                color: DESIGN_TOKENS.colors.text.secondary
              }}>Contrast Shift</label>
              </div>
              <span className="text-sm font-mono px-2 py-1 rounded transition-colors duration-300" style={{
                color: DESIGN_TOKENS.colors.text.secondary,
                backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard
              }}>
                {contrastShift > 0 ? '+' : ''}{contrastShift}
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={contrastShift}
                onChange={(e) => setContrastShift(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    #ef4444 0%, 
                    #f97316 25%, 
                    #eab308 50%, 
                    #22c55e 75%, 
                    #3b82f6 100%
                  )`
                }}
              />
              <div className="flex justify-between text-xs mt-1 transition-colors duration-300" style={{
                color: DESIGN_TOKENS.colors.text.muted
              }}>
                <span>-50</span>
                <span>0</span>
                <span>+50</span>
              </div>
            </div>
            <p className="text-xs transition-colors duration-300" style={{
              color: DESIGN_TOKENS.colors.text.muted
            }}>
              Adjust the contrast and brightness of generated shades
            </p>
          </div>

          {/* Naming Pattern */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 transition-colors duration-300" style={{
                 color: DESIGN_TOKENS.colors.text.muted
               }} />
              <label className="text-sm font-medium transition-colors duration-300" style={{
                 color: DESIGN_TOKENS.colors.text.secondary
               }}>Naming Pattern</label>
            </div>
            <div className="relative">
              <motion.button
                onClick={() => setNamingDropdownOpen(!namingDropdownOpen)}
                className="w-full p-3 text-left rounded-lg border-2 transition-all duration-200 flex items-center justify-between"
                style={{
                  borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb',
                  backgroundColor: isDark ? DARK_THEME_COLORS.background.primary : '#ffffff',
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}
                whileHover={{
                  backgroundColor: isDark ? DARK_THEME_COLORS.background.secondary : '#f9fafb'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <div className="font-medium text-sm">
                    {namingPatternOptions.find(opt => opt.value === namingPattern)?.label}
                  </div>
                  <div className="text-xs mt-1 font-mono transition-colors duration-300" style={{
                    color: DESIGN_TOKENS.colors.text.muted
                  }}>
                    {namingPatternOptions.find(opt => opt.value === namingPattern)?.example}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: namingDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" style={{
                    color: DESIGN_TOKENS.colors.text.muted
                  }} />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {namingDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 right-0 mb-2 border rounded-lg shadow-lg"
                    style={{
                      backgroundColor: isDark ? DARK_THEME_COLORS.background.primary : '#ffffff',
                      borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb',
                      zIndex: 9999
                    }}
                  >
                    {namingPatternOptions.map((option, index) => (
                      <motion.button
                        key={option.value}
                        onClick={() => {
                          setNamingPattern(option.value);
                          setNamingDropdownOpen(false);
                        }}
                        className="w-full p-3 text-left transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                        style={{
                          backgroundColor: namingPattern === option.value
                            ? (isDark ? DARK_THEME_COLORS.background.secondary : '#eff6ff')
                            : 'transparent',
                          color: namingPattern === option.value
                            ? (isDark ? DARK_THEME_COLORS.accent.primary : '#1d4ed8')
                            : (isDark ? DARK_THEME_COLORS.text.secondary : '#374151')
                        }}
                        whileHover={{
                          backgroundColor: namingPattern === option.value
                            ? (isDark ? DARK_THEME_COLORS.background.secondary : '#eff6ff')
                            : (isDark ? DARK_THEME_COLORS.background.secondary : '#f9fafb')
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs mt-1 font-mono transition-colors duration-300" style={{
                              color: namingPattern === option.value 
                                ? (isDark ? DARK_THEME_COLORS.text.tertiary : '#3b82f6')
                                : DESIGN_TOKENS.colors.text.muted
                            }}>
                              {option.example}
                            </div>
                          </div>
                          {namingPattern === option.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: isDark ? DARK_THEME_COLORS.accent.primary : '#3b82f6'
                              }}
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Shade Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 transition-colors duration-300" style={{
                  color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
                }} />
                <label className="text-sm font-medium transition-colors duration-300" style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}>Shade Count</label>
              </div>
              <span className="text-sm font-mono px-2 py-1 rounded transition-colors duration-300" style={{
                color: isDark ? DARK_THEME_COLORS.text.secondary : '#4b5563',
                backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard
              }}>
                {customShadeMode ? customShadeCount : shadeCount} shades
              </span>
            </div>
            
            {!customShadeMode && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="range"
                    min={minShadeCount}
                    max={maxShadeCount}
                    step="1"
                    value={shadeCount}
                    onChange={(e) => setShadeCount(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: isDark 
                        ? `linear-gradient(to right, ${DARK_THEME_COLORS.accent.primary}, ${DARK_THEME_COLORS.accent.hover})`
                        : 'linear-gradient(to right, #3b82f6, #1d4ed8)'
                    }}
                  />
                  <div className="flex justify-between text-xs mt-2 transition-colors duration-300" style={{
                    color: DESIGN_TOKENS.colors.text.muted
                  }}>
                    <span>{minShadeCount}</span>
                    <span>{Math.floor((minShadeCount + maxShadeCount) / 2)}</span>
                    <span>{maxShadeCount}</span>
                  </div>
                </div>
              </div>
            )}
            
            {customShadeMode && (
              <div className="p-3 rounded-lg border-2 border-dashed transition-colors duration-300" style={{
                borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#d1d5db',
                backgroundColor: isDark ? DARK_THEME_COLORS.background.secondary : '#f9fafb'
              }}>
                <p className="text-xs text-center transition-colors duration-300" style={{
                  color: DESIGN_TOKENS.colors.text.muted
                }}>
                  Custom mode active - Use the custom input below to set shade count
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-1 mt-2">
              {Array.from({ length: customShadeMode ? customShadeCount : shadeCount }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-6 rounded-sm"
                  style={{
                    backgroundImage: isDark 
                      ? `linear-gradient(to bottom, ${DARK_THEME_COLORS.surface.primary}, ${DARK_THEME_COLORS.surface.secondary})`
                      : 'linear-gradient(to bottom, #e5e7eb, #1f2937)'
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>

          {/* Custom Shade Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 transition-colors duration-300" style={{
                  color: isDark ? DARK_THEME_COLORS.text.tertiary : '#4b5563'
                }} />
                <label className="text-sm font-medium transition-colors duration-300" style={{
                  color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                }}>Custom Mode</label>
              </div>
              <motion.button
                onClick={() => setCustomShadeMode(!customShadeMode)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: customShadeMode 
                    ? (isDark ? DARK_THEME_COLORS.accent.primary : '#3b82f6')
                    : (isDark ? DARK_THEME_COLORS.surface.secondary : '#d1d5db')
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                  animate={{
                    x: customShadeMode ? 24 : 4
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            
            <AnimatePresence>
              {customShadeMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium transition-colors duration-300" style={{
                      color: isDark ? DARK_THEME_COLORS.text.secondary : '#374151'
                    }}>Custom Shade Count</label>
                    <span className="text-sm font-mono px-2 py-1 rounded transition-colors duration-300" style={{
                      color: isDark ? DARK_THEME_COLORS.text.secondary : '#4b5563',
                      backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard
                    }}>
                      {customShadeCount} shades
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="100"
                      value={customShadeCount}
                      onChange={(e) => {
                        const value = Math.max(3, Math.min(100, parseInt(e.target.value) || 3));
                        setCustomShadeCount(value);
                      }}
                      className="w-full p-3 text-center rounded-lg border-2 transition-all duration-200 font-mono text-lg"
                      style={{
                        borderColor: isDark ? DARK_THEME_COLORS.border.secondary : '#e5e7eb',
                        backgroundColor: isDark ? DARK_THEME_COLORS.background.primary : '#ffffff',
                        color: isDark ? DARK_THEME_COLORS.text.primary : '#111827'
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs transition-colors duration-300" style={{
                    color: DESIGN_TOKENS.colors.text.muted
                  }}>
                    <span>Min: 3</span>
                    <span>Max: 100</span>
                  </div>
                  
                  <p className="text-xs transition-colors duration-300" style={{
                    color: DESIGN_TOKENS.colors.text.muted
                  }}>
                    Enable custom mode to specify any number of shades beyond the 20 limit
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>
      </motion.div>
    </motion.div>
  );
};