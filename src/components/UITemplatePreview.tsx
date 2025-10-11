import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Smartphone, Monitor, Globe, BarChart3, ZoomIn, ZoomOut, ShoppingBag, BookOpen, Server, MessageCircle } from 'lucide-react';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { useTemplateStore } from '../stores/useTemplateStore';
import { TemplateType } from '../types';
import { cn } from "../lib/utils";

const TEMPLATE_OPTIONS: { id: TemplateType; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'mobile-app', label: 'Mobile App', icon: Smartphone },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Globe },
  { id: 'landing-page', label: 'Landing Page', icon: Monitor },
  { id: 'e-commerce', label: 'E-Commerce', icon: ShoppingBag },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'saas-platform', label: 'SaaS Platform', icon: Server },
  { id: 'social-media', label: 'Social Media', icon: MessageCircle }
];

export const UITemplatePreview: React.FC = () => {
  const { currentPalette } = useAIPaletteStore();
  const { 
    currentTemplate, 
    setCurrentTemplate, 
    zoomLevel, 
    setZoomLevel,
    showGrid,
    toggleGrid 
  } = useTemplateStore();

  if (!currentPalette) return null;

  // Crear colores seguros con valores por defecto
  const colors = {
    background: {
      base: currentPalette?.colors?.background?.base || '#ffffff',
      variations: {
        200: currentPalette?.colors?.background?.variations?.[200] || '#f8f9fa',
        300: currentPalette?.colors?.background?.variations?.[300] || '#e9ecef'
      }
    },
    primary: {
      base: currentPalette?.colors?.primary?.base || '#007bff',
      variations: {
        200: currentPalette?.colors?.primary?.variations?.[200] || '#66b3ff',
        300: currentPalette?.colors?.primary?.variations?.[300] || '#4da6ff'
      }
    },
    accent: {
      base: currentPalette?.colors?.accent?.base || '#28a745',
      variations: {
        200: currentPalette?.colors?.accent?.variations?.[200] || '#6bcf7f',
        300: currentPalette?.colors?.accent?.variations?.[300] || '#5cbf73'
      }
    },
    text: {
      base: currentPalette?.colors?.text?.base || '#212529',
      variations: {
        200: currentPalette?.colors?.text?.variations?.[200] || '#6c757d',
        300: currentPalette?.colors?.text?.variations?.[300] || '#495057'
      }
    }
  };

  const handleZoomIn = () => setZoomLevel(Math.min(2, zoomLevel + 0.1));
  const handleZoomOut = () => setZoomLevel(Math.max(0.5, zoomLevel - 0.1));

  const renderTemplate = () => {
    const style = {
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'top left'
    };

    switch (currentTemplate) {
      case 'mobile-app':
        return <MobileAppTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'dashboard':
        return <DashboardTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'portfolio':
        return <PortfolioTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'landing-page':
        return <LandingPageTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'e-commerce':
        return <ECommerceTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'blog':
        return <BlogTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'saas-platform':
        return <SaaSPlatformTemplate colors={colors} style={style} showGrid={showGrid} />;
      case 'social-media':
        return <SocialMediaTemplate colors={colors} style={style} showGrid={showGrid} />;
      default:
        return <MobileAppTemplate colors={colors} style={style} showGrid={showGrid} />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="p-2 sm:p-3 lg:p-4 bg-white/10 rounded-xl">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" style={{ color: '#23AAD7' }} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">UI Preview</h2>
            <p className="text-sm sm:text-base lg:text-xl text-white/70">See your palette in real UI templates</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
          {/* Template Selector - Grid Layout */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-3">
            {TEMPLATE_OPTIONS.map((template) => {
              const Icon = template.icon;
              const isActive = currentTemplate === template.id;

              return (
                <motion.button
                  key={template.id}
                  onClick={() => setCurrentTemplate(template.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 sm:gap-2 px-2 py-2 sm:px-3 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm",
                    "focus:outline-none focus:ring-2",
                    isActive
                      ? "text-white border"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  style={{
                    ...(isActive && {
                      backgroundColor: 'rgba(35, 170, 215, 0.2)',
                      borderColor: 'rgba(35, 170, 215, 0.3)',
                      boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
                    }),
                    ...(!isActive && {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      boxShadow: 'transparent'
                    })
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs text-center leading-tight">{template.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Zoom Controls & Grid Toggle */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 bg-white/10 rounded-xl p-2 sm:p-3 w-fit mx-auto">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <motion.button
                onClick={handleZoomOut}
                className="p-2 sm:p-3 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/70" />
              </motion.button>
              <span className="text-sm sm:text-base lg:text-lg text-white/70 min-w-[3.5rem] sm:min-w-[5rem] text-center font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <motion.button
                onClick={handleZoomIn}
                className="p-2 sm:p-3 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/70" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 sm:h-8 bg-white/20"></div>

            {/* Grid Toggle */}
            <label className="flex items-center gap-2 sm:gap-3 text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={toggleGrid}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-white/10 focus:ring-2"
                style={{
                  accentColor: '#23AAD7',
                  '--tw-ring-color': 'rgba(35, 170, 215, 0.5)'
                } as React.CSSProperties}
              />
              <span className="text-sm sm:text-base font-medium">Grid</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Template Preview */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-3 sm:p-6 lg:p-12 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ minHeight: '400px' }}
      >
        <div className="flex justify-center items-center min-h-full">
          {renderTemplate()}
        </div>
      </motion.div>
    </div>
  );
};

// Template Components
const MobileAppTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-[320px] sm:max-w-xs md:w-80 h-[500px] sm:h-[600px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative" data-template-container>
    {/* Status Bar */}
    <div
      className="h-10 sm:h-12 flex items-center justify-between px-4 sm:px-6 text-xs sm:text-sm font-medium"
      style={{ backgroundColor: colors.background.base, color: colors.text.base }}
    >
      <span>9:41</span>
      <span>100%</span>
    </div>

    {/* Header */}
    <div
      className="h-12 sm:h-16 flex items-center justify-between px-4 sm:px-6"
      style={{ backgroundColor: colors.primary.base }}
    >
      <h1 className="text-lg sm:text-xl font-bold text-white">My App</h1>
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full"></div>
    </div>

    {/* Content */}
    <div style={{ backgroundColor: colors.background.variations[200] }} className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl"
          style={{ backgroundColor: colors.background.base }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
            <div>
              <div className="h-2.5 sm:h-3 w-16 sm:w-20 rounded" style={{ backgroundColor: colors.text.base }}></div>
              <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded mt-1" style={{ backgroundColor: colors.text.variations[200] }}></div>
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 w-full rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
            <div className="h-1.5 sm:h-2 w-3/4 rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom Navigation */}
    <div
      className="h-16 sm:h-20 flex items-center justify-around border-t"
      style={{
        backgroundColor: colors.background.base,
        borderColor: colors.background.variations[300]
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded"
          style={{ backgroundColor: i === 2 ? colors.primary.base : colors.text.variations[200] }}
        ></div>
      ))}
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

const DashboardTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    {/* Sidebar */}
    <div className="flex h-full">
      <div
        className="w-16 sm:w-48 lg:w-64 p-2 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4"
        style={{ backgroundColor: colors.background.variations[300] }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <span className="hidden sm:block text-xs lg:text-sm font-bold" style={{ color: colors.text.base }}>Dashboard</span>
        </div>

        {['Analytics', 'Users', 'Settings', 'Reports'].map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 lg:p-3 rounded-lg"
            style={{
              backgroundColor: i === 0 ? colors.primary.variations[200] : 'transparent',
              color: i === 0 ? colors.primary.base : colors.text.variations[200]
            }}
          >
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'currentColor' }}></div>
            <span className="hidden sm:block text-xs lg:text-sm font-medium">{item}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1" style={{ backgroundColor: colors.background.base }}>
        {/* Header */}
        <div
          className="h-12 sm:h-14 lg:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b"
          style={{ borderColor: colors.background.variations[300] }}
        >
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: colors.text.base }}>Analytics</h1>
          <div
            className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg text-white text-xs sm:text-sm font-medium"
            style={{ backgroundColor: colors.accent.base }}
          >
            Export
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-3 sm:p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Stats Cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-4 rounded-xl"
              style={{ backgroundColor: colors.background.variations[200] }}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg"
                  style={{ backgroundColor: colors.primary.variations[200] }}
                ></div>
                <span className="text-[10px] sm:text-xs" style={{ color: colors.text.variations[200] }}>+12%</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: colors.text.base }}>
                {i === 1 ? '2.4k' : i === 2 ? '1.8k' : '956'}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: colors.text.variations[200] }}>
                {i === 1 ? 'Users' : i === 2 ? 'Sessions' : 'Revenue'}
              </div>
            </div>
          ))}

          {/* Chart Area */}
          <div
            className="col-span-1 sm:col-span-2 lg:col-span-3 h-32 sm:h-48 lg:h-64 p-3 sm:p-4 lg:p-6 rounded-xl"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <h3 className="text-xs sm:text-sm lg:text-base font-semibold" style={{ color: colors.text.base }}>Traffic Overview</h3>
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: colors.primary.base }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: colors.accent.base }}></div>
              </div>
            </div>
            <div className="h-20 sm:h-32 lg:h-40 flex items-end justify-between gap-1 sm:gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    backgroundColor: i % 3 === 0 ? colors.primary.base : colors.accent.variations[200]
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

const PortfolioTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 lg:p-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2" style={{ color: colors.text.base }}>
            John Designer
          </h1>
          <p className="text-xs sm:text-sm lg:text-base" style={{ color: colors.text.variations[200] }}>
            Creative Director & UI/UX Designer
          </p>
        </div>
        <div
          className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full text-white text-xs sm:text-sm font-medium whitespace-nowrap"
          style={{ backgroundColor: colors.primary.base }}
        >
          Contact Me
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col justify-end"
            style={{
              backgroundColor: i % 2 === 0 ? colors.primary.variations[200] : colors.accent.variations[200]
            }}
          >
            <div className="space-y-1 sm:space-y-2">
              <div
                className="h-2 sm:h-2.5 lg:h-3 w-14 sm:w-16 lg:w-20 rounded"
                style={{ backgroundColor: colors.background.base }}
              ></div>
              <div
                className="h-1.5 sm:h-2 w-10 sm:w-12 lg:w-16 rounded"
                style={{ backgroundColor: colors.background.variations[200] }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-2 sm:gap-3 lg:gap-4">
          {['Dribbble', 'Behance', 'Instagram'].map((social) => (
            <div
              key={social}
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
          ))}
        </div>
        <div style={{ color: colors.text.variations[200] }} className="text-xs sm:text-sm">
          © 2024 John Designer
        </div>
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

const LandingPageTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Navigation */}
      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <span className="text-sm sm:text-base font-bold" style={{ color: colors.text.base }}>Brand</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          {['Home', 'About', 'Services', 'Contact'].slice(0, 2).map((item) => (
            <span
              key={item}
              className="hidden sm:block text-xs lg:text-sm font-medium"
              style={{ color: colors.text.variations[200] }}
            >
              {item}
            </span>
          ))}
          <div
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium"
            style={{ backgroundColor: colors.accent.base }}
          >
            Get Started
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4" style={{ color: colors.text.base }}>
          Build Amazing Products
        </h1>
        <p className="text-xs sm:text-sm lg:text-lg mb-4 sm:mb-6 lg:mb-8 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto" style={{ color: colors.text.variations[200] }}>
          Create stunning user experiences with our powerful design system and tools
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4">
          <div
            className="w-full sm:w-auto px-6 py-2 sm:px-7 sm:py-2.5 lg:px-8 lg:py-3 rounded-lg text-white text-xs sm:text-sm font-medium"
            style={{ backgroundColor: colors.primary.base }}
          >
            Start Free Trial
          </div>
          <div
            className="w-full sm:w-auto px-6 py-2 sm:px-7 sm:py-2.5 lg:px-8 lg:py-3 rounded-lg border text-xs sm:text-sm font-medium"
            style={{
              borderColor: colors.primary.base,
              color: colors.primary.base
            }}
          >
            Learn More
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-3 sm:p-4 lg:p-6">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl mx-auto mb-2 sm:mb-3 lg:mb-4"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2" style={{ color: colors.text.base }}>
              Feature {i}
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: colors.text.variations[200] }}>
              Description of amazing feature that helps users
            </p>
          </div>
        ))}
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

