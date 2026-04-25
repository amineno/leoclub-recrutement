import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="floating-blob w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
      <div className="floating-blob w-[400px] h-[400px] bg-secondary/20 -bottom-48 -right-48" style={{ animationDelay: '-10s' }} />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card max-w-2xl w-full text-center space-y-8 md:space-y-10 relative z-10 p-6 sm:p-8 md:p-16"
      >
        {/* Animated Check Icon */}
        <div className="relative mx-auto w-32 h-32">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-32 h-32 bg-accent rounded-[3rem] flex items-center justify-center text-white shadow-2xl shadow-accent/40 relative z-10"
          >
            <CheckCircle size={72} strokeWidth={2.5} />
          </motion.div>
          {/* Decorative circles */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-accent rounded-[3rem] -z-10"
          />
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            Candidature <span className="gradient-text">Envoyée !</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed"
          >
            Merci de votre intérêt pour le <span className="text-primary font-bold">Lions Club</span>. Votre profil est entre de bonnes mains.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full py-3 sm:py-4 justify-center text-sm sm:text-base"
          >
            <Home size={18} className="sm:w-5 sm:h-5" />
            Retour à l'accueil
          </button>
          <button 
            className="w-full py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Recrutement Lions Club 2026',
                  url: window.location.origin
                });
              }
            }}
          >
            <Share2 size={20} />
            Partager le site
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Suivez-nous sur</p>
          <div className="flex gap-6">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="font-black">FB</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="font-black">IG</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="font-black">LI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
