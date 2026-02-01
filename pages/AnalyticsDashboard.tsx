import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioService } from '../services/apiService';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Activity,
    ArrowLeft,
    Users,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    MousePointer2,
    Clock,
    ChevronRight,
    Loader
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface AnalyticsData {
    portfolioId: string;
    totalViews: number;
    uniqueVisitors: number;
    deviceTypes: Record<string, number>;
    browsers: Record<string, number>;
    countries: Record<string, number>;
    recentEvents: any[];
    cloudflare?: any;
    lastUpdated: string;
}

const AnalyticsDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // If no ID is provided, we might want to fetch all portfolios, but for now 
                // just show a placeholder or fetch the first one if available.
                // The user's request suggests they want a global analytics view or at least consistent design.
                if (!id) {
                    // Fetch all portfolios to show a list or default to the most recent
                    const { portfolios } = await portfolioService.getPortfolios();
                    if (portfolios && portfolios.length > 0) {
                        const firstId = portfolios[0].id;
                        const data = await portfolioService.getAnalytics(firstId!);
                        setData(data);
                    } else {
                        setLoading(false);
                        return;
                    }
                } else {
                    const data = await portfolioService.getAnalytics(id);
                    setData(data);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError('Failed to extract node telemetry');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [id]);

    if (loading) return (
        <DashboardLayout>
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader className="text-teal-500 animate-spin" />

            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout>
            <div className="h-full flex flex-col items-center justify-center gap-4 text-rose-500">
                <Activity className="w-12 h-12 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                <button onClick={() => navigate('/dashboard')} className="text-xs font-bold underline opacity-60">Return to Grid</button>
            </div>
        </DashboardLayout>
    );

    if (!data) return (
        <DashboardLayout>
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-8">
                <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-4 bg-teal-500/5 rounded-full flex items-center justify-center">
                        <Activity className="w-12 h-12 text-teal-500/40" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-3">No Analytics Data Yet</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Deploy your professional portfolio to start monitoring real-time visitor telemetry and global relay activity.
                    </p>
                </div>
               
            </div>
        </DashboardLayout>
    );

    // Transform data for charts
    const deviceData = Object.entries(data.deviceTypes || {}).map(([name, value]) => ({ name, value }));
    const countryData = Object.entries(data.countries || {}).map(([name, value]) => ({ name, value }));

    // Extract Cloudflare stats
    const cfStats = data.cloudflare?.data?.viewer?.accounts?.[0]?.pagesProjects?.[0]?.analytics1dGroups || [];
    const cfChartData = cfStats.map((group: any) => ({
        date: group.dimensions.date,
        views: group.sum.pageViews,
        visitors: group.sum.visits
    })).reverse();

    const totalCFViews = cfStats.reduce((acc: number, curr: any) => acc + curr.sum.pageViews, 0);
    const totalCFVisitors = cfStats.reduce((acc: number, curr: any) => acc + curr.sum.visits, 0);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-12 pb-20 text-left">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Traffic Analytics</h1>
                        <p className="text-sm text-teal-600  font-medium">
                            Monitoring website performance
                        </p>
                    </div>
                   
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                    <StatCard
                        title="Total Page Views"
                        value={totalCFViews || data.totalViews}
                        icon={<MousePointer2 className="w-5 h-5 text-teal-500" />}
                        color="teal"
                    />
                    <StatCard
                        title="Unique Visitors"
                        value={totalCFVisitors || data.uniqueVisitors}
                        icon={<Users className="w-5 h-5 text-blue-500" />}
                        color="blue"
                    />
                    <StatCard
                        title="Top Location"
                        value={countryData[0]?.name || 'Global'}
                        subValue={countryData[0]?.value ? `${countryData[0].value} visitors` : 'No data yet'}
                        icon={<Globe className="w-5 h-5 text-purple-500" />}
                        color="purple"
                    />
                   
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Traffic Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-teal-500" /> Traffic Last 7 Days
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                                        <span className="text-[10px] font-semibold  opacity-60">Views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                                        <span className="text-[10px] font-semibold  opacity-60">Visits</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cfChartData.length > 0 ? cfChartData : generatePlaceholderData()}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#111',
                                                border: 'none',
                                                borderRadius: '16px',
                                                color: '#fff',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                            }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            stroke="#14b8a6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorViews)"
                                            animationDuration={1500}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="visitors"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            strokeDasharray="8 8"
                                            fill="transparent"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Side Distribution Charts */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Distribution Card */}
                        <Card className="border-border bg-white shadow-sm rounded-3xl overflow-hidden h-full">
                            <CardHeader className="p-8">
                                <CardTitle className="text-lg font-bold flex items-center gap-3">
                                    <Monitor className="w-5 h-5 text-orange-500" /> Traffic Source
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="space-y-6">
                                    {deviceData.length > 0 ? deviceData.map(device => (
                                        <div key={device.name} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs font-semibold  text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(device.name)}
                                                    <span>{device.name}</span>
                                                </div>
                                                <span className="text-teal-600">{device.value} visits</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(device.value / Math.max(...deviceData.map(d => d.value))) * 100}%` }}
                                                    className="h-full bg-orange-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center py-10">Waiting for device data...</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, subValue, icon, color }: { title: string, value: string | number, subValue?: string, icon: any, color: string }) => {
    const colors: Record<string, string> = {
        teal: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col gap-6"
        >
            <div className="flex justify-between items-center">
                <div className={`p-4 rounded-2xl border ${colors[color]}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold  text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                </div>
            </div>
            {subValue && (
                <div className="flex items-center gap-2 text-[10px] font-semibold  text-muted-foreground bg-[#F8FAFC] p-3 rounded-xl border border-border/50">
                    <ChevronRight className="w-3 h-3" />
                    {subValue}
                </div>
            )}
        </motion.div>
    );
};

const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-3 h-3" />;
    if (d.includes('tablet')) return <Tablet className="w-3 h-3" />;
    return <Monitor className="w-3 h-3" />;
};

const generatePlaceholderData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 30) + 5
    }));
};

export default React.memo(AnalyticsDashboard);
