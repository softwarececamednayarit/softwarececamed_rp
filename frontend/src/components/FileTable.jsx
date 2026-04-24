import React from 'react';
import { FileText, ExternalLink, MoreVertical, Download } from 'lucide-react';

const FileTable = ({ archivos, onRefresh }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Oficio</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {archivos.map((file) => (
            <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]">
                      {file.nombreOriginal || 'Sin nombre'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{file.propietarioRol}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  {file.noOficio}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-600 font-medium">
                  {new Date(file.fechaRegistroSistema).toLocaleDateString()}
                </p>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;