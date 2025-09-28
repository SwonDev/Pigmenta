import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Palette, Pipette, Eye } from 'lucide-react';
import { MagnifierLens } from './MagnifierLens';
import { extractColorsFromImage, generateMonochromaticPalette, generateMulticolorPalette } from '../utils/imageColorExtraction';
import { useAppStore } from '../stores/useAppStore';

interface ImageImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaletteType = 'monochromatic' | 'multicolor' | 'eyedropper';

interface ExtractedPalette {
  type: PaletteType;
  colors: string[];
  name: string;
}

export const ImageImportModal = ({ isOpen, onClose }: ImageImportModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPalettes, setExtractedPalettes] = useState<ExtractedPalette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<ExtractedPalette | null>(null);
  const [eyedropperMode, setEyedropperMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { addColor, clearColors, importPalette } = useAppStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      
      // Extract colors from image
      try {
        const dominantColors = await extractColorsFromImage(imageUrl);
        
        const palettes: ExtractedPalette[] = [
          {
            type: 'monochromatic',
            colors: generateMonochromaticPalette(dominantColors[0]),
            name: 'Paleta Monocromática'
          },
          {
            type: 'multicolor',
            colors: generateMulticolorPalette(dominantColors),
            name: 'Paleta Multicolor'
          }
        ];
        
        setExtractedPalettes(palettes);
        setSelectedPalette(palettes[0]);
        
        // Load image data for magnifier
        loadImageData(imageUrl);
      } catch (error) {
        console.error('Error extracting colors:', error);
        alert('Error al procesar la imagen. Por favor, intenta con otra imagen.');
      }
      
      setIsProcessing(false);
    };
    
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };



  const loadImageData = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setImageData(data);
    };
    img.src = imageUrl;
  };



  // Throttled mouse move handler for performance - now works across entire modal
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!eyedropperMode) return;
    
    // If we have an image, also calculate relative coordinates to it for magnifier
    if (imageRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      const relativeX = e.clientX - imageRect.left;
      const relativeY = e.clientY - imageRect.top;
      
      // Set relative coordinates for the magnifier
      setMousePosition({ x: relativeX, y: relativeY });
    }
    
    setShowMagnifier(true);
  }, [eyedropperMode]);

  // Handle mouse enter/leave for magnifier visibility
  const handleMouseEnter = useCallback(() => {
    if (eyedropperMode) {
      setShowMagnifier(true);
    }
  }, [eyedropperMode]);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperMode || !imageRef.current || !imageData) return;

    try {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Usar el mismo sistema de coordenadas que el magnifier
      // Calcular las coordenadas exactas del píxel usando imageData
      const scaleX = imageData.width / rect.width;
      const scaleY = imageData.height / rect.height;
      const pixelX = Math.floor(x * scaleX);
      const pixelY = Math.floor(y * scaleY);

      // Verificar límites del imageData
      if (pixelX < 0 || pixelX >= imageData.width || pixelY < 0 || pixelY >= imageData.height) {
        console.warn(`Click coordinates out of bounds: (${pixelX}, ${pixelY}) for image ${imageData.width}x${imageData.height}`);
        return;
      }

      // Obtener color del píxel directamente desde imageData
      const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      const a = imageData.data[pixelIndex + 3];
      
      console.log(`Pixel data at (${pixelX}, ${pixelY}):`, { r, g, b, a });
      
      // Validate pixel data
      if (a < 128) { // Consider semi-transparent pixels as invalid
        console.warn('Transparent or semi-transparent pixel selected');
        return;
      }

      // Validate RGB values
      if (r === undefined || g === undefined || b === undefined || 
          r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        console.error('Invalid RGB values:', { r, g, b });
        return;
      }

      // Convert to hex color
      const selectedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      console.log(`Selected color: ${selectedColor} at coordinates (${pixelX}, ${pixelY})`);

      // Validate the selected color format
      if (!selectedColor || !selectedColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        console.error('Invalid color format extracted:', selectedColor);
        return;
      }

      // Generate palette from selected color
      const monoPalette = generateMonochromaticPalette(selectedColor);
      
      // Validate generated palette
      if (!monoPalette || monoPalette.length === 0) {
        console.error('Failed to generate palette from color:', selectedColor);
        return;
      }

      const eyedropperPalette: ExtractedPalette = {
        type: 'eyedropper',
        name: `Color Seleccionado (${selectedColor.toUpperCase()})`,
        colors: monoPalette
      };

      // Update palettes and select the new one
      setExtractedPalettes(prev => {
        const filtered = prev.filter(p => p.type !== 'eyedropper');
        return [...filtered, eyedropperPalette];
      });
      
      setSelectedPalette(eyedropperPalette);
      setEyedropperMode(false);
      
      console.log('Eyedropper palette generated successfully:', eyedropperPalette);
    } catch (error) {
      console.error('Error in eyedropper functionality:', error);
      setEyedropperMode(false);
    }
  };

  const handleImportPalette = () => {
    if (!selectedPalette) return;
    
    clearColors();
    selectedPalette.colors.forEach(color => {
      addColor(color);
    });
    
    // Import the palette using the new function
    importPalette(selectedPalette.colors);
    
    onClose();
  };

  const resetModal = () => {
    setUploadedImage(null);
    setExtractedPalettes([]);
    setSelectedPalette(null);
    setEyedropperMode(false);
    setIsProcessing(false);
    setImageData(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="image-import-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              style={{
                cursor: eyedropperMode ? 'none' : 'default'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon size={24} />
                Importar Paleta desde Imagen
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {!uploadedImage ? (
                /* Upload Area */
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-blue-400 bg-blue-400/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Arrastra una imagen aquí
                  </h3>
                  <p className="text-slate-400 mb-4">
                    o haz clic para seleccionar un archivo
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Seleccionar Imagen
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Image Processing Area */
                <div className="space-y-6">
                  {/* Image Display */}
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Imagen Subida</h3>
                      <div className="relative">
                        <img
                          ref={imageRef}
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full max-h-64 object-contain rounded-lg transition-all duration-200"
                          style={{
                            filter: eyedropperMode ? 'brightness(1.1) contrast(1.05)' : 'none'
                          }}
                          onClick={handleImageClick}
                        />
                        {eyedropperMode && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10 rounded-lg flex items-center justify-center pointer-events-none">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-400/30 backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Haz clic en cualquier pixel para extraer su color</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Magnifier Lens dentro del contenedor de la imagen */}
                        <AnimatePresence>
                          {showMagnifier && eyedropperMode && (
                            <MagnifierLens
                              key="magnifier-lens"
                              imageRef={imageRef}
                              imageData={imageData}
                              mousePosition={mousePosition}
                              isVisible={showMagnifier && eyedropperMode}
                              zoomLevel={20}
                              size={120}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Palette Options */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Opciones de Paleta</h3>
                      
                      {/* Palette Type Buttons */}
                      <div className="space-y-3 mb-4">
                        {extractedPalettes.map((palette) => (
                          <button
                            key={palette.type}
                            onClick={() => setSelectedPalette(palette)}
                            className={`w-full p-3 rounded-lg border transition-all ${
                              selectedPalette?.type === palette.type
                                ? 'border-blue-400 bg-blue-400/10'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {palette.type === 'monochromatic' && <Palette size={20} className="text-slate-400" />}
                              {palette.type === 'multicolor' && <Eye size={20} className="text-slate-400" />}
                              <div className="text-left">
                                <div className="text-white font-medium">{palette.name}</div>
                                <div className="flex gap-1 mt-1">
                                  {palette.colors.slice(0, 5).map((color, idx) => (
                                    <div
                                      key={idx}
                                      className="w-4 h-4 rounded border border-slate-600"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                        
                        {/* Eyedropper Button */}
                        <button
                          onClick={() => setEyedropperMode(!eyedropperMode)}
                          className={`w-full p-3 rounded-lg border transition-all duration-200 transform hover:scale-[1.02] ${
                            eyedropperMode
                              ? 'border-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/25'
                              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-all duration-200 ${
                              eyedropperMode ? 'text-blue-400 scale-110' : 'text-slate-400'
                            }`}>
                              <Pipette size={20} className={eyedropperMode ? 'animate-pulse' : ''} />
                            </div>
                            <div className="text-left">
                              <div className={`font-medium transition-colors ${
                                eyedropperMode ? 'text-blue-300' : 'text-white'
                              }`}>
                                {eyedropperMode ? 'Modo Eyedropper Activo' : 'Activar Eyedropper'}
                              </div>
                              <div className="text-slate-400 text-sm">
                                {eyedropperMode 
                                  ? 'Haz clic en la imagen para seleccionar un color'
                                  : 'Selecciona un pixel exacto de la imagen'
                                }
                              </div>
                            </div>
                            {eyedropperMode && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Selected Palette Preview */}
                      {selectedPalette && (
                        <div className="bg-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3">{selectedPalette.name}</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {selectedPalette.colors.map((color, idx) => (
                              <div key={idx} className="text-center">
                                <div
                                  className="w-full h-12 rounded border border-slate-600 mb-1"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="text-xs text-slate-400 font-mono">
                                  {color.toUpperCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={resetModal}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Subir Otra Imagen
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={handleClose}
                      className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportPalette}
                      disabled={!selectedPalette}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Importar Paleta
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-slate-800 rounded-lg p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
                    <div className="text-white">Procesando imagen...</div>
                  </div>
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

    </>
  );
};