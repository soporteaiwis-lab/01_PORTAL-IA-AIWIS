import React from 'react';
import { User, Project, AppRoute } from '../types';

const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <i className={`fa-solid ${name} ${className}`}></i>
);

export const Dashboard = ({ 
    currentUser, 
    projects,
    onNavigate 
}: { 
    currentUser: User, 
    projects: Project[],
    onNavigate: (r: AppRoute) => void 
}) => {
  const activeProjects = projects.filter(p => p.status === 'En Curso').length;
  const myProjects = projects.filter(p => p.status === 'En Curso' && (p.teamIds.includes(currentUser.id) || p.leadId === currentUser.id)).length;
  const completedClasses = currentUser.completedVideoIds?.length || 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20 lg:pb-0">
      
      {/* WELCOME BANNER */}
      <div className="relative bg-gradient-to-r from-SIMPLEDATA-900 to-SIMPLEDATA-800 p-8 rounded-2xl shadow-lg border border-slate-700 overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Icon name="fa-chart-network" className="text-9xl text-white" />
          </div>
          
          <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Bienvenido, {currentUser.name.split(' ')[0]}</h1>
              <p className="text-slate-300 text-lg mt-2">Panel Principal</p>
              <div className="mt-6 flex flex-wrap gap-4">
                  <button onClick={() => onNavigate(AppRoute.CLASSES)} className="bg-SIMPLEDATA-500 hover:bg-SIMPLEDATA-400 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                      <Icon name="fa-play-circle" /> Ir a mis Clases
                  </button>
                  <button onClick={() => onNavigate(AppRoute.PROJECTS)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                      <Icon name="fa-folder-open" /> Ver Proyectos
                  </button>
              </div>
          </div>
      </div>

      {/* KPIS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                  <Icon name="fa-graduation-cap" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Clases Vistas</p>
                  <h3 className="text-3xl font-bold text-slate-800">{completedClasses}</h3>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
                  <Icon name="fa-project-diagram" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Mis Proyectos Activos</p>
                  <h3 className="text-3xl font-bold text-slate-800">{myProjects}</h3>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl">
                  <Icon name="fa-building" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Total Corporativo</p>
                  <h3 className="text-3xl font-bold text-slate-800">{activeProjects}</h3>
              </div>
          </div>
      </div>

      {/* RECENT ACTIVITY OR QUICK LINKS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Acceso Rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => onNavigate(AppRoute.TEAM)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group">
                  <div className="w-10 h-10 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Icon name="fa-users" className="text-slate-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Equipo</span>
              </button>
              <button onClick={() => onNavigate(AppRoute.GEMS)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group">
                  <div className="w-10 h-10 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Icon name="fa-gem" className="text-purple-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Gemas</span>
              </button>
              {/* Add more as needed */}
          </div>
      </div>
    </div>
  );
};