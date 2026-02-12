
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DrugInfo } from '../types';

interface Props {
  data: DrugInfo;
}

const StatsDashboard: React.FC<Props> = ({ data }) => {
  // Process data for charts
  const typeCounts = data.sites.reduce((acc: any, site) => {
    acc[site.type] = (acc[site.type] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(typeCounts).map(key => ({
    name: key.length > 15 ? key.substring(0, 15) + '...' : key,
    count: typeCounts[key]
  }));

  const statusCounts = data.sites.reduce((acc: any, site) => {
    acc[site.inspectionStatus] = (acc[site.inspectionStatus] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Manufacturing Capabilities</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Inspection Profile</h3>
        <div className="h-[250px] w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 pr-8">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                <span className="text-slate-600 font-medium">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
