import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { DESIGN_TOKENS } from '@/constants/designTokens';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md group"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.surface.card,
          borderColor: DESIGN_TOKENS.colors.border.subtle,
          color: DESIGN_TOKENS.colors.text.primary
        }}
        whileHover={{ 
          backgroundColor: DESIGN_TOKENS.colors.surface.mutedCard,
          scale: 1.01
        }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: isOpen 
                ? DESIGN_TOKENS.colors.accent.primary 
                : DESIGN_TOKENS.colors.surface.mutedCard
            }}
          >
            <Icon 
              className="w-4 h-4 transition-colors duration-200" 
              style={{
                color: isOpen 
                  ? '#ffffff' 
                  : DESIGN_TOKENS.colors.text.muted
              }}
            />
          </div>
          <div className="text-left">
            <h3 
              className="text-sm font-semibold transition-colors duration-200"
              style={{
                color: isOpen 
                  ? DESIGN_TOKENS.colors.accent.primary 
                  : DESIGN_TOKENS.colors.text.primary
              }}
            >
              {title}
            </h3>
            {description && (
              <p 
                className="text-xs mt-0.5 transition-colors duration-200"
                style={{ color: DESIGN_TOKENS.colors.text.muted }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown 
            className="w-4 h-4 transition-colors duration-200" 
            style={{
              color: isOpen 
                ? DESIGN_TOKENS.colors.accent.primary 
                : DESIGN_TOKENS.colors.text.muted
            }}
          />
        </motion.div>
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut",
              opacity: { duration: 0.2 },
              height: { duration: 0.3 }
            }}
            className="overflow-hidden"
          >
            <motion.div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.primary,
                borderColor: DESIGN_TOKENS.colors.border.subtle
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};