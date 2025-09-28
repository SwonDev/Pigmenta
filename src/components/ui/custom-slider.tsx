import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CustomSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const currentValue = value[0] || 0;

  const calculateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const newValue = calculateValue(e.clientX);
    onValueChange([newValue]);
  }, [disabled, calculateValue, onValueChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const newValue = calculateValue(e.clientX);
    onValueChange([newValue]);
  }, [isDragging, disabled, calculateValue, onValueChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative flex w-full touch-none select-none items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Track */}
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        {/* Range */}
        <div 
          className="absolute h-full bg-primary transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Thumb */}
      <div
        className={cn(
          'absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'hover:scale-110',
          isDragging && 'scale-110 shadow-lg',
          disabled && 'cursor-not-allowed'
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
};