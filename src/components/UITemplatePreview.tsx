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
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/10 rounded-xl">
            <Eye className="w-10 h-10" style={{ color: '#23AAD7' }} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">UI Preview</h2>
            <p className="text-xl text-white/70">See your palette in real UI templates</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6">
          {/* Template Selector - Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {TEMPLATE_OPTIONS.map((template) => {
              const Icon = template.icon;
              const isActive = currentTemplate === template.id;

              return (
                <motion.button
                  key={template.id}
                  onClick={() => setCurrentTemplate(template.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-3 py-3 rounded-xl font-medium transition-all duration-200 text-sm",
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
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center leading-tight">{template.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Zoom Controls & Grid Toggle */}
          <div className="flex items-center justify-center gap-6 bg-white/10 rounded-xl p-3 w-fit mx-auto">
            {/* Zoom Controls */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleZoomOut}
                className="p-3 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomOut className="w-6 h-6 text-white/70" />
              </motion.button>
              <span className="text-lg text-white/70 min-w-[5rem] text-center font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <motion.button
                onClick={handleZoomIn}
                className="p-3 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomIn className="w-6 h-6 text-white/70" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20"></div>

            {/* Grid Toggle */}
            <label className="flex items-center gap-3 text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={toggleGrid}
                className="w-5 h-5 rounded border-white/20 bg-white/10 focus:ring-2"
                style={{
                  accentColor: '#23AAD7',
                  '--tw-ring-color': 'rgba(35, 170, 215, 0.5)'
                } as React.CSSProperties}
              />
              <span className="text-base font-medium">Grid</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Template Preview */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-12 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ minHeight: '800px' }}
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
  <div style={style} className="w-80 h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden relative" data-template-container>
    {/* Status Bar */}
    <div 
      className="h-12 flex items-center justify-between px-6 text-sm font-medium"
      style={{ backgroundColor: colors.background.base, color: colors.text.base }}
    >
      <span>9:41</span>
      <span>100%</span>
    </div>
    
    {/* Header */}
    <div 
      className="h-16 flex items-center justify-between px-6"
      style={{ backgroundColor: colors.primary.base }}
    >
      <h1 className="text-xl font-bold text-white">My App</h1>
      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
    </div>
    
    {/* Content */}
    <div style={{ backgroundColor: colors.background.variations[200] }} className="flex-1 p-6 space-y-4">
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="p-4 rounded-2xl"
          style={{ backgroundColor: colors.background.base }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
            <div>
              <div className="h-3 w-20 rounded" style={{ backgroundColor: colors.text.base }}></div>
              <div className="h-2 w-16 rounded mt-1" style={{ backgroundColor: colors.text.variations[200] }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Bottom Navigation */}
    <div 
      className="h-20 flex items-center justify-around border-t"
      style={{ 
        backgroundColor: colors.background.base,
        borderColor: colors.background.variations[300]
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          className="w-6 h-6 rounded"
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    {/* Sidebar */}
    <div className="flex h-full">
      <div 
        className="w-64 p-6 space-y-4"
        style={{ backgroundColor: colors.background.variations[300] }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div 
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <span className="font-bold" style={{ color: colors.text.base }}>Dashboard</span>
        </div>
        
        {['Analytics', 'Users', 'Settings', 'Reports'].map((item, i) => (
          <div 
            key={item}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ 
              backgroundColor: i === 0 ? colors.primary.variations[200] : 'transparent',
              color: i === 0 ? colors.primary.base : colors.text.variations[200]
            }}
          >
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'currentColor' }}></div>
            <span className="text-sm font-medium">{item}</span>
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="flex-1" style={{ backgroundColor: colors.background.base }}>
        {/* Header */}
        <div 
          className="h-16 flex items-center justify-between px-6 border-b"
          style={{ borderColor: colors.background.variations[300] }}
        >
          <h1 className="text-2xl font-bold" style={{ color: colors.text.base }}>Analytics</h1>
          <div 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.accent.base }}
          >
            Export
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Stats Cards */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.background.variations[200] }}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: colors.primary.variations[200] }}
                ></div>
                <span className="text-xs" style={{ color: colors.text.variations[200] }}>+12%</span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: colors.text.base }}>
                {i === 1 ? '2.4k' : i === 2 ? '1.8k' : '956'}
              </div>
              <div className="text-sm" style={{ color: colors.text.variations[200] }}>
                {i === 1 ? 'Users' : i === 2 ? 'Sessions' : 'Revenue'}
              </div>
            </div>
          ))}
          
          {/* Chart Area */}
          <div 
            className="col-span-3 h-64 p-6 rounded-xl"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: colors.text.base }}>Traffic Overview</h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary.base }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent.base }}></div>
              </div>
            </div>
            <div className="h-40 flex items-end justify-between gap-2">
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.base }}>
            John Designer
          </h1>
          <p style={{ color: colors.text.variations[200] }}>
            Creative Director & UI/UX Designer
          </p>
        </div>
        <div 
          className="px-6 py-3 rounded-full text-white font-medium"
          style={{ backgroundColor: colors.primary.base }}
        >
          Contact Me
        </div>
      </div>
      
      {/* Portfolio Grid */}
      <div className="px-8 grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i}
            className="aspect-square rounded-2xl p-6 flex flex-col justify-end"
            style={{ 
              backgroundColor: i % 2 === 0 ? colors.primary.variations[200] : colors.accent.variations[200]
            }}
          >
            <div className="space-y-2">
              <div 
                className="h-3 w-20 rounded"
                style={{ backgroundColor: colors.background.base }}
              ></div>
              <div 
                className="h-2 w-16 rounded"
                style={{ backgroundColor: colors.background.variations[200] }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
        <div className="flex gap-4">
          {['Dribbble', 'Behance', 'Instagram'].map((social) => (
            <div 
              key={social}
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
          ))}
        </div>
        <div style={{ color: colors.text.variations[200] }} className="text-sm">
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative" data-template-container>
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Navigation */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <span className="font-bold" style={{ color: colors.text.base }}>Brand</span>
        </div>
        <div className="flex items-center gap-6">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <span
              key={item}
              className="text-sm font-medium"
              style={{ color: colors.text.variations[200] }}
            >
              {item}
            </span>
          ))}
          <div
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.accent.base }}
          >
            Get Started
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: colors.text.base }}>
          Build Amazing Products
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.text.variations[200] }}>
          Create stunning user experiences with our powerful design system and tools
        </p>
        <div className="flex items-center justify-center gap-4">
          <div
            className="px-8 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary.base }}
          >
            Start Free Trial
          </div>
          <div
            className="px-8 py-3 rounded-lg border font-medium"
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
      <div className="px-6 grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-6">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>
            <h3 className="font-semibold mb-2" style={{ color: colors.text.base }}>
              Feature {i}
            </h3>
            <p className="text-sm" style={{ color: colors.text.variations[200] }}>
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative">
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div
        className="h-16 flex items-center justify-between px-6 border-b"
        style={{ borderColor: colors.background.variations[300] }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: colors.primary.base }}
            ></div>
            <span className="font-bold text-lg" style={{ color: colors.text.base }}>Shop</span>
          </div>
          {['New', 'Men', 'Women', 'Kids', 'Sale'].map((item) => (
            <span
              key={item}
              className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: colors.text.variations[200] }}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: colors.text.variations[200] }}></div>
          <div className="w-6 h-6 rounded" style={{ backgroundColor: colors.accent.base }}></div>
        </div>
      </div>

      {/* Banner */}
      <div
        className="h-32 flex items-center justify-center"
        style={{ backgroundColor: colors.primary.variations[200] }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary.base }}>
            SUMMER SALE
          </h2>
          <p style={{ color: colors.text.base }}>Up to 50% OFF</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-6 grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div
              className="h-32"
              style={{
                backgroundColor: i % 2 === 0 ? colors.accent.variations[200] : colors.primary.variations[200]
              }}
            ></div>
            <div className="p-3">
              <div
                className="h-2 w-3/4 rounded mb-2"
                style={{ backgroundColor: colors.text.base }}
              ></div>
              <div className="flex items-center justify-between">
                <div
                  className="h-3 w-12 rounded"
                  style={{ backgroundColor: colors.accent.base }}
                ></div>
                <div
                  className="h-2 w-8 rounded"
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative">
    <div style={{ backgroundColor: colors.background.base }} className="h-full">
      {/* Header */}
      <div className="p-8 border-b" style={{ borderColor: colors.background.variations[300] }}>
        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: colors.text.base }}>
          The Blog
        </h1>
        <p className="text-center" style={{ color: colors.text.variations[200] }}>
          Stories, ideas, and insights
        </p>
      </div>

      {/* Featured Post */}
      <div className="px-8 py-6">
        <div
          className="h-48 rounded-2xl p-6 flex flex-col justify-end"
          style={{ backgroundColor: colors.primary.variations[200] }}
        >
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 w-fit"
            style={{ backgroundColor: colors.accent.base, color: 'white' }}
          >
            Featured
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary.base }}>
            How to Build Better Products
          </h2>
          <p style={{ color: colors.text.base }}>
            A comprehensive guide to product development
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="px-8 grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <div
              className="h-24 rounded-lg mb-3"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>
            <div
              className="h-3 w-full rounded mb-2"
              style={{ backgroundColor: colors.text.base }}
            ></div>
            <div
              className="h-2 w-3/4 rounded mb-3"
              style={{ backgroundColor: colors.text.variations[200] }}
            ></div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: colors.primary.base }}
              ></div>
              <div
                className="h-2 w-20 rounded"
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative">
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-20 flex flex-col items-center py-6 space-y-6 border-r"
        style={{
          backgroundColor: colors.background.variations[300],
          borderColor: colors.background.variations[300]
        }}
      >
        <div
          className="w-10 h-10 rounded-xl"
          style={{ backgroundColor: colors.primary.base }}
        ></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-lg"
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
          className="h-16 flex items-center justify-between px-6 border-b"
          style={{ borderColor: colors.background.variations[300] }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.text.base }}>
              Workspace
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors.primary.base }}
            >
              Upgrade
            </div>
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.background.variations[200] }}
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3"
                  style={{ backgroundColor: colors.primary.variations[200] }}
                ></div>
                <div className="text-2xl font-bold mb-1" style={{ color: colors.text.base }}>
                  {i * 234}
                </div>
                <div className="text-xs" style={{ color: colors.text.variations[200] }}>
                  Metric {i}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Timeline */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: colors.background.variations[200] }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.text.base }}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.accent.base }}
                  ></div>
                  <div className="flex-1">
                    <div
                      className="h-2 w-3/4 rounded mb-1"
                      style={{ backgroundColor: colors.text.base }}
                    ></div>
                    <div
                      className="h-2 w-1/2 rounded"
                      style={{ backgroundColor: colors.text.variations[200] }}
                    ></div>
                  </div>
                  <div
                    className="h-2 w-16 rounded"
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
  <div style={style} className="w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden relative">
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div
        className="w-64 p-6 border-r"
        style={{
          backgroundColor: colors.background.base,
          borderColor: colors.background.variations[300]
        }}
      >
        <div className="mb-8">
          <div
            className="w-12 h-12 rounded-full mb-3"
            style={{ backgroundColor: colors.primary.base }}
          ></div>
          <div
            className="h-3 w-32 rounded mb-2"
            style={{ backgroundColor: colors.text.base }}
          ></div>
          <div
            className="h-2 w-24 rounded"
            style={{ backgroundColor: colors.text.variations[200] }}
          ></div>
        </div>

        <div className="space-y-3">
          {['Feed', 'Messages', 'Notifications', 'Profile', 'Settings'].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: i === 0 ? colors.primary.variations[200] : 'transparent',
                color: i === 0 ? colors.primary.base : colors.text.variations[200]
              }}
            >
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: 'currentColor' }}
              ></div>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div
        className="flex-1 p-6 overflow-auto"
        style={{ backgroundColor: colors.background.variations[200] }}
      >
        {/* Post Composer */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: colors.background.base }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: colors.accent.base }}
            ></div>
            <div
              className="flex-1 h-10 rounded-full px-4 flex items-center"
              style={{ backgroundColor: colors.background.variations[200] }}
            >
              <span className="text-sm" style={{ color: colors.text.variations[200] }}>
                What's on your mind?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {['Photo', 'Video', 'Event'].map((action) => (
              <div
                key={action}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: colors.background.variations[200] }}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.accent.base }}
                ></div>
                <span className="text-xs font-medium" style={{ color: colors.text.variations[200] }}>
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
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.background.base }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: colors.primary.base }}
              ></div>
              <div>
                <div
                  className="h-3 w-24 rounded mb-1"
                  style={{ backgroundColor: colors.text.base }}
                ></div>
                <div
                  className="h-2 w-16 rounded"
                  style={{ backgroundColor: colors.text.variations[200] }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div
                className="h-2 w-full rounded"
                style={{ backgroundColor: colors.text.variations[200] }}
              ></div>
              <div
                className="h-2 w-5/6 rounded"
                style={{ backgroundColor: colors.text.variations[200] }}
              ></div>
            </div>

            <div
              className="h-48 rounded-lg mb-3"
              style={{ backgroundColor: colors.accent.variations[200] }}
            ></div>

            <div className="flex items-center gap-6">
              {['Like', 'Comment', 'Share'].map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-2"
                  style={{ color: colors.text.variations[200] }}
                >
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'currentColor' }}></div>
                  <span className="text-sm font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar - Suggestions */}
      <div
        className="w-64 p-6 border-l"
        style={{
          backgroundColor: colors.background.base,
          borderColor: colors.background.variations[300]
        }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.text.base }}>
          Suggestions
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: colors.accent.variations[200] }}
              ></div>
              <div className="flex-1">
                <div
                  className="h-2 w-20 rounded mb-1"
                  style={{ backgroundColor: colors.text.base }}
                ></div>
                <div
                  className="h-2 w-16 rounded"
                  style={{ backgroundColor: colors.text.variations[200] }}
                ></div>
              </div>
              <div
                className="px-3 py-1 rounded-lg text-xs font-medium text-white"
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