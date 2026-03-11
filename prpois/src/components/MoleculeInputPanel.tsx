import React from 'react';
import { motion } from 'framer-motion';
import { Molecule } from '../data/mockDatabase';
import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MoleculeInputPanelProps {
    molecule: Molecule;
    onSearch: (smiles: string) => void;
}

export const MoleculeInputPanel: React.FC<MoleculeInputPanelProps> = ({ molecule, onSearch }) => {
    const isRejected = molecule.lipinskiViolations > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={`glass-card p-6 h-full flex flex-col ${isRejected ? 'glow-red' : ''}`}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue"></span>
                    <span>Target Molecule</span>
                </h2>
                {isRejected ? (
                    <div className="flex items-center space-x-1 text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle size={12} />
                        <span>FAIL-FAST REJECTED</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span>VIABLE</span>
                    </div>
                )}
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-black/40 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon-blue focus:border-neon-blue sm:text-sm transition-colors"
                    placeholder="Enter SMILES string..."
                    defaultValue={molecule.smiles}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch(e.currentTarget.value);
                        }
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-black/20 rounded-lg p-4 border border-white/5 flex flex-col justify-center">
                    <div className="text-xs text-gray-400 mb-1 font-mono uppercase">Molecular Wt</div>
                    <div className="text-2xl font-light text-white flex items-baseline space-x-1">
                        <span>{molecule.molecularWeight.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">g/mol</span>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/5 flex flex-col justify-center">
                    <div className="text-xs text-gray-400 mb-1 font-mono uppercase">LogP</div>
                    <div className="text-2xl font-light text-white">{molecule.logP.toFixed(2)}</div>
                </div>

                <div className={`col-span-2 bg-black/20 rounded-lg p-4 border flex flex-col justify-center ${isRejected ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 font-mono uppercase">Lipinski Violations</div>
                        <div className={`text-2xl font-bold ${isRejected ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'text-emerald-400'}`}>
                            {molecule.lipinskiViolations}
                        </div>
                    </div>
                    {isRejected && (
                        <div className="mt-2 text-xs text-red-400/80">
                            Fails oral bioavailability screening. Lab testing not scalable.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500 font-mono flex items-center space-x-2">
                    <span>Entity:</span>
                    <span className="text-neon-blue">MOLECULE</span>
                    <span>&#x2022;</span>
                    <span>MOLECULE_INTERACTION</span>
                </div>
            </div>
        </motion.div>
    );
};
