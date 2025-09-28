import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const DESIGN_TOKENS = {
  colors: {
    surface: {
      mutedCard: 'rgba(255, 255, 255, 0.03)',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      focus: 'rgba(255, 255, 255, 0.12)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
      tertiary: 'rgba(255, 255, 255, 0.6)',
      placeholder: 'rgba(255, 255, 255, 0.4)',
    },
    accent: {
      primary: '#3b82f6',
      hover: 'rgba(59, 130, 246, 0.1)',
      subtle: 'rgba(255, 255, 255, 0.12)',
    },
  },
};

interface NotesPanelProps {
  className?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ className = '' }) => {
  const { isDark } = useAppStore();
  const [notes, setNotes] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('pigmenta-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Handle click outside to remove focus and contract textarea
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsExpanded(false);
        // Reset textarea to compact size
        if (textareaRef.current) {
          textareaRef.current.style.height = '24px';
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notes]);

  // Auto-save notes with debounce
  useEffect(() => {
    if (notes.trim() === '') {
      localStorage.removeItem('pigmenta-notes');
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem('pigmenta-notes', notes);
      setTimeout(() => setIsSaving(false), 500);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes]);

  const handleFocus = () => {
    setIsExpanded(true);
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Contract textarea when losing focus
    setIsFocused(false);
    setIsExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    
    // Auto-resize textarea as user types
    const textarea = e.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, 200) + 'px';
  };

  return (
    <motion.div
      ref={containerRef}
      className={`mt-6 p-4 border-2 rounded-xl transition-all duration-300 ${className}`}
      style={{
        borderColor: isFocused 
          ? (isDark ? DESIGN_TOKENS.colors.border.focus : 'rgba(0, 0, 0, 0.2)') 
          : (isDark ? DESIGN_TOKENS.colors.border.subtle : 'rgba(0, 0, 0, 0.1)'),
        backgroundColor: isDark 
          ? DESIGN_TOKENS.colors.surface.mutedCard 
          : 'rgba(248, 250, 252, 0.8)',
        boxShadow: isFocused 
          ? (isDark ? '0 0 0 1px rgba(255, 255, 255, 0.08)' : '0 0 0 1px rgba(0, 0, 0, 0.08)') 
          : 'none',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="relative">
        <div className="flex items-center space-x-2 mb-2">
          <Edit3 
            className="w-4 h-4" 
            style={{ 
              color: isDark 
                ? DESIGN_TOKENS.colors.text.tertiary 
                : '#64748b' 
            }} 
          />
          <span 
            className="text-sm font-medium"
            style={{ 
              color: isDark 
                ? DESIGN_TOKENS.colors.text.secondary 
                : '#374151' 
            }}
          >
            Notas
          </span>
          <AnimatePresence>
            {isSaving && (
              <motion.div
                className="flex items-center space-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Save className="w-3 h-3" style={{ color: DESIGN_TOKENS.colors.accent.primary }} />
                <span 
                  className="text-xs"
                  style={{ color: DESIGN_TOKENS.colors.accent.primary }}
                >
                  Guardado
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Añadir notas sobre esta paleta..."
          className="w-full resize-none border-0 bg-transparent outline-none transition-all duration-300"
          style={{
            color: isDark 
              ? DESIGN_TOKENS.colors.text.primary 
              : '#111827',
            fontSize: '14px',
            lineHeight: '1.5',
            minHeight: '24px',
            maxHeight: '200px',
            height: isExpanded ? 'auto' : '24px',
          }}
        />
        

      </div>
    </motion.div>
  );
};