import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { DESIGN_TOKENS } from '../constants/designTokens';
import { ImageImportModal } from './ImageImportModal';

export const ImageImportSection = () => {
  const [showImageImport, setShowImageImport] = useState(false);

  const handleImageImport = () => {
    setShowImageImport(true);
  };

  const handleCloseImageImport = () => {
    setShowImageImport(false);
  };

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handleImageImport}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.primary,
          color: DESIGN_TOKENS.colors.text.primary,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        whileHover={{ 
          scale: 1.02,
          backgroundColor: 'rgba(255,255,255,0.08)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Upload size={18} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Import from Image</span>
          <span 
            className="text-xs"
            style={{ color: DESIGN_TOKENS.colors.text.muted }}
          >
            Extract colors from any image
          </span>
        </div>
      </motion.button>

      {/* Image Import Modal */}
      <ImageImportModal 
        isOpen={showImageImport} 
        onClose={handleCloseImageImport} 
      />
    </div>
  );
};