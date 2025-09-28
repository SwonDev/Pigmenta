import { useEffect } from 'react';
import { Header } from './components/Header';
import { PaletteDisplay } from './components/PaletteDisplay';
import { ExportSection } from './components/ExportSection';
import { ControlsPanel } from './components/ControlsPanel';
import { ColorPicker } from './components/ColorPicker';

import { Footer } from './components/Footer';
import { useAppStore } from "./stores/useAppStore";
import { useSidebarStore } from "./stores/sidebarStore";
import { DESIGN_TOKENS } from './constants/designTokens';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const { theme } = useAppStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  // Apply theme class to document element for CSS selectors
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: DESIGN_TOKENS.colors.background.canvas, // #0B0F12
        color: DESIGN_TOKENS.colors.text.primary
      }}
    >
      {/* Header - 72px height, transparent background, subtle border */}
      <header 
        className="flex-shrink-0 border-b"
        style={{
          height: '72px',
          backgroundColor: 'transparent',
          borderColor: DESIGN_TOKENS.colors.border.subtle
        }}
      >
        <Header />
      </header>
      
      {/* Main Layout */}
      <div className="flex flex-1 relative">
        {/* Toggle Button */}
        <motion.button
          onClick={toggleSidebar}
          className="absolute top-4 z-50 p-2 rounded-lg border transition-all duration-200 hover:shadow-lg"
          style={{
            left: isCollapsed ? '16px' : '304px', // 320px - 16px padding
            backgroundColor: DESIGN_TOKENS.colors.surface.card,
            borderColor: DESIGN_TOKENS.colors.border.subtle,
            color: DESIGN_TOKENS.colors.text.secondary
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          animate={{
            left: isCollapsed ? '16px' : '304px'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </motion.button>

        {/* Left Sidebar - Collapsible */}
        <motion.aside 
          className="flex-shrink-0 border-r sidebar-scrollable"
          style={{
            backgroundColor: '#0B1116', // Exact color from design_app.json
            borderColor: 'rgba(255,255,255,0.03)', // Subtle right border
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE and Edge
          }}
          initial={false}
          animate={{
            width: isCollapsed ? '0px' : '320px',
            opacity: isCollapsed ? 0 : 1
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                style={{ padding: DESIGN_TOKENS.spacing.lg, width: '320px' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
                  <ColorPicker />
                  <ControlsPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
        
        {/* Main Content Panel - #0B0F12 background */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.background.canvas // #0B0F12
          }}
        >
          <motion.div 
            style={{ 
              padding: DESIGN_TOKENS.spacing.lg, // 24px padding
              display: 'flex',
              flexDirection: 'column',
              gap: DESIGN_TOKENS.spacing.lg // 24px gap
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Palette Card */}
            <div 
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.card, // #0F1620
                borderRadius: DESIGN_TOKENS.radius.lg, // 16px
                border: `1px solid ${DESIGN_TOKENS.colors.border.subtle}`,
                padding: DESIGN_TOKENS.spacing.lg // 24px
              }}
            >
              <PaletteDisplay />
            </div>
            
            {/* Export Card */}
            <div 
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface.card, // #0F1620
                borderRadius: DESIGN_TOKENS.radius.lg, // 16px
                border: `1px solid ${DESIGN_TOKENS.colors.border.subtle}`,
                padding: DESIGN_TOKENS.spacing.lg // 24px
              }}
            >
              <ExportSection />
            </div>
            

          </motion.div>
        </main>
      </div>
      
      {/* Footer - #071019 background */}
      <Footer />
    </div>
  );
}

export default App;
