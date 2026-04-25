import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Briefcase, Users, Lightbulb, Target, BrainCircuit, ShieldAlert, HeartHandshake, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  { 
    id: 'motivation', 
    title: 'Questions générales', 
    icon: HeartHandshake, 
    questions: [
      "1. Pourquoi voulez-vous intégrer notre club ?",
      "2. Qu'est-ce qui vous inspire à consacrer votre temps et vos efforts de manière bénévole plutôt que de vous engager dans d'autres activités ?",
      "3. Comment pensez-vous que vos compétences et vos valeurs personnelles correspondent aux valeurs et à la mission de notre club ?"
    ],
    minWords: 30 
  },
  { 
    id: 'experience', 
    title: 'Expérience', 
    icon: Briefcase, 
    questions: [
      "4. Avez-vous intégré un club ? Si oui : parlez-nous de votre expérience. Si non : pourquoi avez-vous choisi notre club comme première expérience ?"
    ],
    minWords: 30 
  },
  { 
    id: 'personalityTeamwork', 
    title: 'Travail en équipe & personnalité', 
    icon: Users, 
    questions: [
      "5. Lorsque vous rencontrez des difficultés ou des obstacles, êtes-vous à l'aise de demander de l'aide ou des conseils aux autres membres ou au bureau exécutif ?",
      "6. Quels sont les accomplissements dont vous êtes le(la) plus fier(e) dans votre vie personnelle ou professionnelle ?",
      "7. Avez-vous déjà été confronté(e) à un échec ? Comment avez-vous géré cette expérience et qu'avez-vous appris ?"
    ],
    minWords: 40 
  },
  { 
    id: 'projectIdeation', 
    title: 'Projet / Idée', 
    icon: Lightbulb, 
    questions: [
      "8. Choisir un axe (Malnutrition, Vue, Diabète, Environnement ou Cancer Infantile) et développer une idée d'action ou événement en précisant : Emplacement, Nom de l'action, Date, Sponsors, Matériel, Budget estimé."
    ],
    minWords: 50 
  },
  { 
    id: 'expectationsSkills', 
    title: 'Attentes & compétences', 
    icon: Target, 
    questions: [
      "9. Quelles sont vos attentes concernant votre intégration au sein du club ?",
      "10. Quelles sont les compétences essentielles pour réussir en RIL selon vous ?",
      "11. Comment gérez-vous les différences d'opinions ou les conflits dans une équipe ?"
    ],
    minWords: 30 
  },
  { 
    id: 'behavioralThinking', 
    title: 'Questions comportementales', 
    icon: BrainCircuit, 
    questions: [
      "12. Parle-moi d'une situation où tu as aidé quelqu'un sans qu'il te le demande. Pourquoi ?",
      "13. Si tu avais un budget illimité pour un projet social, quelle cause soutiendrais-tu et pourquoi ?",
      "14. Quelle valeur est la plus importante : solidarité, efficacité ou créativité ? Pourquoi ?",
      "15. Quelle est la différence entre quelqu'un qui 'veut aider' et quelqu'un qui 'aide vraiment' ?",
      "16. Raconte une expérience où tu as convaincu un groupe de ton idée.",
      "17. En cas de désaccord dans l'équipe : imposer une décision, chercher un compromis ou laisser choisir ? Pourquoi ?",
      "18. Si un membre ne respecte pas ses engagements, comment réagis-tu ?",
      "19. Pour toi, un bon leader est : modèle, coach ou stratège ? Explique."
    ],
    minWords: 80 
  },
  { 
    id: 'situationalProblemSolving', 
    title: 'Mises en situation (MES)', 
    icon: ShieldAlert, 
    questions: [
      "20. Conflit entre deux membres le jour J → réaction ?",
      "21. Organisation d'un TeamBuilding avec manque de voitures → solution ?",
      "22. Démotivation totale de l'équipe → que fais-tu ?",
      "23. Transporteur ne répond pas le jour d'un événement → réaction ?",
      "24. Conflit avec ton binôme → comportement ?",
      "25. Manque d'espace pour stocker les dons → solution ?",
      "26. Personne ne remplit le sheet → sous-effectif → réaction ?",
      "27. Un autre club prend votre stand → que fais-tu ?",
      "28. Manque de fonds pendant une action → solution ?"
    ],
    minWords: 80 
  }
];

