import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Briefcase, Users, Lightbulb, Target, BrainCircuit, ShieldAlert, HeartHandshake, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  { id: 'motivation', title: 'General Motivation', icon: HeartHandshake, placeholder: 'Why do you want to join us? What drives you? Be specific about your personal values and how they align with our mission.', minWords: 30 },
  { id: 'experience', title: 'Experience', icon: Briefcase, placeholder: 'Describe your past experiences (associations, projects, work). What did you build or achieve?', minWords: 20 },
  { id: 'personalityTeamwork', title: 'Personality & Teamwork', icon: Users, placeholder: 'How do you operate in a team? Are you a leader, a mediator, an executor? Give an example of a conflict you resolved.', minWords: 30 },
  { id: 'projectIdeation', title: 'Project Ideation', icon: Lightbulb, placeholder: 'Propose a concrete project (social, technical, or event) we haven\'t done yet. Detail the problem, your solution, and the first 3 steps to execute it.', minWords: 50 },
  { id: 'expectationsSkills', title: 'Expectations & Skills', icon: Target, placeholder: 'What do you expect to learn from us? What hard/soft skills do you currently bring to the table?', minWords: 20 },
  { id: 'behavioralThinking', title: 'Behavioral Thinking', icon: BrainCircuit, placeholder: 'If half your team suddenly quits two weeks before a major event, what is your immediate action plan?', minWords: 40 },
  { id: 'situationalProblemSolving', title: 'Problem Solving', icon: ShieldAlert, placeholder: 'You are tasked with securing a sponsor for an event, but you have no network and 0 budget. How do you pitch and close the deal?', minWords: 40 },
  // Communication is conditional, will be added dynamically
];

export default function Phase2Form() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [sections, setSections] = useState(SECTIONS);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [answers, setAnswers] = useState({
    motivation: '',
    experience: '',
    personalityTeamwork: '',
    projectIdeation: '',
    expectationsSkills: '',
    behavioralThinking: '',
    situationalProblemSolving: '',
    communication: ''
  });

  useEffect(() => {
    if (!token) {
      toast.error("Lien d'accès invalide.");
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/candidates/phase2-verify`, {
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
          setSections(prev => [...prev, { 
            id: 'communication', 
            title: 'Communication & PR', 
            icon: Mail, 
            placeholder: 'How would you write a pitch to a corporate sponsor or a press release for our next big charity event? Write a short draft.',
            minWords: 30
          }]);
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
      const res = await fetch('http://localhost:5000/api/candidates/phase2-submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ phase2Answers: answers })
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
  const currentAnswer = answers[currentSection.id];
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const progress = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 flex flex-col h-screen">
        
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

              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group focus-within:border-blue-500/30 transition-colors duration-500">
                <textarea
                  autoFocus
                  value={currentAnswer}
                  onChange={(e) => setAnswers({ ...answers, [currentSection.id]: e.target.value })}
                  placeholder={currentSection.placeholder}
                  className="w-full h-full min-h-[250px] bg-transparent resize-none outline-none text-lg md:text-xl text-slate-200 placeholder:text-slate-600 leading-relaxed font-light"
                />
                
                {/* Word Count Indicator */}
                <div className={`absolute bottom-6 right-6 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all duration-300 ${
                  wordCount < currentSection.minWords 
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                    : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                  {wordCount} / {currentSection.minWords}+ words
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
