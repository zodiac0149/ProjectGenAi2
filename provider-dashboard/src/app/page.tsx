'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MedCompanionApp() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState<'patient' | 'provider'>('patient');
  const [userId, setUserId] = useState('1'); 
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  // Day 7: Multi-Language Localization
  const t = {
    en: {
      patientApp: "Patient App",
      providerPortal: "Provider Dashboard",
      chatTitle: "Health Assistant Chat",
      chatSub: "Ask me anything about your health plan.",
      typeHere: "Type your health concern here...",
      send: "Send",
      manualLog: "Symptom Logging",
      bpPlaceholder: "Blood Pressure (e.g. 120)",
      sugarPlaceholder: "Blood Sugar (e.g. 95)",
      logBtn: "Save Vitals",
      emerBtn: "🚨 Emergency Dispatch",
    },
    ml: {
      patientApp: "രോഗിയുടെ ആപ്പ്",
      providerPortal: "ഡോക്ടർ ഡാഷ്‌ബോർഡ്",
      chatTitle: "ഹെൽത്ത് അസിസ്റ്റന്റ് ചാറ്റ്",
      chatSub: "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് എന്തും ചോദിക്കുക.",
      typeHere: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
      send: "അയക്കുക",
      manualLog: "മാനുവൽ ഹെൽത്ത് ലോഗ്",
      bpPlaceholder: "രക്തസമ്മർദ്ദം",
      sugarPlaceholder: "രക്തത്തിലെ പഞ്ചസാര",
      logBtn: "സേവ് ചെയ്യുക",
      emerBtn: "🚨 എമർജൻസി ഡിസ്പാച്ച്",
    }
  };

  const text = t[lang];

  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [manualBp, setManualBp] = useState('');
  const [manualSugar, setManualSugar] = useState('');
  
  const [riskData, setRiskData] = useState<any>(null);
  const [wearableLogs, setWearableLogs] = useState<any[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', 'securedummy');
      const res = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
      } else alert('Login Securely Blocked: Invalid Credentials');
    } catch (err) {
      console.error('Server offline.', err);
    }
  };

  const secureHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const sendMessage = async () => {
    if (!input) return;
    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST', headers: secureHeaders,
        body: JSON.stringify({ user_id: parseInt(userId), message: input })
      });
      if (res.status === 401 || res.status === 403) return setMessages(prev => [...prev, { role: 'ai', content: 'SYSTEM BLOCK: Unauthorized.' }]);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error.' }]);
    }
  };

  const logManualData = async () => {
    if (manualBp) {
      await fetch(`http://localhost:8000/analytics/manual-ingest/${userId}`, {
        method: 'POST', headers: secureHeaders,
        body: JSON.stringify({ metric_type: 'blood_pressure', value: parseFloat(manualBp) })
      });
    }
    if (manualSugar) {
      await fetch(`http://localhost:8000/analytics/manual-ingest/${userId}`, {
        method: 'POST', headers: secureHeaders,
        body: JSON.stringify({ metric_type: 'blood_glucose', value: parseFloat(manualSugar) })
      });
    }
    setManualBp(''); setManualSugar('');
    alert(lang === 'en' ? 'Vitals Saved securely directly to the provider dashboard!' : 'സേവ് ചെയ്തു!');
    if (view === 'provider') loadProviderDashboard();
  };

  const dispatchEmergency = async () => {
    try {
      const res = await fetch(`http://localhost:8000/analytics/emergency-dispatch/${userId}`, {
        method: 'POST', headers: secureHeaders
      });
      const data = await res.json();
      alert(`Emergency Dispatch AI Hook Triggered!\nGeolocating nearest Hospital: ${data.hospital}.\nSummary of patient biometrics successfully dispatched!`);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProviderDashboard = async () => {
    try {
      const res = await fetch(`http://localhost:8000/analytics/patient-risk-score/${userId}`, { headers: secureHeaders });
      const logRes = await fetch(`http://localhost:8000/analytics/wearable-data/${userId}`, { headers: secureHeaders });
      if (res.ok) setRiskData(await res.json());
      if (logRes.ok) setWearableLogs(await logRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token && view === 'provider') loadProviderDashboard();
  }, [view, userId, token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-sans">
        <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-2">MedCompanion</h1>
            <p className="text-gray-500 font-medium">Secured Enterprise Medical Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gateway Login ID</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 font-mono" placeholder="username: provider1" required/>
            </div>
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-blue-600/30 shadow-lg">Authenticate via JWT</button>
          </form>
        </div>
      </div>
    );
  }

  // Day 6: Recharts Data Pipeline Formatting
  const chartData = wearableLogs.slice().reverse().map((log: any, index: number) => ({
    name: `T-${20-index}`,
    value: log.value,
    type: log.metric_type
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-300">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">MedCompanion AI</h1>
            <span className="text-xs font-mono font-medium text-green-600 tracking-widest uppercase flex items-center mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>Secure Link
            </span>
          </div>
          
          <div className="space-x-4 flex items-center">
            {/* Day 7 Multi-Lang Toggle */}
            <button onClick={() => setLang(lang === 'en' ? 'ml' : 'en')} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-sm hover:bg-yellow-200 transition-colors shadow-sm">
              {lang === 'en' ? 'മലയാളം' : 'English'}
            </button>
            <button className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'patient' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} onClick={() => setView('patient')}>
              {text.patientApp}
            </button>
            <button className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'provider' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} onClick={() => setView('provider')}>
              {text.providerPortal}
            </button>
            <button onClick={() => setToken(null)} className="ml-4 text-sm font-semibold text-gray-500 hover:text-red-500 underline underline-offset-4 decoration-dotted">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-end">
          {/* Day 7: Multi-Patient Database Toggle via RBAC checks */}
          <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span>Viewing Database for Multi-Profile #ID:</span>
            <input type="number" min="1" value={userId} onChange={e => setUserId(e.target.value)} className="border-b-2 border-gray-300 pb-0.5 px-2 w-16 focus:outline-none focus:border-blue-500 font-mono text-center text-blue-600 font-bold"/>
          </label>
        </div>

        {view === 'patient' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day 6: Patient Sidebar Logging */}
            <div className="col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">{text.manualLog}</h3>
                <div className="space-y-3">
                  <input type="number" value={manualBp} onChange={e => setManualBp(e.target.value)} placeholder={text.bpPlaceholder} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"/>
                  <input type="number" value={manualSugar} onChange={e => setManualSugar(e.target.value)} placeholder={text.sugarPlaceholder} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"/>
                  <button onClick={logManualData} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">{text.logBtn}</button>
                </div>
              </div>
              <button 
                onClick={dispatchEmergency} 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-xl font-bold text-lg transition-transform transform active:scale-95 shadow-lg shadow-red-600/30 animate-pulse hover:animate-none flex flex-col items-center justify-center space-y-1"
              >
                <span>{text.emerBtn}</span>
                <span className="text-xs font-normal opacity-80">(Dispatches Local Hospital Alert)</span>
              </button>
            </div>

            {/* Chat App */}
            <div className="col-span-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
              <div className="bg-blue-50 flex justify-between items-center px-6 py-4 border-b border-blue-100">
                <div>
                  <h2 className="text-lg font-bold text-blue-900">{text.chatTitle}</h2>
                  <p className="text-sm text-blue-700 opacity-80">{text.chatSub}</p>
                </div>
                <div className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-semibold shadow-sm border border-blue-200">
                  Powered by LLaMA-3 Models
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 scroll-smooth">
                {messages.length === 0 && <div className="text-center text-gray-500 mt-20">{text.typeHere}</div>}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-sm text-sm md:text-base leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : m.content.includes('WARNING') ? 'bg-red-50 border-2 border-red-200 text-red-900 rounded-bl-none font-semibold shadow-red-100' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t border-gray-100 flex space-x-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={text.typeHere} className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-blue-500 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                <button onClick={sendMessage} className="bg-blue-600 text-white rounded-full px-8 py-3 font-semibold hover:bg-blue-700 transition-colors shadow-md">{text.send}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Patient Global Risk View</h2>
                {riskData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl shadow-inner border-l-4 ${riskData.risk_level === 'High' ? 'bg-red-50 border-red-500' : riskData.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}>
                      <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Overall Risk</h3>
                      <div className="text-2xl font-black text-gray-900">{riskData.risk_level}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500 shadow-inner">
                      <h3 className="text-xs font-bold uppercase text-blue-500 mb-1">Abnormal Vitals</h3>
                      <div className="text-2xl font-black text-blue-900">{riskData.abnormal_readings} events</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500 shadow-inner">
                      <h3 className="text-xs font-bold uppercase text-purple-500 mb-1">AI Chat Flags</h3>
                      <div className="text-2xl font-black text-purple-900">{riskData.flagged_interactions} alerts</div>
                    </div>
                  </div>
                ) : <p className="text-gray-500">Loading analytics pipeline...</p>}
              </div>

              {/* Day 6: Chart.js / Recharts Telemetry Graph */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Longitudinal Telemetry Trends</h3>
                  <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">Recharts.js Live Data</span>
                </div>
                {wearableLogs.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6B7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#6B7280'}} width={35} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', fontSize: '13px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}} 
                          cursor={{stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5'}}
                        />
                        <Legend wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} iconType="circle" />
                        <Line type="monotone" name="Metric Value" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, stroke: '#2563eb', strokeWidth: 2}} animationDuration={1500} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-sm text-gray-500 flex h-40 items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">No chart data isolated for this patient ID.</p>}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg h-full">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800">Raw Biometric Ledger</h3>
                  <div className="flex space-x-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
                  {wearableLogs.map((log: any, idx: number) => (
                    <li key={idx} className="px-5 py-4 flex justify-between items-center hover:bg-blue-50 transition-colors cursor-default">
                      <div className="flex items-center space-x-3">
                        <span className={`w-2 h-2 rounded-full shadow-sm ${log.value > 100 || log.value < 60 ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'}`}></span>
                        <span className="text-xs font-bold text-gray-700 capitalize">{log.metric_type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs font-mono font-bold border px-2 py-1 rounded bg-white text-gray-800 shadow-sm">{log.value.toFixed(1)}</span>
                    </li>
                  ))}
                  {wearableLogs.length === 0 && <li className="px-6 py-10 text-center text-sm text-gray-400">Ledger empty. Log manual symptoms or run the mock wearable sync script.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
