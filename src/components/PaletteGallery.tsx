import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Search,
  Filter,
  Heart,
  Eye,
  Clock,
  Star,
  Copy,
  Download,
  Play,
  Grid3x3,
  List,
  SortAsc,
  TrendingUp
} from 'lucide-react';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { PaletteCategory, PaletteGalleryItem, SemanticPalette } from '../types';
import { cn } from "../lib/utils";

type ViewMode = 'grid' | 'list';
type SortMode = 'newest' | 'oldest' | 'mostLiked' | 'mostViewed' | 'name';

const CATEGORIES: { id: PaletteCategory; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'new', label: 'New', icon: Star },
  { id: 'top', label: 'Top Rated', icon: Heart },
  { id: 'views', label: 'Most Viewed', icon: Eye },
  { id: 'history', label: 'Recent', icon: Clock }
];

export const PaletteGallery: React.FC = () => {
  const { 
    savedPalettes, 
    favorites, 
    views, 
    searchPalettes, 
    setCurrentPalette,
    toggleFavorite,
    incrementViews,
    loadPredefinedPalette
  } = useAIPaletteStore();

  const [activeCategory, setActiveCategory] = useState<PaletteCategory>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // Predefined palettes
  const predefinedPalettes: PaletteGalleryItem[] = [
    {
      id: 'electric-city-nights',
      name: 'Electric City Nights',
      description: 'Vibrant neon colors inspired by cyberpunk aesthetics',
      colors: {
        background: { base: '#0a0a0f', variations: { 200: '#1a1a2e', 300: '#16213e' } },
        primary: { base: '#00d4ff', variations: { 200: '#33ddff', 300: '#66e6ff' } },
        accent: { base: '#ff0080', variations: { 200: '#ff3399', 300: '#ff66b3' } },
        text: { base: '#ffffff', variations: { 200: '#e0e0e0', 300: '#c0c0c0' } }
      },
      tags: ['cyberpunk', 'neon', 'dark', 'futuristic'],
      category: 'new',
      views: 1247,
      likes: 89,
      createdAt: new Date('2024-01-15'),
      author: 'AI Generator'
    },
    {
      id: 'lavender-dreams',
      name: 'Lavender Dreams',
      description: 'Soft purple tones for calming and elegant designs',
      colors: {
        background: { base: '#faf9fc', variations: { 200: '#f5f3f8', 300: '#ede9f3' } },
        primary: { base: '#8b5cf6', variations: { 200: '#a78bfa', 300: '#c4b5fd' } },
        accent: { base: '#ec4899', variations: { 200: '#f472b6', 300: '#f9a8d4' } },
        text: { base: '#1f2937', variations: { 200: '#4b5563', 300: '#6b7280' } }
      },
      tags: ['purple', 'elegant', 'soft', 'feminine'],
      category: 'top',
      views: 2156,
      likes: 156,
      createdAt: new Date('2024-01-10'),
      author: 'AI Generator'
    },
    {
      id: 'ocean-depths',
      name: 'Ocean Depths',
      description: 'Deep blues and teals reminiscent of underwater worlds',
      colors: {
        background: { base: '#0f172a', variations: { 200: '#1e293b', 300: '#334155' } },
        primary: { base: '#0ea5e9', variations: { 200: '#38bdf8', 300: '#7dd3fc' } },
        accent: { base: '#06b6d4', variations: { 200: '#22d3ee', 300: '#67e8f9' } },
        text: { base: '#f8fafc', variations: { 200: '#e2e8f0', 300: '#cbd5e1' } }
      },
      tags: ['blue', 'ocean', 'deep', 'professional'],
      category: 'views',
      views: 3421,
      likes: 203,
      createdAt: new Date('2024-01-08'),
      author: 'AI Generator'
    },
    {
      id: 'sunset-warmth',
      name: 'Sunset Warmth',
      description: 'Warm oranges and reds capturing golden hour magic',
      colors: {
        background: { base: '#fef7ed', variations: { 200: '#fed7aa', 300: '#fdba74' } },
        primary: { base: '#ea580c', variations: { 200: '#fb923c', 300: '#fdba74' } },
        accent: { base: '#dc2626', variations: { 200: '#ef4444', 300: '#f87171' } },
        text: { base: '#1c1917', variations: { 200: '#44403c', 300: '#78716c' } }
      },
      tags: ['orange', 'warm', 'sunset', 'energetic'],
      category: 'new',
      views: 987,
      likes: 67,
      createdAt: new Date('2024-01-12'),
      author: 'AI Generator'
    },
    {
      id: 'forest-serenity',
      name: 'Forest Serenity',
      description: 'Natural greens for eco-friendly and organic designs',
      colors: {
        background: { base: '#f0fdf4', variations: { 200: '#dcfce7', 300: '#bbf7d0' } },
        primary: { base: '#16a34a', variations: { 200: '#22c55e', 300: '#4ade80' } },
        accent: { base: '#059669', variations: { 200: '#10b981', 300: '#34d399' } },
        text: { base: '#14532d', variations: { 200: '#166534', 300: '#15803d' } }
      },
      tags: ['green', 'nature', 'organic', 'fresh'],
      category: 'top',
      views: 1876,
      likes: 134,
      createdAt: new Date('2024-01-05'),
      author: 'AI Generator'
    },
    {
      id: 'midnight-elegance',
      name: 'Midnight Elegance',
      description: 'Sophisticated dark theme with gold accents',
      colors: {
        background: { base: '#111827', variations: { 200: '#1f2937', 300: '#374151' } },
        primary: { base: '#fbbf24', variations: { 200: '#fcd34d', 300: '#fde68a' } },
        accent: { base: '#8b5cf6', variations: { 200: '#a78bfa', 300: '#c4b5fd' } },
        text: { base: '#f9fafb', variations: { 200: '#f3f4f6', 300: '#e5e7eb' } }
      },
      tags: ['dark', 'elegant', 'gold', 'luxury'],
      category: 'history',
      views: 2543,
      likes: 189,
      createdAt: new Date('2024-01-03'),
      author: 'AI Generator'
    }
  ];

  // Combine predefined and saved palettes
  const allPalettes = useMemo(() => {
    const combined = [
      ...predefinedPalettes.map(palette => ({
        id: palette.id,
        uniqueKey: `preset-${palette.id}`, // Unique key for predefined palettes
        name: palette.name,
        description: palette.description || '',
        colors: palette.colors,
        tags: palette.tags || [],
        category: 'new' as PaletteCategory,
        views: views[palette.id] || 0,
        likes: favorites.includes(palette.id) ? 1 : 0,
        createdAt: palette.createdAt || new Date(),
        author: 'Pigmenta',
        isPreset: true
      })),
      ...savedPalettes.map(palette => ({
        id: palette.id,
        uniqueKey: `saved-${palette.id}`, // Unique key for saved palettes
        name: palette.name,
        description: palette.description || '',
        colors: palette.colors,
        tags: palette.metadata.tags || [],
        category: 'history' as PaletteCategory,
        views: views[palette.id] || 0,
        likes: favorites.includes(palette.id) ? 1 : 0,
        createdAt: palette.metadata.createdAt || new Date(),
        author: 'You',
        isPreset: false
      }))
    ];

    // Filter by search query
    let filtered = searchQuery 
      ? combined.filter(palette => 
          palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (palette.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (palette.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : combined;

    // Filter by category
    switch (activeCategory) {
      case 'new':
        filtered = filtered.sort((a, b) => {
          const getTimestamp = (date: Date | string): number => {
            if (!date) return 0;
            if (date instanceof Date) return date.getTime();
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };
          
          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          return dateB - dateA;
        });
        break;
      case 'top':
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case 'history':
        filtered = savedPalettes.map(palette => ({
          id: palette.id,
          uniqueKey: `history-${palette.id}`, // Unique key for history palettes
          name: palette.name,
          description: palette.description || '',
          colors: palette.colors,
          tags: palette.metadata.tags || [],
          views: views[palette.id] || 0,
          likes: favorites.includes(palette.id) ? 1 : 0,
          createdAt: palette.metadata.createdAt || new Date(),
          author: 'You',
          category: 'history' as PaletteCategory,
          isPreset: false
        })).sort((a, b) => {
          const getTimestamp = (date: Date | string): number => {
            if (!date) return 0;
            if (date instanceof Date) return date.getTime();
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };
          
          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          return dateB - dateA;
        });
        break;
    }

    // Apply additional sorting
    switch (sortMode) {
      case 'newest':
        filtered = filtered.sort((a, b) => {
          const getTimestamp = (date: Date | string): number => {
            if (!date) return 0;
            if (date instanceof Date) return date.getTime();
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };

          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => {
          const getTimestamp = (date: Date | string): number => {
            if (!date) return 0;
            if (date instanceof Date) return date.getTime();
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };

          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          return dateA - dateB;
        });
        break;
      case 'mostLiked':
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'mostViewed':
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case 'name':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [predefinedPalettes, savedPalettes, searchQuery, activeCategory, views, favorites, sortMode]);

  const handlePaletteSelect = (palette: PaletteGalleryItem) => {
    // Convert PaletteGalleryItem to SemanticPalette
    const semanticPalette: SemanticPalette = {
      id: palette.id,
      name: palette.name,
      description: palette.description || '',
      prompt: '', // Default value
      colors: palette.colors,
      metadata: {
        createdAt: palette.createdAt,
        harmony: 'complementary',
        accessibility: { wcagAA: true, contrastRatios: {} },
        isAIGenerated: false,
        tags: palette.tags || []
      }
    };
    
    setCurrentPalette(semanticPalette);
    incrementViews(palette.id);
    
    // Load predefined palette if it's one of them
    const predefinedPalette = predefinedPalettes.find(p => p.id === palette.id);
    if (predefinedPalette) {
      loadPredefinedPalette(semanticPalette);
    }
  };

  const handleToggleFavorite = (paletteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(paletteId);
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
            <Palette className="w-10 h-10" style={{ color: '#23AAD7' }} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">Palette Gallery</h2>
            <p className="text-xl text-white/70">
              {allPalettes.length} {allPalettes.length === 1 ? 'palette' : 'palettes'} available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-3 rounded-lg transition-all duration-200",
                viewMode === 'grid'
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              style={viewMode === 'grid' ? {
                backgroundColor: 'rgba(35, 170, 215, 0.2)',
              } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Grid View"
            >
              <Grid3x3 className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-3 rounded-lg transition-all duration-200",
                viewMode === 'list'
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              style={viewMode === 'list' ? {
                backgroundColor: 'rgba(35, 170, 215, 0.2)',
              } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="List View"
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors text-base text-white font-medium appearance-none cursor-pointer pr-12"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.25rem',
                colorScheme: 'dark'
              }}
            >
              <option value="newest" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Newest First</option>
              <option value="oldest" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Oldest First</option>
              <option value="mostLiked" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Most Liked</option>
              <option value="mostViewed" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Most Viewed</option>
              <option value="name" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Name (A-Z)</option>
            </select>
          </div>

          {/* Filters Button */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-4 px-8 py-4 rounded-xl transition-colors text-lg border",
              showFilters
                ? "text-white"
                : "text-white/70 hover:text-white"
            )}
            style={showFilters ? {
              backgroundColor: 'rgba(35, 170, 215, 0.2)',
              borderColor: 'rgba(35, 170, 215, 0.3)',
            } : {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-6 h-6" />
            <span className="font-medium">Filters</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Categories */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-7 h-7 text-white/40" />
          <input
            type="text"
            placeholder="Search palettes, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white/10 border border-white/20 rounded-xl text-white text-xl placeholder-white/40 focus:outline-none focus:ring-2 focus:border-white/30"
            style={{
              '--tw-ring-color': 'rgba(35, 170, 215, 0.5)',
              '--tw-border-opacity': '0.3'
            } as React.CSSProperties}
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 -mb-2">
          <div className="flex items-center gap-4 py-2 px-1">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-4 px-8 py-4 rounded-xl font-medium transition-all duration-200 whitespace-nowrap text-lg",
                    "focus:outline-none",
                    isActive
                      ? "text-white border"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  style={isActive ? {
                    backgroundColor: 'rgba(35, 170, 215, 0.2)',
                    borderColor: 'rgba(35, 170, 215, 0.5)',
                    boxShadow: '0 0 0 3px rgba(35, 170, 215, 0.3)'
                  } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-6 h-6" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-lg font-medium text-white/70 mb-3">Color Theme</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base cursor-pointer hover:bg-white/15 transition-colors"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Themes</option>
                    <option value="dark" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Dark</option>
                    <option value="light" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Light</option>
                    <option value="colorful" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Colorful</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-white/70 mb-3">Style</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base cursor-pointer hover:bg-white/15 transition-colors"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Styles</option>
                    <option value="modern" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Modern</option>
                    <option value="vintage" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Vintage</option>
                    <option value="minimalist" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Minimalist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-white/70 mb-3">Mood</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base cursor-pointer hover:bg-white/15 transition-colors"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Moods</option>
                    <option value="energetic" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Energetic</option>
                    <option value="calm" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Calm</option>
                    <option value="professional" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-white/70 mb-3">Author</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base cursor-pointer hover:bg-white/15 transition-colors"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Authors</option>
                    <option value="ai" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>AI Generated</option>
                    <option value="user" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Your Palettes</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Palette Grid/List */}
      <motion.div
        className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
            : "flex flex-col gap-6"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {allPalettes.map((palette, index) => (
            viewMode === 'grid' ? (
              // GRID VIEW
              <motion.div
                key={palette.uniqueKey || palette.id}
                className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(35, 170, 215, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handlePaletteSelect(palette)}
              >
                {/* Color Preview */}
                <div className="h-48 flex">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: palette.colors.background.base }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: palette.colors.primary.base }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: palette.colors.accent.base }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: palette.colors.text.base }}
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white transition-colors group-hover:text-white"
                          onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#23AAD7'}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'white'}>
                        {palette.name}
                      </h3>
                      <p className="text-lg text-white/70 mt-3 line-clamp-2">
                        {palette.description}
                      </p>
                    </div>

                    <motion.button
                      onClick={(e) => handleToggleFavorite(palette.id, e)}
                      className={cn(
                        "p-3 rounded-full transition-colors",
                        favorites.includes(palette.id)
                          ? "text-red-400 hover:text-red-300"
                          : "text-white/40 hover:text-red-400"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        className="w-6 h-6"
                        fill={favorites.includes(palette.id) ? 'currentColor' : 'none'}
                      />
                    </motion.button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {palette.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-2 bg-white/10 rounded-full text-sm text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                    {palette.tags.length > 3 && (
                      <span className="px-3 py-2 bg-white/10 rounded-full text-sm text-white/70">
                        +{palette.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{palette.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>{palette.likes}</span>
                      </div>
                    </div>
                    <span>by {palette.author}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: 'rgba(35, 170, 215, 0.2)',
                        color: '#23AAD7'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(35, 170, 215, 0.3)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(35, 170, 215, 0.2)'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaletteSelect(palette);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Use
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/70 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/70 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // LIST VIEW
              <motion.div
                key={palette.uniqueKey || palette.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(35, 170, 215, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileHover={{ x: 5 }}
                onClick={() => handlePaletteSelect(palette)}
              >
                <div className="flex items-center gap-6 p-6">
                  {/* Color Preview - Compact */}
                  <div className="flex h-20 w-32 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.background.base }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.primary.base }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.accent.base }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.text.base }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-white truncate"
                            onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#23AAD7'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'white'}>
                          {palette.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-1 line-clamp-1">
                          {palette.description}
                        </p>
                      </div>

                      <motion.button
                        onClick={(e) => handleToggleFavorite(palette.id, e)}
                        className={cn(
                          "p-2 rounded-full transition-colors flex-shrink-0",
                          favorites.includes(palette.id)
                            ? "text-red-400 hover:text-red-300"
                            : "text-white/40 hover:text-red-400"
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart
                          className="w-5 h-5"
                          fill={favorites.includes(palette.id) ? 'currentColor' : 'none'}
                        />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      {/* Tags - Limited */}
                      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                        {palette.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                        {palette.tags.length > 2 && (
                          <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70">
                            +{palette.tags.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-white/50 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{palette.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{palette.likes}</span>
                        </div>
                        <span className="hidden sm:inline">by {palette.author}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <motion.button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          style={{
                            backgroundColor: 'rgba(35, 170, 215, 0.2)',
                            color: '#23AAD7'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(35, 170, 215, 0.3)'}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(35, 170, 215, 0.2)'}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaletteSelect(palette);
                          }}
                        >
                          <Play className="w-3.5 h-3.5" />
                          Use
                        </motion.button>

                        <motion.button
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => e.stopPropagation()}
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </motion.button>

                        <motion.button
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => e.stopPropagation()}
                          title="Export"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {allPalettes.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Palette className="w-20 h-20 text-white/20 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white/60 mb-3">No palettes found</h3>
          <p className="text-lg text-white/40">
            {searchQuery 
              ? "Try adjusting your search terms or filters"
              : "Start by generating your first AI palette"
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}