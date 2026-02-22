import React from 'react';

const AdminStatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 sm:gap-5">
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default AdminStatCard;
