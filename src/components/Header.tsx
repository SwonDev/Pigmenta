import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { DESIGN_TOKENS } from '../constants/designTokens';
import { ImageImportModal } from './ImageImportModal';

export const Header = () => {
  const [showImageImport, setShowImageImport] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageImport = () => {
    setShowImageImport(true);
  };

  const handleCloseImageImport = () => {
    setShowImageImport(false);
  };

  return (
    <div className={`w-full h-full flex items-center ${isMobile ? 'justify-center px-4' : 'justify-between px-6'}`}>
      {/* Logo - Centrado en móvil, izquierda en desktop */}
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: isMobile ? 1 : 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <motion.img
              src="/logo.png"
              alt="Pigmenta Logo"
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg shadow-lg`}
              whileHover={{ rotate: isMobile ? 0 : 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
          <div className="flex flex-col">
            <h1 
              className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}
              style={{
                color: DESIGN_TOKENS.colors.text.primary
              }}
            >
              Pigmenta
            </h1>
            {!isMobile && (
              <p 
                className="text-xs -mt-1"
                style={{
                  color: DESIGN_TOKENS.colors.text.muted
                }}
              >
                Color Generator
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Import from Image Button - Solo en móvil */}
      {isMobile && (
        <motion.button
          onClick={handleImageImport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg touch-manipulation"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.surface.primary,
            color: DESIGN_TOKENS.colors.text.primary,
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: '44px', // Touch-friendly height
            minWidth: '44px'
          }}
          whileHover={{ 
            scale: 1.02,
            backgroundColor: 'rgba(255,255,255,0.08)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Upload size={18} />
          <span className="text-xs font-medium">Import</span>
        </motion.button>
      )}
      
      {/* Image Import Modal */}
      <ImageImportModal 
        isOpen={showImageImport} 
        onClose={handleCloseImageImport} 
      />
    </div>
  );
};