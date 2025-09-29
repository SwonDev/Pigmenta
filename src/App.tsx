import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from './components/Header';
import { PaletteDisplay } from './components/PaletteDisplay';
import { ExportSection } from './components/ExportSection';
import { ControlsPanel } from './components/ControlsPanel';
import { ColorPicker } from './components/ColorPicker';
import { IntelligentGeneration } from './components/IntelligentGeneration';
import { Footer } from './components/Footer';
import { ImageImportSection } from './components/ImageImportSection';
import { useAppStore } from './stores/useAppStore';
import { DESIGN_TOKENS } from './constants/designTokens';

function App() {
  const { theme } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, cerrar sidebar por defecto; en desktop, abierto por defecto
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${isMobile ? 'mobile-app-container mobile-safe-area-top mobile-safe-area-bottom' : ''}`}
      style={{
        backgroundColor: DESIGN_TOKENS.colors.background.app
      }}
    >
      {/* Mobile Header with Menu Button */}
      {isMobile && (
        <motion.div
          className="mobile-header fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 border-b mobile-safe-area-top"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.surface.card,
            borderColor: DESIGN_TOKENS.colors.border.subtle
          }}
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: sidebarOpen ? DESIGN_TOKENS.colors.surface.mutedCard : 'transparent',
              color: DESIGN_TOKENS.colors.text.primary
            }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <motion.img
              src="/logo.png"
              alt="Pigmenta Logo"
              className="w-8 h-8 rounded-lg"
              whileTap={{ scale: 0.9 }}
            />
            <h1 
              className="text-lg font-bold"
              style={{ color: DESIGN_TOKENS.colors.text.primary }}
            >
              Pigmenta
            </h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </motion.div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              className={`${
                isMobile 
                  ? 'mobile-sidebar fixed inset-y-0 left-0 z-40 w-full max-w-sm' 
                  : 'relative w-96'
              } flex flex-col border-r overflow-hidden`}
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.card,
                borderColor: DESIGN_TOKENS.colors.border.subtle,
                marginTop: isMobile ? '64px' : '0'
              }}
              initial={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
              animate={isMobile ? { x: 0 } : { width: 384, opacity: 1 }}
              exit={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeInOut',
                width: { duration: 0.3 }
              }}
            >
              {/* Desktop Header in Sidebar - Solo logo sin botón Import */}
              {!isMobile && (
                <div 
                  className="h-20 border-b flex-shrink-0 flex items-center px-6"
                  style={{ borderColor: DESIGN_TOKENS.colors.border.subtle }}
                >
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <motion.img
                          src="/logo.png"
                          alt="Pigmenta Logo"
                          className="w-8 h-8 rounded-lg shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <h1 
                          className="text-xl font-bold"
                          style={{
                            color: DESIGN_TOKENS.colors.text.primary
                          }}
                        >
                          Pigmenta
                        </h1>
                        <p 
                          className="text-xs -mt-1"
                          style={{
                            color: DESIGN_TOKENS.colors.text.muted
                          }}
                        >
                          Color Generator
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                <div className={`p-4 space-y-6 ${isMobile ? 'pb-20' : ''}`}>

                  {/* Color Picker */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ColorPicker />
                  </motion.div>

                  {/* Controls Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ControlsPanel />
                  </motion.div>

                  {/* Intelligent Generation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <IntelligentGeneration />
                  </motion.div>

                  {/* Image Import Section - Solo en sidebar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ImageImportSection />
                  </motion.div>
                </div>
              </div>

              {/* Desktop Toggle Button - Posición fija más arriba */}
              {!isMobile && (
                <motion.button
                  onClick={toggleSidebar}
                  className="absolute -right-4 p-2 rounded-full shadow-lg border z-10"
                  style={{
                    backgroundColor: DESIGN_TOKENS.colors.surface.card,
                    borderColor: DESIGN_TOKENS.colors.border.subtle,
                    color: DESIGN_TOKENS.colors.text.primary,
                    top: '60px' // Posición alineada con el logo
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </motion.button>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            style={{ marginTop: '64px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}

        {/* Desktop Collapsed Sidebar Toggle - Posición fija más arriba */}
        {!isMobile && !sidebarOpen && (
          <motion.button
            onClick={toggleSidebar}
            className="fixed p-3 rounded-full shadow-lg border z-10"
            style={{
              backgroundColor: DESIGN_TOKENS.colors.surface.card,
              borderColor: DESIGN_TOKENS.colors.border.subtle,
              color: DESIGN_TOKENS.colors.text.primary,
              left: '16px',
              top: '60px' // Posición alineada con el logo
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChevronRight size={20} />
          </motion.button>
        )}

        {/* Main Content */}
        <motion.main
          className={`flex-1 flex flex-col overflow-hidden ${
            isMobile ? 'pt-16' : ''
          }`}
          layout
          transition={{ duration: 0.3 }}
        >
          {/* Content Area - Sin header duplicado en desktop */}
          <div className="flex-1 overflow-y-auto">
            <div className={`${isMobile ? 'p-4' : 'p-8'} space-y-8`}>
              {/* Palette Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <PaletteDisplay />
              </motion.div>

              {/* Export Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ExportSection />
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </motion.main>
      </div>
    </div>
  );
}

export default App;
