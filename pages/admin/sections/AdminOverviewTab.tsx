import React from 'react';
import { CheckCircle, Layout, Users, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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
  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-2 ${canViewRevenueStats ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-2`}>
        {canViewRevenueStats && (
          <AdminStatCard label="Total Revenue" value={`N${(stats?.totalRevenue || 0).toLocaleString()}`} icon={Zap} color="bg-amber-500" />
        )}
        <AdminStatCard label="Total Users" value={stats?.totalUsers || users.length} icon={Users} color="bg-blue-500" />
        <AdminStatCard label="Total Portfolios" value={stats?.totalPortfolios || portfolios.length} icon={Layout} color="bg-purple-500" />
        <AdminStatCard label="Live Sites" value={stats?.liveSites || 0} icon={CheckCircle} color="bg-emerald-500" />
      </div>

      {stats && (
        <div className={`grid grid-cols-1 ${canViewRevenueStats ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800">User Growth</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 Days</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.userGrowth}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" hide />
                  <YAxis hide />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="count" stroke="#0d9488" fillOpacity={1} fill="url(#userGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {canViewRevenueStats && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800">Revenue Growth</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 Days</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" hide />
                    <YAxis hide />
                    <RechartsTooltip />
                    <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOverviewTab;
