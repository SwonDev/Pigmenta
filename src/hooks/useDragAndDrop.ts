import { useCallback, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { 
  DragState, 
  CustomColor, 
  UseDragAndDropReturn 
} from '@/types';

/**
 * Hook personalizado para gestionar drag & drop con @dnd-kit
 * Proporciona funcionalidades accesibles de arrastrar y soltar
 */
export const useDragAndDrop = (
  items: CustomColor[],
  onReorder: (fromIndex: number, toIndex: number) => void
): UseDragAndDropReturn => {
  
  // Estado del drag
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedColor: null,
    draggedIndex: null,
    dropZone: null
  });

  // Configuración de sensores para accesibilidad
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere mover 8px antes de activar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Animación de drop personalizada
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Manejar inicio de drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedColor = items.find(item => item.id === active.id);
    const draggedIndex = items.findIndex(item => item.id === active.id);
    
    setDragState({
      isDragging: true,
      draggedColor: draggedColor || null,
      draggedIndex: draggedIndex !== -1 ? draggedIndex : null,
      dropZone: null
    });
  }, [items]);

  // Manejar drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    setDragState(prev => ({
      ...prev,
      dropZone: over?.id as string || null
    }));
  }, []);

  // Manejar fin de drag
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setDragState({
      isDragging: false,
      draggedColor: null,
      draggedIndex: null,
      dropZone: null
    });

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Encontrar índices
    const oldIndex = items.findIndex(item => item.id === activeId);
    const newIndex = items.findIndex(item => item.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }, [items, onReorder]);

  // Manejar cancelación de drag
  const handleDragCancel = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedColor: null,
      draggedIndex: null,
      dropZone: null
    });
  }, []);

  // Obtener props para el contexto de drag
  const getDragContextProps = useCallback(() => ({
    sensors,
    collisionDetection: closestCenter,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel
  }), [sensors, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel]);

  // Obtener props para el contexto sortable
  const getSortableContextProps = useCallback((strategy: 'vertical' | 'horizontal' = 'horizontal') => ({
    items: items.map(item => item.id),
    strategy: strategy === 'vertical' ? verticalListSortingStrategy : horizontalListSortingStrategy
  }), [items]);

  // Obtener props para overlay de drag
  const getDragOverlayProps = useCallback(() => ({
    dropAnimation
  }), [dropAnimation]);

  // Utilidades para componentes
  const isItemDragging = useCallback((itemId: string): boolean => {
    return dragState.isDragging && dragState.draggedColor?.id === itemId;
  }, [dragState]);

  const isItemDraggedOver = useCallback((itemId: string): boolean => {
    return dragState.dropZone === itemId;
  }, [dragState]);

  const getItemDragStyle = useCallback((itemId: string) => {
    const isDragging = isItemDragging(itemId);
    const isDraggedOver = isItemDraggedOver(itemId);

    return {
      opacity: isDragging ? 0.5 : 1,
      transform: isDraggedOver ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease',
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  }, [isItemDragging, isItemDraggedOver]);

  // Funciones de utilidad para reordenamiento
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    onReorder(fromIndex, toIndex);
  }, [onReorder]);

  const moveItemToStart = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index > 0) {
      onReorder(index, 0);
    }
  }, [items, onReorder]);

  const moveItemToEnd = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1 && index < items.length - 1) {
      onReorder(index, items.length - 1);
    }
  }, [items, onReorder]);

  const moveItemLeft = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index > 0) {
      onReorder(index, index - 1);
    }
  }, [items, onReorder]);

  const moveItemRight = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1 && index < items.length - 1) {
      onReorder(index, index + 1);
    }
  }, [items, onReorder]);

  // Funciones para accesibilidad
  const getAriaLabel = useCallback((itemId: string, position: number): string => {
    const item = items.find(i => i.id === itemId);
    if (!item) return '';

    return `Color ${item.name || item.value} en posición ${position + 1} de ${items.length}. Presiona espacio para mover.`;
  }, [items]);

  const getAriaDescription = useCallback((): string => {
    return 'Usa las flechas del teclado para reordenar los colores, o arrastra con el mouse.';
  }, []);

  // Validación de drop
  const canDrop = useCallback((activeId: string, overId: string): boolean => {
    // Por defecto, permitir todos los drops dentro del mismo contenedor
    return activeId !== overId;
  }, []);

  // Obtener información de posición
  const getItemPosition = useCallback((itemId: string): number => {
    return items.findIndex(item => item.id === itemId);
  }, [items]);

  const getItemAtPosition = useCallback((position: number): CustomColor | null => {
    return items[position] || null;
  }, [items]);

  return {
    // Estado
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedColor,
    dropZone: dragState.dropZone,
    
    // Props para componentes
    getDragContextProps,
    getSortableContextProps,
    getDragOverlayProps,
    
    // Utilidades de estilo
    isItemDragging,
    isItemDraggedOver,
    getItemDragStyle,
    
    // Funciones de movimiento
    moveItem,
    moveItemToStart,
    moveItemToEnd,
    moveItemLeft,
    moveItemRight,
    
    // Accesibilidad
    getAriaLabel,
    getAriaDescription,
    
    // Validación
    canDrop,
    
    // Información de posición
    getItemPosition,
    getItemAtPosition,
    
    // Componentes de contexto (para usar directamente)
    DndContext,
    SortableContext,
    DragOverlay
  };
};