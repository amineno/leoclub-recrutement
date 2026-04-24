import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, BookOpen, Layers, Target, Wrench, CheckCircle, 
  ChevronRight, ChevronLeft, Loader2, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { applyCandidate } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import useLocalStorage from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const schema = z.object({
  lastName: z.string().min(2, "Nom requis (min 2 caractères)"),
  firstName: z.string().min(2, "Prénom requis (min 2 caractères)"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  birthDate: z.string().min(1, "Date de naissance requise"),
  studyYear: z.string().min(1, "Niveau d'étude requis"),
  departments: z.array(z.string()).min(3, "Veuillez classer vos 3 départements préférés"),
  axis: z.string().min(1, "Axe préféré requis"),
  skills: z.array(z.string()).min(1, "Sélectionnez au moins une compétence"),
});

const STEPS = [
  { id: 1, title: "Infos Personnelles", icon: User },
  { id: 2, title: "Niveau d'étude", icon: BookOpen },
  { id: 3, title: "Départements", icon: Layers },
  { id: 4, title: "Axe Préféré", icon: Target },
  { id: 5, title: "Compétences", icon: Wrench },
  { id: 6, title: "Récapitulatif", icon: CheckCircle },
];

const STUDY_YEARS = ["1ère année", "2ème année", "3ème année", "M1"];
const DEPARTMENTS = ["RH", "Sponsoring", "Marketing"];
const AXES = [
  { id: "Malnutrition", label: "Malnutrition", icon: "🍎" },
  { id: "Environnement", label: "Environnement", icon: "🌿" },
  { id: "Diabète", label: "Diabète", icon: "🩺" },
  { id: "Vue", label: "Vue", icon: "👁️" },
  { id: "Cancer Infantile", label: "Cancer Infantile", icon: "🎗️" },
];
const SKILLS = [
  "Travail en équipe", "Photographie", "Rédaction", "Créativité", 
  "Négociation", "Polyvalence", "Montage", "Leadership", 
  "Esprit d'écoute", "Gestion de stress", "Empathie", "Flexibilité"
];

const RecruitmentForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useLocalStorage('recruitment-form', {});

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, trigger } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: savedData.lastName || '',
      firstName: savedData.firstName || '',
      email: savedData.email || '',
      phone: savedData.phone || '',
      birthDate: savedData.birthDate || '',
      studyYear: savedData.studyYear || '',
      departments: savedData.departments || [],
      axis: savedData.axis || '',
      skills: savedData.skills || [],
    },
    mode: "onChange"
  });

  const formData = watch();

  useEffect(() => {
    const subscription = watch((value) => {
      setSavedData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, setSavedData]);

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ["lastName", "firstName", "email", "phone", "birthDate"];
    if (step === 2) fieldsToValidate = ["studyYear"];
    if (step === 3) fieldsToValidate = ["departments"];
    if (step === 4) fieldsToValidate = ["axis"];
    if (step === 5) fieldsToValidate = ["skills"];

    const result = await trigger(fieldsToValidate);
    if (result) setStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await applyCandidate(data);
      localStorage.removeItem('recruitment-form');
      navigate('/success');
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la soumission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-8 custom-scrollbar">
      {/* Background Blobs */}
      <div className="floating-blob w-[500px] h-[500px] bg-primary/30 -top-48 -left-48" />
      <div className="floating-blob w-[400px] h-[400px] bg-secondary/30 -bottom-48 -right-48" style={{ animationDelay: '-10s' }} />
      <div className="floating-blob w-64 h-64 bg-accent/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '-15s' }} />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-primary/20 border-2 border-white/50 dark:border-slate-800">
              <img src="/lionsClub-removebg-preview.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Lions Club</h1>
              <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-80">Recruitment 2026</p>
            </div>
          </motion.div>
          <ThemeToggle />
        </div>

        {/* Progress Bar */}
        <div className="space-y-6 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0">
          <div className="flex justify-between items-center min-w-[600px] md:min-w-full px-4 relative">
            {/* Connection Line */}
            <div className="absolute left-10 right-10 top-6 h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />
            <motion.div 
              className="absolute left-10 top-6 h-[2px] bg-primary -z-10"
              initial={{ width: 0 }}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 90}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-3">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: step === s.id ? 1.1 : 1,
                    backgroundColor: step >= s.id ? 'var(--color-primary)' : 'rgba(226, 232, 240, 0.5)'
                  }}
                  className={cn(
                    "step-indicator shadow-sm w-10 h-10 md:w-12 md:h-12",
                    step >= s.id ? "text-white shadow-lg shadow-primary/30" : "text-slate-400 dark:bg-slate-800/50"
                  )}
                >
                  <s.icon size={18} className="md:w-5 md:h-5" />
                  {step > s.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-accent flex items-center justify-center"
                    >
                      <CheckCircle size={20} className="md:w-6 md:h-6" />
                    </motion.div>
                  )}
                </motion.div>
                <span className={cn(
                  "text-[10px] md:text-xs font-bold tracking-wider uppercase transition-colors duration-300 whitespace-nowrap",
                  step >= s.id ? "text-primary" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-card min-h-[450px] flex flex-col"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex-1">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Commençons par faire connaissance.</h2>
                      <p className="text-slate-500 dark:text-slate-400">Remplissez vos informations personnelles pour continuer.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Nom</label>
                        <input 
                          {...register('lastName')}
                          placeholder="Nom"
                          className={cn(
                            "input-field text-xl font-medium p-6",
                            errors.lastName ? "border-red-500 bg-red-50/50" : ""
                          )}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs font-bold">{errors.lastName.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Prénom</label>
                        <input 
                          {...register('firstName')}
                          placeholder="Prénom"
                          className={cn(
                            "input-field text-xl font-medium p-6",
                            errors.firstName ? "border-red-500 bg-red-50/50" : ""
                          )}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs font-bold">{errors.firstName.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Email</label>
                        <input 
                          {...register('email')}
                          type="email"
                          placeholder="Email"
                          className={cn(
                            "input-field text-xl font-medium p-6",
                            errors.email ? "border-red-500 bg-red-50/50" : ""
                          )}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Téléphone</label>
                        <input 
                          {...register('phone')}
                          placeholder="0X XX XX XX XX"
                          className={cn(
                            "input-field text-xl font-medium p-6",
                            errors.phone ? "border-red-500 bg-red-50/50" : ""
                          )}
                        />
                        {errors.phone && <p className="text-red-500 text-xs font-bold">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Date de naissance</label>
                      <input 
                        {...register('birthDate')}
                        type="date"
                        className={cn(
                          "input-field text-xl font-medium p-6",
                          errors.birthDate ? "border-red-500 bg-red-50/50" : ""
                        )}
                      />
                      {errors.birthDate && <p className="text-red-500 text-xs font-bold">{errors.birthDate.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Study Level */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Quel est votre niveau actuel ?</h2>
                      <p className="text-slate-500 dark:text-slate-400">Sélectionnez votre année d'étude universitaire.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {STUDY_YEARS.map((year) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={year}
                          type="button"
                          onClick={() => setValue('studyYear', year, { shouldValidate: true })}
                          className={cn(
                            "p-8 rounded-3xl border-2 transition-all text-left flex justify-between items-center group",
                            formData.studyYear === year 
                              ? "border-primary bg-primary/10 shadow-xl shadow-primary/10" 
                              : "border-slate-100 dark:border-slate-800 hover:border-primary/40 bg-white dark:bg-slate-900/50 shadow-sm"
                          )}
                        >
                          <span className={cn(
                            "text-xl font-bold",
                            formData.studyYear === year ? "text-primary" : "text-slate-600 dark:text-slate-400"
                          )}>{year}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            formData.studyYear === year ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-700"
                          )}>
                            {formData.studyYear === year && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.studyYear && <p className="text-red-500 text-xs font-bold">{errors.studyYear.message}</p>}
                  </div>
                )}

                {/* Step 3: Department Ranking */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Choisissez vos départements.</h2>
                      <p className="text-slate-500 dark:text-slate-400">Classez les départements par ordre de préférence (Top 3).</p>
                    </div>
                    <div className="space-y-4">
                      {DEPARTMENTS.map((dept) => {
                        const index = formData.departments.indexOf(dept);
                        return (
                          <motion.button
                            whileHover={{ x: 10 }}
                            key={dept}
                            type="button"
                            onClick={() => {
                              const current = [...formData.departments];
                              if (index > -1) {
                                current.splice(index, 1);
                              } else if (current.length < 3) {
                                current.push(dept);
                              }
                              setValue('departments', current, { shouldValidate: true });
                            }}
                            className={cn(
                              "w-full p-6 rounded-2xl border-2 flex justify-between items-center transition-all group",
                              index > -1 
                                ? "border-primary bg-primary/10 shadow-lg" 
                                : "border-slate-100 dark:border-slate-800 hover:border-primary/40 bg-white dark:bg-slate-900/50 shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                                index > -1 ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              )}>
                                {index > -1 ? index + 1 : "?"}
                              </div>
                              <span className="text-lg font-bold">{dept}</span>
                            </div>
                            <ChevronRight size={20} className={cn(
                              "transition-transform",
                              index > -1 ? "text-primary rotate-90" : "text-slate-300"
                            )} />
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.departments && <p className="text-red-500 text-xs font-bold">{errors.departments.message}</p>}
                  </div>
                )}

                {/* Step 4: Preferred Axis */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Quel axe vous passionne ?</h2>
                      <p className="text-slate-500 dark:text-slate-400">Choisissez l'axe d'intervention qui vous correspond le mieux.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {AXES.map((axis) => (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -5 }}
                          key={axis.id}
                          type="button"
                          onClick={() => setValue('axis', axis.id, { shouldValidate: true })}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                            formData.axis === axis.id 
                              ? "border-primary bg-primary/10 shadow-xl" 
                              : "border-slate-100 dark:border-slate-800 hover:border-primary/40 bg-white dark:bg-slate-900/50 shadow-sm"
                          )}
                        >
                          <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-all",
                            formData.axis === axis.id ? "bg-primary/20 scale-110" : "bg-slate-100 dark:bg-slate-800"
                          )}>
                            {axis.icon}
                          </div>
                          <span className="font-black text-xs uppercase tracking-widest text-center">{axis.label}</span>
                        </motion.button>
                      ))}
                    </div>
                    {errors.axis && <p className="text-red-500 text-xs font-bold">{errors.axis.message}</p>}
                  </div>
                )}

                {/* Step 5: Skills */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Quelles sont vos forces ?</h2>
                      <p className="text-slate-500 dark:text-slate-400">Sélectionnez toutes les compétences que vous possédez.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {SKILLS.map((skill) => {
                        const isSelected = formData.skills.includes(skill);
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={skill}
                            type="button"
                            onClick={() => {
                              const current = [...formData.skills];
                              if (isSelected) {
                                setValue('skills', current.filter(s => s !== skill), { shouldValidate: true });
                              } else {
                                setValue('skills', [...current, skill], { shouldValidate: true });
                              }
                            }}
                            className={cn(
                              "px-6 py-3 rounded-2xl border-2 transition-all text-sm font-bold tracking-tight",
                              isSelected 
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                                : "border-slate-100 dark:border-slate-800 hover:border-primary/40 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 shadow-sm"
                            )}
                          >
                            {skill}
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.skills && <p className="text-red-500 text-xs font-bold">{errors.skills.message}</p>}
                  </div>
                )}

                {/* Step 6: Review */}
                {step === 6 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Presque fini !</h2>
                      <p className="text-slate-500 dark:text-slate-400">Vérifiez vos informations avant de confirmer votre candidature.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/30 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-white/20">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nom & Prénom</p>
                        <p className="text-xl font-bold">{formData.lastName} {formData.firstName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Email & Téléphone</p>
                        <p className="text-lg font-bold">{formData.email}</p>
                        <p className="text-lg font-bold">{formData.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Date de naissance</p>
                        <p className="text-xl font-bold">{formData.birthDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Niveau d'étude</p>
                        <p className="text-xl font-bold">{formData.studyYear}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Départements</p>
                        <div className="flex gap-2">
                          {formData.departments.map((d, i) => (
                            <span key={d} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-lg font-bold">{i+1}. {d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Axe d'intervention</p>
                        <p className="text-xl font-bold flex items-center gap-2">
                          <span className="text-2xl">{AXES.find(a => a.id === formData.axis)?.icon}</span>
                          {formData.axis}
                        </p>
                      </div>
                      <div className="col-span-full space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Compétences clés</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={cn(
                      "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all",
                      step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    )}
                  >
                    <ChevronLeft size={20} />
                    Retour
                  </button>

                  {step < STEPS.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary"
                    >
                      Continuer
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      className="btn-primary bg-green-600 shadow-green-600/20 hover:shadow-green-600/40"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmer ma candidature"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentForm;
