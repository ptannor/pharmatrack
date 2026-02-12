
import React, { useState, useMemo } from 'react';
import { AppStatus, DrugInfo, ManufacturingSite } from './types';
import { fetchFacilityData } from './services/geminiService';
import FacilityCard from './components/FacilityCard';
import StatsDashboard from './components/StatsDashboard';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [drugData, setDrugData] = useState<DrugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setSelectedCountry('');
    setSelectedState('');
    try {
      const data = await fetchFacilityData(searchTerm);
      setDrugData(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message);
      setStatus(AppStatus.ERROR);
    }
  };

  // Helper to extract parts of location string "City, State, Country"
  const getLocationParts = (location: string) => {
    const parts = location.split(',').map(p => p.trim());
    const country = parts[parts.length - 1];
    const state = parts.length >= 3 ? parts[parts.length - 2] : '';
    return { country, state };
  };

  const countries = useMemo(() => {
    if (!drugData) return [];
    const uniqueCountries = new Set(drugData.sites.map(s => getLocationParts(s.location).country));
    return Array.from(uniqueCountries).sort();
  }, [drugData]);

  const statesInUS = useMemo(() => {
    if (!drugData || (selectedCountry !== 'USA' && selectedCountry !== 'United States')) return [];
    const uniqueStates = new Set(
      drugData.sites
        .filter(s => {
          const { country } = getLocationParts(s.location);
          return country === 'USA' || country === 'United States';
        })
        .map(s => getLocationParts(s.location).state)
        .filter(s => s !== '')
    );
    return Array.from(uniqueStates).sort();
  }, [drugData, selectedCountry]);

  const filteredSites = useMemo(() => {
    if (!drugData) return [];
    return drugData.sites.filter(site => {
      const { country, state } = getLocationParts(site.location);
      const countryMatch = !selectedCountry || country === selectedCountry;
      const stateMatch = !selectedState || state === selectedState;
      return countryMatch && stateMatch;
    });
  }, [drugData, selectedCountry, selectedState]);

  // Create a version of drugData with filtered sites for the StatsDashboard
  const filteredDrugData = useMemo(() => {
    if (!drugData) return null;
    return { ...drugData, sites: filteredSites };
  }, [drugData, filteredSites]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div 
                className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-indigo-200 shadow-lg cursor-pointer"
                onClick={() => setStatus(AppStatus.IDLE)}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pharma<span className="text-indigo-600">Track</span></h1>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter drug name (e.g. Lisinopril, Ozempic...)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
            </form>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
              FDA Compliance Monitor v1.1
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto">
            <div className="mb-8 w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Explore the Global Pharma Supply Chain</h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Enter a medication name to uncover the facilities behind its production. 
              Get insights into FDA inspection results, manufacturing types, and site history.
            </p>
            <form onSubmit={handleSearch} className="w-full max-w-md md:hidden mb-8">
               <input
                  type="text"
                  placeholder="Enter drug name..."
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
              {['Aspirin', 'Ibuprofen', 'Ozempic', 'Metformin', 'Lipitor', 'Advil'].map(drug => (
                <button 
                  key={drug}
                  onClick={() => { setSearchTerm(drug); }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  {drug}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-indigo-200 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
            </div>
            <p className="mt-6 text-slate-600 font-medium animate-pulse">Scanning FDA Database & Intelligence sources...</p>
            <p className="text-xs text-slate-400 mt-2 italic">Finding facilities for "{searchTerm}"</p>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-rose-800 mb-2">Search Error</h3>
            <p className="text-rose-600 mb-6">{error}</p>
            <button 
              onClick={() => setStatus(AppStatus.IDLE)}
              className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              Try Another Search
            </button>
          </div>
        )}

        {status === AppStatus.SUCCESS && drugData && (
          <div className="animate-in fade-in duration-700">
            {/* Drug Overview */}
            <div className="bg-indigo-900 rounded-3xl p-8 mb-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl shadow-indigo-200">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-500/30 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Pharmacological Analysis</span>
                <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{drugData.name}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-indigo-100 opacity-90">
                  <p className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    Primary Mfr: <span className="font-bold ml-1">{drugData.manufacturer || 'Various'}</span>
                  </p>
                  <p className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Approved: <span className="font-bold ml-1">{drugData.approvalDate || 'N/A'}</span>
                  </p>
                  <p className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Class: <span className="font-bold ml-1">{drugData.drugClass || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-right">
                <div className="text-6xl font-black text-white/20 leading-none">{filteredSites.length}</div>
                <div className="text-sm font-bold text-indigo-200 uppercase tracking-widest mt-1">
                  {filteredSites.length === drugData.sites.length ? 'Identified Sites' : 'Filtered Sites'}
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 flex flex-wrap gap-6 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filter by Country</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState(''); // Reset state when country changes
                  }}
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {(selectedCountry === 'USA' || selectedCountry === 'United States') && statesInUS.length > 0 && (
                <div className="flex-1 min-w-[200px] animate-in slide-in-from-left duration-300">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filter by State</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">All States</option>
                    {statesInUS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {(selectedCountry || selectedState) && (
                <button 
                  onClick={() => { setSelectedCountry(''); setSelectedState(''); }}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-bold h-[42px] flex items-center px-4"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Visual Insights */}
            {filteredDrugData && <StatsDashboard data={filteredDrugData} />}

            {/* Empty State for Filters */}
            {filteredSites.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300 mb-12">
                <p className="text-slate-400 font-medium">No manufacturing sites match your selected filters.</p>
                <button 
                  onClick={() => { setSelectedCountry(''); setSelectedState(''); }}
                  className="mt-4 text-indigo-600 font-bold"
                >
                  Show all facilities
                </button>
              </div>
            )}

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {filteredSites.map((site, index) => (
                <FacilityCard key={index} site={site} />
              ))}
            </div>

            {/* Sources / Grounding */}
            {drugData.sources && drugData.sources.length > 0 && (
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Sources</h3>
                <div className="flex flex-wrap gap-3">
                  {drugData.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all flex items-center"
                    >
                      <svg className="w-3 h-3 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102 1.101"/></svg>
                      {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action for Mobile Search */}
      {status === AppStatus.SUCCESS && (
        <button 
          onClick={() => { setStatus(AppStatus.IDLE); setDrugData(null); }}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-300 hover:bg-indigo-700 transition-all z-50 transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
      )}
    </div>
  );
};

export default App;
