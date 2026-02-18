import React, { useState } from 'react';
import { User } from '../types';

export const LoginScreen = ({ users, onLogin }: { users: User[], onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('gonzalo.arias@simpledata.cl');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    const storedPass = user?.password;
    const isPassCorrect = storedPass === '' || storedPass === password || (storedPass === '' && password === '1234');

    if (user && isPassCorrect) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas. Contacte a soporte.aiwis@gmail.com si olvidó su clave.');
    }
  };

  const handleRootLogin = () => {
      setEmail('aiwis');
      setPassword('123123');
      // Auto submit logic requires state update delay, simpler to just fill
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-SIMPLEDATA-900 rounded-2xl items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">S</div>
          <h1 className="text-2xl font-bold text-SIMPLEDATA-900">SIMPLEDATA Portal</h1>
          <p className="text-slate-500">Acceso Seguro Corporativo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
              <input type="text" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-SIMPLEDATA-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input type="password" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-SIMPLEDATA-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="Su contraseña asignada" />
              <p className="text-[10px] text-slate-400 mt-1">* Deje en blanco si su usuario no requiere clave.</p>
           </div>
           {error && <p className="text-red-500 text-sm text-center">{error}</p>}
           <button type="submit" className="w-full bg-SIMPLEDATA-600 hover:bg-SIMPLEDATA-700 text-white font-bold py-3 rounded-lg transition-colors">Ingresar</button>
        </form>
        
        <div className="mt-8 border-t pt-4">
             <button onClick={handleRootLogin} className="w-full py-2 bg-slate-800 text-slate-400 text-xs rounded hover:bg-black hover:text-white transition-colors">
                 Ingreso Rápido Master Root
             </button>
        </div>

        <div className="mt-2 text-center text-xs text-slate-400">Protected by SIMPLEDATA Auth v3.1</div>
      </div>
    </div>
  );
};