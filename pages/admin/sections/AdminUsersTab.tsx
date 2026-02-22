import React from 'react';

interface AdminUsersTabProps {
  users: any[];
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users }) => {
  return (
    <div>
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                      {u.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {u.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold uppercase ${u.roles?.includes('admin') ? 'text-teal-600' : 'text-slate-400'}`}>
                    {u.roles?.join(', ') || 'user'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shrink-0">
              {u.fullName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{u.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {u.isVerified ? 'Verified' : 'Pending'}
                </span>
                <span className={`text-[10px] font-bold uppercase ${u.roles?.includes('admin') ? 'text-teal-600' : 'text-slate-400'}`}>
                  {u.roles?.join(', ') || 'user'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 shrink-0">{new Date(u.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersTab;
