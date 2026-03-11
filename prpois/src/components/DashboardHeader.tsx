import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, ManufacturingScale } from '../data/mockDatabase';
import { Activity, Beaker, Factory, LogOut, ShieldAlert, Database } from 'lucide-react';

interface DashboardHeaderProps {
    user: User;
    onLogout: () => void;
    scale: ManufacturingScale;
    setScale: (scale: ManufacturingScale) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout, scale, setScale }) => {
    const [dbConnected, setDbConnected] = useState(false);

    useEffect(() => {
        const checkDbConnection = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/health');
                if (response.ok) {
                    setDbConnected(true);
                } else {
                    setDbConnected(false);
                }
            } catch (error) {
                setDbConnected(false);
            }
        };

        checkDbConnection();
        const interval = setInterval(checkDbConnection, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-white/5"
        >
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-blue-900 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(88,166,255,0.4)]">
                        <span className="font-bold tracking-tighter text-white">PR</span>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-light tracking-wider text-white">PRPOIS</h1>
                        <p className="text-[10px] text-neon-blue font-mono tracking-widest uppercase opacity-80">Core Database</p>
                    </div>
                </div>

                <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                {/* Database Connection Status */}
                <div className={`hidden lg:flex items-center space-x-2 text-xs border px-3 py-1.5 rounded-full transition-colors ${dbConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 [box-shadow:0_0_10px_rgba(16,185,129,0.2)] glow-green' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <Database size={14} className={dbConnected ? 'animate-pulse' : ''} />
                    <span className="font-mono tracking-wider">
                        {dbConnected ? 'Connected to PRPOIS DB' : 'DB Disconnected'}
                    </span>
                </div>

                <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                {/* Manufacturing Scale Toggle */}
                <div className="flex-1 max-w-xs">
                    <div className="bg-black/30 p-1 rounded-lg border border-white/5 flex items-center relative">
                        {(['Lab', 'Pilot', 'Bulk'] as ManufacturingScale[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setScale(s)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-1.5 text-xs font-medium rounded-md transition-all relative z-10 ${scale === s ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {s === 'Lab' && <Beaker size={14} />}
                                {s === 'Pilot' && <Activity size={14} />}
                                {s === 'Bulk' && <Factory size={14} />}
                                <span>{s}</span>
                                {scale === s && (
                                    <motion.div
                                        layoutId="scale-indicator"
                                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-md -z-10 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {/* FDA Compliance Badge Status */}
                <div className="hidden lg:flex items-center space-x-2 text-xs bg-black/30 border border-white/5 px-3 py-1.5 rounded-full">
                    <ShieldAlert size={14} className="text-emerald-400" />
                    <span className="text-gray-300 font-mono tracking-wider">21 CFR Part 11</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="flex items-center justify-end space-x-2">
                            <span className={`w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.8)]'}`}></span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{user.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 transition-all group"
                    >
                        <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>
        </motion.header>
    );
};