export default function Phase2Form() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [sections, setSections] = useState(SECTIONS);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error("Lien d'accès invalide.");
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/candidates/phase2-verify`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          toast.error(data.message || 'Lien invalide ou expiré');
          navigate('/');
          return;
        }
        
        setCandidate(data.candidate);
        
        // Load draft from localStorage
        const draft = localStorage.getItem(`draft_${data.candidate._id}`);
        if (draft) {
          setAnswers(JSON.parse(draft));
          toast.success("Brouillon restauré !");
        }

        // Conditional Communication section
        const depts = data.candidate.departments || [];
        if (depts.some(d => d.toLowerCase().includes('marketing') || d.toLowerCase().includes('communication'))) {
          setSections(prev => {
            if (prev.some(s => s.id === 'communication')) return prev;
            return [...prev, { 
              id: 'communication', 
              title: 'Communication (Com)', 
              icon: Mail, 
              questions: [
                "29. Pourquoi as-tu choisi ce département ?",
                "30. Quelles missions as-tu déjà réalisées en communication ?",
                "31. Quels outils maîtrises-tu (design, photo, montage vidéo) ?",
                "32. En retard pour un passage radio → réaction ?",
                "33. Comment gères-tu un feedback négatif sur les réseaux sociaux ?",
                "34. Un intervenant annule à la dernière minute → réorganisation ?",
                "35. Quelles stratégies pour augmenter l'engagement sur les réseaux sociaux ?",
                "36. Préparer un plan de communication (nom, slogan, publications, objectifs, budget)",
                "37. Test designer : créer une affiche (Liens GDrive ici)",
                "38. Test rédacteur : écrire un paragraphe LinkedIn",
                "39. Bug Facebook/Instagram pendant 1 semaine → comment communiquer ?",
                "40. Promesse de couverture médiatique à un sponsor sans mentionner son nom → solution ?"
              ],
              minWords: 30
            }];
          });
        }

        setLoading(false);
      } catch (err) {
        toast.error('Erreur de connexion.');
        navigate('/');
      }
    };

    verifyToken();
  }, [token, navigate]);

  // Auto-save
  useEffect(() => {
    if (candidate) {
      const timeout = setTimeout(() => {
        localStorage.setItem(`draft_${candidate._id}`, JSON.stringify(answers));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [answers, candidate]);

  const handleNext = () => {
    if (currentStep < sections.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const formattedAnswers = {};
      sections.forEach(sec => {
        if (!sec.questions) return;
        let combined = '';
        sec.questions.forEach((q, idx) => {
          const val = answers[`${sec.id}_${idx}`] || 'Non répondu';
          combined += `Question: ${q}\nRéponse: ${val}\n\n`;
        });
        formattedAnswers[sec.id] = combined.trim();
      });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/candidates/phase2-submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ phase2Answers: formattedAnswers })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      localStorage.removeItem(`draft_${candidate._id}`);
      toast.success("Évaluation soumise avec succès !");
      navigate('/success?phase=2');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg font-light tracking-widest">VERIFYING SECURE LINK...</p>
      </div>
    );
  }

  const currentSection = sections[currentStep];
  const wordCount = currentSection.questions ? currentSection.questions.reduce((total, q, idx) => {
    const text = answers[`${currentSection.id}_${idx}`] || '';
    return total + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0) : 0;
  const progress = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden overflow-y-auto relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Phase 2: <span className="text-white font-light">Deep Dive</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Welcome back, <b className="text-white">{candidate.firstName}</b>. Show us how you think.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-blue-400">AUTO-SAVING DRAFT</span>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2 text-xs font-bold text-slate-500 tracking-wider">
            <span>START</span>
            <span>{Math.round(progress)}% COMPLETED</span>
          </div>
          <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 min-h-[400px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <currentSection.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
              </div>

              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group focus-within:border-blue-500/30 transition-colors duration-500 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                {/* Render specific questions with their individual inputs */}
                <div className="space-y-6 pb-20">
                  {currentSection.questions?.map((q, idx) => {
                    const ansKey = `${currentSection.id}_${idx}`;
                    return (
                      <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-lg group-focus-within:border-white/20 transition-all">
                        <h3 className="text-slate-200 text-base md:text-lg font-bold mb-4 leading-relaxed">{q}</h3>
                        <textarea
                          value={answers[ansKey] || ''}
                          onChange={(e) => setAnswers({ ...answers, [ansKey]: e.target.value })}
                          placeholder="Votre réponse..."
                          className="w-full min-h-[140px] bg-black/20 border border-white/5 rounded-xl p-4 resize-y outline-none text-base md:text-lg text-slate-300 placeholder:text-slate-600 focus:bg-black/40 focus:border-blue-500/50 transition-all font-light"
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Word Count Indicator */}
                <div className={`absolute bottom-6 right-6 px-5 py-2 rounded-full text-xs font-bold backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 z-20 ${
                  wordCount < currentSection.minWords 
                    ? 'bg-orange-600/20 text-orange-400' 
                    : 'bg-green-600/20 text-green-400'
                }`}>
                  {wordCount} / {currentSection.minWords}+ mots (Total de la page)
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <footer className="mt-8 flex items-center justify-between pb-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-slate-400 font-semibold hover:text-white hover:bg-white/5 disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep === sections.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || wordCount < currentSection.minWords}
              className="group relative flex items-center gap-2 px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Submit Application
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
