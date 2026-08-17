import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClientDashboard } from './components/ClientDashboard';
import { NeurofeedbackSession } from './components/NeurofeedbackSession';
import { ClinicianDashboard } from './components/ClinicianDashboard';
import { DoctorDemoModal } from './components/DoctorDemoModal';
import { mockEEG } from './services/mockEegService';
import { realEEG, eegState$ } from './services/realEegService';

const INITIAL_CLIENTS = [
  {
    id: 'EV-084',
    name: 'Sarah K.',
    indication: 'ADHD & Focus Drift',
    protocol: 'Prefrontal-Temporal ILF (0.005 Hz) + High-Beta Inhibit',
    protocolSensitivity: 65,
    optimalResponseFrequencyHz: 0.005,
    completedSessions: 14,
    totalPrescribed: 30,
    streakDays: 14,
    baselineScore: 58,
    currentAvg: 86,
    gainPercent: 28,
    doctorNote: 'Great progress on session 14! Your brain is learning to hold calm infra-low slow wave focus without tiring. During today’s session, let the visual reward guide your state gently.',
    recentSessions: [
      { id: 's14', sessionNumber: 14, date: 'Today', durationMin: 15, focusScore: 88, calmScore: 86 },
      { id: 's13', sessionNumber: 13, date: 'Yesterday', durationMin: 15, focusScore: 86, calmScore: 84 },
      { id: 's12', sessionNumber: 12, date: 'Aug 14', durationMin: 15, focusScore: 84, calmScore: 82 },
      { id: 's11', sessionNumber: 11, date: 'Aug 12', durationMin: 15, focusScore: 81, calmScore: 79 },
    ]
  },
  {
    id: 'EV-092',
    name: 'Tariq M.',
    indication: 'Anxiety & Hyperarousal',
    protocol: 'Right Temporal-Parietal ILF (0.002 Hz) + Alpha Synchrony',
    protocolSensitivity: 65,
    optimalResponseFrequencyHz: 0.002,
    completedSessions: 9,
    totalPrescribed: 25,
    streakDays: 7,
    baselineScore: 52,
    currentAvg: 81,
    gainPercent: 29,
    doctorNote: 'Significant reduction in autonomic hyperarousal observed at 0.002 Hz ORF. Keep shoulders relaxed and breathing rhythmic during video playback.',
    recentSessions: [
      { id: 't9', sessionNumber: 9, date: 'Today', durationMin: 15, focusScore: 82, calmScore: 90 },
      { id: 't8', sessionNumber: 8, date: 'Aug 15', durationMin: 15, focusScore: 80, calmScore: 88 },
      { id: 't7', sessionNumber: 7, date: 'Aug 13', durationMin: 15, focusScore: 76, calmScore: 85 },
    ]
  },
  {
    id: 'EV-105',
    name: 'Elena R.',
    indication: 'Peak Cognitive Performance',
    protocol: 'Dual Frontal-Temporal ILF (0.012 Hz) Coherence',
    protocolSensitivity: 70,
    optimalResponseFrequencyHz: 0.012,
    completedSessions: 18,
    totalPrescribed: 20,
    streakDays: 18,
    baselineScore: 68,
    currentAvg: 92,
    gainPercent: 35,
    doctorNote: 'Executive bandwidth and slow-wave synchrony are consistently in the 90th percentile. Ready for advanced challenge thresholds.',
    recentSessions: [
      { id: 'e18', sessionNumber: 18, date: 'Aug 16', durationMin: 20, focusScore: 94, calmScore: 92 },
      { id: 'e17', sessionNumber: 17, date: 'Aug 14', durationMin: 20, focusScore: 91, calmScore: 89 },
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('client');
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState('EV-084');
  const [eegState, setEegState] = useState(null);
  const [bleStatus, setBleStatus] = useState({ isConnected: false });
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    mockEEG.start(45);
    const unsubMock = mockEEG.subscribe(st => setEegState(st));
    return () => {
      unsubMock();
      mockEEG.stop();
    };
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleUpdateDoctorNote = (clientId, note) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, doctorNote: note } : c));
  };

  const handleUpdateProtocol = (clientId, updates) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  };

  const handleConnectBLE = async () => {
    try {
      await realEEG.connect();
      setBleStatus({ isConnected: true });
    } catch (e) {
      console.warn('Bluetooth connection error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-100">
      
      {/* Clinic Notice Banner */}
      <div className="bg-[#0A0A0A] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#EDEDED] font-medium">Evolve Brain Training:</span>
            <span>At-Home Infra-Low Frequency (ILF) Neurofeedback Supervised Continuation</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-400">Dr. Upasana Gala (PhD, BCN, QEEG-D)</span>
            <span className="hidden sm:inline text-[#555555]">Dubai Healthcare City · Abu Dhabi</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eegState={eegState}
        bleStatus={bleStatus}
        onConnectBLE={handleConnectBLE}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Body Content */}
      <main className="flex-1">
        {activeTab === 'client' && (
          <ClientDashboard
            client={selectedClient}
            clients={clients}
            onSelectClient={setSelectedClientId}
            onStartSession={() => setActiveTab('session')}
            isHeadbandConnected={bleStatus.isConnected}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeTab === 'session' && (
          <NeurofeedbackSession
            client={selectedClient}
            onFinish={() => setActiveTab('client')}
            eegState={eegState}
            mockService={mockEEG}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeTab === 'clinician' && (
          <ClinicianDashboard
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onUpdateClientNote={handleUpdateDoctorNote}
            onUpdateProtocol={handleUpdateProtocol}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}
      </main>

      {/* Doctor Demo Tour Modal */}
      <DoctorDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onLaunchLiveSession={() => {
          setIsDemoOpen(false);
          setActiveTab('session');
        }}
      />

    </div>
  );
}
