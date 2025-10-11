import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { useAIPaletteStore } from '../stores/useAIPaletteStore';
import { useStudioStore } from '../stores/useStudioStore';
import { cn } from "../lib/utils";

const PROMPT_SUGGESTIONS = [
  "Vibrant sunset over ocean waves",
  "Cyberpunk neon city at night",
  "Soft lavender fields in spring",
  "Dark forest with mysterious fog",
  "Warm autumn leaves falling",
  "Electric blue lightning storm",
  "Pastel rainbow cotton candy",
  "Deep space nebula colors",
  "Tropical beach paradise",
  "Vintage film photography tones",
  "Modern minimalist design",
  "Retro 80s synthwave aesthetic"
];

const STYLE_KEYWORDS = [
  { label: "Vibrant", value: "vibrant bright energetic" },
  { label: "Muted", value: "muted soft pastel gentle" },
  { label: "Dark", value: "dark mysterious deep shadow" },
  { label: "Light", value: "light airy clean minimal" },
  { label: "Warm", value: "warm cozy fire sunset" },
  { label: "Cool", value: "cool ice ocean winter" },
  { label: "Nature", value: "nature organic earth forest" },
  { label: "Tech", value: "tech digital cyber modern" }
];

export const AIPromptGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const { generatePalette, isGenerating, error, clearError, lastGenerated } = useAIPaletteStore();
  const { setActiveView, addToHistory } = useStudioStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    clearError();
    await generatePalette({ prompt: prompt.trim() });
    
    if (lastGenerated) {
      addToHistory(lastGenerated.id);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setSelectedSuggestion(suggestion);
  };

  const handleStyleKeywordClick = (keyword: string) => {
    const currentPrompt = prompt.trim();
    const newPrompt = currentPrompt ? `${currentPrompt} ${keyword}` : keyword;
    setPrompt(newPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const goToEditor = () => {
    setActiveView('editor');
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Sparkles className="w-10 h-10" style={{ color: '#23AAD7' }} />
          <h2 className="text-4xl font-bold text-white">AI Palette Generator</h2>
        </div>
        <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
          Describe your vision and let AI create the perfect semantic color palette for your project
        </p>
      </motion.div>

      {/* Main Generator Card */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Prompt Input */}
        <div className="space-y-8">
          <div>
            <label className="block text-2xl font-semibold text-white mb-4">
              Describe your ideal color palette
            </label>
            <p className="text-white/60 mb-6 text-lg">
              Be specific about mood, style, and inspiration. The more detail you provide, the better the result.
            </p>
          </div>
          
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'Vibrant sunset over ocean waves with warm orange and cool blue tones, inspired by tropical beaches and summer evenings'"
              className={cn(
                "w-full h-40 px-8 py-6 bg-white/10 border border-white/20 rounded-2xl",
                "text-white placeholder-white/40 resize-none text-lg",
                "focus:outline-none focus:ring-2 focus:border-white/30",
                "transition-all duration-200"
              )}
              disabled={isGenerating}
            />
            
            {/* Character count */}
            <div className="absolute bottom-4 right-4 text-base text-white/50">
              {prompt.length}/300
            </div>
          </div>

          {/* Style Keywords */}
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-semibold text-white mb-3">
                Quick style keywords
              </label>
              <p className="text-white/60 text-base">
                Click to add style keywords to your prompt
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STYLE_KEYWORDS.map((keyword) => (
                <motion.button
                  key={keyword.label}
                  onClick={() => handleStyleKeywordClick(keyword.value)}
                  className="px-6 py-4 text-base font-medium bg-white/10 hover:bg-white/20 text-white/80 rounded-xl border border-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating}
                >
                  {keyword.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-4 px-10 py-6 rounded-2xl font-semibold text-xl transition-all duration-200",
              "focus:outline-none focus:ring-2",
              prompt.trim() && !isGenerating
                ? "text-white shadow-lg"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
            style={prompt.trim() && !isGenerating ? {
              background: 'linear-gradient(135deg, #23AAD7, #20A0CB)',
              boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
            } : {
              boxShadow: '0 0 0 2px transparent'
            }}
            onMouseEnter={(e) => {
              if (prompt.trim() && !isGenerating) {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #20A0CB, #1985a9)';
              }
            }}
            onMouseLeave={(e) => {
              if (prompt.trim() && !isGenerating) {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #23AAD7, #20A0CB)';
              }
            }}
             whileHover={prompt.trim() && !isGenerating ? { scale: 1.02 } : {}}
            whileTap={prompt.trim() && !isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                Generating your palette...
              </>
            ) : (
              <>
                <Send className="w-7 h-7" />
                Generate Palette
              </>
            )}
          </motion.button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-8 p-6 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="font-medium mb-2 text-lg">Generation Error</div>
              <div className="text-base">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Generated Palette Preview */}
      <AnimatePresence>
        {lastGenerated && (
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-3">{lastGenerated.name}</h3>
                <p className="text-lg text-white/70">{lastGenerated.description}</p>
              </div>
              <motion.button
                onClick={goToEditor}
                className="px-8 py-4 text-white rounded-xl font-semibold transition-colors ml-8 text-lg"
                style={{ backgroundColor: '#23AAD7' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#20A0CB'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#23AAD7'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Palette
              </motion.button>
            </div>

            {/* Color Groups Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(lastGenerated.colors).map(([key, colorGroup]: [string, any]) => (
                <motion.div
                  key={key}
                  className="space-y-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-lg font-semibold text-white capitalize">
                    {colorGroup.name}
                  </div>
                  <div className="space-y-3">
                    <div
                      className="h-20 rounded-xl border border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: colorGroup.base }}
                    >
                      <span className="text-sm font-mono text-white/90 bg-black/40 px-3 py-1.5 rounded-lg">
                        {colorGroup.base}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="h-10 rounded-lg border border-white/20"
                        style={{ backgroundColor: colorGroup.variations[200] }}
                      />
                      <div
                        className="h-10 rounded-lg border border-white/20"
                        style={{ backgroundColor: colorGroup.variations[300] }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Suggestions */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Lightbulb className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">Inspiration</h3>
        </div>
        <p className="text-white/60 mb-8 text-lg">
          Need ideas? Try one of these popular prompts to get started
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "p-6 text-left text-lg rounded-xl border transition-all duration-200",
                "focus:outline-none focus:ring-2",
                selectedSuggestion === suggestion
                  ? "text-white"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              )}
              style={selectedSuggestion === suggestion ? {
                backgroundColor: 'rgba(35, 170, 215, 0.2)',
                borderColor: 'rgba(35, 170, 215, 0.3)',
                boxShadow: '0 0 0 2px rgba(35, 170, 215, 0.5)'
              } : {
                boxShadow: '0 0 0 2px transparent'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGenerating}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};