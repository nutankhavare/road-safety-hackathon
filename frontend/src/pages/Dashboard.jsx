import React from 'react';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <p className="text-gray-400">Overview of road safety and infrastructure metrics.</p>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: '1,248', color: 'text-primary' },
          { label: 'Avg Safety Score', value: '82/100', color: 'text-green-400' },
          { label: 'Hazards Found', value: '342', color: 'text-red-400' },
          { label: 'Safe Roads', value: '68%', color: 'text-secondary' }
        ].map((stat, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-dark-500 transition-colors">
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 h-80 flex flex-col items-center justify-center hover:border-dark-500 transition-colors">
          <p className="text-gray-500">[ Hazard Distribution Chart Placeholder ]</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 h-80 flex flex-col items-center justify-center hover:border-dark-500 transition-colors">
          <p className="text-gray-500">[ Safety Trend Timeline Placeholder ]</p>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 h-96 flex flex-col items-center justify-center mt-8 hover:border-primary/50 transition-colors">
        <p className="text-gray-500">[ Heatmap Interface Placeholder ]</p>
      </div>
    </div>
  );
};

export default Dashboard;
