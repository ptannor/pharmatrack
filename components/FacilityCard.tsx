
import React from 'react';
import { ManufacturingSite } from '../types';

interface Props {
  site: ManufacturingSite;
}

const FacilityCard: React.FC<Props> = ({ site }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Acceptable': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Needs Improvement': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{site.siteName}</h3>
            <p className="text-slate-500 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {site.location}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(site.inspectionStatus)}`}>
            {site.inspectionStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">FEI Number</span>
            <span className="text-sm font-mono text-slate-700">{site.feiNumber || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Type</span>
            <span className="text-sm text-slate-700 font-medium truncate" title={site.type}>{site.type}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Interesting Details</h4>
            <ul className="space-y-2">
              {site.interestingFacts.map((fact, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600 leading-relaxed">
                  <span className="mr-2 text-indigo-500 mt-1 flex-shrink-0">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400">
              Last Insp: <span className="font-semibold text-slate-600">{site.lastInspectionDate || 'Unknown'}</span>
            </div>
            <div className="text-xs text-slate-400">
              Capacity: <span className="font-semibold text-slate-600">{site.capacityEstimate || 'NDA'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
