import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('fr');
  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await loginAdmin({ email, password });
      login(data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="floating-blob w-64 h-64 md:w-96 md:h-96 bg-primary -top-20 -left-20" />
      <div className="floating-blob w-64 h-64 md:w-80 md:h-80 bg-secondary -bottom-20 -right-20" style={{ animationDelay: '-5s' }} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card max-w-md w-full space-y-8 md:space-y-10 relative z-10 p-6 md:p-10"
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-primary transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform sm:w-4 sm:h-4" />
            {t.returnHome}
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setLang('fr')}
              className={cn("px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all", lang === 'fr' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={cn("px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all", lang === 'en' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              EN
            </button>
          </div>
        </div>

        <div className="text-center space-y-3 md:space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border-2 border-slate-50 overflow-hidden"
          >
            <img src="/lionsClub-removebg-preview.png" alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase">{t.admin}</h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">{t.adminPortal}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{t.identifier}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="input-field p-4 md:p-5 text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{t.password}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="input-field p-4 md:p-5 text-sm md:text-base"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-center border border-red-100 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full p-4 md:p-5 text-base md:text-lg"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} className="md:w-5 md:h-5" />}
            Se connecter
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
