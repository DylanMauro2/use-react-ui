import { useState, useRef, createContext, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Popover.css';

import React, { cloneElement, isValidElement } from 'react';

const Slot = ({ children, ...props }: any) => {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...children.props,
      // Combinamos las refs si ambos tienen una
      ref: (node: any) => {
        if (typeof props.ref === 'function') props.ref(node);
        else if (props.ref) props.ref.current = node;
        
        const { ref: childRef } = children as any;
        if (typeof childRef === 'function') childRef(node);
        else if (childRef) childRef.current = node;
      },
    });
  }
  return null;
};

const PopoverContext = createContext<any>(null);

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// 1. Root: El orquestador
export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setAnchorRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, toggle, triggerRef, contentRef, anchorRect }}>
      <div className="popover-root">{children}</div>
    </PopoverContext.Provider>
  );
}

// 2. Trigger: Soporta asChild
export function PopoverTrigger({ children, asChild, ...props }: any) {
  const { toggle, triggerRef, isOpen } = useContext(PopoverContext);

  const sharedProps = {
    ref: triggerRef,
    onClick: toggle,
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    ...props
  };

  if (asChild) {
    return <Slot {...sharedProps}>{children}</Slot>;
  }

  return (
    <button className="popover-trigger" {...sharedProps}>
      {children || 'Click me'}
    </button>
  );
}

// 3. Content: Con Reposicionamiento Automático
export function PopoverContent({ children, className }: any) {
  const { isOpen, setIsOpen, anchorRect, contentRef, triggerRef } = useContext(PopoverContext);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRect || !contentRef.current) return;

    const calculatePosition = () => {
      const root = contentRef.current;
      if (!root) return;

      const contentHeight = root.offsetHeight;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      let top = anchorRect.bottom + window.scrollY + 5; // Por defecto abajo

      // Lógica de Reposicionamiento: 
      // Si no hay espacio abajo Y hay más espacio arriba, lo movemos arriba.
      if (spaceBelow < contentHeight && spaceAbove > spaceBelow) {
        top = anchorRect.top + window.scrollY - contentHeight - 5;
      }

      setCoords({
        top,
        left: anchorRect.left + window.scrollX
      });
    };

    // Ejecutamos al abrir
    calculatePosition();

    // Re-calculamos si el usuario cambia el tamaño de la ventana
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen, anchorRect]);

  // Lógica de Click Outside (Misma que antes)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current && !contentRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen || !anchorRect) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="dialog"
      style={{
        top: coords.top,
        left: coords.left,
        visibility: coords.top === 0 ? 'hidden' : 'visible',
      }}
      className={`popover-content${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>,
    document.body
  );
}