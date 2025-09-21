import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MultiSelectTextareaProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  options: string[];
  onValueChange?: (value: string) => void;
  autoScrollToTop?: boolean;
  scrollMargin?: number;
}

const MultiSelectTextarea: React.FC<MultiSelectTextareaProps> = ({
  className = '',
  placeholder = '',
  defaultValue = '',
  options,
  onValueChange,
  autoScrollToTop = true,
  scrollMargin = 100
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, showAbove: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTextarea = textareaRef.current && textareaRef.current.contains(target);
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      
      if (!isInsideTextarea && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen && textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 192;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        // Calculer la position absolue par rapport au viewport
        const absoluteTop = showAbove ? rect.top - dropdownHeight - 2 : rect.bottom + 2;
        const absoluteLeft = rect.left;
        
        setDropdownPosition({
          top: absoluteTop,
          left: absoluteLeft,
          width: Math.max(rect.width, 200),
          showAbove
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange?.(newValue);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Annuler tout timeout précédent
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Calculer la position du dropdown
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 192; // max-h-48 = 12rem = 192px
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Décider si afficher au-dessus ou en dessous
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      // Calculer la position absolue par rapport au viewport
      const absoluteTop = showAbove ? rect.top - dropdownHeight - 2 : rect.bottom + 2;
      const absoluteLeft = rect.left;
      
      setDropdownPosition({
        top: absoluteTop,
        left: absoluteLeft,
        width: Math.max(rect.width, 200),
        showAbove
      });
    }
    
    // Ouvrir la liste avec un petit délai pour éviter les conflits
    clickTimeoutRef.current = setTimeout(() => {
      // Faire défiler vers le haut pour s'assurer que le dropdown est visible
      if (autoScrollToTop && textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const targetScrollY = Math.max(0, currentScrollY + rect.top - scrollMargin);
        
        // Défilement fluide vers le haut
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
        
        // Recalculer la position après le défilement
        setTimeout(() => {
          if (textareaRef.current) {
            const newRect = textareaRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dropdownHeight = 192;
            const spaceBelow = viewportHeight - newRect.bottom;
            const spaceAbove = newRect.top;
            
            const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
            const absoluteTop = showAbove ? newRect.top - dropdownHeight - 2 : newRect.bottom + 2;
            const absoluteLeft = newRect.left;
            
            setDropdownPosition({
              top: absoluteTop,
              left: absoluteLeft,
              width: Math.max(newRect.width, 200),
              showAbove
            });
          }
        }, 300); // Attendre que le défilement soit terminé
      }
      
      setIsOpen(true);
    }, 50);
  };

  const handleOptionSelect = (option: string) => {
    let newValue = value;
    
    if (newValue.trim() === '') {
      newValue = option;
    } else {
      newValue = newValue + '\n' + option;
    }
    
    // Fermer immédiatement la liste
    setIsOpen(false);
    
    // Mettre à jour la valeur
    setValue(newValue);
    onValueChange?.(newValue);
    
    // Auto-resize textarea after setting value
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 10);
  };

  const handleOptionClick = (e: React.MouseEvent<HTMLButtonElement>, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Annuler le timeout du textarea
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Fermer immédiatement la liste avant de traiter la sélection
    setIsOpen(false);
    
    // Traiter la sélection avec un petit délai pour éviter les conflits
    setTimeout(() => {
      handleOptionSelect(option);
    }, 10);
  };

  const dropdownContent = isOpen && (
    <div 
      ref={dropdownRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{ 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
        minWidth: '200px'
      }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          onClick={(e) => handleOptionClick(e, option)}
          className="w-full text-right p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-sm"
          dir="rtl"
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="relative w-full">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onClick={handleTextareaClick}
          className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden cursor-pointer ${className}`}
          placeholder={placeholder}
          style={{ height: textareaHeight }}
          dir="rtl"
        />
      </div>
      
      {/* Dropdown menu rendered as portal */}
      {isOpen && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default MultiSelectTextarea;