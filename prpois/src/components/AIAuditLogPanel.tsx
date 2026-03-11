import React from 'react';
import { motion } from 'framer-motion';
import { RetrosynthesisLog, User } from '../data/mockDatabase';
import { BrainCircuit, CheckSquare, Square, ShieldCheck } from 'lucide-react';

interface AIAuditLogPanelProps {
    log: RetrosynthesisLog;
    currentUser: User;
    onValidate: (logId: string, validated: boolean) => void;
}

export const AIAuditLogPanel: React.FC<AIAuditLogPanelProps> = ({ log, currentUser, onValidate }) => {
    const canValidate = currentUser.role === 'ADMIN';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                    <span>AI Audit Log</span>
                </h2>
                <div className="flex items-center space-x-1 text-xs px-2 py-1 bg-white/5 rounded text-gray-400 border border-white/5 font-mono">
                    <BrainCircuit size={12} className="text-emerald-400" />
                    <span>{log.aiModelUsed}</span>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {/* Hallucination Risk Score */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-xs text-gray-400 font-mono uppercase">Hallucination Risk Score</div>
                        <div className={`text-xl font-bold ${log.hallucinationRiskScore > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {log.hallucinationRiskScore}%
                        </div>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${log.hallucinationRiskScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${log.hallucinationRiskScore > 20 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-300'}`}
                        />
                    </div>
                </div>

                {/* FDA Validation Toggle */}
                <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${log.humanValidated
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : canValidate
                            ? 'bg-black/30 border-white/10 hover:border-white/20'
                            : 'bg-black/30 border-white/5 opacity-70'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex space-x-3">
                            <ShieldCheck className={`mt-0.5 ${log.humanValidated ? 'text-emerald-400' : 'text-gray-500'}`} size={20} />
                            <div>
                                <div className="text-sm font-medium text-white mb-1">Human Validation Required</div>
                                <div className="text-xs text-gray-400">
                                    21 CFR Part 11 compliant electronic signature.
                                </div>
                                {log.humanValidated && (
                                    <div className="mt-3 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded inline-block">
                                        Validated by {currentUser.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => canValidate && onValidate(log.id, !log.humanValidated)}
                            disabled={!canValidate}
                            className={`flex-shrink-0 transition-colors ${canValidate ? 'cursor-pointer' : 'cursor-not-allowed'} ${log.humanValidated ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'}`}
                            title={!canValidate ? 'Only ADMIN can validate' : 'Toggle validation'}
                        >
                            {log.humanValidated ? <CheckSquare size={24} /> : <Square size={24} />}
                        </button>
                    </div>

                    {!canValidate && !log.humanValidated && (
                        <div className="mt-3 text-[10px] text-orange-400/80 uppercase tracking-wider text-center">
                            Requires Admin Privileges
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-[10px] text-gray-500 font-mono flex items-center space-x-2">
                    <span>Entity:</span>
                    <span className="text-emerald-400">RETROSYNTHESIS_LOG</span>
                </div>
            </div>
        </motion.div>
    );
};
