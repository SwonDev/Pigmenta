import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';
import { cn } from "../lib/utils";

interface StudioModeSwitchProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export const StudioModeSwitch: React.FC<StudioModeSwitchProps> = ({ 
  className, 
  variant = 'desktop' 
}) => {
  const { isStudioMode, toggleStudioMode } = useStudioStore();

  const handleToggle = () => {
    toggleStudioMode();
  };

  if (variant === 'mobile') {
    return (
      <motion.button
        onClick={handleToggle}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl",
          "bg-white/10 backdrop-blur-sm border border-white/20",
          "hover:bg-white/20 transition-all duration-300",
          "focus:outline-none focus:ring-2",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={false}
        animate={{
          backgroundColor: isStudioMode ? 'rgba(35, 170, 215, 0.2)' : 'rgba(255, 255, 255, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: !isStudioMode ? [0, 360] : 0,
            scale: !isStudioMode ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: !isStudioMode ? 2 : 0.3,
            repeat: !isStudioMode ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isStudioMode ? (
            <Palette className="w-5 h-5 text-white/80" />
          ) : (
            <Sparkles className="w-5 h-5" style={{ color: '#23AAD7' }} />
          )}
        </motion.div>
        
        {/* Glow effect when active */}
        {isStudioMode && (
          <motion.div
            className="absolute inset-0 rounded-xl blur-sm"
            style={{ backgroundColor: 'rgba(35, 170, 215, 0.2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative flex items-center bg-white/5 backdrop-blur-sm rounded-2xl p-1",
        "border border-white/10 shadow-lg",
        className
      )}
      initial={false}
      animate={{
        borderColor: isStudioMode ? 'rgba(35, 170, 215, 0.3)' : 'rgba(255, 255, 255, 0.1)'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Background slider */}
      <motion.div
        className="absolute inset-1 rounded-xl backdrop-blur-sm"
        style={{ 
          background: 'linear-gradient(to right, rgba(35, 170, 215, 0.2), rgba(32, 160, 203, 0.2))',
          width: 'calc(50% - 2px)'
        }}
        initial={false}
        animate={{
          x: isStudioMode ? '100%' : '0%',
          opacity: isStudioMode ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      
      {/* Classic Mode Button */}
      <motion.button
        onClick={!isStudioMode ? undefined : handleToggle}
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl",
          "text-sm font-medium transition-all duration-300",
          "focus:outline-none focus:ring-2",
          !isStudioMode 
            ? "text-white bg-white/10 shadow-lg" 
            : "text-white/60 hover:text-white/80"
        )}
        whileHover={{ scale: !isStudioMode ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Classic</span>
      </motion.button>

      {/* Studio Mode Button */}
      <motion.button
        onClick={isStudioMode ? undefined : handleToggle}
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl",
          "text-sm font-medium transition-all duration-300",
          "focus:outline-none focus:ring-2",
          isStudioMode 
            ? "text-white shadow-lg" 
            : "text-white/60 hover:text-white/80"
        )}
        whileHover={{ scale: isStudioMode ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{ 
            rotate: isStudioMode ? [0, 360] : 0,
            scale: isStudioMode ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            duration: isStudioMode ? 2 : 0.3,
            repeat: isStudioMode ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <span className="hidden sm:inline">Studio</span>
      </motion.button>

      {/* Glow effect */}
      {isStudioMode && (
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{ backgroundColor: 'rgba(35, 170, 215, 0.1)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
};