import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Check, FileText, Code, Palette, Settings, FileImage, FileType, Hash, Braces, Layers, Package, Paintbrush, Zap, Database, Figma, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { DESIGN_TOKENS } from '../constants/designTokens';
import { exportToPDF, exportToPNG } from '../utils/exportUtils';
import type { ExportFormat } from '../types';

interface ExportTabProps {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ExportTab = ({ label, icon, isActive, onClick }: ExportTabProps) => {
  
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: isActive 
          ? DESIGN_TOKENS.colors.accent.primary
          : DESIGN_TOKENS.colors.surface.card,
        color: isActive 
          ? DESIGN_TOKENS.colors.text.primary
          : DESIGN_TOKENS.colors.text.secondary
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.mutedCard;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.card;
        }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

const CodeBlock = ({ code, language, onCopy, copied }: CodeBlockProps) => {
  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
          color: DESIGN_TOKENS.colors.text.primary
        }}
      >
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{language}</span>
        </div>
        <motion.button
          onClick={onCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors duration-200"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.accent.primary,
            color: DESIGN_TOKENS.colors.text.secondary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.primary;
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>
      <div 
        className="p-4 rounded-b-lg overflow-x-auto"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.primary,
          color: DESIGN_TOKENS.colors.text.secondary
        }}
      >
        <pre className="text-sm font-mono whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const ExportSection = () => {
  const { 
    currentPalette: palette,
    settings,
    setExportFormat,
    exportPalette
  } = useAppStore();
  
  const exportFormat = settings.exportPreferences.format;
  
  const [copied, setCopied] = useState(false);
  const [downloadFormat] = useState<ExportFormat>('css');
  const [showCode, setShowCode] = useState(false);



  const exportTabs: { format: ExportFormat; label: string; icon: React.ReactNode; category: string }[] = [
    // CSS & Frameworks
    { format: 'css', label: 'CSS Variables', icon: <FileText className="w-4 h-4" />, category: 'css' },
    { format: 'tailwind', label: 'Tailwind CSS', icon: <Palette className="w-4 h-4" />, category: 'css' },
    { format: 'tailwind4', label: 'Tailwind v4', icon: <Settings className="w-4 h-4" />, category: 'css' },
    { format: 'scss', label: 'SCSS/SASS', icon: <Paintbrush className="w-4 h-4" />, category: 'css' },
    
    // JavaScript & Frameworks
    { format: 'hex', label: 'Hexadecimal', icon: <Hash className="w-4 h-4" />, category: 'code' },
    { format: 'react', label: 'React Component', icon: <Braces className="w-4 h-4" />, category: 'code' },
    { format: 'javascript', label: 'JavaScript Object', icon: <Code className="w-4 h-4" />, category: 'code' },
    { format: 'typescript', label: 'TypeScript Interface', icon: <Zap className="w-4 h-4" />, category: 'code' },
    
    // Data Formats
    { format: 'json', label: 'JSON', icon: <Database className="w-4 h-4" />, category: 'data' },
    { format: 'tokens', label: 'Design Tokens', icon: <Layers className="w-4 h-4" />, category: 'data' },
    
    // Design Tools
    { format: 'ase', label: 'Adobe ASE', icon: <Package className="w-4 h-4" />, category: 'design' },
    { format: 'gpl', label: 'GIMP Palette', icon: <FileImage className="w-4 h-4" />, category: 'design' },
    { format: 'sketch', label: 'Sketch Palette', icon: <Palette className="w-4 h-4" />, category: 'design' },
    { format: 'figma', label: 'Figma Tokens', icon: <Figma className="w-4 h-4" />, category: 'design' },
    { format: 'svg', label: 'SVG Palette', icon: <Download className="w-4 h-4" />, category: 'design' }
  ];

  const categories = [
    { id: 'css', label: 'CSS & Frameworks', icon: <FileText className="w-4 h-4" /> },
    { id: 'code', label: 'JavaScript & Code', icon: <Code className="w-4 h-4" /> },
    { id: 'data', label: 'Data Formats', icon: <Database className="w-4 h-4" /> },
    { id: 'design', label: 'Design Tools', icon: <Palette className="w-4 h-4" /> }
  ];

  const [activeCategory, setActiveCategory] = useState('css');
  const filteredTabs = exportTabs.filter(tab => tab.category === activeCategory);

  const handleCopyCode = useCallback(async () => {
    if (!palette) return;
    
    const code = exportPalette();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [palette, exportPalette]);





  const handleDownload = useCallback(() => {
    if (!palette) return;
    
    const code = exportPalette();
    const filename = `pigmenta-palette.${downloadFormat === 'svg' ? 'svg' : downloadFormat === 'tokens' ? 'json' : 'css'}`;
    const mimeType = downloadFormat === 'svg' ? 'image/svg+xml' : downloadFormat === 'tokens' ? 'application/json' : 'text/css';
    
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [palette, downloadFormat, exportPalette]);

  const handleDownloadPDF = useCallback(async () => {
    if (!palette) return;
    
    try {
      await exportToPDF(palette);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  }, [palette]);

  const handleDownloadPNG = useCallback(async () => {
    if (!palette) return;
    
    try {
      await exportToPNG(palette);
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  }, [palette]);

  const handleDownloadGPL = useCallback(() => {
    if (!palette) return;
    
    // Temporarily set export format to GPL and get the GPL content
    const currentFormat = settings.exportPreferences.format;
    setExportFormat('gpl');
    
    // Generate GPL content using the existing exportPalette function
    const gplContent = exportPalette();
    
    // Restore original format
    setExportFormat(currentFormat);
    
    // Create and download the GPL file
    const filename = `${palette.name.toLowerCase().replace(/\s+/g, '-')}-palette.gpl`;
    const blob = new Blob([gplContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [palette, settings.exportPreferences.format, setExportFormat, exportPalette]);

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
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center">
          <Download 
            className="w-12 h-12 mx-auto mb-4" 
            style={{ color: DESIGN_TOKENS.colors.text.muted }}
          />
          <h3 
            className="text-lg font-medium mb-2"
            style={{ color: DESIGN_TOKENS.colors.text.primary }}
          >
            No Palette to Export
          </h3>
          <p style={{ color: DESIGN_TOKENS.colors.text.muted }}>
            Generate a color palette first to see export options.
          </p>
        </div>
      </motion.div>
    );
  }

  const currentCode = exportPalette();

  return (
    <motion.div
      className="rounded-2xl shadow-lg border overflow-hidden"
      style={{
        backgroundColor: DESIGN_TOKENS.colors.surface.card,
        borderColor: DESIGN_TOKENS.colors.border.primary
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <div 
        className="px-4 sm:px-6 py-4 border-b"
        style={{ borderColor: DESIGN_TOKENS.colors.border.primary }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-3">
            <Download 
              className="w-5 h-5" 
              style={{ color: DESIGN_TOKENS.colors.text.muted }}
            />
            <h2 
              className="text-base sm:text-lg font-semibold"
              style={{ color: DESIGN_TOKENS.colors.text.primary }}
            >
              Export Palette
            </h2>
          </div>
          
          {/* Responsive button container */}
          <div className="flex flex-col space-y-3 xs:flex-row xs:space-y-0 xs:space-x-2 xs:items-center">
            {/* Export buttons */}
            <div className="flex flex-wrap gap-1.5 xs:gap-2">
              <motion.button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center space-x-1.5 px-2.5 xs:px-3 py-2 rounded-lg transition-colors duration-200 min-w-[60px] xs:min-w-[70px] flex-1 xs:flex-initial"
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.accent.primary,
                  color: DESIGN_TOKENS.colors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.primary;
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileType className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline text-sm">PDF</span>
              </motion.button>
              
              <motion.button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center space-x-1.5 px-2.5 xs:px-3 py-2 rounded-lg transition-colors duration-200 min-w-[60px] xs:min-w-[70px] flex-1 xs:flex-initial"
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.accent.primary,
                  color: DESIGN_TOKENS.colors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.primary;
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileImage className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline text-sm">PNG</span>
              </motion.button>
              
              <motion.button
                onClick={handleDownloadGPL}
                className="flex items-center justify-center space-x-1.5 px-2.5 xs:px-3 py-2 rounded-lg transition-colors duration-200 min-w-[60px] xs:min-w-[70px] flex-1 xs:flex-initial"
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.accent.primary,
                  color: DESIGN_TOKENS.colors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.accent.primary;
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Palette className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline text-sm">GPL</span>
              </motion.button>
              
              <motion.button
                onClick={handleDownload}
                className="flex items-center justify-center space-x-1.5 px-3 xs:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 min-w-[60px] xs:min-w-[80px] flex-1 xs:flex-initial"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline text-sm">Code</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Category Navigation */}
        <div className="mb-6">
          <h3 
            className="text-sm font-medium mb-3"
            style={{ color: DESIGN_TOKENS.colors.text.secondary }}
          >
            Export Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === category.id 
                    ? DESIGN_TOKENS.colors.accent.primary
                    : DESIGN_TOKENS.colors.surface.mutedCard,
                  color: activeCategory === category.id 
                    ? DESIGN_TOKENS.colors.text.primary
                    : DESIGN_TOKENS.colors.text.secondary,
                  border: `1px solid ${activeCategory === category.id 
                    ? DESIGN_TOKENS.colors.accent.primary
                    : DESIGN_TOKENS.colors.border.subtle}`
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.card;
                    e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.mutedCard;
                    e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border.subtle;
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Export Format Tabs */}
        <div className="mb-6">
          <h3 
            className="text-sm font-medium mb-3"
            style={{ color: DESIGN_TOKENS.colors.text.secondary }}
          >
            Available Formats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredTabs.map((tab) => (
              <ExportTab
                key={tab.format}
                format={tab.format}
                label={tab.label}
                icon={tab.icon}
                isActive={exportFormat === tab.format}
                onClick={() => setExportFormat(tab.format)}
              />
            ))}
          </div>
        </div>

        {/* Code Preview Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 
              className="text-sm font-medium"
              style={{ color: DESIGN_TOKENS.colors.text.secondary }}
            >
              Code Preview
            </h3>
            <motion.button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
                color: DESIGN_TOKENS.colors.text.secondary,
                border: `1px solid ${DESIGN_TOKENS.colors.border.subtle}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.card;
                e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surface.mutedCard;
                e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border.subtle;
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showCode ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Code</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showCode && (
            <motion.div
              key={exportFormat}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CodeBlock
                code={currentCode}
                language={exportFormat}
                onCopy={handleCopyCode}
                copied={copied}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};