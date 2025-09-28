import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface CustomSelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface CustomSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CustomSelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface CustomSelectValueProps {
  placeholder?: string;
  className?: string;
}

const CustomSelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled?: boolean;
} | null>(null);

const useCustomSelectContext = () => {
  const context = React.useContext(CustomSelectContext);
  if (!context) {
    throw new Error('CustomSelect components must be used within CustomSelect');
  }
  return context;
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  children,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  return (
    <CustomSelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </CustomSelectContext.Provider>
  );
};

export const CustomSelectTrigger: React.FC<CustomSelectTriggerProps> = ({
  children,
  className
}) => {
  const { isOpen, setIsOpen, disabled } = useCustomSelectContext();

  const handleClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [isOpen, setIsOpen, disabled]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isOpen && 'ring-2 ring-ring ring-offset-2',
        className
      )}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
};

export const CustomSelectValue: React.FC<CustomSelectValueProps> = ({
  placeholder,
  className
}) => {
  const { value } = useCustomSelectContext();

  return (
    <span className={cn('block truncate', className)}>
      {value || placeholder}
    </span>
  );
};

export const CustomSelectContent: React.FC<CustomSelectContentProps> = ({
  children,
  className
}) => {
  const { isOpen } = useCustomSelectContext();

  if (!isOpen) return null;

  return (
    <div className={cn(
      'absolute top-full left-0 z-50 w-full mt-1 bg-popover text-popover-foreground shadow-md border rounded-md',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

export const CustomSelectItem: React.FC<CustomSelectItemProps> = ({
  value: itemValue,
  children,
  className
}) => {
  const { value, onValueChange, setIsOpen } = useCustomSelectContext();
  const isSelected = value === itemValue;

  const handleClick = useCallback(() => {
    onValueChange(itemValue);
    setIsOpen(false);
  }, [itemValue, onValueChange, setIsOpen]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  );
};