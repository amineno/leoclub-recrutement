import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Users, Target, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState('fr');
  const t = translations[lang];

  const features = [
    {
      icon: <Heart className="text-red-500" />,
      title: t.serviceTitle,
      description: t.serviceDesc
    },
    {
      icon: <Users className="text-blue-500" />,
      title: t.networkTitle,
      description: t.networkDesc
    },
    {
      icon: <Target className="text-primary" />,
      title: t.devTitle,
      description: t.devDesc
    }
  ];

  const axes = [
    "Malnutrition", "Environnement", "Diabète", "Vue", "Cancer Infantile"
  ];

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative", lang === 'ar' && "font-arabic")}>
      {/* Background Blobs */}
      <div className="floating-blob w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
      <div className="floating-blob w-[400px] h-[400px] bg-secondary/20 -bottom-48 -right-48" style={{ animationDelay: '-10s' }} />

      {/* Navbar */}
      <nav className={cn("relative z-20 flex justify-between items-center p-6 md:px-12", lang === 'ar' && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-4", lang === 'ar' && "flex-row-reverse")}>
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-primary/20 border-2 border-white/50 dark:border-slate-800">
            <img src="/lionsClub-removebg-preview.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className={lang === 'ar' ? "text-right" : ""}>
            <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white">Lions Club</h1>
            <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-80">Recrutement 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setLang('fr')}
              className={cn("px-3 py-1 text-xs font-bold rounded-lg transition-all", lang === 'fr' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              FR
            </button>
            <button 
              onClick={() => setLang('ar')}
              className={cn("px-3 py-1 text-xs font-bold rounded-lg transition-all", lang === 'ar' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              AR
            </button>
          </div>
          <ThemeToggle />
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            Admin
          </button>
        </div>
      </nav>

      {/* Hero Section */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={cn("space-y-10", lang === 'ar' && "text-right")}
            >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest border border-primary/20"
            >
              <Sparkles size={14} />
              Ouverture des recrutements 2026
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] dark:text-white">
                {t.heroTitle.split('Lion').map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i === 0 && <span className="gradient-text">Lion</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl ml-auto mr-0">
                {t.heroSubtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn("flex flex-col sm:flex-row gap-4", lang === 'ar' && "justify-end")}
            >
              <button 
                onClick={() => navigate('/apply')}
                className="btn-primary px-10 py-5 text-lg flex items-center justify-center gap-3 group"
              >
                {t.applyNow}
                <ArrowRight className={cn("transition-transform", lang === 'ar' ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
              </button>
              <a 
                href="#discover"
                className="px-10 py-5 text-lg font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
              >
                {t.discoverClub}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={cn("flex items-center gap-6 pt-8", lang === 'ar' && "flex-row-reverse")}
            >
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="member" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                {t.membersCount}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", damping: 15 }}
            className="relative"
          >
            <div className="relative z-10 p-8 rounded-[3rem]">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/5/52/Lions_Clubs_International_logo.svg" 
                alt="Lions Club Logo 4K" 
                className="w-full h-auto max-h-[550px] object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] transform hover:scale-105 transition-transform duration-700 image-render-auto"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1)) contrast(1.05)' }}
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Features Grid */}
        <section id="discover" className="pt-32 space-y-20">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-5xl font-black dark:text-white">{t.whyJoin}</h3>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Le Lions Club est bien plus qu'un club de service, c'est une famille dédiée au bien commun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn("glass-card p-10 space-y-6 hover:translate-y-[-8px] transition-all", lang === 'ar' && "text-right")}
              >
                <div className={cn("w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-2xl", lang === 'ar' && "ml-auto mr-0")}>
                  {f.icon}
                </div>
                <h4 className="text-xl font-black dark:text-white">{f.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Axes Section */}
        <section className="pt-32">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className={cn("relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12", lang === 'ar' && "lg:flex-row-reverse")}>
              <div className={cn("space-y-6 text-center lg:text-left", lang === 'ar' && "lg:text-right")}>
                <h3 className="text-3xl md:text-5xl font-black dark:text-white leading-tight">
                  {t.axesTitle.split(' ').map((word, i) => (
                    <React.Fragment key={i}>
                      {word} {i === 2 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg">
                  {t.axesSubtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {axes.map((a, i) => (
                  <div key={i} className={cn("flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800", lang === 'ar' && "flex-row-reverse")}>
                    <CheckCircle2 className="text-primary shrink-0" size={18} />
                    <span className="font-bold text-sm dark:text-white">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-32 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h3 className="text-4xl md:text-6xl font-black dark:text-white">
              {t.ready}
            </h3>
            <button 
              onClick={() => navigate('/apply')}
              className="btn-primary px-16 py-6 text-xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
            >
              {t.apply2026}
            </button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
              <img src="/lionsClub-removebg-preview.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <p className="font-black text-sm uppercase dark:text-white">Lions Club Recruitment 2026</p>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            © 2026 Lions Club International. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
