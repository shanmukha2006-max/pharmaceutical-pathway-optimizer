import React from 'react';
import { motion } from 'framer-motion';
import { mockDatabase, Molecule } from '../data/mockDatabase';
import { FlaskConical, Thermometer, Wind, AlertOctagon, CheckCircle2, ChevronDown, Rocket } from 'lucide-react';
import { Sketcher } from './Sketcher';

interface PathwaysTabProps {
    targetMolecule: Molecule | null;
}

export const PathwaysTab: React.FC<PathwaysTabProps> = ({ targetMolecule }) => {
    const steps = mockDatabase.reactionSteps;
    const molecules = mockDatabase.stepMolecules;

    if (!targetMolecule) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto flex flex-col items-center justify-center p-20 text-center space-y-6"
            >
                <div className="w-24 h-24 rounded-full bg-black/40 border border-white/5 flex items-center justify-center shadow-2xl relative">
                    <Rocket size={40} className="text-gray-500" />
                    <div className="absolute inset-0 rounded-full border border-neon-blue/20 animate-ping opacity-20"></div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-light text-white tracking-widest">AWAITING TARGET</h2>
                    <p className="text-gray-400 font-medium">No target molecule selected.</p>
                </div>
                <div className="bg-neon-blue/10 border border-neon-blue/20 text-neon-blue px-6 py-3 rounded-lg text-sm max-w-md">
                    Please search in the Repurposing engine or input a SMILES string in the Dashboard to initialize a pathway sequence.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto py-8"
        >
            <div className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <div className="text-neon-blue text-xs font-mono uppercase tracking-widest mb-2 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_#58a6ff]"></span>
                        <span>Retrosynthesis Engine &gt; {targetMolecule.name}</span>
                    </div>
                    <h1 className="text-3xl font-light text-white tracking-widest">PATHWAY ANALYSIS</h1>
                    <p className="text-gray-400 text-sm mt-2 font-mono text-emerald-400/80 bg-emerald-900/10 px-2 py-1 rounded w-fit border border-emerald-500/20">{targetMolecule.smiles}</p>
                </div>
                <div className="flex space-x-4">
                    <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 flex flex-col items-center">
                        <div className="text-xs text-gray-500 font-mono uppercase">Total Steps</div>
                        <div className="text-xl text-white font-light">{steps.length}</div>
                    </div>
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg px-4 py-2 flex flex-col items-center">
                        <div className="text-xs text-emerald-500 font-mono uppercase">Total Yield</div>
                        <div className="text-xl text-emerald-400 font-light">{mockDatabase.pathways[0].totalYield}%</div>
                    </div>
                </div>
            </div>

            <div className="relative pl-6 lg:pl-10">
                {/* Vertical Timeline Line */}
                <div className="absolute top-0 bottom-0 left-[31px] lg:left-[47px] w-0.5 bg-gradient-to-b from-neon-blue via-emerald-400 to-purple-500 opacity-30"></div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative"
                    >
                        {/* Timeline Node */}
                        <div className="absolute -left-[30px] lg:-left-[46px] top-6 w-4 h-4 rounded-full bg-neon-blue border-2 border-[#0d1117] shadow-[0_0_15px_#58a6ff] z-10"></div>
                        <div className="glass-card p-6 border-neon-blue/30 relative overflow-hidden group ml-8">
                            <h3 className="text-xl text-white font-medium mb-4 flex items-center">
                                <span className="mr-2">🎯 Target Synthesized: {targetMolecule.name}</span>
                            </h3>
                            <div className="w-full h-[300px] pointer-events-none opacity-80 rounded overflow-hidden">
                                {/* Reuse the Sketcher purely for visualization of the target */}
                                <Sketcher onSmilesChange={() => { }} initialSmiles={targetMolecule.smiles} />
                            </div>
                        </div>
                    </motion.div>

                    {steps.map((step, index) => {
                        const stepMols = molecules.filter(m => m.stepId === step.id);
                        const reactants = stepMols.filter(m => m.role === 'REACTANT');
                        const catalysts = stepMols.filter(m => m.role === 'CATALYST' || m.role === 'SOLVENT');
                        const byproducts = stepMols.filter(m => m.role === 'BYPRODUCT');

                        const hasToxic = byproducts.some(b => b.isToxic);

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.4, delay: index * 0.15 }}
                                className="relative"
                            >
                                {/* Timeline Node */}
                                <div className="absolute -left-[30px] lg:-left-[46px] top-6 w-4 h-4 rounded-full bg-[#0d1117] border-2 border-neon-blue shadow-[0_0_10px_#58a6ff] z-10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                </div>

                                <div className={`glass-card p-6 ${hasToxic ? 'border-red-500/30 shadow-[0_0_20px_rgba(248,113,113,0.1)]' : 'border-white/10'} relative overflow-hidden group ml-8`} >

                                    {/* Decorative faint icon */}
                                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <FlaskConical size={150} />
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 border-b border-white/5 pb-4 relative z-10">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="text-xs text-gray-500 font-mono uppercase">Step {step.stepOrder}</span>
                                                <h3 className="text-xl text-white font-medium">{step.stepName}</h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6 mt-4 lg:mt-0">
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Thermometer size={16} className="text-orange-400" />
                                                <span className="text-sm">{step.temperatureC}°C</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Wind size={16} className="text-blue-400" />
                                                <span className="text-sm">{step.pressureAtm} atm</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                                <span className="text-sm text-emerald-400 font-medium">Yield: {step.yieldPercentage}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-mono uppercase text-gray-500 mb-2">Reactants</h4>
                                                <div className="space-y-2">
                                                    {reactants.map(r => (
                                                        <div key={r.id} className="bg-black/30 p-2.5 rounded border border-white/5 text-sm text-gray-200">
                                                            {r.moleculeName}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {catalysts.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-mono uppercase text-gray-500 mb-2">Catalysts & Solvents</h4>
                                                    <div className="space-y-2">
                                                        {catalysts.map(c => (
                                                            <div key={c.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5 text-sm">
                                                                <span className="text-purple-300">{c.moleculeName}</span>
                                                                <span className="text-[10px] uppercase text-gray-500">{c.role}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {byproducts.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-mono uppercase text-gray-500 mb-2">By-products (E-Factor tracking)</h4>
                                                    <div className="space-y-2">
                                                        {byproducts.map(b => (
                                                            <div key={b.id} className={`flex items-start space-x-3 p-3 rounded border ${b.isToxic ? 'bg-red-500/10 border-red-500/30' : 'bg-black/30 border-white/5'}`}>
                                                                {b.isToxic ? <AlertOctagon size={16} className="text-red-400 mt-0.5 flex-shrink-0" /> : <div className="w-4" />}
                                                                <div>
                                                                    <div className={`text-sm ${b.isToxic ? 'text-red-300' : 'text-gray-300'}`}>{b.moleculeName}</div>
                                                                    {b.hazardWarning && (
                                                                        <div className="text-xs text-red-400/80 mt-1 uppercase tracking-wide">{b.hazardWarning}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-[#0a0d14] p-4 rounded-lg border border-white/5 mt-auto">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 font-mono uppercase">Step E-Factor</span>
                                                    <span className={`text-lg font-medium ${step.baseEFactor > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                                        {step.baseEFactor.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className={`h-full ${step.baseEFactor > 20 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                                        style={{ width: `${Math.min((step.baseEFactor / 50) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connecting Arrow for next step */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-600">
                                            <ChevronDown size={24} />
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
