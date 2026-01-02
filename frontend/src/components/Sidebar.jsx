import React from 'react';
import { Users } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-72 bg-slate-900 flex-col p-8 text-white sticky top-0 h-screen">
      <div className="mb-12">
        <div className="text-2xl font-black tracking-tighter text-white">
          CECA<span className="text-indigo-400">MED</span>
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">
          Panel de Control
        </p>
      </div>
      <nav className="space-y-2">
        <a href="#" className="flex items-center space-x-3 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-900/20">
          <Users size={20} /> 
          <span className="font-semibold">Atendidos</span>
        </a>
      </nav>
    </aside>
  );
};