import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Role, User } from '../data/mockDatabase';
import { LogIn } from 'lucide-react';

interface AuthScreenProps {
    onLogin: (user: User) => void;
}

const mockUsers: User[] = [
    { id: 'u1', name: 'Dr. Sarah Connor', role: 'ADMIN', email: 'sarah.c@prpois.inc' },
    { id: 'u2', name: 'John Doe', role: 'RESEARCHER', email: 'john.d@prpois.inc' }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [selectedRole, setSelectedRole] = useState<Role>('RESEARCHER');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            const user = mockUsers.find(u => u.role === selectedRole) || mockUsers[1];
            onLogin(user);
        }, 1500); // simulated loading spinner
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#161b22] to-[#0d1117]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-card max-w-md w-full p-8 relative overflow-hidden"
            >
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-neon-blue blur-md opacity-70"></div>

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-16 h-16 bg-gradient-to-br from-neon-blue to-blue-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(88,166,255,0.4)]"
                    >
                        <span className="text-2xl font-bold tracking-tighter text-white">PR</span>
                    </motion.div>
                    <h1 className="text-3xl font-light tracking-widest text-white mb-2">PRPOIS</h1>
                    <p className="text-sm text-gray-400">Pharmaceutical Reaction Pathway Optimization and Analysis System</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Select Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedRole('RESEARCHER')}
                                className={`flex items-center justify-center p-3 rounded-lg border transition-all ${selectedRole === 'RESEARCHER'
                                        ? 'border-neon-blue bg-neon-blue/10 text-white shadow-[0_0_15px_rgba(88,166,255,0.2)]'
                                        : 'border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                Researcher
                            </button>
                            <button
                                onClick={() => setSelectedRole('ADMIN')}
                                className={`flex items-center justify-center p-3 rounded-lg border transition-all ${selectedRole === 'ADMIN'
                                        ? 'border-neon-blue bg-neon-blue/10 text-white shadow-[0_0_15px_rgba(88,166,255,0.2)]'
                                        : 'border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                FDA Admin
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                            />
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