// E-Commerce Template
const ECommerceTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative">
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div
        className="h-12 sm:h-14 lg:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b"
        style={{ borderColor: colors.background.variations[300] }}
      >
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-8">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg"
              style={{ backgroundColor: colors.primary.base }}
            ></div>
            <span className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: colors.text.base }}>Shop</span>
          </div>
          {['New', 'Sale'].map((item) => (
            <span
              key={item}
              className="hidden sm:block text-xs lg:text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: colors.text.variations[200] }}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: colors.accent.base }}></div>
        </div>
      </div>

      {/* Banner */}
      <div
        className="h-20 sm:h-24 lg:h-32 flex items-center justify-center"
        style={{ backgroundColor: colors.primary.variations[200] }}
      >
        <div className="text-center">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2" style={{ color: colors.primary.base }}>
            SUMMER SALE
          </h2>
          <p className="text-xs sm:text-sm lg:text-base" style={{ color: colors.text.base }}>Up to 50% OFF</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-3 sm:p-4 lg:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg sm:rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div
              className="h-20 sm:h-24 lg:h-32"
              style={{
                backgroundColor: i % 2 === 0 ? colors.accent.variations[200] : colors.primary.variations[200]
              }}
            ></div>
            <div className="p-2 sm:p-3">
              <div
                className="h-1.5 sm:h-2 w-3/4 rounded mb-1.5 sm:mb-2"
                style={{ backgroundColor: colors.text.base }}
              ></div>
              <div className="flex items-center justify-between">
                <div
                  className="h-2 sm:h-2.5 lg:h-3 w-8 sm:w-10 lg:w-12 rounded"
                  style={{ backgroundColor: colors.accent.base }}
                ></div>
                <div
                  className="h-1.5 sm:h-2 w-6 sm:w-8 rounded"
                  style={{ backgroundColor: colors.text.variations[200] }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

// Blog Template
const BlogTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative">
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b" style={{ borderColor: colors.background.variations[300] }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2" style={{ color: colors.text.base }}>
          The Blog
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-center" style={{ color: colors.text.variations[200] }}>
          Stories, ideas, and insights
        </p>
      </div>

      {/* Featured Post */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div
          className="h-32 sm:h-40 lg:h-48 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col justify-end"
          style={{ backgroundColor: colors.primary.variations[200] }}
        >
          <div
            className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium mb-2 sm:mb-3 w-fit"
            style={{ backgroundColor: colors.accent.base, color: 'white' }}
          >
            Featured
          </div>
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2" style={{ color: colors.primary.base }}>
            How to Build Better Products
          </h2>
          <p className="text-xs sm:text-sm lg:text-base" style={{ color: colors.text.base }}>
            A comprehensive guide to product development
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg sm:rounded-xl p-3 sm:p-4"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div
              className="h-16 sm:h-20 lg:h-24 rounded-lg mb-2 sm:mb-3"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>
            <div
              className="h-2 sm:h-2.5 lg:h-3 w-full rounded mb-1.5 sm:mb-2"
              style={{ backgroundColor: colors.text.base }}
            ></div>
            <div
              className="h-1.5 sm:h-2 w-3/4 rounded mb-2 sm:mb-3"
              style={{ backgroundColor: colors.text.variations[200] }}
            ></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                style={{ backgroundColor: colors.primary.base }}
              ></div>
              <div
                className="h-1.5 sm:h-2 w-16 sm:w-20 rounded"
                style={{ backgroundColor: colors.text.variations[200] }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

// SaaS Platform Template
const SaaSPlatformTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative">
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-14 sm:w-16 lg:w-20 flex flex-col items-center py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 border-r"
        style={{
          backgroundColor: colors.background.variations[300],
          borderColor: colors.background.variations[300]
        }}
      >
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl"
          style={{ backgroundColor: colors.primary.base }}
        ></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg"
            style={{
              backgroundColor: i === 2 ? colors.accent.variations[200] : 'transparent',
              border: `2px solid ${colors.text.variations[200]}`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1" style={{ backgroundColor: colors.background.base }}>
        {/* Top Bar */}
        <div
          className="h-12 sm:h-14 lg:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b"
          style={{ borderColor: colors.background.variations[300] }}
        >
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: colors.text.base }}>
              Workspace
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div
              className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg text-white text-xs sm:text-sm font-medium"
              style={{ backgroundColor: colors.primary.base }}
            >
              Upgrade
            </div>
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl"
                style={{ backgroundColor: colors.background.variations[200] }}
              >
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg mb-2 sm:mb-2.5 lg:mb-3"
                  style={{ backgroundColor: colors.primary.variations[200] }}
                ></div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: colors.text.base }}>
                  {i * 234}
                </div>
                <div className="text-[10px] sm:text-xs" style={{ color: colors.text.variations[200] }}>
                  Metric {i}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Timeline */}
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 lg:mb-4" style={{ color: colors.text.base }}>
              Recent Activity
            </h3>
            <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                    style={{ backgroundColor: colors.accent.base }}
                  ></div>
                  <div className="flex-1">
                    <div
                      className="h-1.5 sm:h-2 w-3/4 rounded mb-0.5 sm:mb-1"
                      style={{ backgroundColor: colors.text.base }}
                    ></div>
                    <div
                      className="h-1.5 sm:h-2 w-1/2 rounded"
                      style={{ backgroundColor: colors.text.variations[200] }}
                    ></div>
                  </div>
                  <div
                    className="h-1.5 sm:h-2 w-12 sm:w-14 lg:w-16 rounded"
                    style={{ backgroundColor: colors.text.variations[200] }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);

// Social Media Template
const SocialMediaTemplate: React.FC<any> = ({ colors, style, showGrid }) => (
  <div style={style} className="w-full max-w-full sm:max-w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative">
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div
        className="hidden sm:flex sm:flex-col w-16 sm:w-48 lg:w-64 p-2 sm:p-4 lg:p-6 border-r"
        style={{
          backgroundColor: colors.background.base,
          borderColor: colors.background.variations[300]
        }}
      >
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full mb-2 sm:mb-3"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <div
            className="hidden sm:block h-2 sm:h-2.5 lg:h-3 w-24 sm:w-28 lg:w-32 rounded mb-1.5 sm:mb-2"
            style={{ backgroundColor: colors.text.base }}
          ></div>
          <div
            className="hidden sm:block h-1.5 sm:h-2 w-16 sm:w-20 lg:w-24 rounded"
            style={{ backgroundColor: colors.text.variations[200] }}
          ></div>
        </div>

        <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
          {['Feed', 'Messages', 'Profile'].map((item, i) => (
            <div
              key={item}
              className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 lg:gap-3 p-1.5 sm:p-2 lg:p-3 rounded-lg"
              style={{
                backgroundColor: i === 0 ? colors.primary.variations[200] : 'transparent',
                color: i === 0 ? colors.primary.base : colors.text.variations[200]
              }}
            >
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded"
                style={{ backgroundColor: 'currentColor' }}
              ></div>
              <span className="hidden sm:block text-xs lg:text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div
        className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto"
        style={{ backgroundColor: colors.background.variations[200] }}
      >
        {/* Post Composer */}
        <div
          className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6"
          style={{ backgroundColor: colors.background.base }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-2.5 lg:mb-3">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
            <div
              className="flex-1 h-8 sm:h-9 lg:h-10 rounded-full px-3 sm:px-4 flex items-center"
              style={{ backgroundColor: colors.background.variations[200] }}
            >
              <span className="text-xs sm:text-sm" style={{ color: colors.text.variations[200] }}>
                What's on your mind?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {['Photo', 'Video'].map((action) => (
              <div
                key={action}
                className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 rounded-lg"
                style={{ backgroundColor: colors.background.variations[200] }}
              >
                <div
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded"
                  style={{ backgroundColor: colors.accent.base }}
                ></div>
                <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.text.variations[200] }}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4"
            style={{ backgroundColor: colors.background.base }}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-2.5 lg:mb-3">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: colors.primary.base }}
              ></div>
              <div>
                <div
                  className="h-2 sm:h-2.5 lg:h-3 w-16 sm:w-20 lg:w-24 rounded mb-1"
                  style={{ backgroundColor: colors.text.base }}
                ></div>
                <div
                  className="h-1.5 sm:h-2 w-12 sm:w-14 lg:w-16 rounded"
                  style={{ backgroundColor: colors.text.variations[200] }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-2.5 lg:mb-3">
              <div
                className="h-1.5 sm:h-2 w-full rounded"
                style={{ backgroundColor: colors.text.variations[200] }}
              ></div>
              <div
                className="h-1.5 sm:h-2 w-5/6 rounded"
                style={{ backgroundColor: colors.text.variations[200] }}
              ></div>
            </div>

            <div
              className="h-32 sm:h-40 lg:h-48 rounded-lg mb-2 sm:mb-2.5 lg:mb-3"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>

            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              {['Like', 'Comment', 'Share'].map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-1.5 sm:gap-2"
                  style={{ color: colors.text.variations[200] }}
                >
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded" style={{ backgroundColor: 'currentColor' }}></div>
                  <span className="text-xs sm:text-sm font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar - Suggestions */}
      <div
        className="hidden lg:block w-48 lg:w-64 p-4 lg:p-6 border-l"
        style={{
          backgroundColor: colors.background.base,
          borderColor: colors.background.variations[300]
        }}
      >
        <h3 className="text-sm lg:text-base font-semibold mb-3 lg:mb-4" style={{ color: colors.text.base }}>
          Suggestions
        </h3>
        <div className="space-y-3 lg:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 lg:gap-3">
              <div
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: colors.accent.variations[200] }}
              ></div>
              <div className="flex-1">
                <div
                  className="h-1.5 lg:h-2 w-16 lg:w-20 rounded mb-1"
                  style={{ backgroundColor: colors.text.base }}
                ></div>
                <div
                  className="h-1.5 lg:h-2 w-12 lg:w-16 rounded"
                  style={{ backgroundColor: colors.text.variations[200] }}
                ></div>
              </div>
              <div
                className="px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg text-[10px] lg:text-xs font-medium text-white"
                style={{ backgroundColor: colors.primary.base }}
              >
                Follow
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {showGrid && (
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    )}
  </div>
);