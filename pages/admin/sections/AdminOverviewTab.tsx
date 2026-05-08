import React from 'react';
import { CheckCircle, Layout, Users, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import AdminStatCard from './AdminStatCard';

interface AdminOverviewTabProps {
  stats: any;
  users: any[];
  portfolios: any[];
  canViewRevenueStats?: boolean;
}

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  users,
  portfolios,
  canViewRevenueStats = false,
}) => {
  const userGrowthData = Array.isArray(stats?.userGrowth)
    ? stats.userGrowth
      .map((item: any, idx: number) => ({
        _id: String(item?._id ?? idx + 1),
        count: Number(item?.count ?? 0)
      }))
      .filter((item: any) => Number.isFinite(item.count))
    : [];

  const revenueGrowthData = Array.isArray(stats?.revenueGrowth)
    ? stats.revenueGrowth
      .map((item: any, idx: number) => ({
        _id: String(item?._id ?? idx + 1),
        total: Number(item?.total ?? 0)
      }))
      .filter((item: any) => Number.isFinite(item.total))
    : [];
  const canRenderUserGrowthChart = userGrowthData.length > 0;
  const canRenderRevenueChart = revenueGrowthData.length > 0;

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-2 ${canViewRevenueStats ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-2`}>
        {canViewRevenueStats && (
          <AdminStatCard label="Total Revenue" value={`N${(stats?.totalRevenue || 0).toLocaleString()}`} icon={Zap} color="bg-amber-500" />
        )}
        <AdminStatCard label="Total Users" value={`${stats?.totalUsers || users.length} (${stats?.realUsers || 0} Real)`} icon={Users} color="bg-blue-500" />
        <AdminStatCard label="Total Portfolios" value={stats?.totalPortfolios || portfolios.length} icon={Layout} color="bg-purple-500" />
        <AdminStatCard label="Live Sites" value={stats?.liveSites || 0} icon={CheckCircle} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <AdminStatCard label="Total Posts" value={`${stats?.totalPosts || 0} (${stats?.realPosts || 0} Real)`} icon={Layout} color="bg-teal-500" />
        <AdminStatCard label="Social Connections" value={stats?.totalConnections || 0} icon={Users} color="bg-sky-500" />
        <AdminStatCard label="Community Comments" value={stats?.totalComments || 0} icon={CheckCircle} color="bg-rose-500" />
      </div>

      {stats?.growthVelocity && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-24 h-24 text-teal-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Growth Velocity (24h)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Connections</p>
                <p className="text-2xl font-black text-white">+{stats.growthVelocity.newConnections || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Posts</p>
                <p className="text-2xl font-black text-teal-400">+{stats.growthVelocity.newPosts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className={`grid grid-cols-1 ${canViewRevenueStats ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800">User Growth</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 Days</span>
            </div>
            <div className="h-64 w-full">
              {canRenderUserGrowthChart ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="_id" hide />
                    <YAxis hide />
                    <Area type="monotone" dataKey="count" stroke="#0d9488" fillOpacity={1} fill="url(#userGradient)" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                  No user growth data yet
                </div>
              )}
            </div>
          </div>

          {canViewRevenueStats && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800">Revenue Growth</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 Days</span>
              </div>
              <div className="h-64 w-full">
                {canRenderRevenueChart ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueGrowthData}>
                      <XAxis dataKey="_id" hide />
                      <YAxis hide />
                      <Bar dataKey="total" fill="#0f766e" radius={6} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    No revenue growth data yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOverviewTab;
