import { motion } from 'framer-motion';
import { Github, Heart } from 'lucide-react';
import { DESIGN_TOKENS } from '../constants/designTokens';

export const Footer = () => {
  return (
    <motion.footer 
      className="flex-shrink-0 border-t flex items-center justify-between"
      style={{
        backgroundColor: '#071019',
        color: DESIGN_TOKENS.colors.text.muted,
        borderTopColor: DESIGN_TOKENS.colors.border.subtle,
        padding: '20px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <p className="text-sm">Made with ❤️ by the Pigmenta team.</p>
      
      {/* Social Links */}
      <div className="flex items-center space-x-4">
        {/* GitHub Link */}
        <motion.a
          href="https://github.com/SwonDev"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: DESIGN_TOKENS.colors.text.secondary
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = DESIGN_TOKENS.colors.text.primary;
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = DESIGN_TOKENS.colors.text.secondary;
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          <Github className="w-5 h-5" />
        </motion.a>

        {/* Twitter/X Link */}
        <motion.a
          href="https://x.com/Swon_Project"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: DESIGN_TOKENS.colors.text.secondary
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = DESIGN_TOKENS.colors.text.primary;
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = DESIGN_TOKENS.colors.text.secondary;
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
           <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
         </svg>
        </motion.a>

        {/* Support Button */}
        <motion.a
          href="https://ko-fi.com/swonproject"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Support</span>
        </motion.a>
      </div>
    </motion.footer>
  );
};