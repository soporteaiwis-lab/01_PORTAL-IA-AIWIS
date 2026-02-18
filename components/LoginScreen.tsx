import React, { useState } from 'react';
import { User } from '../types';

export const LoginScreen = ({ users, onLogin }: { users: User[], onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('soporte.aiwis@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Allow passwordless for specific demo users or check password
    const storedPass = user?.password;
    const isPassCorrect = storedPass === '' || storedPass === password || (storedPass === '' && password === '1234');

    if (user && isPassCorrect) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas. Contacte a soporte.aiwis@gmail.com');
    }
  };

  const handleRootLogin = () => {
      setEmail('aiwis');
      setPassword('123123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex w-16 h-16 bg-slate-900 rounded-2xl items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg border border-slate-700">A</div>
          <h1 className="text-2xl font-bold text-slate-900">AIWIS PORTAL IA</h1>
          <p className="text-slate-500 text-sm">Acceso Corporativo & Mentoring</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Corporativo</label>
              <input type="text" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" value={email} onChange={e => setEmail(e.target.value)} />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
              <input type="password" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
           </div>
           {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
           <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">Ingresar</button>
        </form>
        
        <div className="mt-8 border-t pt-4">
             <button onClick={handleRootLogin} className="w-full py-2 text-slate-400 text-xs hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                 <i className="fa-solid fa-key"></i> Acceso Master Root
             </button>
        </div>

        <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Powered by AIWIS</p>
            <p className="text-[9px] text-slate-300">Armin Salazar CEO</p>
        </div>
      </div>
    </div>
  );
};