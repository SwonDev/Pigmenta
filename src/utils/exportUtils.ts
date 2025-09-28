import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ColorPalette } from '../types';

// Función para exportar paleta como PDF con diseño profesional
export const exportToPDF = async (palette: ColorPalette): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Configuración de colores y fuentes
  const primaryColor = '#1a1a1a';
  const accentColor = '#6366f1';
  
  // Header con branding
  pdf.setFillColor(accentColor);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PIGMENTA', margin, 18);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Color Palette Generator', pageWidth - margin - 50, 18);
  
  // Información de la paleta
  let yPosition = 40;
  pdf.setTextColor(primaryColor);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Palette Information', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Algorithm: ${palette.algorithm}`, margin, yPosition);
  
  yPosition += 6;
  pdf.text(`Base Color: ${palette.baseColor.hex}`, margin, yPosition);
  
  yPosition += 6;
  pdf.text(`Shade Count: ${palette.shades.length}`, margin, yPosition);
  
  yPosition += 6;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  
  // Paleta de colores
  yPosition += 20;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Color Palette', margin, yPosition);
  
  yPosition += 15;
  const colorBoxSize = 25;
  const colorBoxSpacing = 5;
  const colorsPerRow = Math.floor(contentWidth / (colorBoxSize + colorBoxSpacing));
  
  palette.shades.forEach((shade, index) => {
    const color = shade.color.hex;
    const row = Math.floor(index / colorsPerRow);
    const col = index % colorsPerRow;
    const x = margin + col * (colorBoxSize + colorBoxSpacing);
    const y = yPosition + row * (colorBoxSize + 15);
    
    // Convertir hex a RGB
    const hex = (color || '#000000').replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Dibujar cuadro de color
    pdf.setFillColor(r, g, b);
    pdf.rect(x, y, colorBoxSize, colorBoxSize, 'F');
    
    // Borde del cuadro
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, colorBoxSize, colorBoxSize, 'S');
    
    // Código de color
    pdf.setTextColor(primaryColor);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const textX = x + (colorBoxSize / 2);
    pdf.text(color.toUpperCase(), textX, y + colorBoxSize + 8, { align: 'center' });
  });
  
  // Footer
  const footerY = pageHeight - 15;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(8);
  pdf.text('Generated with Pigmenta - Professional Color Palette Generator', margin, footerY);
  pdf.text(`pigmenta.app`, pageWidth - margin - 20, footerY);
  
  // Descargar PDF
  const algorithmName = (palette.algorithm || 'unknown').toLowerCase().replace(/\s+/g, '-');
  const fileName = `pigmenta-palette-${algorithmName}-${Date.now()}.pdf`;
  pdf.save(fileName);
};

// Función para exportar paleta como PNG con fondo transparente
export const exportToPNG = async (palette: ColorPalette): Promise<void> => {
  // Crear un canvas temporal para generar la imagen
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas');
  }
  
  // Configuración del canvas
  const colorSize = 80;
  const spacing = 10;
  const colorsPerRow = Math.min(palette.shades.length, 8);
  const rows = Math.ceil(palette.shades.length / colorsPerRow);
  
  canvas.width = colorsPerRow * colorSize + (colorsPerRow - 1) * spacing;
  canvas.height = rows * colorSize + (rows - 1) * spacing;
  
  // Limpiar canvas (fondo transparente)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar cada color
  palette.shades.forEach((shade, index) => {
    const color = shade.color.hex;
    const row = Math.floor(index / colorsPerRow);
    const col = index % colorsPerRow;
    const x = col * (colorSize + spacing);
    const y = row * (colorSize + spacing);
    
    // Dibujar cuadro de color
    ctx.fillStyle = color;
    ctx.fillRect(x, y, colorSize, colorSize);
    
    // Borde sutil
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, colorSize, colorSize);
  });
  
  // Convertir canvas a blob y descargar
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const algorithmName = (palette.algorithm || 'unknown').toLowerCase().replace(/\s+/g, '-');
      link.download = `pigmenta-palette-${algorithmName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

// Función auxiliar para capturar elemento DOM como PNG (alternativa)
export const exportElementToPNG = async (elementId: string, filename?: string): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Elemento con ID '${elementId}' no encontrado`);
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Fondo transparente
      scale: 2, // Mayor resolución
      useCORS: true,
      allowTaint: true
    });
    
    // Convertir a blob y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `pigmenta-export-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error al exportar PNG:', error);
    throw error;
  }
};