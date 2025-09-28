import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagnifierLensProps {
  imageRef: React.RefObject<HTMLImageElement>;
  imageData: ImageData | null;
  mousePosition: { x: number; y: number };
  isVisible: boolean;
  zoomLevel?: number;
  size?: number;
}

export const MagnifierLens: React.FC<MagnifierLensProps> = ({
  imageRef,
  imageData,
  mousePosition,
  isVisible,
  zoomLevel = 20,
  size = 120
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Posicionar la lupa exactamente en la posición del cursor
  // Sin offset para reemplazar completamente el cursor del ratón
  const lensPosition = {
    x: mousePosition.x,
    y: mousePosition.y
  };

  useEffect(() => {
    if (!isVisible || !imageRef.current || !imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imageRef.current;
    const rect = image.getBoundingClientRect();
    
    // mousePosition ya contiene coordenadas relativas a la imagen
    const relativeX = mousePosition.x;
    const relativeY = mousePosition.y;
    
    // Usar el mismo sistema de coordenadas que el click handler para sincronización perfecta
    const scaleX = imageData.width / rect.width;
    const scaleY = imageData.height / rect.height;
    
    const pixelX = Math.floor(relativeX * scaleX);
    const pixelY = Math.floor(relativeY * scaleY);
    
    setPixelPosition({ x: pixelX, y: pixelY });

    // Verificar que las coordenadas estén dentro de los límites
    if (pixelX < 0 || pixelX >= imageData.width || pixelY < 0 || pixelY >= imageData.height) {
      return;
    }

    // Obtener color del pixel central
    const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
    const r = imageData.data[pixelIndex];
    const g = imageData.data[pixelIndex + 1];
    const b = imageData.data[pixelIndex + 2];
    
    setCurrentColor(`rgb(${r}, ${g}, ${b})`);

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurar canvas para zoom
    const magnifierRadius = size / 2;
    const sourceRadius = magnifierRadius / zoomLevel;
    
    // Crear imagen temporal para extraer la región
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Calcular región a magnificar
    const sourceX = Math.max(0, pixelX - sourceRadius);
    const sourceY = Math.max(0, pixelY - sourceRadius);
    const sourceWidth = Math.min(sourceRadius * 2, imageData.width - sourceX);
    const sourceHeight = Math.min(sourceRadius * 2, imageData.height - sourceY);
    
    // Crear clip circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(magnifierRadius, magnifierRadius, magnifierRadius - 2, 0, 2 * Math.PI);
    ctx.clip();
    
    // Dibujar imagen magnificada
    ctx.drawImage(
      tempCanvas,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, size, size
    );
    
    ctx.restore();
    
    // Dibujar grid de pixels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    
    const gridSize = zoomLevel;
    for (let x = 0; x <= size; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    
    for (let y = 0; y <= size; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    
    // Dibujar crosshair central
    const centerX = magnifierRadius;
    const centerY = magnifierRadius;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Línea horizontal
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.stroke();
    
    // Línea vertical
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
    
    // Punto central
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde circular
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(magnifierRadius, magnifierRadius, magnifierRadius - 1.5, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Borde exterior
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(magnifierRadius, magnifierRadius, magnifierRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
  }, [imageRef, imageData, mousePosition, isVisible, zoomLevel, size]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: lensPosition.x,
        top: lensPosition.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Magnifier Container */}
      <div className="relative">
        {/* Canvas para la lupa */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full shadow-2xl border-2 border-white"
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))'
          }}
        />
        
        {/* Información de color */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 min-w-max">
          <div className="text-center">
            {/* Muestra de color */}
            <div 
              className="w-8 h-8 rounded border-2 border-white mx-auto mb-2 shadow-lg"
              style={{ backgroundColor: currentColor }}
            />
            
            {/* Información RGB */}
            <div className="text-white text-xs font-mono mb-1">
              {currentColor}
            </div>
            
            {/* Información Hex */}
            <div className="text-slate-300 text-xs font-mono">
              {(() => {
                const rgb = currentColor.match(/\d+/g);
                if (rgb) {
                  const hex = rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
                  return `#${hex.toUpperCase()}`;
                }
                return currentColor;
              })()}
            </div>
            
            {/* Coordenadas del pixel */}
            <div className="text-slate-400 text-xs mt-1">
              {pixelPosition.x}, {pixelPosition.y}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};