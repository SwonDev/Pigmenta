import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pipette, Shuffle, Copy, Check } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useColorStore } from '../stores/useColorStore';
import { DESIGN_TOKENS, DARK_THEME_COLORS } from '../constants/designTokens';
import { convertColor, parseColorInput, generateRandomColor, isValidHexColor } from '../utils/colorUtils';
import type { ColorFormat } from '../types';

export const ColorInputSection = () => {
  const {
    currentPalette,
    updateBaseColor
  } = useAppStore();
  
  const { colorFormat, setColorFormat } = useColorStore();
  
  const baseColor = currentPalette.baseColor;
  const { isDark } = useAppStore();
  
  const [hexInput, setHexInput] = useState(baseColor.hex);
  const [copied, setCopied] = useState(false);

  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    
    if (isValidHexColor(value)) {
      const newColor = parseColorInput(value);
      if (newColor) {
        updateBaseColor(newColor);
      }
    }
  }, [updateBaseColor]);





  const handleRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    updateBaseColor(randomColor);
    setHexInput(randomColor.hex);
  }, [updateBaseColor]);

  const handleCopyColor = useCallback(async () => {
    const colorString = convertColor(baseColor, colorFormat);
    try {
      await navigator.clipboard.writeText(colorString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, [baseColor, colorFormat]);

  const formatOptions: { value: ColorFormat; label: string }[] = [
    { value: 'hsl', label: 'HSL' },
    { value: 'rgb', label: 'RGB' },
    { value: 'oklch', label: 'OKLCH' }
  ];

  return (
    <motion.div
      className="rounded-2xl shadow-lg border p-6"
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.subtle
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: DESIGN_TOKENS.colors.text.primary }}
          >
            Color Input
          </h2>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleRandomColor}
              className="p-2 text-white rounded-lg transition-colors"
              style={{
                backgroundColor: DESIGN_TOKENS.colors.accent.primary,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={handleCopyColor}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
                color: DESIGN_TOKENS.colors.text.secondary
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Color Preview */}
        <div className="relative">
          <motion.div
            className="w-full h-24 rounded-xl border-2 cursor-pointer relative overflow-hidden group"
            style={{ 
              backgroundColor: baseColor.hex,
              borderColor: DESIGN_TOKENS.colors.border.subtle
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = baseColor.hex;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const colorValue = parseColorInput(target.value);
                if (colorValue) {
                  updateBaseColor(colorValue);
                  setHexInput(colorValue.hex);
                }
              };
              input.click();
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
              >
                <Pipette className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Hex Input */}
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: DESIGN_TOKENS.colors.text.secondary }}
          >
            Hex Color
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
            style={{
              backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
              borderColor: DESIGN_TOKENS.colors.border.subtle,
              color: DESIGN_TOKENS.colors.text.primary
            }}
            placeholder="#3b82f6"
          />
        </div>

        {/* Format Selector */}
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: DESIGN_TOKENS.colors.text.secondary }}
          >
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formatOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setColorFormat(option.value)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: colorFormat === option.value 
                    ? DESIGN_TOKENS.colors.accent.primary
                    : DESIGN_TOKENS.colors.surface.mutedCard,
                  color: colorFormat === option.value
                    ? '#ffffff'
                    : DESIGN_TOKENS.colors.text.secondary
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Value Display */}
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: isDark ? DARK_THEME_COLORS.text.tertiary : '#374151' }}
          >
            Current Value
          </label>
          <div 
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
              borderColor: DESIGN_TOKENS.colors.border.subtle
            }}
          >
            <code 
              className="text-sm font-mono"
              style={{ color: DESIGN_TOKENS.colors.text.primary }}
            >
              {convertColor(baseColor, colorFormat)}
            </code>
          </div>
        </div>




      </div>
    </motion.div>
  );
};