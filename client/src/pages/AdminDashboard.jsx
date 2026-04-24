import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Trash2, Eye, 
  ChevronDown, LayoutDashboard, LogOut, X, Check,
  BarChart2, PieChart as PieChartIcon, TrendingUp,
  FileText, Menu, Star, Calendar, Target, Loader2, ChevronLeft, ChevronRight,
  Settings, Home as HomeIcon, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { cn } from '../lib/utils';
import { 
  getCandidates, deleteCandidate, updateCandidate, exportCandidatesCSV, exportCandidatesExcel,
  getAdminProfile, updateAdminProfile
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

const AXES = [
  { id: "Malnutrition", label: "Malnutrition", icon: "🍎" },
  { id: "Environnement", label: "Environnement", icon: "🌿" },
  { id: "Diabète", label: "Diabète", icon: "🩺" },
  { id: "Vue", label: "Vue", icon: "👁️" },
  { id: "Cancer Infantile", label: "Cancer Infantile", icon: "🎗️" },
];

const AdminDashboard = () => {
  const [view, setView] = useState('home'); // 'home', 'candidates', 'settings'
  const [candidates, setCandidates] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState({ studyYear: '', axis: '', department: '', status: '', score: '' });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCandidates();
    fetchAdminProfile();
  }, [debouncedSearch, filter, currentPage]);

  const fetchAdminProfile = async () => {
    try {
      const { data } = await getAdminProfile();
      setAdminProfile(data);
      setNewEmail(data.email);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateAdminProfile({ email: newEmail, password: newPassword });
      toast.success('Profil mis à jour');
      setNewPassword('');
      fetchAdminProfile();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const { data } = await getCandidates({ 
        search: debouncedSearch, 
        ...filter, 
        sort: 'newest',
        page: currentPage,
        limit: 10
      });
      setCandidates(data.candidates);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    try {
      await deleteCandidate(candidateToDelete._id);
      toast.success('Candidat supprimé avec succès', { icon: '🗑️' });
      fetchCandidates();
      if (selectedCandidate?._id === candidateToDelete._id) setSelectedCandidate(null);
      setCandidateToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    handleUpdate(id, { status });
  };

  const handleUpdate = async (id, data) => {
    setIsUpdating(true);
    try {
      await updateCandidate(id, data);
      
      if (data.status) {
        const statusLabel = data.status === 'Accepted' ? 'acceptée' : 'refusée';
        const statusIcon = data.status === 'Accepted' ? '✅' : '❌';
        
        toast.success(`Candidature ${statusLabel}`, {
          icon: statusIcon,
          style: {
            border: data.status === 'Accepted' ? '1px solid #10b981' : '1px solid #ef4444',
          }
        });
      } else {
        toast.success('Mis à jour avec succès');
      }
      
      fetchCandidates();
      if (selectedCandidate?._id === id) {
        setSelectedCandidate({ ...selectedCandidate, ...data });
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportCandidatesExcel({ 
        search: debouncedSearch, 
        ...filter 
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `recrutement_lions_club_${date}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export Excel (.xlsx) réussi', { icon: '📊' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'exportation Excel');
    }
  };

  // Stats for charts
  const deptStats = [
    { name: 'RH', count: candidates.filter(c => c.departments.includes('RH')).length },
    { name: 'Sponsoring', count: candidates.filter(c => c.departments.includes('Sponsoring')).length },
    { name: 'Marketing', count: candidates.filter(c => c.departments.includes('Marketing')).length },
  ];

  const yearStats = [
    { name: '1ère', value: candidates.filter(c => c.studyYear === '1ère année').length },
    { name: '2ème', value: candidates.filter(c => c.studyYear === '2ème année').length },
    { name: '3ème', value: candidates.filter(c => c.studyYear === '3ème année').length },
    { name: 'M1', value: candidates.filter(c => c.studyYear === 'M1').length },
  ];

  const axisStats = AXES.map(axis => ({
    name: axis.id,
    count: candidates.filter(c => c.axis === axis.id).length
  }));

  const statusStats = [
    { name: 'En attente', value: candidates.filter(c => c.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Acceptés', value: candidates.filter(c => c.status === 'Accepted').length, color: '#10b981' },
    { name: 'Refusés', value: candidates.filter(c => c.status === 'Rejected').length, color: '#ef4444' },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#030712] transition-colors duration-500 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 lg:static lg:flex flex-col border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-12 z-50 transition-transform duration-300 shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/20 border border-slate-100 dark:border-slate-800">
              <img src="/lionsClub-removebg-preview.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Admin</h1>
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-80">Lions Club</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setView('home')}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all",
              view === 'home' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn("p-2 rounded-xl", view === 'home' ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
              <HomeIcon size={20} />
            </div>
            Accueil
          </button>
          <button 
            onClick={() => setView('candidates')}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all",
              view === 'candidates' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn("p-2 rounded-xl", view === 'candidates' ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
              <Users size={20} />
            </div>
            Candidats
          </button>
          <button 
            onClick={() => setView('settings')}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all",
              view === 'settings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn("p-2 rounded-xl", view === 'settings' ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
              <Settings size={20} />
            </div>
            Paramètres
          </button>
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl font-bold transition-all group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
        >
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl group-hover:scale-110 transition-transform">
            <LogOut size={20} />
          </div>
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-12 space-y-8 md:space-y-12 custom-scrollbar relative">
        {/* Background Blobs for Dashboard */}
        <div className="floating-blob w-[600px] h-[600px] bg-primary/10 -top-48 -right-48" />
        <div className="floating-blob w-[400px] h-[400px] bg-secondary/10 -bottom-48 -left-48" style={{ animationDelay: '-10s' }} />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Menu size={24} className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {view === 'home' ? 'Tableau de bord' : view === 'candidates' ? 'Liste des Candidats' : 'Paramètres'}
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium">
                {view === 'home' ? 'Aperçu global de la campagne 2026' : view === 'candidates' ? 'Gestion des recrues et sélections' : 'Gérez votre compte et sécurité'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <ThemeToggle />
            {view === 'candidates' && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
              >
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText size={18} className="text-primary" /> 
                </div>
                <span>Exporter</span>
              </button>
            )}
          </div>
        </div>

        {view === 'home' && (
          <div className="space-y-8 md:space-y-12 relative z-10">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Candidats', value: total, icon: Users, color: 'bg-blue-500' },
                { label: 'En attente', value: candidates.filter(c => c.status === 'Pending').length, icon: Calendar, color: 'bg-yellow-500' },
                { label: 'Acceptés', value: candidates.filter(c => c.status === 'Accepted').length, icon: Check, color: 'bg-green-500' },
                { label: 'Score Moyen', value: (candidates.reduce((acc, c) => acc + (c.score || 0), 0) / (candidates.length || 1)).toFixed(1), icon: Star, color: 'bg-purple-500' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 flex items-center gap-6"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Grid (Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <BarChart2 size={24} />
                  </div>
                  Candidats / Département
                </h3>
                <div className="h-64 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: '1px solid #F1F5F9', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                          padding: '12px',
                          fontSize: '12px',
                          background: '#FFFFFF'
                        }}
                      />
                      <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                    <PieChartIcon size={24} />
                  </div>
                  Répartition par niveau
                </h3>
                <div className="h-64 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={yearStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {yearStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: '1px solid #F1F5F9', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                          padding: '12px',
                          fontSize: '12px',
                          background: '#FFFFFF'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-accent/10 rounded-xl text-accent">
                    <Target size={24} />
                  </div>
                  Candidats / Axe Préféré
                </h3>
                <div className="h-64 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={axisStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} 
                        width={100}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: '1px solid #F1F5F9', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                          padding: '12px',
                          fontSize: '12px',
                          background: '#FFFFFF'
                        }}
                      />
                      <Bar dataKey="count" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-green-100 rounded-xl text-green-600">
                    <TrendingUp size={24} />
                  </div>
                  Suivi des candidatures
                </h3>
                <div className="h-64 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {statusStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: '1px solid #F1F5F9', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                          padding: '12px',
                          fontSize: '12px',
                          background: '#FFFFFF'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {view === 'candidates' && (
          <div className="glass-card relative z-10 overflow-visible">
            <div className="flex flex-col xl:flex-row items-center gap-4 md:gap-6 mb-8">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un talent..."
                className="input-field pl-16 p-4 md:p-5 text-base md:text-lg font-medium text-slate-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-56">
                <select 
                  onChange={(e) => setFilter({ ...filter, studyYear: e.target.value })}
                  className="input-field appearance-none px-6 py-4 md:py-5 pr-12 font-bold text-sm text-slate-700"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="1ère année">1ère année</option>
                  <option value="2ème année">2ème année</option>
                  <option value="3ème année">3ème année</option>
                  <option value="M1">M1</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size="16" />
              </div>
              <div className="relative flex-1 xl:w-56">
                <select 
                  onChange={(e) => setFilter({ ...filter, axis: e.target.value })}
                  className="input-field appearance-none px-6 py-4 md:py-5 pr-12 font-bold text-sm text-slate-700"
                >
                  <option value="">Tous les axes</option>
                  <option value="Malnutrition">Malnutrition</option>
                  <option value="Environnement">Environnement</option>
                  <option value="Diabète">Diabète</option>
                  <option value="Vue">Vue</option>
                  <option value="Cancer Infantile">Cancer</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size="16" />
              </div>
              <div className="relative flex-1 xl:w-48">
                <select 
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="input-field appearance-none px-6 py-4 md:py-5 pr-12 font-bold text-sm text-slate-700"
                >
                  <option value="">Tous les status</option>
                  <option value="Pending">En attente</option>
                  <option value="Accepted">Acceptés</option>
                  <option value="Rejected">Refusés</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size="16" />
              </div>
              <div className="relative flex-1 xl:w-40">
                <select 
                  onChange={(e) => setFilter({ ...filter, score: e.target.value })}
                  className="input-field appearance-none px-6 py-4 md:py-5 pr-12 font-bold text-sm text-slate-700"
                >
                  <option value="">Tous les scores</option>
                  <option value="5">5 Étoiles</option>
                  <option value="4">4 Étoiles</option>
                  <option value="3">3 Étoiles</option>
                  <option value="2">2 Étoiles</option>
                  <option value="1">1 Étoile</option>
                  <option value="0">0 Étoile</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size="16" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 md:-mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <th className="pb-4 pl-6">Candidat</th>
                    <th className="pb-4 hidden sm:table-cell">Niveau</th>
                    <th className="pb-4 hidden md:table-cell">Département (P1)</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <motion.tr 
                      layout
                      key={c._id} 
                      className="group bg-[#F8FAFC]/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl"
                    >
                      <td className="py-5 pl-6 rounded-l-2xl md:rounded-l-[1.5rem] transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-base md:text-lg shrink-0">
                          {(c.lastName || c.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm md:text-lg truncate text-slate-900 dark:text-white">
                            {c.lastName ? `${c.lastName} ${c.firstName}` : (c.name || 'Candidat Inconnu')}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 font-medium">{c.email || 'Pas d\'email'}</p>
                        </div>
                        </div>
                      </td>
                      <td className="py-5 font-bold text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                        {c.studyYear}
                      </td>
                      <td className="py-5 hidden md:table-cell">
                        <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] rounded-lg font-black uppercase tracking-wider border border-primary/10">
                          {c.departments[0]}
                        </span>
                      </td>
                      <td className="py-5">
                        <span className={cn(
                          "px-3 py-1 text-[8px] md:text-[10px] rounded-lg font-black uppercase tracking-widest",
                          c.status === 'Accepted' ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                          c.status === 'Rejected' ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-5 pr-6 text-right rounded-r-2xl md:rounded-r-[1.5rem]">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <button 
                            onClick={() => setSelectedCandidate(c)}
                            className="p-2 md:p-3 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all active:scale-90"
                          >
                            <Eye size={18} className="md:w-5 md:h-5" />
                          </button>
                          <button 
                            onClick={() => setCandidateToDelete(c)}
                            className="p-2 md:p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 size={18} className="md:w-5 md:h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary disabled:opacity-50 transition-all active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95",
                        currentPage === i + 1 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 border border-slate-100 dark:border-slate-800"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === pages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary disabled:opacity-50 transition-all active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {candidates.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={28} />
                </div>
                <p className="text-slate-500 font-bold text-sm md:text-base px-4">Aucun candidat ne correspond à vos critères</p>
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 md:p-12 space-y-10"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-inner">
                  <Shield size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sécurité du Compte</h3>
                  <p className="text-slate-500 font-medium">Mettez à jour vos identifiants d'accès</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email de l'administrateur</label>
                  <input 
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field p-5"
                    placeholder="admin@leoclub.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nouveau Mot de Passe</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field p-5"
                    placeholder="••••••••"
                  />
                  <p className="text-[10px] text-slate-400 ml-2 italic">Laissez vide pour conserver le mot de passe actuel</p>
                </div>

                <button 
                  disabled={isUpdating}
                  type="submit"
                  className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {isUpdating ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  Enregistrer les modifications
                </button>
              </form>
            </motion.div>

            <div className="glass-card p-8 border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-black text-red-500 uppercase tracking-tight">Déconnexion</h4>
                  <p className="text-xs text-slate-500 font-medium">Fermer votre session actuelle</p>
                </div>
                <button 
                  onClick={logout}
                  className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-primary/20 shrink-0">
                    {(selectedCandidate.lastName || selectedCandidate.name || '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-2xl font-black tracking-tight truncate text-slate-900 dark:text-white">
                      {selectedCandidate.lastName ? `${selectedCandidate.lastName} ${selectedCandidate.firstName}` : (selectedCandidate.name || 'Candidat Inconnu')}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">Inscrit le {new Date(selectedCandidate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                  <X size="20" className="md:w-6 md:h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6 md:p-10 space-y-8 md:space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Contact</p>
                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.email || 'N/A'}</p>
                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Date de naissance</p>
                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.birthDate || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Niveau d'étude</p>
                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.studyYear || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Axe Préféré</p>
                    <div className="text-lg md:text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                      <span className="text-2xl md:text-3xl">{AXES.find(a => a.id === selectedCandidate.axis)?.icon || '🎯'}</span>
                      <span className="truncate">{selectedCandidate.axis || 'Non spécifié'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Choix des Départements</p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                    {(selectedCandidate.departments || []).map((d, i) => (
                      <div key={d} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="w-6 h-6 md:w-8 md:h-8 bg-primary text-white rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-base shrink-0">{i + 1}</span>
                        <span className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100">{d}</span>
                      </div>
                    ))}
                    {(!selectedCandidate.departments || selectedCandidate.departments.length === 0) && (
                      <p className="text-slate-500 italic">Aucun département choisi</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Compétences</p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {(selectedCandidate.skills || []).map(s => (
                      <span key={s} className="px-3 md:px-5 py-2 md:py-2.5 bg-secondary/5 text-secondary text-[10px] md:text-sm rounded-lg md:rounded-xl font-black uppercase tracking-tight border border-secondary/10">
                        {s}
                      </span>
                    ))}
                    {(!selectedCandidate.skills || selectedCandidate.skills.length === 0) && (
                      <p className="text-slate-500 italic">Aucune compétence spécifiée</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Score du Candidat</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdate(selectedCandidate._id, { score: s })}
                          className={cn(
                            "p-2 rounded-xl transition-all active:scale-90",
                            (selectedCandidate.score || 0) >= s ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 text-slate-300 dark:bg-slate-800"
                          )}
                        >
                          <Star size={24} fill={(selectedCandidate.score || 0) >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Date d'entretien</p>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="datetime-local"
                        value={selectedCandidate.interviewDate ? new Date(selectedCandidate.interviewDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleUpdate(selectedCandidate._id, { interviewDate: e.target.value })}
                        className="input-field pl-12 p-4 text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Commentaires Admin</p>
                  <textarea 
                    value={selectedCandidate.notes || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, notes: e.target.value })}
                    onBlur={() => handleUpdate(selectedCandidate._id, { notes: selectedCandidate.notes })}
                    placeholder="Saisissez vos observations ici..."
                    className="input-field p-4 md:p-6 min-h-[120px] md:min-h-[150px] resize-none text-base md:text-lg font-medium"
                  />
                </div>
              </div>

              <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 md:gap-4 w-full sm:w-auto">
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'Accepted')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-green-600 text-white rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} className="md:w-5 md:h-5" />}
                    Accepter
                  </button>
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'Rejected')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-red-500 text-white rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <X size={18} className="md:w-5 md:h-5" />}
                    Refuser
                  </button>
                </div>
                <button 
                  onClick={() => setCandidateToDelete(selectedCandidate)}
                  className="p-3 md:p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-90"
                >
                  <Trash2 size="20" className="md:w-6 md:h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {candidateToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCandidateToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-center space-y-6 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Supprimer Candidat ?</h3>
                <p className="text-slate-500 font-medium">
                  Êtes-vous sûr de vouloir supprimer <span className="text-slate-900 dark:text-slate-200 font-bold">{candidateToDelete.lastName} {candidateToDelete.firstName}</span> ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCandidateToDelete(null)}
                  className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
