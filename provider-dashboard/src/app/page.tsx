'use client';
import { useState, useEffect } from 'react';

export default function MedCompanionApp() {
  const [view, setView] = useState<'patient' | 'provider'>('patient');
  const [userId, setUserId] = useState('1'); 
  
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  
  const [riskData, setRiskData] = useState<any>(null);
  const [wearableLogs, setWearableLogs] = useState<any[]>([]);
  
  const sendMessage = async () => {
    if (!input) return;
    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId), message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error to backend.' }]);
    }
  };

  const loadProviderDashboard = async () => {
    try {
      const res = await fetch(`http://localhost:8000/analytics/patient-risk-score/${userId}`);
      const data = await res.json();
      setRiskData(data);
      
      const logRes = await fetch(`http://localhost:8000/analytics/wearable-data/${userId}`);
      if (logRes.ok) {
        const logData = await logRes.json();
        setWearableLogs(logData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const simulateWearableData = async () => {
    try {
      await fetch(`http://localhost:8000/analytics/mock-ingest/${userId}`, { method: 'POST' });
      alert('Mock wearable data ingested successfully.');
      if (view === 'provider') loadProviderDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (view === 'provider') loadProviderDashboard();
  }, [view, userId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-300">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">MedCompanion AI</h1>
          <div className="space-x-4">
            <button 
              className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'patient' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              onClick={() => setView('patient')}
            >
              Patient App
            </button>
            <button 
              className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'provider' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              onClick={() => setView('provider')}
            >
              Provider Portal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4">
          <label className="flex items-center space-x-2 text-sm font-medium">
            <span>User ID:</span>
            <input 
              type="number" 
              value={userId} 
              onChange={e => setUserId(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-20"
            />
          </label>
          <button 
            onClick={simulateWearableData}
            className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm hover:bg-green-200 transition-colors"
          >
            + Simulate Wearable Sync
          </button>
        </div>

        {view === 'patient' ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900">Health Assistant Chat</h2>
              <p className="text-sm text-blue-700 opacity-80">Ask me anything about your health plan.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">Start chatting with MedCompanion. Try asking: "I have chest pain today."</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : m.role === 'ai' && m.content.includes('WARNING') 
                        ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-none font-medium'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type your health concern here..."
                className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              <button 
                onClick={sendMessage}
                className="bg-blue-600 text-white rounded-full px-6 py-3 font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Provider Dashboard</h2>
            {riskData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl shadow-inner border-l-4 ${
                  riskData.risk_level === 'High' ? 'bg-red-50 border-red-500' : 
                  riskData.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Overall Risk</h3>
                  <div className="text-3xl font-bold text-gray-900">{riskData.risk_level}</div>
                </div>
                
                <div className="p-6 rounded-xl bg-blue-50 border-l-4 border-blue-500 shadow-inner">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-500 mb-1">Abnormal Wearable Metrics</h3>
                  <div className="text-3xl font-bold text-blue-900">{riskData.abnormal_readings} <span className="text-base font-normal">events</span></div>
                </div>

                <div className="p-6 rounded-xl bg-purple-50 border-l-4 border-purple-500 shadow-inner">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-500 mb-1">Flagged AI Chats</h3>
                  <div className="text-3xl font-bold text-purple-900">{riskData.flagged_interactions} <span className="text-base font-normal">chats</span></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 animate-pulse">Loading patient analytics...</p>
            )}

            {wearableLogs.length > 0 && (
              <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700">Recent Wearable Simulation Data</h3>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Live Sync</span>
                </div>
                <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {wearableLogs.map((log: any, idx: number) => (
                    <li key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className={`w-2 h-2 rounded-full ${log.metric_type === 'heart_rate' && log.value > 100 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className="text-sm font-medium text-gray-800 capitalize leading-none">{log.metric_type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm font-mono border px-2 py-1 rounded bg-gray-50 border-gray-200 text-gray-600">
                        {log.value.toFixed(1)} <span className="text-xs text-gray-400 font-sans ml-1">{log.metric_type === 'heart_rate' ? 'bpm' : 'mg/dL'}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tele-Monitoring Details</h3>
              <p className="text-sm text-gray-600">The Analytics Engine processes mocked health metrics synced from smart wearables and tracks dialogue flags emitted by the MedCompanion LLM.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
