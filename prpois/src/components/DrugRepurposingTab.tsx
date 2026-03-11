import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, ArrowRight, AlertTriangle, Zap } from 'lucide-react';
import { Molecule } from '../data/mockDatabase';

interface PubChemResult {
    smiles: string;
    iupacName: string;
    molecularWeight: string;
    xLogP: string;
}

interface DrugRepurposingTabProps {
    onSendToPathway?: (molecule: Molecule) => void;
}

export const DrugRepurposingTab: React.FC<DrugRepurposingTabProps> = ({ onSendToPathway }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<PubChemResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setResult(null);

        try {
            // Hit PubChem PUG REST API
            const response = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,IsomericSMILES,XLogP,IUPACName/JSON`
            );

            if (!response.ok) {
                throw new Error('Drug not found in PubChem Database');
            }

            const data = await response.json();
            const props = data.PropertyTable.Properties[0];

            setResult({
                smiles: props.IsomericSMILES || 'N/A',
                iupacName: props.IUPACName || 'N/A',
                molecularWeight: props.MolecularWeight ? props.MolecularWeight.toString() : 'N/A',
                xLogP: props.XLogP ? props.XLogP.toString() : 'N/A',
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred during search.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6 flex flex-col items-center"
        >
            <div className="w-full text-center space-y-2 mb-8 mt-4">
                <div className="inline-flex items-center justify-center space-x-2 bg-neon-blue/10 px-4 py-1.5 rounded-full border border-neon-blue/20 text-neon-blue text-xs font-mono mb-4">
                    <Database size={14} />
                    <span>Live Data Bridge: PubChem REST API</span>
                </div>
                <h1 className="text-3xl font-light text-white tracking-widest">DRUG REPURPOSING</h1>
                <p className="text-gray-400 text-sm">Query active compounds to initialize novel pathway generation.</p>
            </div>

            <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by compound name (e.g., 'Aspirin', 'Imatinib', 'Paclitaxel')..."
                    className="block w-full pl-12 pr-32 py-4 border border-white/10 rounded-xl leading-5 bg-black/40 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon-blue focus:border-neon-blue transition-all shadow-lg text-lg glass backdrop-blur-md"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-neon-blue hover:bg-blue-400 text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-full flex items-center"
                    >
                        {isSearching ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                            />
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>
            </form>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full glass-card border-red-500/30 p-6 flex flex-col items-center justify-center space-y-4 glow-red text-center mt-8"
                    >
                        <AlertTriangle size={48} className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                        <div>
                            <h3 className="text-xl text-white font-medium">Compound Not Found</h3>
                            <p className="text-red-400/80 text-sm mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.4 }}
                        className="w-full mt-8"
                    >
                        <div className="glass-card p-8 border-neon-blue/30 shadow-[0_0_30px_rgba(88,166,255,0.1)] relative overflow-hidden group">
                            {/* Glow Accent */}
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Database size={200} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div className="col-span-1 md:col-span-3 pb-6 border-b border-white/10 flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-neon-blue font-mono uppercase tracking-widest mb-1">Compound Match</div>
                                        <h2 className="text-3xl text-white font-light">{query.charAt(0).toUpperCase() + query.slice(1)}</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (onSendToPathway && result) {
                                                const newMol: Molecule = {
                                                    id: 'live-' + Date.now().toString(),
                                                    name: query.charAt(0).toUpperCase() + query.slice(1),
                                                    smiles: result.smiles,
                                                    molecularWeight: parseFloat(result.molecularWeight) || 0,
                                                    logP: parseFloat(result.xLogP) || 0,
                                                    lipinskiViolations: 0, // Simplified for this handoff
                                                    swissAdme: { lipo: 0, size: 0, polar: 0, insolu: 0, insatu: 0, flex: 0 }
                                                };
                                                onSendToPathway(newMol);
                                            }
                                        }}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black px-5 py-2.5 rounded-lg font-medium shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all transform hover:scale-105"
                                    >
                                        <Zap size={18} />
                                        <span>Send to Pathway Engine</span>
                                        <ArrowRight size={18} className="ml-1" />
                                    </button>
                                </div>

                                <div className="col-span-1 md:col-span-3">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-2">IUPAC Name</div>
                                    <div className="text-sm text-gray-300 break-words font-light bg-black/20 p-4 rounded-lg border border-white/5">{result.iupacName}</div>
                                </div>

                                <div className="col-span-1 md:col-span-3">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-2">Canonical SMILES</div>
                                    <div className="text-sm text-emerald-400 break-words font-mono bg-emerald-900/10 p-4 rounded-lg border border-emerald-500/20">{result.smiles}</div>
                                </div>

                                <div className="bg-black/20 p-6 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-2">Molecular Weight</div>
                                    <div className="text-3xl text-white font-light flex items-baseline space-x-1">
                                        <span>{result.molecularWeight}</span>
                                        <span className="text-sm text-gray-500">g/mol</span>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-6 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-2">XLogP</div>
                                    <div className="text-3xl text-white font-light">{result.xLogP}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
