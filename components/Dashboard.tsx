import React, { useState, useEffect } from 'react';
import { User, Project, UserRole, TrainingModule, TrainingVideo } from '../types';
import { db } from '../services/dbService';
import { StudyGuideModal } from './StudyGuideModal';

const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <i className={`fa-solid ${name} ${className}`}></i>
);

export const Dashboard = ({ currentUser, projects }: { currentUser: User, projects: Project[] }) => {
  const isMaster = currentUser.role === UserRole.MASTER_ROOT;
  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.CEO || isMaster;
  
  // State for Training Portal
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [companyConfig, setCompanyConfig] = useState({ title: 'PORTAL CORPORATIVO', subtitle: 'Centro de Capacitación' });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  
  // Completed Videos tracking (Local State for UI update)
  const [watchedVideos, setWatchedVideos] = useState<string[]>(currentUser.completedVideoIds || []);

  // Master Root Edit Modes
  const [isAddingVideo, setIsAddingVideo] = useState<{modId: string} | null>(null);
  
  // Edit States
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [editingVideo, setEditingVideo] = useState<{modId: string, vid: TrainingVideo} | null>(null);

  useEffect(() => {
      loadPortalData();
  }, []);

  const loadPortalData = async () => {
      const ms = await db.getModules();
      const cfg = db.getCompanyConfig();
      setModules(ms.sort((a,b) => a.order - b.order));
      setCompanyConfig(cfg);
  };

  const handleTitleSave = () => {
      db.saveCompanyConfig(companyConfig);
      setIsEditingTitle(false);
      // Force reload to update sidebar instantly (quick hack, ideally context)
      window.location.reload(); 
  };

  const handleToggleWatched = async (videoId: string) => {
      const newWatched = watchedVideos.includes(videoId) 
          ? watchedVideos.filter(id => id !== videoId)
          : [...watchedVideos, videoId];
      
      setWatchedVideos(newWatched);
      
      const updatedUser = { ...currentUser, completedVideoIds: newWatched };
      await db.updateUser(updatedUser);
  };

  // --- MASTER ROOT CRUD ---
  const handleAddModule = async () => {
      const title = prompt("Título del Nuevo Módulo:");
      if (!title) return;
      const newMod: TrainingModule = {
          id: 'mod_' + Date.now(),
          title,
          description: 'Nueva sección de aprendizaje.',
          videos: [],
          order: modules.length + 1
      };
      await db.addModule(newMod);
      loadPortalData();
  };

  const handleUpdateModule = async () => {
      if (!editingModule) return;
      await db.updateModule(editingModule);
      setEditingModule(null);
      loadPortalData();
  };

  const handleDeleteModule = async (id: string) => {
      if(confirm("¿Eliminar módulo y todos sus videos?")) {
          await db.deleteModule(id);
          loadPortalData();
      }
  };

  const handleSaveVideo = async (modId: string, title: string, url: string, type: 'video'|'meet', duration?: string) => {
      const module = modules.find(m => m.id === modId);
      if (!module) return;
      
      const newVideo: TrainingVideo = {
          id: 'v_' + Date.now(),
          title,
          url,
          type,
          duration: duration || '10 min'
      };
      const updatedMod = { ...module, videos: [...module.videos, newVideo] };
      await db.updateModule(updatedMod);
      loadPortalData();
      setIsAddingVideo(null);
  };

  const handleUpdateVideo = async () => {
      if (!editingVideo) return;
      const module = modules.find(m => m.id === editingVideo.modId);
      if (!module) return;

      const updatedVideos = module.videos.map(v => v.id === editingVideo.vid.id ? editingVideo.vid : v);
      await db.updateModule({ ...module, videos: updatedVideos });
      setEditingVideo(null);
      loadPortalData();
  };

  const handleDeleteVideo = async (modId: string, vidId: string) => {
      if (!confirm("¿Borrar clase?")) return;
      const module = modules.find(m => m.id === modId);
      if (!module) return;
      
      const updatedVideos = module.videos.filter(v => v.id !== vidId);
      await db.updateModule({ ...module, videos: updatedVideos });
      loadPortalData();
  }

  // --- RENDER HELPERS ---
  const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
          return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; 
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 lg:pb-0">
      
      {/* HEADER SECTION (EDITABLE BY MASTER) */}
      <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Icon name="fa-graduation-cap" className="text-9xl text-SIMPLEDATA-900" />
          </div>
          
          <div className="relative z-10">
              {isEditingTitle ? (
                  <div className="flex flex-col gap-2 max-w-md">
                      <input className="text-3xl font-bold border p-2 rounded" value={companyConfig.title} onChange={e => setCompanyConfig({...companyConfig, title: e.target.value})} />
                      <input className="text-lg text-slate-500 border p-2 rounded" value={companyConfig.subtitle} onChange={e => setCompanyConfig({...companyConfig, subtitle: e.target.value})} />
                      <button onClick={handleTitleSave} className="bg-green-600 text-white px-4 py-2 rounded font-bold w-fit mt-2">Guardar Cambios</button>
                  </div>
              ) : (
                  <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-SIMPLEDATA-900 uppercase tracking-tight">{companyConfig.title}</h1>
                      <p className="text-slate-500 text-lg mt-2">{companyConfig.subtitle}</p>
                      <p className="text-sm text-slate-400 mt-1">Bienvenido, {currentUser.name}</p>
                  </div>
              )}
          </div>

          {/* Master Controls */}
          {isMaster && !isEditingTitle && (
              <button onClick={() => setIsEditingTitle(true)} className="absolute top-4 right-4 text-slate-300 hover:text-blue-500 z-20 text-xs flex items-center gap-1">
                  <Icon name="fa-pen" /> Editar Título
              </button>
          )}

          {/* Quick Stats for Student */}
          {!isAdmin && (
              <div className="mt-6 flex gap-4">
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold border border-green-100">
                      {watchedVideos.length} Clases Completadas
                  </div>
                  <button onClick={() => setShowStudyGuide(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2">
                      <Icon name="fa-book-open" /> Ver Guía de Estudios
                  </button>
              </div>
          )}
      </div>

      {/* MASTER CONTROLS BAR */}
      {isMaster && (
          <div className="flex gap-4 p-4 bg-slate-800 rounded-xl text-white items-center">
              <span className="font-bold text-yellow-400"><Icon name="fa-crown" /> MASTER ROOT:</span>
              <button onClick={handleAddModule} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm font-bold transition-colors">
                  + Nuevo Módulo
              </button>
              <button onClick={() => setShowStudyGuide(true)} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm font-bold transition-colors">
                  Ver Guía Completa
              </button>
          </div>
      )}

      {/* TRAINING MODULES (NETFLIX STYLE) */}
      <div className="space-y-12">
          {modules.map(module => (
              <div key={module.id} className="relative group/module">
                  <div className="flex justify-between items-end mb-4 px-2">
                      <div className="group/title relative">
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                              {module.title}
                              {isMaster && (
                                  <>
                                    <button onClick={() => setEditingModule(module)} className="text-xs text-slate-300 hover:text-blue-500"><Icon name="fa-pen"/></button>
                                    <button onClick={() => handleDeleteModule(module.id)} className="text-xs text-slate-300 hover:text-red-500"><Icon name="fa-trash"/></button>
                                  </>
                              )}
                          </h2>
                          <p className="text-sm text-slate-500">{module.description}</p>
                      </div>
                      {isMaster && (
                          <button onClick={() => setIsAddingVideo({modId: module.id})} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200">
                              + Video
                          </button>
                      )}
                  </div>

                  {/* Horizontal Scroll Container */}
                  <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
                      {module.videos.map(video => {
                          const isWatched = watchedVideos.includes(video.id);
                          return (
                              <div key={video.id} className="snap-start shrink-0 w-[300px] md:w-[350px] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all relative flex flex-col group/card">
                                  
                                  {/* Thumbnail / Video Placeholder */}
                                  <div className="h-44 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                      {video.url.includes('youtube') ? (
                                           <img 
                                              src={`https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`} 
                                              className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity"
                                           />
                                      ) : (
                                          <Icon name="fa-chalkboard-teacher" className="text-5xl text-slate-700" />
                                      )}
                                      <a href={video.url} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg scale-90 group-hover/card:scale-100 transition-transform">
                                              <Icon name="fa-play" className="ml-1" />
                                          </div>
                                      </a>
                                      {/* Duration Badge */}
                                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                          {video.duration}
                                      </div>

                                      {/* MASTER EDIT VIDEO */}
                                      {isMaster && (
                                          <div className="absolute top-2 right-2 flex gap-1 z-20">
                                              <button onClick={() => setEditingVideo({modId: module.id, vid: video})} className="w-6 h-6 bg-slate-800 hover:bg-blue-600 text-white rounded text-[10px] flex items-center justify-center"><Icon name="fa-pen"/></button>
                                              <button onClick={() => handleDeleteVideo(module.id, video.id)} className="w-6 h-6 bg-slate-800 hover:bg-red-600 text-white rounded text-[10px] flex items-center justify-center"><Icon name="fa-trash"/></button>
                                          </div>
                                      )}
                                  </div>

                                  {/* Content */}
                                  <div className="p-4 flex-1 flex flex-col">
                                      <div className="flex justify-between items-start mb-2">
                                          <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight h-10">{video.title}</h3>
                                          {isWatched && <Icon name="fa-check-circle" className="text-green-500 text-lg shrink-0" />}
                                      </div>
                                      
                                      <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100">
                                          <button 
                                            onClick={() => handleToggleWatched(video.id)}
                                            className={`flex-1 text-xs font-bold py-2 rounded transition-colors ${isWatched ? 'bg-slate-100 text-slate-500' : 'bg-SIMPLEDATA-600 text-white hover:bg-SIMPLEDATA-700'}`}
                                          >
                                              {isWatched ? 'Visto' : 'Marcar Visto'}
                                          </button>
                                          {video.quizUrl && (
                                              <a href={video.quizUrl} target="_blank" className="flex-1 text-xs font-bold py-2 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center gap-1">
                                                  <Icon name="fa-tasks" /> Quiz
                                              </a>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      
                      {/* Add Video Card Placeholder for Master */}
                      {isMaster && (
                           <div onClick={() => setIsAddingVideo({modId: module.id})} className="snap-start shrink-0 w-[100px] flex items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-200 hover:border-slate-400 transition-colors">
                               <div className="text-center text-slate-400">
                                   <Icon name="fa-plus" className="text-2xl block mb-1" />
                                   <span className="text-xs font-bold">Agregar</span>
                               </div>
                           </div>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {/* MODALS */}
      
      {/* Add Video Modal */}
      {isAddingVideo && (
          <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">Agregar Video a Módulo</h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const t = e.target as any;
                      handleSaveVideo(isAddingVideo.modId, t.title.value, t.url.value, 'video', t.duration.value);
                  }}>
                      <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                      <input name="title" className="w-full border p-2 rounded mb-2" required />
                      
                      <label className="text-xs font-bold text-slate-500 uppercase">URL (Youtube/Meet)</label>
                      <input name="url" className="w-full border p-2 rounded mb-2" required />
                      
                      <label className="text-xs font-bold text-slate-500 uppercase">Duración (Ej: 15 min)</label>
                      <input name="duration" className="w-full border p-2 rounded mb-4" placeholder="10 min" />

                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsAddingVideo(null)} className="px-3 py-1 text-slate-500">Cancelar</button>
                          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded font-bold">Guardar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
          <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">Editar Módulo</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                          <input className="w-full border p-2 rounded" value={editingModule.title} onChange={e => setEditingModule({...editingModule, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                          <textarea className="w-full border p-2 rounded h-20" value={editingModule.description} onChange={e => setEditingModule({...editingModule, description: e.target.value})} />
                      </div>
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingModule(null)} className="px-3 py-1 text-slate-500">Cancelar</button>
                          <button onClick={handleUpdateModule} className="px-3 py-1 bg-blue-600 text-white rounded font-bold">Guardar</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
          <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">Editar Video</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                          <input className="w-full border p-2 rounded" value={editingVideo.vid.title} onChange={e => setEditingVideo({...editingVideo, vid: {...editingVideo.vid, title: e.target.value}})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">URL</label>
                          <input className="w-full border p-2 rounded" value={editingVideo.vid.url} onChange={e => setEditingVideo({...editingVideo, vid: {...editingVideo.vid, url: e.target.value}})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Duración</label>
                          <input className="w-full border p-2 rounded" value={editingVideo.vid.duration} onChange={e => setEditingVideo({...editingVideo, vid: {...editingVideo.vid, duration: e.target.value}})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">URL Quiz (Opcional)</label>
                          <input className="w-full border p-2 rounded" value={editingVideo.vid.quizUrl || ''} onChange={e => setEditingVideo({...editingVideo, vid: {...editingVideo.vid, quizUrl: e.target.value}})} />
                      </div>
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingVideo(null)} className="px-3 py-1 text-slate-500">Cancelar</button>
                          <button onClick={handleUpdateVideo} className="px-3 py-1 bg-blue-600 text-white rounded font-bold">Guardar</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Study Guide Modal */}
      {showStudyGuide && <StudyGuideModal modules={modules} onClose={() => setShowStudyGuide(false)} />}
    </div>
  );
};