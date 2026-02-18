import React from 'react';
import { TrainingModule } from '../types';

const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <i className={`fa-solid ${name} ${className}`}></i>
);

export const StudyGuideModal = ({ modules, onClose }: { modules: TrainingModule[], onClose: () => void }) => {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Guía de Estudios</h2>
                        <p className="text-slate-500 text-sm">Contenido completo de la capacitación</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Icon name="fa-print" /> Imprimir / PDF
                        </button>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center">
                            <Icon name="fa-times" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 print:p-0">
                    <div className="text-center mb-10 border-b pb-8">
                         <h1 className="text-3xl font-bold text-slate-900 mb-2">Plan de Capacitación Corporativo</h1>
                         <p className="text-slate-500">Documento Oficial de Contenidos</p>
                    </div>

                    <div className="space-y-8">
                        {modules.map((mod, idx) => (
                            <div key={mod.id} className="break-inside-avoid">
                                <h3 className="text-xl font-bold text-blue-800 border-l-4 border-blue-600 pl-3 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">{idx + 1}</span>
                                    {mod.title}
                                </h3>
                                <p className="text-slate-600 mb-4 pl-11">{mod.description}</p>
                                
                                <div className="ml-11 grid gap-3">
                                    {mod.videos.map((vid, vIdx) => (
                                        <div key={vid.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    <Icon name={vid.type === 'meet' ? 'fa-video' : 'fa-play-circle'} className="text-slate-400" />
                                                    {vid.title}
                                                </h4>
                                                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                                    <span><Icon name="fa-clock" /> {vid.duration}</span>
                                                    {vid.quizUrl && <span className="text-green-600 font-bold"><Icon name="fa-tasks" /> Evaluación Disponible</span>}
                                                </div>
                                            </div>
                                            <a href={vid.url} target="_blank" className="text-blue-600 text-xs font-bold hover:underline print:hidden">
                                                Ver Recurso <Icon name="fa-external-link-alt" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};