import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from './components/AuthScreen';
import { DashboardHeader } from './components/DashboardHeader';
import { MoleculeInputPanel } from './components/MoleculeInputPanel';
import { RadarChartPanel } from './components/RadarChartPanel';
import { TechnoEconomicPanel } from './components/TechnoEconomicPanel';
import { AIAuditLogPanel } from './components/AIAuditLogPanel';
import { DrugRepurposingTab } from './components/DrugRepurposingTab';
import { PathwaysTab } from './components/PathwaysTab';
import { Viewer3DTab } from './components/Viewer3DTab';
import { Sketcher } from './components/Sketcher';
import { User, ManufacturingScale, mockDatabase, Molecule } from './data/mockDatabase';
import { LayoutDashboard, Beaker, Network, FileText, Settings, Loader2, Box } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [scale, setScale] = useState<ManufacturingScale>('Lab');

  // App Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'molecules' | 'pathways' | 'viewer' | 'logs'>('dashboard');

  // Global Target Molecule State
  const [globalTargetMolecule, setGlobalTargetMolecule] = useState<Molecule | null>(null);

  // Dashboard Tab State connected to Mock DB / Local API
  const [targetMolecule, setTargetMolecule] = useState<Molecule>(mockDatabase.molecules[0]);
  const [isLoadingMolecule, setIsLoadingMolecule] = useState(false);
  const [logs, setLogs] = useState(mockDatabase.retrosynthesisLogs);
  const pathway = mockDatabase.pathways[0];
  const pricing = mockDatabase.indicationPricing[0];

  const handleSearchMolecule = async (smilesOrName: string) => {
    setIsLoadingMolecule(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/molecule/${encodeURIComponent(smilesOrName)}?target_scale=${scale}`);
      if (!response.ok) {
        throw new Error('Molecule not found');
      }
      const data = await response.json();

      // Map backend response to frontend Molecule interface
      const updatedMolecule: Molecule = {
        id: data.id.toString(),
        name: data.name,
        smiles: data.smiles,
        molecularWeight: data.mw,
        logP: data.logp,
        tpsa: data.tpsa,
        lipinskiViolations: data.lipinski_violations,
        swissAdme: {
          lipo: 0,
          size: 0,
          polar: 0,
          insolu: 0,
          insatu: 0,
          flex: 0
        }
      };

      setTargetMolecule(updatedMolecule);
    } catch (error) {
      console.error("Failed to fetch molecule:", error);
      // Fallback to mock search logic for Dashboard if backend fails
      const found = mockDatabase.molecules.find(m =>
        m.name.toLowerCase().includes(smilesOrName.toLowerCase()) ||
        m.smiles.includes(smilesOrName)
      );
      if (found) {
        setTargetMolecule(found);
      } else {
        // Create a temporary mock if completely not found
        setTargetMolecule({
          ...mockDatabase.molecules[0],
          name: smilesOrName,
          smiles: smilesOrName
        });
      }
    } finally {
      setIsLoadingMolecule(false);
    }
  };

  // Re-fetch when scale changes
  useEffect(() => {
    if (targetMolecule) {
      handleSearchMolecule(targetMolecule.smiles);
    }
  }, [scale]);

  // Also sync the dashboard target molecule when globalTargetMolecule changes
  useEffect(() => {
    if (globalTargetMolecule) {
      // When coming from Drug Repurposing, pre-fill and trigger search in dashboard
      handleSearchMolecule(globalTargetMolecule.smiles);
    }
  }, [globalTargetMolecule]);

  const handleValidateLog = (logId: string, validated: boolean) => {
    if (user?.role !== 'ADMIN') return;
    setLogs(logs.map(log =>
      log.id === logId
        ? { ...log, humanValidated: validated, validatedByUserId: validated ? user.id : undefined }
        : log
    ));
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const renderDashboardTab = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono mb-4">
        <span>PROJECT</span>
        <span className="text-gray-600">&gt;</span>
        <span className="text-white">Active Pathway: O-Alkylation Route ({pathway.id})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
        <div className="col-span-1 xl:col-span-2 row-span-1 space-y-6">
          <div className="relative">
            {isLoadingMolecule && (
              <div className="absolute inset-0 bg-black/50 z-10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
              </div>
            )}
            <MoleculeInputPanel
              molecule={targetMolecule}
              onSearch={handleSearchMolecule}
            />
          </div>
          <Sketcher onSmilesChange={handleSearchMolecule} initialSmiles={targetMolecule.smiles} />
        </div>

        <div className="col-span-1 row-span-1 min-h-[400px]">
          <RadarChartPanel molecule={targetMolecule} />
        </div>

        <div className="col-span-1 xl:col-span-2 row-span-1">
          <TechnoEconomicPanel
            pathway={pathway}
            pricing={pricing}
            scale={scale}
          />
        </div>

        <div className="col-span-1 row-span-1">
          {logs.map(log => (
            <AIAuditLogPanel
              key={log.id}
              log={log}
              currentUser={user}
              onValidate={handleValidateLog}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'molecules':
        return <DrugRepurposingTab key="molecules" onSendToPathway={(target) => {
          setGlobalTargetMolecule(target);
          setActiveTab('pathways');
        }} />;
      case 'pathways':
        return <PathwaysTab key="pathways" targetMolecule={globalTargetMolecule} />;
      case 'viewer':
        return <Viewer3DTab key="viewer" targetMolecule={globalTargetMolecule} />;
      case 'logs':
        return (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <FileText size={64} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-light text-white mb-2">Audit Logs Repository</h2>
            <p>Full 21 CFR Part 11 electronic history available here.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-dark-bg min-h-screen font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0d14] flex flex-col items-center lg:items-start py-6 transition-all z-40">
        <div className="w-full px-0 lg:px-6 mb-8 flex justify-center lg:justify-start">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-blue-900 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(88,166,255,0.4)]">
            <span className="font-bold tracking-tighter text-white">PR</span>
          </div>
        </div>

        <nav className="flex-1 w-full space-y-2 px-3">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'molecules', icon: <Beaker size={20} />, label: 'Drug Repurposing' },
            { id: 'pathways', icon: <Network size={20} />, label: 'Pathways Engine' },
            { id: 'viewer', icon: <Box size={20} />, label: '3D Topology' },
            { id: 'logs', icon: <FileText size={20} />, label: 'Audit Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === item.id ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <div className="flex justify-center w-full lg:w-auto lg:mr-3">{item.icon}</div>
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="w-full px-3 mt-auto">
          <button className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <div className="flex justify-center w-full lg:w-auto lg:mr-3"><Settings size={20} /></div>
            <span className="hidden lg:block font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative Background Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>

        <DashboardHeader
          user={user}
          onLogout={() => setUser(null)}
          scale={scale}
          setScale={setScale}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
