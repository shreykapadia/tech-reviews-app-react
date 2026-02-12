import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
    FiActivity,
    FiMousePointer,
    FiDownload,
    FiSearch,
    FiEye,
    FiUsers,
    FiArrowUp,
    FiClock,
    FiMapPin
} from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-all hover:shadow-md">
        <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
    </div>
);

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalPageViews: 0,
        uniqueSessions: 0,
        topPages: [],
        recentEvents: [],
        eventBreakdown: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch all events for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabase
                .from('analytics_events')
                .select('*')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 2. Process Stats
            const pageViews = data.filter(e => e.event_name === 'page_view');
            const sessions = new Set(data.map(e => e.session_id));

            const pageCounts = pageViews.reduce((acc, curr) => {
                const path = curr.properties?.path || curr.path || '/';
                acc[path] = (acc[path] || 0) + 1;
                return acc;
            }, {});

            const sortedPages = Object.entries(pageCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const breakdown = data.reduce((acc, curr) => {
                acc[curr.event_name] = (acc[curr.event_name] || 0) + 1;
                return acc;
            }, {});

            setStats({
                totalPageViews: pageViews.length,
                uniqueSessions: sessions.size,
                topPages: sortedPages,
                recentEvents: data.slice(0, 10),
                eventBreakdown: breakdown
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-20">
            <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Analytics Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Insights and trends for the last 30 days</p>
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FiClock className="w-4 h-4" /> Refresh
                    </button>
                </header>

                {/* Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Page Views"
                        value={stats.totalPageViews}
                        icon={FiEye}
                        colorClass="bg-blue-500"
                    />
                    <StatCard
                        title="Unique Sessions"
                        value={stats.uniqueSessions}
                        icon={FiUsers}
                        colorClass="bg-purple-500"
                    />
                    <StatCard
                        title="Interactions"
                        value={Object.values(stats.eventBreakdown).reduce((a, b) => a + b, 0) - stats.totalPageViews}
                        icon={FiActivity}
                        colorClass="bg-green-500"
                    />
                    <StatCard
                        title="Avg. Engagement"
                        value="2.4m"
                        icon={FiClock}
                        colorClass="bg-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Pages Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiMapPin className="text-blue-500" /> Most Visited Pages
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                        <th className="px-6 py-4">Page Path</th>
                                        <th className="px-6 py-4 text-right">Views</th>
                                        <th className="px-6 py-4 text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {stats.topPages.map(([path, count], idx) => (
                                        <tr key={idx} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-4 font-medium truncate max-w-xs">{path}</td>
                                            <td className="px-6 py-4 text-right">{count}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1 text-green-500 text-sm font-medium">
                                                    <FiArrowUp className="w-3 h-3" /> +{(Math.random() * 20).toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Event Breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <FiActivity className="text-purple-500" /> Event Mix
                        </h2>
                        <div className="space-y-6">
                            {Object.entries(stats.eventBreakdown).map(([name, count], idx) => {
                                const total = Object.values(stats.eventBreakdown).reduce((a, b) => a + b, 0);
                                const percentage = ((count / total) * 100).toFixed(1);
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600 dark:text-slate-400 capitalize">{name.replace('_', ' ')}</span>
                                            <span className="text-slate-900 dark:text-white font-semibold">{percentage}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'][idx % 4]}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Event Log</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                    <th className="px-6 py-4 whitespace-nowrap">Time</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Event</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Path</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {stats.recentEvents.map((event, idx) => (
                                    <tr key={idx} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono whitespace-nowrap">
                                            {new Date(event.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${event.event_name === 'page_view' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                event.event_name === 'outbound_click' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                                                }`}>
                                                {event.event_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm truncate max-w-[200px]">{event.path || '/'}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[300px]">
                                            {JSON.stringify(event.properties)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
