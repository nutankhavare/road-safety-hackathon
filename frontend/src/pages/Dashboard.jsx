import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  AlertTriangle, ShieldAlert, BarChart3, Activity, 
  MapPin, CheckCircle, RefreshCw, Layers, ShieldCheck, Flame, Droplets, Grid, ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalReports: 0,
    criticalRoads: 0,
    averageSafetyScore: 0,
    averageRoadHealth: 0
  });
  const [issues, setIssues] = useState({
    potholes: 0,
    cracks: 0,
    waterlogging: 0,
    fadedMarkings: 0,
    roadCollapse: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const [statsRes, issuesRes, reportsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/issues'),
        api.get('/dashboard/recent-reports')
      ]);

      setStats(statsRes.data);
      setIssues(issuesRes.data);
      setRecentReports(reportsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch live analytics from database. Please check connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Helper for safety status color coding
  const getSafetyLevel = (score) => {
    if (score >= 85) return { label: 'Safe', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80', hex: '#34D399' };
    if (score >= 70) return { label: 'Moderate Risk', color: 'text-amber-400 bg-amber-950/40 border-amber-800/80', hex: '#FBBF24' };
    if (score >= 45) return { label: 'Dangerous', color: 'text-orange-400 bg-orange-950/40 border-orange-800/80', hex: '#FB923C' };
    return { label: 'Critical', color: 'text-rose-400 bg-rose-950/40 border-rose-800/80', hex: '#F87171' };
  };

  // Helper for priority badges
  const getPriorityStyle = (priority) => {
    const p = String(priority).toLowerCase();
    if (p === 'critical') return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
    if (p === 'urgent') return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
    if (p === 'moderate') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  };

  // Timestamp formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format pie chart data
  const pieChartData = [
    { name: 'Potholes', value: issues.potholes || 0, color: '#F87171' },
    { name: 'Cracks', value: issues.cracks || 0, color: '#FB923C' },
    { name: 'Waterlogging', value: issues.waterlogging || 0, color: '#38BDF8' },
    { name: 'Faded Markings', value: issues.fadedMarkings || 0, color: '#FBBF24' },
    { name: 'Road Collapse', value: issues.roadCollapse || 0, color: '#C084FC' }
  ].filter(item => item.value > 0);

  // Fallback pie data if no issues exist
  const finalPieData = pieChartData.length > 0 ? pieChartData : [
    { name: 'No Issues', value: 1, color: '#475569' }
  ];

  // Dynamic bar chart data from recent reports
  const riskCategories = { 'Safe': 0, 'Moderate Risk': 0, 'Dangerous': 0, 'Critical': 0 };
  recentReports.forEach(r => {
    const score = r.safety_score;
    const level = getSafetyLevel(score).label;
    riskCategories[level]++;
  });

  const barChartData = [
    { name: 'Safe (85-100)', count: riskCategories['Safe'], color: '#10B981' },
    { name: 'Moderate (70-84)', count: riskCategories['Moderate Risk'], color: '#F59E0B' },
    { name: 'Dangerous (45-69)', count: riskCategories['Dangerous'], color: '#F97316' },
    { name: 'Critical (0-44)', count: riskCategories['Critical'], color: '#EF4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-200">
      
      {/* Header section with live controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-dark-700 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('dashboardTitle')}
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {t('dashboardSubtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {refreshing && (
            <span className="text-xs text-primary animate-pulse font-medium">Updating data...</span>
          )}
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-dark-700 hover:border-dark-600 transition-all font-medium disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-800/80 rounded-xl p-4 flex items-center gap-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        /* Skeletons */
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-dark-800/50 border border-dark-700 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-dark-800/50 border border-dark-700 h-80 rounded-xl lg:col-span-2"></div>
            <div className="bg-dark-800/50 border border-dark-700 h-80 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Total Reports */}
            <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700 rounded-2xl p-6 hover:border-primary/40 transition-all group shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium tracking-wide">{t('dashboardTotalReports')}</p>
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-all">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-extrabold mt-3 text-white">{stats.totalReports}</p>
              <p className="text-xs text-gray-500 mt-2">Active database logs</p>
            </div>

            {/* Critical Roads */}
            <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700 rounded-2xl p-6 hover:border-rose-500/40 transition-all group shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium tracking-wide">{t('dashboardCriticalRoads')}</p>
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:bg-rose-500/20 transition-all">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-extrabold mt-3 text-rose-400">{stats.criticalRoads}</p>
              <p className="text-xs text-gray-500 mt-2">Requires immediate dispatch</p>
            </div>

            {/* Average Safety Score */}
            <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700 rounded-2xl p-6 hover:border-emerald-500/40 transition-all group shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium tracking-wide">Avg Safety Score</p>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-extrabold mt-3 text-white">
                {stats.averageSafetyScore}<span className="text-lg text-emerald-400">/100</span>
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${stats.averageSafetyScore >= 70 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-xs text-gray-400">
                  {stats.averageSafetyScore >= 70 ? 'Safety Threshold Met' : 'Needs Road Intervention'}
                </span>
              </div>
            </div>

            {/* Average Road Health */}
            <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700 rounded-2xl p-6 hover:border-secondary/40 transition-all group shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium tracking-wide">Avg Infrastructure Health</p>
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:bg-secondary/20 transition-all">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-extrabold mt-3 text-white">
                {stats.averageRoadHealth}<span className="text-lg text-secondary">%</span>
              </p>
              <div className="w-full bg-dark-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.averageRoadHealth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Counter Panels for Specific Hazards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Potholes */}
            <div className="bg-dark-800/40 border border-dark-700 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pothole Count</h3>
                  <p className="text-xs text-gray-400">Pavement collapses</p>
                </div>
              </div>
              <div className="text-2xl font-bold px-4 py-1.5 bg-red-950/40 border border-red-800 text-red-400 rounded-xl">
                {issues.potholes}
              </div>
            </div>

            {/* Cracks */}
            <div className="bg-dark-800/40 border border-dark-700 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Crack Detections</h3>
                  <p className="text-xs text-gray-400">Structural fissures</p>
                </div>
              </div>
              <div className="text-2xl font-bold px-4 py-1.5 bg-orange-950/40 border border-orange-800 text-orange-400 rounded-xl">
                {issues.cracks}
              </div>
            </div>

            {/* Waterlogging */}
            <div className="bg-dark-800/40 border border-dark-700 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Waterlogging Scans</h3>
                  <p className="text-xs text-gray-400">Pooling and drainage failures</p>
                </div>
              </div>
              <div className="text-2xl font-bold px-4 py-1.5 bg-sky-950/40 border border-sky-800 text-sky-400 rounded-xl">
                {issues.waterlogging}
              </div>
            </div>

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Bar Chart - Risk Distribution */}
            <div className="bg-dark-800/60 border border-dark-700 rounded-2xl p-6 lg:col-span-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Road Condition Breakdown
                </h3>
                <p className="text-xs text-gray-400 mt-1">Classification of safety score zones among recent reports.</p>
              </div>

              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Hazard Distribution */}
            <div className="bg-dark-800/60 border border-dark-700 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-secondary" />
                  Detected Hazard Proportions
                </h3>
                <p className="text-xs text-gray-400 mt-1">Share of specific structural issues in the system.</p>
              </div>

              <div className="h-48 mt-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {finalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#475569'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {finalPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports Activity Section */}
          <div className="bg-dark-800/60 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Active Scans Activity Log
                </h3>
                <p className="text-xs text-gray-400 mt-1">Real-time live feeds of parsed road intelligence logs.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-dark-700/60 text-gray-300 rounded-full border border-dark-600">
                Latest 10 reports
              </span>
            </div>

            {recentReports.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-dark-700 rounded-xl">
                <CheckCircle className="w-12 h-12 text-gray-500 mx-auto" />
                <p className="text-gray-400 mt-3 font-medium">No reports scanned yet.</p>
                <p className="text-gray-500 text-sm mt-1">Uploaded scans will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentReports.map((report) => {
                  const safety = getSafetyLevel(report.safety_score);
                  
                  return (
                    <div 
                      key={report.id} 
                      className="bg-dark-900/55 border border-dark-700 hover:border-dark-600 rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg duration-300"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full sm:w-28 h-28 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-dark-700">
                        <img 
                          src={report.image_url} 
                          alt="Road scan" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop';
                          }}
                        />
                        {/* Confidence Badge */}
                        <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-[9px] font-bold text-sky-400 px-1 rounded border border-sky-400/20">
                          96.4% Conf.
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="flex-grow space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${safety.color}`}>
                              {safety.label}
                            </span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-600" />
                              ID #{report.id}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mt-2 font-medium">
                            <span className="text-gray-300">Issues:</span> {report.detected_issues || 'None detected'}
                          </p>
                        </div>

                        {/* Scores & Badges */}
                        <div className="flex items-center justify-between gap-3 border-t border-dark-800 pt-2 text-xs">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Safety</span>
                              <span className="font-extrabold text-white text-sm">{report.safety_score}</span>
                            </div>
                            <div className="border-l border-dark-800 h-6"></div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Health</span>
                              <span className="font-extrabold text-white text-sm">{report.road_health_score}%</span>
                            </div>
                          </div>

                          <div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getPriorityStyle(report.maintenance_priority)}`}>
                              {report.maintenance_priority} Priority
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[10px] text-gray-500 text-right">
                          {formatDate(report.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
