import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { ColorPalette, ColorShade } from '../types';

// Types
interface Point {
  x: number;
  y: number;
}

interface ColorNode {
  id: string;
  position: Point;
  color: string;
  name: string;
  hex: string;
  selected: boolean;
  isDragging: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedNode: string | null;
  offset: Point;
}

interface NodeCanvasProps {
  palette?: ColorPalette;
  onShadeClick?: (shade: ColorShade, index: number) => void;
  isMobile?: boolean;
}

// Constants
const NODE_SIZE = 100;
const GRID_SPACING = 140;
const CANVAS_PADDING = 60;

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);



const NodeCanvas: React.FC<NodeCanvasProps> = ({ palette, onShadeClick, isMobile = false }) => {
  // Store
  const { currentPalette } = useAppStore();
  
  // State
  const [nodes, setNodes] = useState<ColorNode[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNode: null,
    offset: { x: 0, y: 0 }
  });
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Generate nodes from current palette
  useEffect(() => {

    
    if (!currentPalette?.shades?.length) {
      console.log('NodeCanvas: No palette or shades available');
      return;
    }
    
    const newNodes: ColorNode[] = currentPalette.shades.map((shade, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      
      return {
        id: generateId(),
        position: {
          x: CANVAS_PADDING + col * GRID_SPACING,
          y: CANVAS_PADDING + row * GRID_SPACING
        },
        color: shade.color.hex,
        name: shade.name,
        hex: shade.color.hex,
        selected: false,
        isDragging: false
      };
    });
    

    setNodes(newNodes);
  }, [currentPalette]);
  
  // Event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Check if clicking on a node
    const clickedNode = nodes.find(node => {
      const nodeRect = {
        left: node.position.x,
        top: node.position.y,
        right: node.position.x + NODE_SIZE,
        bottom: node.position.y + NODE_SIZE
      };
      
      return clientPoint.x >= nodeRect.left && clientPoint.x <= nodeRect.right &&
             clientPoint.y >= nodeRect.top && clientPoint.y <= nodeRect.bottom;
    });
    
    if (clickedNode) {
      // Start dragging node
      setDragState({
        isDragging: true,
        draggedNode: clickedNode.id,
        offset: {
          x: clientPoint.x - clickedNode.position.x,
          y: clientPoint.y - clickedNode.position.y
        }
      });
      
      // Select node
      setNodes(prev => prev.map(node => ({
        ...node,
        selected: node.id === clickedNode.id,
        isDragging: node.id === clickedNode.id
      })));
    } else {
      // Clear selection
      setNodes(prev => prev.map(node => ({ ...node, selected: false })));
    }
  }, [nodes]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current || !dragState.isDragging || !dragState.draggedNode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const newPosition = {
      x: Math.max(0, Math.min(clientPoint.x - dragState.offset.x, rect.width - NODE_SIZE)),
      y: Math.max(0, Math.min(clientPoint.y - dragState.offset.y, rect.height - NODE_SIZE))
    };
    
    setNodes(prev => prev.map(node => 
      node.id === dragState.draggedNode
        ? { ...node, position: newPosition }
        : node
    ));
  }, [dragState]);
  
  const handlePointerUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNode: null,
      offset: { x: 0, y: 0 }
    });
    
    setNodes(prev => prev.map(node => ({ ...node, isDragging: false })));
  }, []);
  
  // Reset canvas
  const resetCanvas = useCallback(() => {
    if (!currentPalette?.shades?.length) return;
    
    const newNodes: ColorNode[] = currentPalette.shades.map((shade, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      
      return {
        id: generateId(),
        position: {
          x: CANVAS_PADDING + col * GRID_SPACING,
          y: CANVAS_PADDING + row * GRID_SPACING
        },
        color: shade.color.hex,
        name: shade.name,
        hex: shade.color.hex,
        selected: false,
        isDragging: false
      };
    });
    
    setNodes(newNodes);
  }, [currentPalette]);
  
  // Export functionality
  const exportCanvas = useCallback(() => {
    if (!nodes.length) return;
    
    const canvasData = {
      palette: currentPalette?.name || 'Untitled',
      nodes: nodes.map(node => ({
        name: node.name,
        color: node.hex,
        position: node.position
      })),
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPalette?.name || 'palette'}-nodes-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [nodes, currentPalette]);
  
  // Render node with simplified styling
  const renderNode = useCallback((node: ColorNode) => {
    const isSelected = node.selected;
    const isDragging = node.isDragging;
    
    return (
      <motion.div
        key={node.id}
        className={`absolute cursor-pointer select-none group ${
          isSelected ? 'z-20' : 'z-10'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: NODE_SIZE,
          height: NODE_SIZE
        }}
        animate={{
          scale: isDragging ? 1.1 : isSelected ? 1.05 : 1,
          rotate: isDragging ? 2 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Node shadow */}
        <div
          className="absolute inset-0 rounded-lg blur-sm opacity-30"
          style={{
            backgroundColor: node.color,
            transform: 'translate(2px, 2px)'
          }}
        />
        
        {/* Main node */}
        <div
          className={`relative w-full h-full rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-2 ${
            isSelected 
              ? 'border-white shadow-lg shadow-white/20' 
              : 'border-gray-600 hover:border-gray-400'
          }`}
          style={{ backgroundColor: node.color }}
        >
          {/* Selection ring */}
          {isSelected && (
            <div className="absolute -inset-1 rounded-lg border-2 border-white/50 animate-pulse" />
          )}
          
          {/* Color info */}
          <div className="text-center">
            <div 
              className="text-xs font-medium mb-1 drop-shadow-sm"
              style={{ 
                color: node.color === '#FFFFFF' || node.color === '#ffffff' ? '#000000' : '#FFFFFF'
              }}
            >
              {node.name}
            </div>
            <div 
              className="text-xs font-mono drop-shadow-sm"
              style={{ 
                color: node.color === '#FFFFFF' || node.color === '#ffffff' ? '#000000' : '#FFFFFF'
              }}
            >
              {node.hex.toUpperCase()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <motion.div 
        className="flex items-center justify-between p-4 bg-slate-800/30 border-b border-slate-700/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={resetCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={16} />
            Reset Grid
          </motion.button>
          
          <motion.button
            onClick={exportCanvas}
            disabled={!nodes.length}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
            whileHover={{ scale: nodes.length > 0 ? 1.02 : 1, y: nodes.length > 0 ? -1 : 0 }}
            whileTap={{ scale: nodes.length > 0 ? 0.98 : 1 }}
          >
            <Download size={16} />
            Export ({nodes.length})
          </motion.button>
        </div>
        
        {/* Info panel */}
        <motion.div 
          className="px-3 py-2 bg-slate-800/50 text-slate-300 rounded-lg backdrop-blur-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm flex items-center gap-3">
            <span>{nodes.length} nodos</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {currentPalette?.name || 'Sin paleta'}
            </span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div
          ref={canvasRef}
          className="relative w-full h-full overflow-auto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            minHeight: '500px'
          }}
        >
          {/* Render all nodes */}
          {nodes.map(renderNode)}
        </div>
      </div>
    </div>
  );
};

export { NodeCanvas };