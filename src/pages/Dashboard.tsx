import { useEffect, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { 
  CloudRain, Droplets, Sun, Wind, MapPin, Calendar, 
  MessageSquare, Send, Sprout, TrendingUp
} from "lucide-react";

const yieldData = [
  { month: "Jan", actual: 4000, predicted: 4400 },
  { month: "Feb", actual: 3000, predicted: 3200 },
  { month: "Mar", actual: 2000, predicted: 2400 },
  { month: "Apr", actual: 2780, predicted: 2900 },
  { month: "May", actual: 1890, predicted: 2100 },
  { month: "Jun", actual: 2390, predicted: 2500 },
  { month: "Jul", actual: 3490, predicted: 3600 },
];

export default function Dashboard() {
  const [aiMessage, setAiMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { role: "ai", text: "Kumusta! Ako si Ani, ang iyong AgriLink AI assistant. Ano ang maitutulong ko sa iyong ani ngayon?" }
  ]);

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const newLog = [...chatLog, { role: "user", text: aiMessage }];
    setChatLog(newLog);
    setAiMessage("");

    // Simulate AI response
    setTimeout(() => {
      setChatLog([...newLog, { 
        role: "ai", 
        text: "Naitala ko na ang iyong report. Maganda ang panahon next week, kaya perfect time para mag-harvest ng palay. May buyer na naghahanap ng 500kg, ipapa-connect ba kita?" 
      }]);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Farmer Dashboard</h1>
            <p className="text-neutral-500">Welcome back, Mang Juan. Here's your farm overview.</p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            Register New Harvest
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-500">Expected Yield</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">2,450 kg</div>
                <div className="text-sm text-green-600 mt-1">+12% from last season</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-500">Active Crops</h3>
                  <Sprout className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">3</div>
                <div className="text-sm text-neutral-500 mt-1">Rice, Corn, Tomatoes</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-500">Pending Offers</h3>
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">2</div>
                </div>
                <div className="text-2xl font-bold text-neutral-900">₱45,000</div>
                <div className="text-sm text-neutral-500 mt-1">Awaiting approval</div>
              </div>
            </div>

            {/* Yield Prediction Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Yield Forecast vs Actual (kg)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#737373'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="actual" name="Actual Yield" stroke="#16a34a" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="predicted" name="Predicted Yield" stroke="#93c5fd" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Harvests Table */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-900">Upcoming Harvests</h3>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 text-sm">
                      <th className="py-3 px-6 font-medium">Crop</th>
                      <th className="py-3 px-6 font-medium">Est. Quantity</th>
                      <th className="py-3 px-6 font-medium">Harvest Date</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      { crop: "Dinorado Rice", qty: "1,200 kg", date: "Oct 15, 2026", status: "Looking for Buyer", statusColor: "bg-amber-100 text-amber-800" },
                      { crop: "Sweet Corn", qty: "500 kg", date: "Oct 22, 2026", status: "Matched", statusColor: "bg-green-100 text-green-800" },
                      { crop: "Tomatoes", qty: "150 kg", date: "Nov 05, 2026", status: "Growing", statusColor: "bg-blue-100 text-blue-800" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-neutral-900">{row.crop}</td>
                        <td className="py-4 px-6 text-neutral-600">{row.qty}</td>
                        <td className="py-4 px-6 text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            {row.date}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-blue-100 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Nueva Ecija, PH
                  </h3>
                  <div className="text-3xl font-bold">28°C</div>
                  <p className="text-blue-100 text-sm">Partly Cloudy</p>
                </div>
                <CloudRain className="w-12 h-12 text-white/80" />
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-4 mt-4">
                <div className="text-center">
                  <div className="text-white/70 text-xs mb-1">Humidity</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-medium">
                    <Droplets className="w-3 h-3" /> 65%
                  </div>
                </div>
                <div className="text-center border-l border-r border-white/20">
                  <div className="text-white/70 text-xs mb-1">Wind</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-medium">
                    <Wind className="w-3 h-3" /> 12 km/h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white/70 text-xs mb-1">UV Index</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-medium">
                    <Sun className="w-3 h-3" /> Mod
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-lg p-3 text-sm">
                <p className="font-medium">⚠️ Agri Alert</p>
                <p className="text-blue-100 text-xs mt-1">Light rain expected tomorrow afternoon. Good condition for newly planted seedlings.</p>
              </div>
            </div>

            {/* AI Assistant Chat */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-[400px]">
              <div className="p-4 border-b border-neutral-200 bg-green-50 rounded-t-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Ani AI Assistant</h3>
                  <p className="text-xs text-green-700">Taglish NLP supported</p>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-green-600 text-white rounded-br-none' 
                          : 'bg-neutral-100 text-neutral-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-neutral-200">
                <form onSubmit={handleSendAi} className="flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Sabihin kung kailan ka mag-harvest..."
                    className="flex-1 border border-neutral-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button 
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center flex-shrink-0"
                    disabled={!aiMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


