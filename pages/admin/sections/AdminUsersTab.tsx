import React from 'react';

type AccessKey = 'overview' | 'chats' | 'users' | 'portfolios' | 'notifications' | 'templates' | 'config';

const ADMIN_ACCESS_OPTIONS: { key: AccessKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'chats', label: 'Chats' },
  { key: 'users', label: 'Users' },
  { key: 'portfolios', label: 'Portfolios' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'templates', label: 'Templates' },
  { key: 'config', label: 'System Config' },
];

interface AdminUsersTabProps {
  users: any[];
  currentUserId?: string;
  isSavingUserId: string | null;
  canManagePermissions?: boolean;
  onSavePermissions: (userId: string, roles: string[], adminPageAccess: string[]) => Promise<void>;
}

const ensureAdminRole = (roles: string[]): string[] => {
  const normalized = (roles || []).map((r) => String(r).toLowerCase());
  return normalized.includes('admin') ? ['user', 'admin'] : ['user'];
};

const sanitizeAccess = (access: string[]): AccessKey[] => {
  const normalized = (access || []).map((a) => String(a).toLowerCase()) as AccessKey[];
  return ADMIN_ACCESS_OPTIONS.map((o) => o.key).filter((key) => normalized.includes(key));
};

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users, currentUserId, onSavePermissions, isSavingUserId, canManagePermissions = false }) => {
  const [draftRolesByUser, setDraftRolesByUser] = React.useState<Record<string, string[]>>({});
  const [draftAccessByUser, setDraftAccessByUser] = React.useState<Record<string, AccessKey[]>>({});

  const getDraftRoles = (u: any) => draftRolesByUser[u.id] || ensureAdminRole(u.roles || []);
  const getDraftAccess = (u: any) => draftAccessByUser[u.id] || sanitizeAccess(u.adminPageAccess || []);

  const setRole = (u: any, role: 'user' | 'admin') => {
    const nextRoles = role === 'admin' ? ['user', 'admin'] : ['user'];
    setDraftRolesByUser((prev) => ({ ...prev, [u.id]: nextRoles }));
    if (role === 'user') {
      setDraftAccessByUser((prev) => ({ ...prev, [u.id]: [] }));
      return;
    }
    if (!draftAccessByUser[u.id] || draftAccessByUser[u.id].length === 0) {
      setDraftAccessByUser((prev) => ({ ...prev, [u.id]: ADMIN_ACCESS_OPTIONS.map((o) => o.key) }));
    }
  };

  const toggleAccess = (userId: string, key: AccessKey) => {
    setDraftAccessByUser((prev) => {
      const current = prev[userId] || [];
      return current.includes(key)
        ? { ...prev, [userId]: current.filter((k) => k !== key) }
        : { ...prev, [userId]: [...current, key] };
    });
  };

  const renderPermissionEditor = (u: any) => {
    if (!canManagePermissions) {
      return (
        <p className="text-[11px] text-slate-500 font-medium">
          Read-only. You do not have permission to assign roles or privileges.
        </p>
      );
    }

    const draftRoles = getDraftRoles(u);
    const isAdmin = draftRoles.includes('admin');
    const draftAccess = getDraftAccess(u);
    const isSelf = currentUserId === u.id;

    return (
      <div className="space-y-2">
        <select
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500"
          value={isAdmin ? 'admin' : 'user'}
          onChange={(e) => setRole(u, e.target.value as 'user' | 'admin')}
          disabled={isSelf}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {isAdmin && (
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_ACCESS_OPTIONS.map((opt) => (
              <label key={`${u.id}-${opt.key}`} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={draftAccess.includes(opt.key)}
                  onChange={() => toggleAccess(u.id, opt.key)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        )}

        <button
          onClick={() => onSavePermissions(u.id, draftRoles, draftAccess)}
          disabled={isSavingUserId === u.id || isSelf || (isAdmin && draftAccess.length === 0)}
          className="w-full rounded-xl bg-teal-600 text-white text-[10px] font-black uppercase py-2 disabled:opacity-50 hover:bg-teal-700 transition-colors"
        >
          {isSavingUserId === u.id ? 'Saving...' : isSelf ? 'Cannot edit self' : 'Save'}
        </button>
      </div>
    );
  };

  return (
    <div>
      {!canManagePermissions && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
          Role and privilege management is restricted.
        </div>
      )}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors align-top">
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
                <td className="px-6 py-4 min-w-[260px]">
                  {renderPermissionEditor(u)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
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
            <div className="mt-3">
              {renderPermissionEditor(u)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersTab;
