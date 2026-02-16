import React from 'react';

export const RenderField = ({ label, value, icon: Icon, isBool }) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-full">
      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 flex items-center gap-1">
          {Icon && <Icon size={10} />} {label}
      </span>
      {isBool ? (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              {value ? 'SÍ' : 'NO'}
          </span>
      ) : (
          value ? (
              <p className="text-sm font-bold text-slate-700 break-words">{value}</p>
          ) : (
              <p className="text-xs text-slate-400 italic">No registrado</p>
          )
      )}
  </div>
);