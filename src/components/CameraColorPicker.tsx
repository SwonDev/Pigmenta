import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { DESIGN_TOKENS } from '../constants/designTokens';
import { parseColorInput } from '../utils/colorUtils';

interface CameraColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorCaptured?: (color: string) => void;
}

interface CapturePoint {
  x: number;
  y: number;
  color: string;
}

export const CameraColorPicker: React.FC<CameraColorPickerProps> = ({
  isOpen,
  onClose,
  onColorCaptured
}) => {
  const { updateBaseColor } = useAppStore();
  
  // Estados del componente
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedColor, setCapturedColor] = useState<string | null>(null);
  const [capturePoint, setCapturePoint] = useState<CapturePoint | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);



  // ===== FUNCIÓN DE MAPEO DE COORDENADAS ULTRA-PRECISA =====
  const getCanvasCoordinates = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement, touchX: number, touchY: number) => {
    console.log('🎯 INICIANDO MAPEO DE COORDENADAS ULTRA-PRECISO');
    
    // Obtener dimensiones exactas del elemento video en pantalla
    const rect = video.getBoundingClientRect();
    console.log('📱 Dimensiones del video en pantalla:', {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top
    });
    
    // Obtener dimensiones reales del video stream
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    console.log('🎥 Dimensiones reales del video stream:', {
      videoWidth,
      videoHeight
    });
    
    // Obtener dimensiones del canvas (que debe coincidir con el video stream)
    console.log('🖼️ Dimensiones del canvas:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
    
    // Coordenadas del toque relativas al elemento video
    console.log('👆 Coordenadas de toque originales:', { touchX, touchY });
    
    // Calcular aspect ratios
    const videoAspectRatio = videoWidth / videoHeight;
    const displayAspectRatio = rect.width / rect.height;
    
    console.log('📐 Aspect ratios:', {
      videoAspectRatio: videoAspectRatio.toFixed(3),
      displayAspectRatio: displayAspectRatio.toFixed(3)
    });
    
    // Variables para el mapeo final
    let finalX, finalY;
    let actualVideoDisplayWidth, actualVideoDisplayHeight;
    let offsetX = 0, offsetY = 0;
    
    if (Math.abs(videoAspectRatio - displayAspectRatio) < 0.01) {
      // Aspect ratios son prácticamente iguales - mapeo directo
      console.log('✅ Aspect ratios coinciden - mapeo directo');
      actualVideoDisplayWidth = rect.width;
      actualVideoDisplayHeight = rect.height;
      offsetX = 0;
      offsetY = 0;
    } else if (videoAspectRatio > displayAspectRatio) {
      // Video es más ancho - se ajusta por altura, hay barras verticales
      console.log('📏 Video más ancho - barras verticales');
      actualVideoDisplayHeight = rect.height;
      actualVideoDisplayWidth = rect.height * videoAspectRatio;
      offsetX = (rect.width - actualVideoDisplayWidth) / 2;
      offsetY = 0;
    } else {
      // Video es más alto - se ajusta por ancho, hay barras horizontales
      console.log('📏 Video más alto - barras horizontales');
      actualVideoDisplayWidth = rect.width;
      actualVideoDisplayHeight = rect.width / videoAspectRatio;
      offsetX = 0;
      offsetY = (rect.height - actualVideoDisplayHeight) / 2;
    }
    
    console.log('📊 Área de video real en pantalla:', {
      actualVideoDisplayWidth: actualVideoDisplayWidth.toFixed(2),
      actualVideoDisplayHeight: actualVideoDisplayHeight.toFixed(2),
      offsetX: offsetX.toFixed(2),
      offsetY: offsetY.toFixed(2)
    });
    
    // Ajustar coordenadas de toque quitando los offsets
    const adjustedTouchX = touchX - offsetX;
    const adjustedTouchY = touchY - offsetY;
    
    console.log('🔧 Coordenadas ajustadas (sin offsets):', {
      adjustedTouchX: adjustedTouchX.toFixed(2),
      adjustedTouchY: adjustedTouchY.toFixed(2)
    });
    
    // Verificar que el toque esté dentro del área real del video
    if (adjustedTouchX < 0 || adjustedTouchX > actualVideoDisplayWidth || 
        adjustedTouchY < 0 || adjustedTouchY > actualVideoDisplayHeight) {
      console.warn('⚠️ Toque fuera del área del video real');
      // Clamp a los límites del área de video
      const clampedX = Math.max(0, Math.min(actualVideoDisplayWidth, adjustedTouchX));
      const clampedY = Math.max(0, Math.min(actualVideoDisplayHeight, adjustedTouchY));
      console.log('🔒 Coordenadas clampeadas:', { clampedX, clampedY });
    }
    
    // Calcular escalas exactas del display al canvas
    const scaleX = canvas.width / actualVideoDisplayWidth;
    const scaleY = canvas.height / actualVideoDisplayHeight;
    
    console.log('⚖️ Escalas de transformación:', {
      scaleX: scaleX.toFixed(4),
      scaleY: scaleY.toFixed(4)
    });
    
    // Mapear a coordenadas del canvas
    finalX = adjustedTouchX * scaleX;
    finalY = adjustedTouchY * scaleY;
    
    // Redondear a píxeles enteros
    const pixelX = Math.round(finalX);
    const pixelY = Math.round(finalY);
    
    // Clamp final a los límites del canvas
    const clampedPixelX = Math.max(0, Math.min(canvas.width - 1, pixelX));
    const clampedPixelY = Math.max(0, Math.min(canvas.height - 1, pixelY));
    
    console.log('🎯 RESULTADO FINAL DEL MAPEO:', {
      coordenadasOriginales: { touchX, touchY },
      coordenadasFinales: { x: clampedPixelX, y: clampedPixelY },
      precision: 'ULTRA-PRECISA'
    });
    
    return {
      x: clampedPixelX,
      y: clampedPixelY
    };
  }, []);

  // ===== INICIALIZACIÓN DE CÁMARA OPTIMIZADA PARA PRECISIÓN ABSOLUTA =====
  const initializeCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 INICIANDO CONFIGURACIÓN DE CÁMARA DE ALTA PRECISIÓN');

      // Verificar si getUserMedia está disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu dispositivo no soporta acceso a la cámara');
      }

      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Configuración avanzada para máxima resolución y calidad de color
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          // Configuración de resolución para máxima precisión
          width: { 
            ideal: 3840,  // 4K para máxima precisión
            min: 1920     // Mínimo Full HD
          },
          height: { 
            ideal: 2160,  // 4K para máxima precisión
            min: 1080     // Mínimo Full HD
          },
          // Configuración de frame rate optimizada para captura de color
          frameRate: { 
            ideal: 60,    // Alta frecuencia para mejor estabilidad
            min: 30       // Mínimo aceptable
          },
          // Configuraciones adicionales para calidad de color
          aspectRatio: { ideal: 16/9 }
          // Configuraciones avanzadas se aplicarán después si están disponibles
        },
        audio: false
      };

      console.log('📹 Configuración de cámara de precisión absoluta:', constraints);

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Configurar el video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Configurar propiedades del video para máxima calidad
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        // Esperar a que el video esté completamente cargado
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              const videoWidth = videoRef.current?.videoWidth || 0;
              const videoHeight = videoRef.current?.videoHeight || 0;
              const aspectRatio = videoWidth / videoHeight;
              
              console.log('✅ CÁMARA DE ALTA PRECISIÓN CONFIGURADA:', {
                resolución: `${videoWidth}x${videoHeight}`,
                aspectRatio: aspectRatio.toFixed(2),
                calidad: videoWidth >= 1920 ? 'ALTA DEFINICIÓN' : 'DEFINICIÓN ESTÁNDAR',
                precisión: videoWidth >= 3840 ? 'ULTRA ALTA (4K)' : videoWidth >= 1920 ? 'ALTA (FHD)' : 'ESTÁNDAR (HD)',
                optimizadoPara: 'CAPTURA DE COLOR PROFESIONAL'
              });
              
              // Verificar si se obtuvo la resolución deseada
              if (videoWidth < 1280 || videoHeight < 720) {
                console.warn('⚠️ Resolución menor a la óptima, pero funcional para captura de color');
              }
              
              resolve();
            };
            
            videoRef.current.onerror = (error) => {
              console.error('❌ Error al cargar video:', error);
              reject(new Error('Error al cargar el stream de video'));
            };
            
            // Timeout de seguridad
            setTimeout(() => {
              reject(new Error('Timeout al cargar el video'));
            }, 10000);
          }
        });

        // Configurar track de video para máxima calidad
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          console.log('🎥 Capacidades de la cámara:', capabilities);
          
          // Aplicar configuraciones avanzadas si están disponibles
          const advancedConstraints: any = {};
          
          if ('whiteBalanceMode' in capabilities && capabilities.whiteBalanceMode && Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes('manual')) {
            advancedConstraints.whiteBalanceMode = 'manual';
          }
          
          if ('exposureMode' in capabilities && capabilities.exposureMode && Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('manual')) {
            advancedConstraints.exposureMode = 'manual';
          }
          
          if ('focusMode' in capabilities && capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
            advancedConstraints.focusMode = 'continuous';
          }
          
          try {
            await videoTrack.applyConstraints({ advanced: [advancedConstraints] });
            console.log('✅ Configuraciones avanzadas aplicadas:', advancedConstraints);
          } catch (constraintError) {
            console.log('ℹ️ Algunas configuraciones avanzadas no están disponibles:', constraintError);
          }
        }
        
        videoRef.current.play();
      }

      setHasPermission(true);
      setIsLoading(false);
      
      console.log('🎯 SISTEMA DE CÁMARA DE PRECISIÓN ABSOLUTA LISTO');
    } catch (err: any) {
      console.error('❌ ERROR CRÍTICO EN CONFIGURACIÓN DE CÁMARA:', err);
      setIsLoading(false);
      
      let errorMessage = 'Error desconocido al acceder a la cámara';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Acceso a la cámara denegado. Se requiere acceso para la captura de color de precisión.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró cámara compatible para captura de color de alta precisión.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Tu navegador no soporta acceso a la cámara.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo utilizada por otra aplicación. Cierra otras apps que usen la cámara.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'La cámara no soporta la configuración de alta precisión solicitada. Intentando con configuración estándar...';
        
        // Fallback a configuración estándar
        try {
          const fallbackConstraints: MediaStreamConstraints = {
            video: {
              facingMode: facingMode,
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
              frameRate: { ideal: 30, min: 15 }
            },
            audio: false
          };
          
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          streamRef.current = fallbackStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play();
          }
          
          setHasPermission(true);
          setIsLoading(false);
          console.log('✅ Cámara configurada con parámetros estándar');
          return;
        } catch (fallbackError) {
          errorMessage = `Error de configuración de cámara: ${err.message}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setHasPermission(false);
    }
  }, [facingMode]);

  // ===== SISTEMA DE PRECISIÓN ABSOLUTA - NIVEL PROFESIONAL =====

  // Función para conversión sRGB a Linear RGB con precisión máxima
  const sRGBToLinear = useCallback((value: number): number => {
    const normalized = value / 255;
    if (normalized <= 0.04045) {
      return normalized / 12.92;
    } else {
      return Math.pow((normalized + 0.055) / 1.055, 2.4);
    }
  }, []);

  // Función para conversión Linear RGB a sRGB con precisión máxima
  const linearToSRGB = useCallback((value: number): number => {
    if (value <= 0.0031308) {
      return value * 12.92;
    } else {
      return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
    }
  }, []);

  // Función de interpolación bilineal sub-pixel para máxima precisión
  const bilinearInterpolation = useCallback((
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number
  ): { r: number; g: number; b: number } => {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, ctx.canvas.width - 1);
    const y2 = Math.min(y1 + 1, ctx.canvas.height - 1);

    const fx = x - x1;
    const fy = y - y1;

    // Obtener los 4 píxeles vecinos
    const getPixel = (px: number, py: number) => {
      const imageData = ctx.getImageData(px, py, 1, 1);
      return {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2]
      };
    };

    const p11 = getPixel(x1, y1);
    const p21 = getPixel(x2, y1);
    const p12 = getPixel(x1, y2);
    const p22 = getPixel(x2, y2);

    // Interpolación bilineal para cada canal
    const interpolateChannel = (c11: number, c21: number, c12: number, c22: number): number => {
      const r1 = c11 * (1 - fx) + c21 * fx;
      const r2 = c12 * (1 - fx) + c22 * fx;
      return r1 * (1 - fy) + r2 * fy;
    };

    return {
      r: interpolateChannel(p11.r, p21.r, p12.r, p22.r),
      g: interpolateChannel(p11.g, p21.g, p12.g, p22.g),
      b: interpolateChannel(p11.b, p21.b, p12.b, p22.b)
    };
  }, []);

  // Algoritmo adaptativo para determinar el radio óptimo de muestreo
  const calculateAdaptiveRadius = useCallback((
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    maxRadius: number = 8
  ): number => {
    const centerPixel = ctx.getImageData(centerX, centerY, 1, 1);
    const centerColor = {
      r: centerPixel.data[0],
      g: centerPixel.data[1],
      b: centerPixel.data[2]
    };

    let optimalRadius = 1;
    let previousVariance = 0;

    for (let radius = 1; radius <= maxRadius; radius++) {
      const samples: { r: number; g: number; b: number }[] = [];
      
      // Muestrear en círculo
      for (let angle = 0; angle < 360; angle += 30) {
        const x = Math.round(centerX + radius * Math.cos(angle * Math.PI / 180));
        const y = Math.round(centerY + radius * Math.sin(angle * Math.PI / 180));
        
        if (x >= 0 && x < ctx.canvas.width && y >= 0 && y < ctx.canvas.height) {
          const pixel = ctx.getImageData(x, y, 1, 1);
          samples.push({
            r: pixel.data[0],
            g: pixel.data[1],
            b: pixel.data[2]
          });
        }
      }

      // Calcular varianza de color
      const variance = samples.reduce((sum, sample) => {
        const dr = sample.r - centerColor.r;
        const dg = sample.g - centerColor.g;
        const db = sample.b - centerColor.b;
        return sum + (dr * dr + dg * dg + db * db);
      }, 0) / samples.length;

      // Si la varianza aumenta significativamente, usar el radio anterior
      if (radius > 1 && variance > previousVariance * 2) {
        break;
      }

      optimalRadius = radius;
      previousVariance = variance;
    }

    return Math.max(2, optimalRadius);
  }, []);

  // Muestreo avanzado multi-punto con círculos concéntricos y pesos adaptativos
  const advancedMultiPointSampling = useCallback((
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    adaptiveRadius: number
  ) => {
    const samples: Array<{ r: number; g: number; b: number; weight: number }> = [];
    
    // Muestreo del centro con máximo peso
    const centerSample = bilinearInterpolation(ctx, centerX, centerY);
    samples.push({ ...centerSample, weight: 4.0 });

    // Muestreo en círculos concéntricos con pesos decrecientes
    for (let ring = 1; ring <= adaptiveRadius; ring++) {
      const ringRadius = ring * 0.8; // Espaciado más denso
      const pointsInRing = Math.max(8, ring * 6); // Más puntos en anillos externos
      const ringWeight = 1.0 / (ring * ring); // Peso inversamente proporcional al cuadrado de la distancia

      for (let i = 0; i < pointsInRing; i++) {
        const angle = (2 * Math.PI * i) / pointsInRing;
        const x = centerX + ringRadius * Math.cos(angle);
        const y = centerY + ringRadius * Math.sin(angle);

        if (x >= 0 && x < ctx.canvas.width && y >= 0 && y < ctx.canvas.height) {
          const sample = bilinearInterpolation(ctx, x, y);
          samples.push({ ...sample, weight: ringWeight });
        }
      }
    }

    // Muestreo adicional en patrón de cruz para mayor precisión
    const crossOffsets = [
      { dx: 0.5, dy: 0 }, { dx: -0.5, dy: 0 },
      { dx: 0, dy: 0.5 }, { dx: 0, dy: -0.5 },
      { dx: 0.3, dy: 0.3 }, { dx: -0.3, dy: -0.3 },
      { dx: 0.3, dy: -0.3 }, { dx: -0.3, dy: 0.3 }
    ];

    crossOffsets.forEach(offset => {
      const x = centerX + offset.dx;
      const y = centerY + offset.dy;
      if (x >= 0 && x < ctx.canvas.width && y >= 0 && y < ctx.canvas.height) {
        const sample = bilinearInterpolation(ctx, x, y);
        samples.push({ ...sample, weight: 2.0 });
      }
    });

    return samples;
  }, [bilinearInterpolation]);

  // Algoritmo avanzado de reducción de ruido con filtrado estadístico
  const advancedNoiseReduction = useCallback((
    samples: Array<{ r: number; g: number; b: number; weight: number }>
  ) => {
    if (samples.length === 0) return { r: 0, g: 0, b: 0 };

    // Separar por canales
    const rValues = samples.map(s => s.r);
    const gValues = samples.map(s => s.g);
    const bValues = samples.map(s => s.b);
    const weights = samples.map(s => s.weight);

    // Función para filtrar outliers usando IQR (Interquartile Range)
    const filterOutliersIQR = (values: number[], weights: number[]) => {
      const sortedIndices = values
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => a.val - b.val);

      const q1Index = Math.floor(sortedIndices.length * 0.25);
      const q3Index = Math.floor(sortedIndices.length * 0.75);
      
      const q1 = sortedIndices[q1Index].val;
      const q3 = sortedIndices[q3Index].val;
      const iqr = q3 - q1;
      
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      return sortedIndices
        .filter(item => item.val >= lowerBound && item.val <= upperBound)
        .map(item => ({ value: item.val, weight: weights[item.idx] }));
    };

    // Filtrar outliers para cada canal
    const filteredR = filterOutliersIQR(rValues, weights);
    const filteredG = filterOutliersIQR(gValues, weights);
    const filteredB = filterOutliersIQR(bValues, weights);

    // Calcular promedio ponderado
    const weightedAverage = (filtered: Array<{ value: number; weight: number }>) => {
      const totalWeight = filtered.reduce((sum, item) => sum + item.weight, 0);
      const weightedSum = filtered.reduce((sum, item) => sum + item.value * item.weight, 0);
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    };

    return {
      r: weightedAverage(filteredR),
      g: weightedAverage(filteredG),
      b: weightedAverage(filteredB)
    };
  }, []);

  // Compensación automática de balance de blancos
  const autoWhiteBalance = useCallback((r: number, g: number, b: number) => {
    // Convertir a espacio lineal para cálculos precisos
    const linearR = sRGBToLinear(r);
    const linearG = sRGBToLinear(g);
    const linearB = sRGBToLinear(b);

    // Calcular la luminancia
    const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;

    // Detectar temperatura de color aproximada
    const colorTemp = (linearB / linearR) * 1000 + 3000; // Aproximación simple

    // Factores de corrección basados en temperatura de color
    let rCorrection = 1.0;
    const gCorrection = 1.0;
    let bCorrection = 1.0;

    if (colorTemp < 4000) {
      // Luz cálida (incandescente)
      rCorrection = 0.95;
      bCorrection = 1.1;
    } else if (colorTemp > 6500) {
      // Luz fría (fluorescente/LED)
      rCorrection = 1.05;
      bCorrection = 0.9;
    }

    // Aplicar corrección y convertir de vuelta a sRGB
    const correctedR = linearToSRGB(linearR * rCorrection) * 255;
    const correctedG = linearToSRGB(linearG * gCorrection) * 255;
    const correctedB = linearToSRGB(linearB * bCorrection) * 255;

    return {
      r: Math.max(0, Math.min(255, correctedR)),
      g: Math.max(0, Math.min(255, correctedG)),
      b: Math.max(0, Math.min(255, correctedB))
    };
  }, [sRGBToLinear, linearToSRGB]);

  // Compensación de exposición avanzada
  const exposureCompensation = useCallback((r: number, g: number, b: number) => {
    // Convertir a espacio lineal
    const linearR = sRGBToLinear(r);
    const linearG = sRGBToLinear(g);
    const linearB = sRGBToLinear(b);

    // Calcular luminancia percibida
    const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;

    // Determinar factor de compensación
    let exposureFactor = 1.0;

    if (luminance < 0.1) {
      // Subexpuesto - aumentar exposición gradualmente
      exposureFactor = 1.0 + (0.1 - luminance) * 2.0;
    } else if (luminance > 0.8) {
      // Sobreexpuesto - reducir exposición gradualmente
      exposureFactor = 1.0 - (luminance - 0.8) * 1.5;
    }

    // Aplicar compensación manteniendo la relación de colores
    const compensatedR = linearToSRGB(linearR * exposureFactor) * 255;
    const compensatedG = linearToSRGB(linearG * exposureFactor) * 255;
    const compensatedB = linearToSRGB(linearB * exposureFactor) * 255;

    return {
      r: Math.max(0, Math.min(255, compensatedR)),
      g: Math.max(0, Math.min(255, compensatedG)),
      b: Math.max(0, Math.min(255, compensatedB))
    };
  }, [sRGBToLinear, linearToSRGB]);

  // Corrección de aberración cromática
  const chromaticAberrationCorrection = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ) => {
    // Muestrear con ligeros offsets para corregir aberración
    const redSample = bilinearInterpolation(ctx, centerX - 0.2, centerY);
    const greenSample = bilinearInterpolation(ctx, centerX, centerY);
    const blueSample = bilinearInterpolation(ctx, centerX + 0.2, centerY);

    return {
      r: redSample.r,
      g: greenSample.g,
      b: blueSample.b
    };
  }, [bilinearInterpolation]);

  // Función RGB a HEX con precisión absoluta
  const precisionRgbToHex = useCallback((r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const clamped = Math.max(0, Math.min(255, Math.round(n)));
      const hex = clamped.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // ===== FUNCIÓN PRINCIPAL DE CAPTURA ULTRA-PRECISA =====
  const captureColorAtPoint = useCallback(async (x: number, y: number) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    try {
      console.log('🎯 INICIANDO CAPTURA ULTRA-PRECISA DEL PÍXEL EXACTO');
      console.log('👆 Coordenadas de toque recibidas:', { x, y });
      
      // PASO 1: Configurar canvas con dimensiones exactas del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('📐 Configuración del canvas:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      
      // PASO 2: Dibujar frame actual del video sin suavizado
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('🖼️ Frame del video dibujado en canvas');

      // PASO 3: Mapear coordenadas de toque a píxeles exactos del canvas
      const coords = getCanvasCoordinates(video, canvas, x, y);
      console.log('🎯 Coordenadas mapeadas al canvas:', coords);

      // PASO 4: Capturar el color del píxel EXACTO
      const imageData = ctx.getImageData(coords.x, coords.y, 1, 1);
      const pixelData = imageData.data;
      
      const exactR = pixelData[0];
      const exactG = pixelData[1];
      const exactB = pixelData[2];
      const alpha = pixelData[3];
      
      console.log('🔍 PÍXEL EXACTO CAPTURADO:', {
        coordenadas: coords,
        r: exactR,
        g: exactG,
        b: exactB,
        alpha: alpha
      });

      // PASO 5: Verificar que el píxel sea válido
      if (alpha < 128) {
        console.warn('⚠️ Píxel transparente o semi-transparente detectado');
        return;
      }

      // PASO 6: Convertir a HEX con precisión absoluta
      const hexColor = precisionRgbToHex(exactR, exactG, exactB);
      console.log('🎨 Color HEX del píxel exacto:', hexColor);

      // PASO 7: Validar el color capturado
      const validatedColor = parseColorInput(hexColor);
      if (!validatedColor) {
        console.error('❌ Error en validación del color:', hexColor);
        return;
      }

      console.log('✅ CAPTURA ULTRA-PRECISA COMPLETADA:', {
        coordenadasToque: { x, y },
        coordenadasCanvas: coords,
        colorRGB: { r: exactR, g: exactG, b: exactB },
        colorHEX: hexColor,
        precision: 'PÍXEL EXACTO'
      });

      // PASO 8: Actualizar estados con el color exacto
      setCapturedColor(hexColor);
      setCapturePoint({ x, y, color: hexColor });

      // PASO 9: Efecto visual de confirmación
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);

      // PASO 10: Aplicar color al store
      updateBaseColor(validatedColor, true);

      // PASO 11: Ejecutar callback si existe
      if (onColorCaptured) {
        onColorCaptured(hexColor);
      }

      // PASO 12: Auto-cerrar con delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ ERROR CRÍTICO EN CAPTURA ULTRA-PRECISA:', error);
    }
  }, [
    getCanvasCoordinates,
    calculateAdaptiveRadius,
    advancedMultiPointSampling,
    advancedNoiseReduction,
    autoWhiteBalance,
    exposureCompensation,
    chromaticAberrationCorrection,
    precisionRgbToHex,
    parseColorInput,
    updateBaseColor,
    onColorCaptured,
    onClose
  ]);

  // Manejar click/touch en el video
  const handleVideoClick = useCallback((event: React.MouseEvent<HTMLVideoElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    captureColorAtPoint(x, y);
  }, [captureColorAtPoint]);

  // Manejar touch en el video
  const handleVideoTouch = useCallback((event: React.TouchEvent<HTMLVideoElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    captureColorAtPoint(x, y);
  }, [captureColorAtPoint]);

  // Alternar entre cámara frontal y trasera
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Limpiar recursos al cerrar
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCapturedColor(null);
    setCapturePoint(null);
    setError(null);
    setHasPermission(null);
  }, []);

  // Efectos
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen, initializeCamera, cleanup]);

  // Reinicializar cámara cuando cambia el facing mode
  useEffect(() => {
    if (isOpen && hasPermission) {
      initializeCamera();
    }
  }, [facingMode, isOpen, hasPermission, initializeCamera]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Flash effect */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="absolute inset-0 bg-white z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <div className="relative w-full h-full flex flex-col">
          {/* Header con controles */}
          <motion.div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Botón cerrar */}
            <motion.button
              onClick={onClose}
              className="p-3 rounded-full shadow-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            {/* Título */}
            <div className="text-center">
              <h2 className="text-white text-lg font-semibold">Capturar Color</h2>
              <p className="text-white/70 text-sm">Toca cualquier superficie</p>
            </div>

            {/* Botón cambiar cámara */}
            <motion.button
              onClick={toggleCamera}
              className="p-3 rounded-full shadow-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isLoading || !hasPermission}
            >
              <RotateCcw size={24} />
            </motion.button>
          </motion.div>

          {/* Área de video */}
          <div className="flex-1 flex items-center justify-center relative">
            {isLoading && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-white text-lg">Iniciando cámara...</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">Error de Cámara</h3>
                <p className="text-white/80 text-center leading-relaxed">{error}</p>
                <motion.button
                  onClick={initializeCamera}
                  className="mt-6 px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: DESIGN_TOKENS.colors.accent.primary,
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reintentar
                </motion.button>
              </motion.div>
            )}

            {hasPermission && !error && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover cursor-crosshair"
                  autoPlay
                  playsInline
                  muted
                  onClick={handleVideoClick}
                  onTouchStart={handleVideoTouch}
                />

                {/* Crosshair central */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Crosshair className="w-8 h-8 text-white/60" />
                </div>

                {/* Punto de captura */}
                {capturePoint && (
                  <motion.div
                    className="absolute w-6 h-6 border-2 border-white rounded-full pointer-events-none"
                    style={{
                      left: capturePoint.x - 12,
                      top: capturePoint.y - 12,
                      backgroundColor: capturePoint.color
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer con color capturado */}
          {capturedColor && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-30 p-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div
                className="mx-auto max-w-sm p-4 rounded-xl shadow-lg flex items-center space-x-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: capturedColor }}
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Color Capturado</p>
                  <p className="text-white/80 font-mono text-sm">{capturedColor}</p>
                </div>
                <div className="text-white/60">
                  <Camera size={20} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};