import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { DESIGN_TOKENS } from '../constants/designTokens';
import { ImageImportModal } from './ImageImportModal';

export const Header = () => {
  const [showImageImport, setShowImageImport] = useState(false);

  const handleImageImport = () => {
    setShowImageImport(true);
  };

  const handleCloseImageImport = () => {
    setShowImageImport(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-between px-6">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <motion.img
                src="/logo.png"
                alt="Pigmenta Logo"
                className="w-8 h-8 rounded-lg shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <div className="flex flex-col">
              <h1 
                className="text-xl font-bold"
                style={{
                  color: DESIGN_TOKENS.colors.text.primary
                }}
              >
                Pigmenta
              </h1>
              <p 
                className="text-xs -mt-1"
                style={{
                  color: DESIGN_TOKENS.colors.text.muted
                }}
              >
                Color Generator
              </p>
            </div>
          </div>
        </motion.div>

        {/* Import from Image Button */}
        <motion.button
          onClick={handleImageImport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.surface.primary,
            color: DESIGN_TOKENS.colors.text.primary,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.08)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Upload size={16} />
          <span className="text-sm font-medium">Import from Image</span>
        </motion.button>
      </div>
      
      {/* Image Import Modal */}
      <ImageImportModal 
        isOpen={showImageImport} 
        onClose={handleCloseImageImport} 
      />
    </div>
  );
};