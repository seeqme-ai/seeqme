import React from 'react';
import { ExternalLink, FileEdit, Layout, Trash2, Zap } from 'lucide-react';

interface AdminPortfoliosTabProps {
  portfolios: any[];
  users: any[];
  onOpenConfirm: (type: 'deploy' | 'delete', id: string) => void;
}

const AdminPortfoliosTab: React.FC<AdminPortfoliosTabProps> = ({ portfolios, users, onOpenConfirm }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {portfolios.map((p) => (
        <div key={p.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex justify-between items-start mb-4">
              {(() => {
                const isLive = Boolean(p.isPublished || p.status === 'completed' || p.status === 'live');
                return (
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isLive ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Layout className="w-5 h-5" />
                  </div>
                );
              })()}
              {(() => {
                const isLive = Boolean(p.isPublished || p.status === 'completed' || p.status === 'live');
                return (
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${isLive ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {isLive ? 'Live' : 'Draft'}
                  </span>
                );
              })()}
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors text-sm sm:text-base">{p.title}</h3>
            <p className="text-xs text-slate-500 mb-3 font-medium italic">Owner: {users.find(u => u.id === p.userId)?.fullName || 'Guest'}</p>
            {p.domain && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-4 truncate">
                <ExternalLink className="w-3 h-3 shrink-0" />
                {p.domain}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => window.open(`/builder?id=${p.id}`, '_blank')}
              className="flex-1 bg-teal-50 text-teal-600 hover:bg-teal-100 text-[10px] font-black p-3 rounded-xl transition-all uppercase flex items-center justify-center gap-1.5"
            >
              <FileEdit className="w-3 h-3" /> Studio
            </button>
            {!(p.isPublished || p.status === 'completed' || p.status === 'live') && (
              <button
                onClick={() => onOpenConfirm('deploy', p.id)}
                className="flex-1 bg-teal-600 text-white text-[10px] font-black p-3 rounded-xl hover:bg-teal-700 transition-all uppercase shadow-lg shadow-teal-500/20 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-white" /> Deploy
              </button>
            )}
            <button
              onClick={() => onOpenConfirm('delete', p.id)}
              className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPortfoliosTab;
